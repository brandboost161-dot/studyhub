import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

// ============================================
// CREATE REVIEW
// ============================================
export async function createReview(data: {
  userId: string;
  courseId: string;
  workloadRating: number;
  difficultyRating: number;
  overallRating: number;
  examStyle?: string;
  attendanceRequired: boolean;
  reviewText: string;
}) {
  const {
    userId,
    courseId,
    workloadRating,
    difficultyRating,
    overallRating,
    examStyle,
    attendanceRequired,
    reviewText,
  } = data;

  // Validate ratings are 1-5
  if (
    workloadRating < 1 || workloadRating > 5 ||
    difficultyRating < 1 || difficultyRating > 5 ||
    overallRating < 1 || overallRating > 5
  ) {
    throw new AppError('Ratings must be between 1 and 5', 400, 'INVALID_RATING');
  }

  // Verify course exists and belongs to user's school
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  if (course.schoolId !== user.schoolId) {
    throw new AppError(
      'Cannot review courses from other schools',
      403,
      'FORBIDDEN'
    );
  }

  // Check if user already reviewed this course
  const existingReview = await prisma.courseReview.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      'You have already reviewed this course',
      409,
      'ALREADY_REVIEWED'
    );
  }

  // Create review
  const review = await prisma.courseReview.create({
    data: {
      userId,
      courseId,
      workloadRating,
      difficultyRating,
      overallRating,
      examStyle,
      attendanceRequired,
      reviewText,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
        },
      },
    },
  });

  // Award reputation points
  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationScore: { increment: 10 },
    },
  });

  return review;
}

// ============================================
// LIST REVIEWS FOR COURSE
// ============================================
export async function listReviews(params: {
  courseId: string;
  sort?: 'helpful' | 'recent';
  page?: number;
  limit?: number;
  userId?: string;
}) {
  const { courseId, sort = 'helpful', page = 1, limit = 10, userId } = params;

  const skip = (page - 1) * limit;

  const orderBy: any =
    sort === 'helpful'
      ? { helpfulVotes: 'desc' }
      : { createdAt: 'desc' };

  const [reviews, total] = await Promise.all([
    prisma.courseReview.findMany({
      where: { courseId },
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            reputationScore: true,
          },
        },
      },
    }),
    prisma.courseReview.count({ where: { courseId } }),
  ]);

  // Add hasVoted status if user is authenticated
  const reviewsWithStatus = await Promise.all(
    reviews.map(async (review) => {
      let hasVoted = false;

      if (userId) {
        const vote = await prisma.helpfulVote.findUnique({
          where: {
            userId_reviewId: {
              userId,
              reviewId: review.id,
            },
          },
        });
        hasVoted = !!vote;
      }

      return {
        ...review,
        hasVoted,
      };
    })
  );

  return {
    reviews: reviewsWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// GET SINGLE REVIEW
// ============================================
export async function getReview(reviewId: string, userId?: string) {
  const review = await prisma.courseReview.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
        },
      },
      course: {
        select: {
          id: true,
          courseCode: true,
          title: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }

  let hasVoted = false;

  if (userId) {
    const vote = await prisma.helpfulVote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });
    hasVoted = !!vote;
  }

  return {
    ...review,
    hasVoted,
  };
}

// ============================================
// UPDATE REVIEW
// ============================================
export async function updateReview(data: {
  reviewId: string;
  userId: string;
  workloadRating?: number;
  difficultyRating?: number;
  overallRating?: number;
  examStyle?: string;
  attendanceRequired?: boolean;
  reviewText?: string;
}) {
  const {
    reviewId,
    userId,
    workloadRating,
    difficultyRating,
    overallRating,
    examStyle,
    attendanceRequired,
    reviewText,
  } = data;

  // Check ownership
  const review = await prisma.courseReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }

  if (review.userId !== userId) {
    throw new AppError('You can only edit your own reviews', 403, 'FORBIDDEN');
  }

  // Validate ratings if provided
  if (workloadRating && (workloadRating < 1 || workloadRating > 5)) {
    throw new AppError('Workload rating must be between 1 and 5', 400, 'INVALID_RATING');
  }
  if (difficultyRating && (difficultyRating < 1 || difficultyRating > 5)) {
    throw new AppError('Difficulty rating must be between 1 and 5', 400, 'INVALID_RATING');
  }
  if (overallRating && (overallRating < 1 || overallRating > 5)) {
    throw new AppError('Overall rating must be between 1 and 5', 400, 'INVALID_RATING');
  }

  // Update review
  const updateData: any = {};
  if (workloadRating !== undefined) updateData.workloadRating = workloadRating;
  if (difficultyRating !== undefined) updateData.difficultyRating = difficultyRating;
  if (overallRating !== undefined) updateData.overallRating = overallRating;
  if (examStyle !== undefined) updateData.examStyle = examStyle;
  if (attendanceRequired !== undefined) updateData.attendanceRequired = attendanceRequired;
  if (reviewText !== undefined) updateData.reviewText = reviewText;

  const updated = await prisma.courseReview.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
        },
      },
    },
  });

  return updated;
}

// ============================================
// DELETE REVIEW
// ============================================
export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.courseReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }

  if (review.userId !== userId) {
    throw new AppError('You can only delete your own reviews', 403, 'FORBIDDEN');
  }

  await prisma.courseReview.delete({
    where: { id: reviewId },
  });

  return { message: 'Review deleted successfully' };
}

// ============================================
// VOTE REVIEW AS HELPFUL
// ============================================
export async function voteHelpful(reviewId: string, userId: string) {
  // Check if review exists
  const review = await prisma.courseReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }

  // Can't vote on your own review
  if (review.userId === userId) {
    throw new AppError('Cannot vote on your own review', 400, 'CANNOT_VOTE_OWN');
  }

  // Check if already voted
  const existing = await prisma.helpfulVote.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  if (existing) {
    throw new AppError('Already voted', 400, 'ALREADY_VOTED');
  }

  // Create vote and increment count
  await prisma.$transaction([
    prisma.helpfulVote.create({
      data: {
        userId,
        reviewId,
      },
    }),
    prisma.courseReview.update({
      where: { id: reviewId },
      data: {
        helpfulVotes: { increment: 1 },
      },
    }),
  ]);

  // Award reputation to review author
  await prisma.user.update({
    where: { id: review.userId },
    data: {
      reputationScore: { increment: 1 },
    },
  });

  return { message: 'Voted as helpful' };
}

// ============================================
// REMOVE HELPFUL VOTE
// ============================================
export async function removeHelpfulVote(reviewId: string, userId: string) {
  const existing = await prisma.helpfulVote.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Vote not found', 400, 'NOT_VOTED');
  }

  await prisma.$transaction([
    prisma.helpfulVote.delete({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    }),
    prisma.courseReview.update({
      where: { id: reviewId },
      data: {
        helpfulVotes: { decrement: 1 },
      },
    }),
  ]);

  return { message: 'Vote removed' };
}

// ============================================
// GET COURSE STATS
// ============================================
export async function getCourseStats(courseId: string) {
  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    select: {
      workloadRating: true,
      difficultyRating: true,
      overallRating: true,
      attendanceRequired: true,
    },
  });

  if (reviews.length === 0) {
    return {
      reviewCount: 0,
      averageOverallRating: 0,
      averageWorkloadRating: 0,
      averageDifficultyRating: 0,
      attendanceRequiredPercent: 0,
    };
  }

  const total = reviews.length;
  const sum = reviews.reduce(
    (acc, review) => ({
      workload: acc.workload + review.workloadRating,
      difficulty: acc.difficulty + review.difficultyRating,
      overall: acc.overall + review.overallRating,
      attendance: acc.attendance + (review.attendanceRequired ? 1 : 0),
    }),
    { workload: 0, difficulty: 0, overall: 0, attendance: 0 }
  );

  return {
    reviewCount: total,
    averageOverallRating: Math.round((sum.overall / total) * 10) / 10,
    averageWorkloadRating: Math.round((sum.workload / total) * 10) / 10,
    averageDifficultyRating: Math.round((sum.difficulty / total) * 10) / 10,
    attendanceRequiredPercent: Math.round((sum.attendance / total) * 100),
  };
}