import { Router } from 'express';
import * as schoolController from '../controllers/school.controller';

const router = Router();

router.get('/', schoolController.listSchools);

export default router;