export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  reputationScore: number;
  schoolId: string;
  school: {
    id: string;
    name: string;
    domain: string;
  };
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  department: {
    id: string;
    name: string;
  };
  reviewCount?: number;
  resourceCount?: number;
  flashcardsCount?: number;
  notesCount?: number;
  averageOverallRating?: number;
  averageWorkloadRating?: number;
  averageDifficultyRating?: number;
  isSaved?: boolean;
}

export interface Review {
  id: string;
  workloadRating: number;
  difficultyRating: number;
  overallRating: number;
  examStyle: string | null;
  attendanceRequired: boolean;
  reviewText: string;
  helpfulVotes: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    reputationScore: number;
  };
  course?: Course;
  hasVoted?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  order: number;
}

export interface StudyResource {
  id: string;
  type: 'FLASHCARDS' | 'NOTES';
  title: string;
  examTag: string | null;
  upvotes: number;
  usedCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    courseCode: string;
    title: string;
  };
  flashcards?: Flashcard[];
  flashcardCount?: number;
  fileCount?: number;
  extractedText?: string;
  hasUpvoted?: boolean;
  isSaved?: boolean;
}

export interface Analytics {
  studyStats: {
    totalFlashcardsCreated: number;
    totalFlashcardSets: number;
    estimatedStudyHours: number;
    totalResourcesUsed: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastStudied: string | null;
    totalStudyDays: number;
  };
  rank: {
    rank: number;
    totalUsers: number;
    percentile: number;
    reputation: number;
  };
}