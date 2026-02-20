import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

// ============================================
// GET USER PROFILE
// ============================================
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      reputationScore: true,
      createdAt: true,
      school: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          studyResources: true,
          savedCourses: true,
          savedResources: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    ...user,
    reviewCount: user._count.reviews,
    resourceCount: user._count.studyResources,
    savedCourseCount: user._count.savedCourses,
    savedResourceCount: user._count.savedResources,
  };
}

// ============================================
// GET USER REVIEWS
// ============================================
export async function getUserReviews(userId: string) {
  const reviews = await prisma.courseReview.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          courseCode: true,
          title: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reviews;
}

// ============================================
// GET USER RESOURCES
// ============================================
export async function getUserResources(params: {
  userId: string;
  type?: 'FLASHCARDS' | 'NOTES';
}) {
  const { userId, type } = params;

  const where: any = { userId };
  if (type) {
    where.type = type;
  }

  const resources = await prisma.studyResource.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          courseCode: true,
          title: true,
        },
      },
      _count: {
        select: {
          flashcards: true,
          files: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return resources.map((resource) => ({
    ...resource,
    flashcardCount: resource._count.flashcards,
    fileCount: resource._count.files,
  }));
}

// ============================================
// GET SAVED RESOURCES
// ============================================
export async function getSavedResources(userId: string) {
  const savedResources = await prisma.savedResource.findMany({
    where: { userId },
    include: {
      resource: {
        include: {
          course: {
            select: {
              id: true,
              courseCode: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              flashcards: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return savedResources.map((sr) => ({
    ...sr.resource,
    flashcardCount: sr.resource._count.flashcards,
  }));
}

// ============================================
// GET REPUTATION BREAKDOWN
// ============================================
export async function getReputationBreakdown(userId: string) {
  // Get all reputation sources
  const [reviews, helpfulVotes, resources, resourceUpvotes] = await Promise.all([
    // Reviews created (+10 each)
    prisma.courseReview.findMany({
      where: { userId },
      select: { id: true, createdAt: true },
    }),

    // Helpful votes received (+1 each)
    prisma.helpfulVote.findMany({
      where: {
        review: {
          userId,
        },
      },
      select: { id: true, createdAt: true },
    }),

    // Resources created (+5 each)
    prisma.studyResource.findMany({
      where: { userId },
      select: { id: true, createdAt: true },
    }),

    // Resource upvotes received (+1 each)
    prisma.resourceUpvote.findMany({
      where: {
        resource: {
          userId,
        },
      },
      select: { id: true, createdAt: true },
    }),
  ]);

  const breakdown = {
    fromReviews: {
      count: reviews.length,
      points: reviews.length * 10,
      perItem: 10,
    },
    fromHelpfulVotes: {
      count: helpfulVotes.length,
      points: helpfulVotes.length * 1,
      perItem: 1,
    },
    fromResources: {
      count: resources.length,
      points: resources.length * 5,
      perItem: 5,
    },
    fromResourceUpvotes: {
      count: resourceUpvotes.length,
      points: resourceUpvotes.length * 1,
      perItem: 1,
    },
  };

  const totalCalculated =
    breakdown.fromReviews.points +
    breakdown.fromHelpfulVotes.points +
    breakdown.fromResources.points +
    breakdown.fromResourceUpvotes.points;

  // Get actual reputation from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { reputationScore: true },
  });

  return {
    breakdown,
    totalCalculated,
    currentReputation: user?.reputationScore || 0,
  };
}

// ============================================
// GET USER ACTIVITY STATS
// ============================================
export async function getUserActivityStats(userId: string) {
  const [
    totalReviews,
    totalFlashcards,
    totalNotes,
    totalHelpfulVotesReceived,
    totalUpvotesReceived,
    recentActivity,
  ] = await Promise.all([
    prisma.courseReview.count({ where: { userId } }),
    
    prisma.studyResource.count({
      where: { userId, type: 'FLASHCARDS' },
    }),
    
    prisma.studyResource.count({
      where: { userId, type: 'NOTES' },
    }),
    
    prisma.helpfulVote.count({
      where: { review: { userId } },
    }),
    
    prisma.resourceUpvote.count({
      where: { resource: { userId } },
    }),

    // Recent activity (last 30 days)
    prisma.courseReview.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    totalReviews,
    totalFlashcards,
    totalNotes,
    totalResources: totalFlashcards + totalNotes,
    totalHelpfulVotesReceived,
    totalUpvotesReceived,
    recentActivity,
  };
}

// ============================================
// SAVE RESOURCE
// ============================================
export async function saveResource(resourceId: string, userId: string) {
  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  const existing = await prisma.savedResource.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  if (existing) {
    throw new AppError('Resource already saved', 400, 'ALREADY_SAVED');
  }

  await prisma.savedResource.create({
    data: {
      userId,
      resourceId,
    },
  });

  return { message: 'Resource saved successfully' };
}

// ============================================
// UNSAVE RESOURCE
// ============================================
export async function unsaveResource(resourceId: string, userId: string) {
  const existing = await prisma.savedResource.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Resource not saved', 400, 'NOT_SAVED');
  }

  await prisma.savedResource.delete({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  return { message: 'Resource unsaved successfully' };
}