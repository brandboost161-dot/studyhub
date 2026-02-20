import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Personal analytics
router.get('/study-stats', analyticsController.getUserStudyStats);
router.get('/streak', analyticsController.getStudyStreak);
router.get('/weak-areas', analyticsController.getWeakAreas);
router.get('/rank', analyticsController.getUserRank);

// School-wide analytics
router.get('/leaderboard', analyticsController.getSchoolLeaderboard);
router.get('/course-insights', analyticsController.getCourseInsights);

export default router;