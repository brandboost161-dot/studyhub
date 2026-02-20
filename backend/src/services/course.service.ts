import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

// ============================================
// LIST COURSES
// ============================================
export async function listCourses(params: {
  schoolId: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { schoolId, departmentId, search, page = 1, limit = 20 } = params;

  const skip = (page - 1) * limit;

  const where: any = {
    schoolId,
  };

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search && search.length > 0) {
    where.OR = [
      { courseCode: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            studyResources: true,
          },
        },
      },
      orderBy: [
        { courseCode: 'asc' },
      ],
    }),
    prisma.course.count({ where }),
  ]);

  // Get average ratings for each course
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const reviews = await prisma.courseReview.findMany({
        where: { courseId: course.id },
        select: {
          overallRating: true,
          workloadRating: true,
          difficultyRating: true,
        },
      });

      let stats = {
        averageOverallRating: 0,
        averageWorkloadRating: 0,
        averageDifficultyRating: 0,
      };

      if (reviews.length > 0) {
        const sum = reviews.reduce(
          (acc, r) => ({
            overall: acc.overall + r.overallRating,
            workload: acc.workload + r.workloadRating,
            difficulty: acc.difficulty + r.difficultyRating,
          }),
          { overall: 0, workload: 0, difficulty: 0 }
        );

        stats = {
          averageOverallRating: Math.round((sum.overall / reviews.length) * 10) / 10,
          averageWorkloadRating: Math.round((sum.workload / reviews.length) * 10) / 10,
          averageDifficultyRating: Math.round((sum.difficulty / reviews.length) * 10) / 10,
        };
      }

      return {
        ...course,
        reviewCount: course._count.reviews,
        resourceCount: course._count.studyResources,
        ...stats,
      };
    })
  );

  return {
    courses: coursesWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// GET COURSE DETAILS
// ============================================
export async function getCourseDetails(params: {
  courseId: string;
  userId?: string;
}) {
  const { courseId, userId } = params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
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
        },
      },
    },
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'NOT_FOUND');
  }

  // Get review stats
  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    select: {
      overallRating: true,
      workloadRating: true,
      difficultyRating: true,
      attendanceRequired: true,
    },
  });

  let stats = {
    reviewCount: reviews.length,
    averageOverallRating: 0,
    averageWorkloadRating: 0,
    averageDifficultyRating: 0,
    attendanceRequiredPercent: 0,
  };

  if (reviews.length > 0) {
    const sum = reviews.reduce(
      (acc, r) => ({
        overall: acc.overall + r.overallRating,
        workload: acc.workload + r.workloadRating,
        difficulty: acc.difficulty + r.difficultyRating,
        attendance: acc.attendance + (r.attendanceRequired ? 1 : 0),
      }),
      { overall: 0, workload: 0, difficulty: 0, attendance: 0 }
    );

    stats = {
      reviewCount: reviews.length,
      averageOverallRating: Math.round((sum.overall / reviews.length) * 10) / 10,
      averageWorkloadRating: Math.round((sum.workload / reviews.length) * 10) / 10,
      averageDifficultyRating: Math.round((sum.difficulty / reviews.length) * 10) / 10,
      attendanceRequiredPercent: Math.round((sum.attendance / reviews.length) * 100),
    };
  }

  // Check if user has saved this course
  let isSaved = false;
  if (userId) {
    const saved = await prisma.savedCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    isSaved = !!saved;
  }

  // Get resource counts by type
  const flashcardsCount = await prisma.studyResource.count({
    where: { courseId, type: 'FLASHCARDS' },
  });

  const notesCount = await prisma.studyResource.count({
    where: { courseId, type: 'NOTES' },
  });

  return {
    ...course,
    ...stats,
    flashcardsCount,
    notesCount,
    isSaved,
  };
}

// ============================================
// SAVE/UNSAVE COURSE
// ============================================
export async function saveCourse(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'NOT_FOUND');
  }

  // Check if already saved
  const existing = await prisma.savedCourse.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existing) {
    throw new AppError('Course already saved', 400, 'ALREADY_SAVED');
  }

  await prisma.savedCourse.create({
    data: {
      userId,
      courseId,
    },
  });

  return { message: 'Course saved successfully' };
}

export async function unsaveCourse(courseId: string, userId: string) {
  const existing = await prisma.savedCourse.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Course not saved', 400, 'NOT_SAVED');
  }

  await prisma.savedCourse.delete({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  return { message: 'Course unsaved successfully' };
}

// ============================================
// LIST DEPARTMENTS
// ============================================
export async function listDepartments(schoolId: string) {
  const departments = await prisma.department.findMany({
    where: { schoolId },
    include: {
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    courseCount: dept._count.courses,
  }));
}

// ============================================
// GET SAVED COURSES
// ============================================
export async function getSavedCourses(userId: string) {
  const savedCourses = await prisma.savedCourse.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              studyResources: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return savedCourses.map((sc) => sc.course);
}