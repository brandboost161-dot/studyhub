import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

// ============================================
// GET USER STUDY STATISTICS
// ============================================
export async function getUserStudyStats(userId: string) {
  const [
    totalFlashcardsStudied,
    totalResourcesUsed,
    flashcardSets,
    quizzesGenerated,
    studyGuidesGenerated,
  ] = await Promise.all([
    // Count total flashcards across all sets user created
    prisma.flashcard.count({
      where: {
        resource: {
          userId,
        },
      },
    }),

    // Resources with usedCount > 0
    prisma.studyResource.count({
      where: {
        usedCount: { gt: 0 },
      },
    }),

    // User's flashcard sets
    prisma.studyResource.findMany({
      where: {
        userId,
        type: 'FLASHCARDS',
      },
      select: {
        id: true,
        title: true,
        usedCount: true,
        upvotes: true,
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    }),

    // Estimate quizzes (we don't track these yet, so estimate based on activity)
    prisma.studyResource.count({
      where: {
        userId,
        type: 'FLASHCARDS',
        usedCount: { gt: 0 },
      },
    }),

    // Estimate study guides (same approach)
    prisma.studyResource.count({
      where: {
        userId,
        type: 'NOTES',
      },
    }),
  ]);

  // Calculate estimated study time (rough estimate: 2 min per flashcard)
  const estimatedStudyMinutes = totalFlashcardsStudied * 2;
  const estimatedStudyHours = Math.round(estimatedStudyMinutes / 60 * 10) / 10;

  return {
    totalFlashcardsCreated: totalFlashcardsStudied,
    totalFlashcardSets: flashcardSets.length,
    totalResourcesUsed,
    estimatedStudyHours,
    quizzesGenerated,
    studyGuidesGenerated,
    mostUsedSet: flashcardSets.sort((a, b) => b.usedCount - a.usedCount)[0] || null,
    mostUpvotedSet: flashcardSets.sort((a, b) => b.upvotes - a.upvotes)[0] || null,
  };
}

// ============================================
// GET STUDY STREAK
// ============================================
export async function getStudyStreak(userId: string) {
  // Get all user's study activities (resource creation dates)
  const activities = await prisma.studyResource.findMany({
    where: { userId },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudied: null,
    };
  }

  // Get unique dates
  const dates = [...new Set(
    activities.map(a => a.createdAt.toISOString().split('T')[0])
  )].sort().reverse();

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (dates[0] === today || dates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastStudied: activities[0].createdAt,
    totalStudyDays: dates.length,
  };
}

// ============================================
// GET WEAK AREAS (COURSES NEEDING ATTENTION)
// ============================================
export async function getWeakAreas(userId: string) {
  // Get user's saved courses
  const savedCourses = await prisma.savedCourse.findMany({
    where: { userId },
    select: {
      course: {
        select: {
          id: true,
          courseCode: true,
          title: true,
        },
      },
    },
  });

  // For each course, check if user has created resources or reviewed it
  const courseAnalysis = await Promise.all(
    savedCourses.map(async (sc) => {
      const [hasReview, resourceCount, hasStudied] = await Promise.all([
        prisma.courseReview.findFirst({
          where: {
            courseId: sc.course.id,
            userId,
          },
        }),
        
        prisma.studyResource.count({
          where: {
            courseId: sc.course.id,
            userId,
          },
        }),

        prisma.studyResource.findFirst({
          where: {
            courseId: sc.course.id,
            userId,
            usedCount: { gt: 0 },
          },
        }),
      ]);

      return {
        course: sc.course,
        hasReview: !!hasReview,
        resourceCount,
        hasStudied: !!hasStudied,
        needsAttention: !hasReview && resourceCount === 0,
      };
    })
  );

  const needsAttention = courseAnalysis
    .filter(c => c.needsAttention)
    .map(c => c.course);

  const wellStudied = courseAnalysis
    .filter(c => c.hasStudied && c.resourceCount > 0)
    .map(c => ({ ...c.course, resourceCount: c.resourceCount }));

  return {
    coursesNeedingAttention: needsAttention,
    wellStudiedCourses: wellStudied,
    totalSavedCourses: savedCourses.length,
  };
}

// ============================================
// GET SCHOOL LEADERBOARD
// ============================================
export async function getSchoolLeaderboard(params: {
  schoolId: string;
  timeframe?: 'week' | 'month' | 'all';
  limit?: number;
}) {
  const { schoolId, timeframe = 'all', limit = 10 } = params;

  let dateFilter = {};
  if (timeframe === 'week') {
    dateFilter = {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    };
  } else if (timeframe === 'month') {
    dateFilter = {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    };
  }

  const topUsers = await prisma.user.findMany({
    where: {
      schoolId,
      ...dateFilter,
    },
    select: {
      id: true,
      name: true,
      reputationScore: true,
      _count: {
        select: {
          reviews: true,
          studyResources: true,
        },
      },
    },
    orderBy: {
      reputationScore: 'desc',
    },
    take: limit,
  });

  return topUsers.map((user, index) => ({
    rank: index + 1,
    id: user.id,
    name: user.name,
    reputation: user.reputationScore,
    reviewCount: user._count.reviews,
    resourceCount: user._count.studyResources,
    totalContributions: user._count.reviews + user._count.studyResources,
  }));
}

// ============================================
// GET COURSE INSIGHTS (SCHOOL-WIDE)
// ============================================
export async function getCourseInsights(schoolId: string) {
  const [
    mostReviewedCourses,
    mostResourcefulCourses,
    trendingCourses,
  ] = await Promise.all([
    // Most reviewed courses
    prisma.course.findMany({
      where: { schoolId },
      select: {
        id: true,
        courseCode: true,
        title: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        reviews: {
          _count: 'desc',
        },
      },
      take: 5,
    }),

    // Courses with most study resources
    prisma.course.findMany({
      where: { schoolId },
      select: {
        id: true,
        courseCode: true,
        title: true,
        _count: {
          select: {
            studyResources: true,
          },
        },
      },
      orderBy: {
        studyResources: {
          _count: 'desc',
        },
      },
      take: 5,
    }),

    // Trending (most activity in last 7 days)
    prisma.course.findMany({
      where: {
        schoolId,
        OR: [
          {
            reviews: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
          {
            studyResources: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        courseCode: true,
        title: true,
        _count: {
          select: {
            reviews: true,
            studyResources: true,
          },
        },
      },
      take: 5,
    }),
  ]);

  return {
    mostReviewed: mostReviewedCourses.map(c => ({
      ...c,
      reviewCount: c._count.reviews,
    })),
    mostResourceful: mostResourcefulCourses.map(c => ({
      ...c,
      resourceCount: c._count.studyResources,
    })),
    trending: trendingCourses.map(c => ({
      ...c,
      activityCount: c._count.reviews + c._count.studyResources,
    })),
  };
}

// ============================================
// GET USER RANK
// ============================================
export async function getUserRank(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      schoolId: true,
      reputationScore: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Count how many users have higher reputation
  const usersAbove = await prisma.user.count({
    where: {
      schoolId: user.schoolId,
      reputationScore: {
        gt: user.reputationScore,
      },
    },
  });

  const totalUsers = await prisma.user.count({
    where: { schoolId: user.schoolId },
  });

  const rank = usersAbove + 1;
  const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

  return {
    rank,
    totalUsers,
    percentile,
    reputation: user.reputationScore,
  };
}