import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';

const app = createApp();

// On mocke Prisma pour ne pas avoir besoin d'une vraie BDD dans la CI
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    utilisateur: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('201 - cree un compte client', async () => {
    (mockPrisma.utilisateur.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 3, libelle: 'CLIENT' });
    (mockPrisma.utilisateur.create as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.fr',
      nom: 'Doe',
      prenom: 'John',
      role: { libelle: 'CLIENT' },
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.fr',
      motDePasse: 'Password123!',
      nom: 'Doe',
      prenom: 'John',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.utilisateur.email).toBe('test@test.fr');
    expect(res.body.utilisateur.role).toBe('CLIENT');
  });

  it('409 - email deja utilise', async () => {
    (mockPrisma.utilisateur.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.fr' });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.fr',
      motDePasse: 'Password123!',
      nom: 'Doe',
      prenom: 'John',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('email');
  });

  it('400 - donnees invalides (email manquant)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      motDePasse: 'Password123!',
      nom: 'Doe',
      prenom: 'John',
    });
    expect(res.status).toBe(400);
  });

  it('400 - mot de passe trop court', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.fr',
      motDePasse: '123',
      nom: 'Doe',
      prenom: 'John',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401 - utilisateur inexistant', async () => {
    (mockPrisma.utilisateur.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nope@test.fr',
      motDePasse: 'Password123!',
    });

    expect(res.status).toBe(401);
  });

  it('401 - mauvais mot de passe', async () => {
    (mockPrisma.utilisateur.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.fr',
      // hash de "Password123!" : on utilise un hash different pour simuler un mauvais mdp
      motDePasse: '$2b$10$invalid',
      role: { libelle: 'CLIENT' },
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.fr',
      motDePasse: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('400 - email invalide', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'pas-un-email',
      motDePasse: 'Password123!',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('401 - sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 - token invalide', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  it('200 - healthcheck', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
