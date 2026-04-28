import { Request, Response, NextFunction } from 'express';
import { reservationsService } from './reservations.service';
import { BadRequest, Unauthorized } from '../../utils/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw BadRequest('Identifiant invalide');
  return id;
}

export const reservationsController = {
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await reservationsService.listForCurrent(req.user));
    } catch (err) {
      next(err);
    }
  },

  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await reservationsService.listAll());
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const reservation = await reservationsService.create(req.user, req.body.seanceId);
      res.status(201).json(reservation);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const reservation = await reservationsService.cancel(req.user, parseId(req.params.id));
      res.json(reservation);
    } catch (err) {
      next(err);
    }
  },

  async joinWaitingList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const entry = await reservationsService.joinWaitingList(req.user, req.body.seanceId);
      res.status(201).json(entry);
    } catch (err) {
      next(err);
    }
  },

  async leaveWaitingList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await reservationsService.leaveWaitingList(req.user, parseId(req.params.seanceId)));
    } catch (err) {
      next(err);
    }
  },

  async waitingListPosition(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const position = await reservationsService.getWaitingListPosition(req.user, parseId(req.params.seanceId));
      res.json({ position });
    } catch (err) {
      next(err);
    }
  },

  async listWaitingForSeance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      res.json(await reservationsService.listWaitingForSeance(parseId(req.params.seanceId)));
    } catch (err) {
      next(err);
    }
  },
};
