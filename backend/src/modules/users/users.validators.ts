import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'COACH', 'CLIENT']),
});

export const updateProfileSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;