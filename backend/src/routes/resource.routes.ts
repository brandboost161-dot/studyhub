import { Router } from 'express';
import * as resourceController from '../controllers/resource.controller';
import { authenticate, requireEmailVerified } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

// List flashcard sets for a course (public - optional auth)
router.get('/courses/:courseId/flashcards', resourceController.listFlashcardSets);

// List notes for a course (public - optional auth)
router.get('/courses/:courseId/notes', resourceController.listNotes);

// Get single resource (public - optional auth)
router.get('/:resourceId', resourceController.getFlashcardSet);

// Protected routes (require authentication)
router.post(
  '/courses/:courseId/flashcards',
  authenticate,
  requireEmailVerified,
  resourceController.createFlashcardSet
);

// Upload notes
router.post(
  '/courses/:courseId/notes',
  authenticate,
  requireEmailVerified,
  upload.array('files', 10),
  resourceController.uploadNotes
);

router.put(
  '/:resourceId',
  authenticate,
  requireEmailVerified,
  resourceController.updateFlashcardSet
);

router.delete(
  '/:resourceId',
  authenticate,
  resourceController.deleteFlashcardSet
);

router.post(
  '/:resourceId/upvote',
  authenticate,
  resourceController.upvoteResource
);

router.delete(
  '/:resourceId/upvote',
  authenticate,
  resourceController.removeUpvote
);

router.post(
  '/:resourceId/increment-usage',
  resourceController.incrementUsage
);

export default router;