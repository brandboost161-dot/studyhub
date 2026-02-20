import { Router } from 'express';
import * as courseController from '../controllers/course.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// List courses (requires auth to scope to user's school)
router.get('/', authenticate, courseController.listCourses);

// Get course details
router.get('/:courseId', courseController.getCourseDetails);

// List departments
router.get('/departments/list', authenticate, courseController.listDepartments);

// Save/unsave course
router.post('/:courseId/save', authenticate, courseController.saveCourse);
router.delete('/:courseId/save', authenticate, courseController.unsaveCourse);

// Get saved courses
router.get('/saved/list', authenticate, courseController.getSavedCourses);

export default router;