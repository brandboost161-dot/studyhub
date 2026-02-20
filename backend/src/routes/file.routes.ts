import { Router } from 'express';
import * as fileController from '../controllers/file.controller';
import { authenticate, requireEmailVerified } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Create notes resource (empty, files uploaded separately)
router.post(
  '/courses/:courseId/notes',
  authenticate,
  requireEmailVerified,
  fileController.createNotesResource
);

// Upload file to notes resource
router.post(
  '/:resourceId/upload',
  authenticate,
  upload.single('file'), // 'file' is the form field name
  fileController.uploadFile
);

// Delete uploaded file
router.delete(
  '/:fileId',
  authenticate,
  fileController.deleteFile
);

export default router;