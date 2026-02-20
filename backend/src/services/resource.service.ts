import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

// ============================================
// CREATE FLASHCARD SET
// ============================================
export async function createFlashcardSet(data: {
  userId: string;
  courseId: string;
  title: string;
  examTag?: string;
  flashcards: Array<{ front: string; back: string }>;
}) {
  const { userId, courseId, title, examTag, flashcards } = data;

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
      'Cannot create resources for courses from other schools',
      403,
      'FORBIDDEN'
    );
  }

  const resource = await prisma.studyResource.create({
    data: {
      userId,
      courseId,
      type: 'FLASHCARDS',
      title,
      examTag,
      flashcards: {
        create: flashcards.map((card, index) => ({
          front: card.front,
          back: card.back,
          order: index,
        })),
      },
    },
    include: {
      flashcards: {
        orderBy: { order: 'asc' },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationScore: { increment: 5 },
    },
  });

  return resource;
}

// ============================================
// GET FLASHCARD SET BY ID
// ============================================
export async function getFlashcardSet(resourceId: string, userId?: string) {
  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
    include: {
      flashcards: {
        orderBy: { order: 'asc' },
      },
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

  if (!resource) {
    throw new AppError('Flashcard set not found', 404, 'NOT_FOUND');
  }

  // Removed FLASHCARDS type check to allow viewing all resource types

  let hasUpvoted = false;
  let isSaved = false;

  if (userId) {
    const upvote = await prisma.resourceUpvote.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });
    hasUpvoted = !!upvote;

    const saved = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });
    isSaved = !!saved;
  }

  return {
    ...resource,
    hasUpvoted,
    isSaved,
  };
}

// ============================================
// LIST FLASHCARD SETS FOR A COURSE
// ============================================
export async function listFlashcardSets(params: {
  courseId: string;
  examTag?: string;
  sort?: 'popular' | 'recent';
  page?: number;
  limit?: number;
  userId?: string;
}) {
  const {
    courseId,
    examTag,
    sort = 'popular',
    page = 1,
    limit = 20,
    userId,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {
    courseId,
    type: 'FLASHCARDS',
  };

  if (examTag) {
    where.examTag = examTag;
  }

  const orderBy: any =
    sort === 'popular' ? { upvotes: 'desc' } : { createdAt: 'desc' };

  const [resources, total] = await Promise.all([
    prisma.studyResource.findMany({
      where,
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
        _count: {
          select: {
            flashcards: true,
          },
        },
      },
    }),
    prisma.studyResource.count({ where }),
  ]);

  const resourcesWithStatus = await Promise.all(
    resources.map(async (resource) => {
      let hasUpvoted = false;
      let isSaved = false;

      if (userId) {
        const [upvote, saved] = await Promise.all([
          prisma.resourceUpvote.findUnique({
            where: {
              userId_resourceId: {
                userId,
                resourceId: resource.id,
              },
            },
          }),
          prisma.savedResource.findUnique({
            where: {
              userId_resourceId: {
                userId,
                resourceId: resource.id,
              },
            },
          }),
        ]);
        hasUpvoted = !!upvote;
        isSaved = !!saved;
      }

      return {
        ...resource,
        flashcardCount: resource._count.flashcards,
        hasUpvoted,
        isSaved,
      };
    })
  );

  return {
    resources: resourcesWithStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// UPDATE FLASHCARD SET
// ============================================
export async function updateFlashcardSet(data: {
  resourceId: string;
  userId: string;
  title?: string;
  examTag?: string;
  flashcards?: Array<{ front: string; back: string }>;
}) {
  const { resourceId, userId, title, examTag, flashcards } = data;

  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new AppError('Flashcard set not found', 404, 'NOT_FOUND');
  }

  if (resource.userId !== userId) {
    throw new AppError(
      'You can only edit your own flashcard sets',
      403,
      'FORBIDDEN'
    );
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (examTag !== undefined) updateData.examTag = examTag;

  if (flashcards) {
    await prisma.flashcard.deleteMany({
      where: { resourceId },
    });

    updateData.flashcards = {
      create: flashcards.map((card, index) => ({
        front: card.front,
        back: card.back,
        order: index,
      })),
    };
  }

  const updated = await prisma.studyResource.update({
    where: { id: resourceId },
    data: updateData,
    include: {
      flashcards: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return updated;
}

// ============================================
// DELETE FLASHCARD SET
// ============================================
export async function deleteFlashcardSet(resourceId: string, userId: string) {
  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new AppError('Flashcard set not found', 404, 'NOT_FOUND');
  }

  if (resource.userId !== userId) {
    throw new AppError(
      'You can only delete your own flashcard sets',
      403,
      'FORBIDDEN'
    );
  }

  await prisma.studyResource.delete({
    where: { id: resourceId },
  });

  return { message: 'Flashcard set deleted successfully' };
}

// ============================================
// UPVOTE FLASHCARD SET
// ============================================
export async function upvoteResource(resourceId: string, userId: string) {
  const existing = await prisma.resourceUpvote.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  if (existing) {
    throw new AppError('Already upvoted', 400, 'ALREADY_UPVOTED');
  }

  const [upvote] = await prisma.$transaction([
    prisma.resourceUpvote.create({
      data: {
        userId,
        resourceId,
      },
    }),
    prisma.studyResource.update({
      where: { id: resourceId },
      data: {
        upvotes: { increment: 1 },
      },
    }),
  ]);

  const resource = await prisma.studyResource.findUnique({
    where: { id: resourceId },
    select: { userId: true },
  });

  if (resource) {
    await prisma.user.update({
      where: { id: resource.userId },
      data: {
        reputationScore: { increment: 1 },
      },
    });
  }

  return { message: 'Upvoted successfully' };
}

// ============================================
// REMOVE UPVOTE
// ============================================
export async function removeUpvote(resourceId: string, userId: string) {
  const existing = await prisma.resourceUpvote.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Not upvoted', 400, 'NOT_UPVOTED');
  }

  await prisma.$transaction([
    prisma.resourceUpvote.delete({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    }),
    prisma.studyResource.update({
      where: { id: resourceId },
      data: {
        upvotes: { decrement: 1 },
      },
    }),
  ]);

  return { message: 'Upvote removed' };
}

// ============================================
// INCREMENT USAGE COUNT
// ============================================
export async function incrementUsage(resourceId: string) {
  await prisma.studyResource.update({
    where: { id: resourceId },
    data: {
      usedCount: { increment: 1 },
    },
  });

  return { message: 'Usage tracked' };
}

// ============================================
// CREATE NOTES RESOURCE
// ============================================
export async function createNotesResource(data: {
  userId: string;
  courseId: string;
  title: string;
  examTag?: string;
}) {
  const { userId, courseId, title, examTag } = data;

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
      'Cannot create resources for courses from other schools',
      403,
      'FORBIDDEN'
    );
  }

  const resource = await prisma.studyResource.create({
    data: {
      userId,
      courseId,
      type: 'NOTES',
      title,
      examTag,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationScore: { increment: 5 },
    },
  });

  return resource;
}

export async function uploadNotes(data: {
  userId: string;
  courseId: string;
  title: string;
  examTag?: string;
  files: Express.Multer.File[];
}) {
  const { userId, courseId, title, examTag, files } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  // Create the notes resource
  const resource = await prisma.studyResource.create({
  data: {
    userId,
    courseId,
    title,
    examTag,
    type: 'NOTES',
  },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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

  // Award reputation for uploading notes
  await prisma.user.update({
    where: { id: userId },
    data: {
      reputationScore: {
        increment: 10,
      },
    },
  });

  return resource;
}

export async function listNotes(params: {
  courseId: string;
  examTag?: string;
  sort?: 'popular' | 'recent';
  page?: number;
  limit?: number;
  userId?: string;
}) {
  const { courseId, examTag, sort = 'recent', page = 1, limit = 20, userId } = params;

  const where: any = {
    courseId,
    type: 'NOTES',
  };

  if (examTag) {
    where.examTag = examTag;
  }

  const orderBy: any = sort === 'popular' 
    ? [{ upvotes: 'desc' }, { usedCount: 'desc' }]
    : { createdAt: 'desc' };

  const resources = await prisma.studyResource.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
          courseCode: true,
          title: true,
        },
      },
      upvotedBy: userId ? {
        where: { userId },
        select: { userId: true },
      } : false,
    },
  });

  const total = await prisma.studyResource.count({ where });

  const resourcesWithVoteStatus = resources.map((resource) => ({
    ...resource,
    hasUpvoted: userId ? resource.upvotedBy.length > 0 : false,
    upvotedBy: undefined,
  }));

  return {
    resources: resourcesWithVoteStatus,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}  
