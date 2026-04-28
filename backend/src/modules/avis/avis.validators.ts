import { z } from 'zod';

export const createAvisSchema = z.object({
  seanceId: z.coerce.number().int().positive(),
  note: z.coerce.number().int().min(1).max(5),
  commentaire: z.string().max(1000).optional(),
});

export type CreateAvisInput = z.infer<typeof createAvisSchema>;
