/**
 * Notifications in-app par utilisateur (lu / non lu). Utilise aussi create() depuis autres services.
 */
import { prisma } from '../../config/prisma';
import { JwtPayload } from '../../utils/jwt';
import { NotFound, Forbidden } from '../../utils/errors';

export const notificationsService = {
  async listForUser(user: JwtPayload) {
    return prisma.notification.findMany({
      where: { userId: user.sub },
      orderBy: { creeLe: 'desc' },
      take: 50,
    });
  },

  async countUnread(user: JwtPayload) {
    return prisma.notification.count({ where: { userId: user.sub, lu: false } });
  },

  async markAsRead(user: JwtPayload, notificationId: number) {
    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif) throw NotFound('Notification introuvable');
    if (notif.userId !== user.sub) throw Forbidden('Acces interdit');
    return prisma.notification.update({ where: { id: notificationId }, data: { lu: true } });
  },

  async markAllAsRead(user: JwtPayload) {
    await prisma.notification.updateMany({
      where: { userId: user.sub, lu: false },
      data: { lu: true },
    });
    return { success: true };
  },

  async create(userId: number, message: string) {
    return prisma.notification.create({ data: { userId, message } });
  },
};
