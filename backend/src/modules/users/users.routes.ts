import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { updateRoleSchema, updateProfileSchema, updatePasswordSchema } from './users.validators';

const router = Router();

router.use(authenticate);

// Routes profil personnel (tout utilisateur connecte)
router.get('/me', usersController.getMe);
router.patch('/me', validate(updateProfileSchema), usersController.updateMe);
router.patch('/me/password', validate(updatePasswordSchema), usersController.updatePassword);

// Routes admin
router.get('/', authorize('ADMIN'), usersController.list);
router.get('/:id', authorize('ADMIN'), usersController.getById);
router.patch('/:id/role', authorize('ADMIN'), validate(updateRoleSchema), usersController.updateRole);
router.delete('/:id', authorize('ADMIN'), usersController.remove);

export default router;
