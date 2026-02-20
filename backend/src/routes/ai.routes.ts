import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate, requireEmailVerified } from '../middleware/auth';

const router = Router();

// Generate flashcards from text
router.post(
  '/generate-flashcards',
  authenticate,
  requireEmailVerified,
  aiController.generateFlashcards
);

// Generate flashcards from uploaded resource
router.post(
  '/resources/:resourceId/generate-flashcards',
  authenticate,
  requireEmailVerified,
  aiController.generateFlashcardsFromResource
);

// Generate study guide from multiple resources
router.post(
  '/generate-study-guide',
  authenticate,
  requireEmailVerified,
  aiController.generateStudyGuide
);

// Generate practice quiz
router.post(
  '/generate-quiz',
  authenticate,
  requireEmailVerified,
  aiController.generateQuiz
);

// Summarize notes
router.post(
  '/resources/:resourceId/summarize',
  authenticate,
  requireEmailVerified,
  aiController.summarizeNotes
);

export default router;