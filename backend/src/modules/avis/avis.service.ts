import { prisma } from '../../config/prisma';
import { BadRequest, Conflict, Forbidden, NotFound } from '../../utils/errors';
import { JwtPayload } from '../../utils/jwt';
import { StatutReservation } from '@prisma/client';
import { CreateAvisInput } from './avis.validators';

export const avisService = {
  async listForSeance(seanceId: number) {
    const seance = await prisma.seance.findUnique({ where: { id: seanceId } });
    if (!seance) throw NotFound('Seance introuvable');

    return prisma.avis.findMany({
      where: { seanceId },
      orderBy: { creeLe: 'desc' },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
      },
    });
  },

  async create(user: JwtPayload, input: CreateAvisInput) {
    const seance = await prisma.seance.findUnique({ where: { id: input.seanceId } });
    if (!seance) throw NotFound('Seance introuvable');

    if (new Date(seance.dateFin).getTime() > Date.now()) {
      throw BadRequest('Vous ne pouvez noter une seance qu\'apres qu\'elle soit terminee');
    }

    const reservation = await prisma.reservation.findUnique({
      where: { uq_client_seance: { clientId: user.sub, seanceId: input.seanceId } },
    });
    if (!reservation || reservation.statut !== StatutReservation.CONFIRMEE) {
      throw Forbidden('Vous devez avoir participe a cette seance pour la noter');
    }

    const existing = await prisma.avis.findUnique({
      where: { uq_avis_client_seance: { clientId: user.sub, seanceId: input.seanceId } },
    });
    if (existing) throw Conflict('Vous avez deja note cette seance');

    return prisma.avis.create({
      data: {
        clientId: user.sub,
        seanceId: input.seanceId,
        note: input.note,
        commentaire: input.commentaire,
      },
      include: {
        client: { select: { id: true, nom: true, prenom: true } },
      },
    });
  },

  async getStats(seanceId: number) {
    const avis = await prisma.avis.findMany({ where: { seanceId } });
    if (avis.length === 0) return { count: 0, moyenne: null };
    const moyenne = avis.reduce((sum, a) => sum + a.note, 0) / avis.length;
    return { count: avis.length, moyenne: Math.round(moyenne * 10) / 10 };
  },
};
