import { Router } from 'express';
import { reservationsController } from './reservations.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createReservationSchema, joinWaitingListSchema } from './reservations.validators';

const router = Router();

router.use(authenticate);

router.get('/me', reservationsController.listMine);
router.get('/', authorize('ADMIN'), reservationsController.listAll);
router.post('/', authorize('CLIENT'), validate(createReservationSchema), reservationsController.create);
router.patch('/:id/cancel', reservationsController.cancel);

// Liste d'attente
router.post('/attente', authorize('CLIENT'), validate(joinWaitingListSchema), reservationsController.joinWaitingList);
router.delete('/attente/:seanceId', authorize('CLIENT'), reservationsController.leaveWaitingList);
router.get('/attente/:seanceId/position', reservationsController.waitingListPosition);
router.get('/attente/:seanceId/list', authorize('COACH', 'ADMIN'), reservationsController.listWaitingForSeance);

export default router;
