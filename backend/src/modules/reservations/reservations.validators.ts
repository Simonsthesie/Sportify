import { z } from 'zod';

export const createReservationSchema = z.object({
  seanceId: z.coerce.number().int().positive(),
});

export const joinWaitingListSchema = z.object({
  seanceId: z.coerce.number().int().positive(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type JoinWaitingListInput = z.infer<typeof joinWaitingListSchema>;
