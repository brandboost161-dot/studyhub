import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate, requireEmailVerified } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/courses/:courseId/reviews', reviewController.listReviews);
router.get('/courses/:courseId/stats', reviewController.getCourseStats);
router.get('/:reviewId', reviewController.getReview);

// Protected routes
router.post(
  '/courses/:courseId/reviews',
  authenticate,
  requireEmailVerified,
  reviewController.createReview
);

router.put(
  '/:reviewId',
  authenticate,
  requireEmailVerified,
  reviewController.updateReview
);

router.delete(
  '/:reviewId',
  authenticate,
  reviewController.deleteReview
);

router.post(
  '/:reviewId/helpful',
  authenticate,
  reviewController.voteHelpful
);

router.delete(
  '/:reviewId/helpful',
  authenticate,
  reviewController.removeHelpfulVote
);

export default router;