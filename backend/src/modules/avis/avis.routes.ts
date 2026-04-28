import { Router } from 'express';
import { avisController } from './avis.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createAvisSchema } from './avis.validators';

const router = Router();

router.use(authenticate);

router.post('/', authorize('CLIENT'), validate(createAvisSchema), avisController.create);

router.get('/seance/:seanceId', avisController.listForSeance);

router.get('/seance/:seanceId/stats', avisController.getStats);

export default router;
