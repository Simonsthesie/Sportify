import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { authenticate } from '../../middlewares/auth';

const router = Router();

/**
 * @openapi
 * /coaches:
 *   get:
 *     summary: Liste de tous les coachs
 *     tags: [Coaches]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des coachs avec leurs informations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   specialite: { type: string }
 *                   bio: { type: string }
 *                   utilisateur:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       nom: { type: string }
 *                       prenom: { type: string }
 *                       email: { type: string }
 */
router.get('/', authenticate, async (_req: Request, res: Response) => {
  const coaches = await prisma.coach.findMany({
    include: {
      utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
    },
    orderBy: { utilisateur: { nom: 'asc' } },
  });
  res.json(coaches.map((c) => ({
    id: c.id,
    specialite: c.specialite,
    bio: c.bio,
    utilisateur: c.utilisateur,
  })));
});

export default router;
