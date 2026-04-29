import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Liste des notifications de l'utilisateur connecte (50 dernieres)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des notifications }
 */
router.get('/', notificationsController.list);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Nombre de notifications non lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Compteur de non-lues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */
router.get('/unread-count', notificationsController.countUnread);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Toutes les notifications marquees lues }
 */
router.patch('/read-all', notificationsController.markAllAsRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Notification marquee lue }
 *       403: { description: Acces interdit }
 *       404: { description: Notification introuvable }
 */
router.patch('/:id/read', notificationsController.markAsRead);

export default router;
