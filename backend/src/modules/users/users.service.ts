/**
 * CRUD utilisateurs (admin), profil / mot de passe connecte ; promotion COACH cree la ligne coach si besoin.
 */
import { prisma } from '../../config/prisma';
import { NotFound, BadRequest, Unauthorized } from '../../utils/errors';
import { RoleLibelle } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';

const safeUserSelect = {
  id: true,
  email: true,
  nom: true,
  prenom: true,
  creeLe: true,
  majLe: true,
  role: { select: { libelle: true } },
} as const;

export const usersService = {
  list() {
    return prisma.utilisateur.findMany({
      orderBy: { id: 'asc' },
      select: safeUserSelect,
    });
  },

  async getById(id: number) {
    const user = await prisma.utilisateur.findUnique({ where: { id }, select: safeUserSelect });
    if (!user) throw NotFound('Utilisateur introuvable');
    return user;
  },

  async getMe(id: number) {
    const user = await prisma.utilisateur.findUnique({ where: { id }, select: safeUserSelect });
    if (!user) throw NotFound('Utilisateur introuvable');
    return user;
  },

  async updateProfile(id: number, data: { nom?: string; prenom?: string }) {
    const user = await prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw NotFound('Utilisateur introuvable');
    return prisma.utilisateur.update({ where: { id }, data, select: safeUserSelect });
  },

  async updatePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw NotFound('Utilisateur introuvable');

    const valid = await comparePassword(currentPassword, user.motDePasse);
    if (!valid) throw Unauthorized('Mot de passe actuel incorrect');

    const hashed = await hashPassword(newPassword);
    await prisma.utilisateur.update({ where: { id }, data: { motDePasse: hashed } });
    return { success: true };
  },

  async updateRole(id: number, libelle: RoleLibelle) {
    const role = await prisma.role.findUnique({ where: { libelle } });
    if (!role) throw BadRequest('Role inconnu');

    if (libelle === 'COACH') {
      // Un coach doit exister en table coach : specialite par defaut si creation
      const existingCoach = await prisma.coach.findUnique({ where: { utilisateurId: id } });
      if (!existingCoach) {
        await prisma.coach.create({ data: { utilisateurId: id, specialite: 'A definir' } });
      }
    }

    return prisma.utilisateur.update({ where: { id }, data: { roleId: role.id }, select: safeUserSelect });
  },

  async remove(id: number) {
    const user = await prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw NotFound('Utilisateur introuvable');
    await prisma.utilisateur.delete({ where: { id } });
  },
};
