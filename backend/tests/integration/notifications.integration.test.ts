import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { signToken } from '../../src/utils/jwt';

const app = createApp();

jest.mock('../../src/config/prisma', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const clientToken = signToken({ sub: 10, role: 'CLIENT', email: 'c@test.fr' });

describe('GET /api/notifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('200 - retourne la liste des notifications', async () => {
    (mockPrisma.notification.findMany as jest.Mock).mockResolvedValue([
      { id: 1, userId: 10, message: 'Test', lu: false, creeLe: new Date() },
    ]);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('401 - sans token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => jest.clearAllMocks());

  it('200 - retourne le nombre de non-lues', async () => {
    (mockPrisma.notification.count as jest.Mock).mockResolvedValue(3);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count', 3);
  });
});

describe('PATCH /api/notifications/read-all', () => {
  beforeEach(() => jest.clearAllMocks());

  it('200 - marque toutes les notifications comme lues', async () => {
    (mockPrisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  beforeEach(() => jest.clearAllMocks());

  it('200 - marque une notification comme lue', async () => {
    (mockPrisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 1, userId: 10, lu: false });
    (mockPrisma.notification.update as jest.Mock).mockResolvedValue({ id: 1, userId: 10, lu: true });

    const res = await request(app)
      .patch('/api/notifications/1/read')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
  });

  it('404 - notification inexistante', async () => {
    (mockPrisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/notifications/999/read')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(404);
  });
});
