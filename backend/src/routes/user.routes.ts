import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getUserProfile);

// User's content
router.get('/reviews', userController.getUserReviews);
router.get('/resources', userController.getUserResources);

// Saved content
router.get('/saved/resources', userController.getSavedResources);

// Reputation & stats
router.get('/reputation', userController.getReputationBreakdown);
router.get('/stats', userController.getUserActivityStats);

// Save/unsave resources
router.post('/resources/:resourceId/save', userController.saveResource);
router.delete('/resources/:resourceId/save', userController.unsaveResource);

export default router;