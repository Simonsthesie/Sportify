import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { signToken } from '../../src/utils/jwt';

const app = createApp();

jest.mock('../../src/config/prisma', () => ({
  prisma: {
    seance: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    coach: { findUnique: jest.fn() },
    reservation: { count: jest.fn() },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const clientToken = signToken({ sub: 4, email: 'client@test.fr', role: 'CLIENT' });
const coachToken  = signToken({ sub: 2, email: 'coach@test.fr',  role: 'COACH'  });
const adminToken  = signToken({ sub: 1, email: 'admin@test.fr',  role: 'ADMIN'  });

const mockSeances = [
  {
    id: 1, titre: 'Yoga', description: null,
    dateDebut: new Date('2026-06-01T09:00:00Z'),
    dateFin: new Date('2026-06-01T10:00:00Z'),
    capaciteMax: 10, lieu: 'Salle 1', creeLe: new Date(), majLe: new Date(),
    coach: { id: 1, specialite: 'Yoga', bio: null, utilisateur: { id: 2, nom: 'Durand', prenom: 'Marie', email: 'coach@test.fr' } },
    _count: { reservations: 3 },
  },
];

describe('GET /api/seances', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401 - sans token', async () => {
    const res = await request(app).get('/api/seances');
    expect(res.status).toBe(401);
  });

  it('200 - retourne la liste des seances avec pagination', async () => {
    (mockPrisma.seance.findMany as jest.Mock).mockResolvedValue(mockSeances);
    (mockPrisma.seance.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/seances')
      .set('Authorization', 'Bearer ' + clientToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].titre).toBe('Yoga');
    expect(res.body.data[0].placesRestantes).toBe(7);
    expect(res.body.pagination.total).toBe(1);
  });

  it('200 - supporte les filtres ?q=yoga', async () => {
    (mockPrisma.seance.findMany as jest.Mock).mockResolvedValue(mockSeances);
    (mockPrisma.seance.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/seances?q=yoga')
      .set('Authorization', 'Bearer ' + clientToken);

    expect(res.status).toBe(200);
  });

  it('400 - page invalide', async () => {
    const res = await request(app)
      .get('/api/seances?page=-1')
      .set('Authorization', 'Bearer ' + clientToken);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/seances', () => {
  beforeEach(() => jest.clearAllMocks());

  it('403 - CLIENT ne peut pas creer une seance', async () => {
    const res = await request(app)
      .post('/api/seances')
      .set('Authorization', 'Bearer ' + clientToken)
      .send({ titre: 'Test', dateDebut: '2026-06-01T09:00:00Z', dateFin: '2026-06-01T10:00:00Z', capaciteMax: 10 });

    expect(res.status).toBe(403);
  });

  it('201 - COACH peut creer une seance', async () => {
    (mockPrisma.coach.findUnique as jest.Mock).mockResolvedValue({ id: 1, utilisateurId: 2 });
    (mockPrisma.seance.create as jest.Mock).mockResolvedValue({
      ...mockSeances[0], _count: { reservations: 0 },
    });

    const res = await request(app)
      .post('/api/seances')
      .set('Authorization', 'Bearer ' + coachToken)
      .send({ titre: 'Yoga', dateDebut: '2026-06-01T09:00:00Z', dateFin: '2026-06-01T10:00:00Z', capaciteMax: 10 });

    expect(res.status).toBe(201);
    expect(res.body.titre).toBe('Yoga');
  });

  it('400 - donnees invalides (dateFin < dateDebut)', async () => {
    const res = await request(app)
      .post('/api/seances')
      .set('Authorization', 'Bearer ' + coachToken)
      .send({ titre: 'Test', dateDebut: '2026-06-01T10:00:00Z', dateFin: '2026-06-01T09:00:00Z', capaciteMax: 10 });

    expect(res.status).toBe(400);
  });
});
