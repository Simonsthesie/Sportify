import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { BadRequest, Unauthorized } from '../../utils/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw BadRequest('Identifiant invalide');
  return id;
}

export const usersController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.list());
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await usersService.getMe(req.user.sub));
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await usersService.updateProfile(req.user.sub, req.body));
    } catch (err) {
      next(err);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await usersService.updatePassword(req.user.sub, req.body.currentPassword, req.body.newPassword));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.getById(parseId(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.updateRole(parseId(req.params.id), req.body.role));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.remove(parseId(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
