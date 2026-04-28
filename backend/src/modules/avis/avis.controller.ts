import { Request, Response, NextFunction } from 'express';
import { avisService } from './avis.service';
import { BadRequest, Unauthorized } from '../../utils/errors';

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw BadRequest('Identifiant invalide');
  return id;
}

export const avisController = {
  async listForSeance(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await avisService.listForSeance(parseId(req.params.seanceId)));
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await avisService.getStats(parseId(req.params.seanceId)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Unauthorized();
      const avis = await avisService.create(req.user, req.body);
      res.status(201).json(avis);
    } catch (err) {
      next(err);
    }
  },
};
