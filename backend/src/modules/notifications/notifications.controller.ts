import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { BadRequest, Unauthorized } from '../../utils/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw BadRequest('Identifiant invalide');
  return id;
}

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await notificationsService.listForUser(req.user));
    } catch (err) {
      next(err);
    }
  },

  async countUnread(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const count = await notificationsService.countUnread(req.user);
      res.json({ count });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await notificationsService.markAsRead(req.user, parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await notificationsService.markAllAsRead(req.user));
    } catch (err) {
      next(err);
    }
  },
};
