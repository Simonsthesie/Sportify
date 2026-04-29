import { Router } from 'express';
import { avisController } from './avis.controller';
import { authenticate, authorize } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { createAvisSchema } from './avis.validators';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /avis:
 *   post:
 *     summary: Publier un avis sur une seance (client uniquement)
 *     tags: [Avis]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seanceId, note]
 *             properties:
 *               seanceId: { type: integer }
 *               note: { type: integer, minimum: 1, maximum: 5 }
 *               commentaire: { type: string }
 *     responses:
 *       201: { description: Avis cree }
 *       400: { description: Donnees invalides }
 *       403: { description: Role insuffisant }
 *       409: { description: Avis deja publie pour cette seance }
 */
router.post('/', authorize('CLIENT'), validate(createAvisSchema), avisController.create);

/**
 * @openapi
 * /avis/seance/{seanceId}:
 *   get:
 *     summary: Liste des avis d'une seance
 *     tags: [Avis]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: seanceId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Liste des avis }
 */
router.get('/seance/:seanceId', avisController.listForSeance);

/**
 * @openapi
 * /avis/seance/{seanceId}/stats:
 *   get:
 *     summary: Statistiques des avis d'une seance (note moyenne, total)
 *     tags: [Avis]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: seanceId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Stats de notation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 moyenne: { type: number }
 *                 total: { type: integer }
 */
router.get('/seance/:seanceId/stats', avisController.getStats);

export default router;
