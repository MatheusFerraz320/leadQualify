import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { LeadStatus, UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DashboardService } from './dashboard.service.js';
import type { AuthenticatedUser } from '../common/guards/auth.guard.js';

const collaborator: AuthenticatedUser = {
  sub: 'user-collab',
  name: 'Colab',
  email: 'colab@test.com',
  role: UserRole.COLLABORATOR,
};

const admin: AuthenticatedUser = {
  sub: 'user-admin',
  name: 'Admin',
  email: 'admin@test.com',
  role: UserRole.ADMIN,
};

const prisma = {
  lead: {
    groupBy: jest.fn(),
    count: jest.fn(),
  },
  users: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(DashboardService);
  });

  function mockStatusGroups() {
    prisma.lead.groupBy.mockImplementation((args: { by: string[] }) => {
      if (args.by.length === 1 && args.by[0] === 'status') {
        return Promise.resolve([
          { status: LeadStatus.PENDING, _count: { _all: 2 } },
          { status: LeadStatus.APPROVED, _count: { _all: 3 } },
          { status: LeadStatus.REJECTED, _count: { _all: 1 } },
        ]);
      }
      if (args.by.includes('product')) {
        return Promise.resolve([
          { product: 'Filtro B2', _count: { _all: 4 } },
          { product: '', _count: { _all: 2 } },
        ]);
      }
      if (args.by.includes('utmCampanha')) {
        return Promise.resolve([
          { utmCampanha: 'campanha-1', _count: { _all: 3 } },
        ]);
      }
      if (args.by.includes('userId')) {
        return Promise.resolve([
          {
            userId: 'user-collab',
            status: LeadStatus.APPROVED,
            _count: { _all: 3 },
          },
          {
            userId: 'user-collab',
            status: LeadStatus.PENDING,
            _count: { _all: 2 },
          },
          {
            userId: 'user-collab',
            status: LeadStatus.REJECTED,
            _count: { _all: 1 },
          },
        ]);
      }
      return Promise.resolve([]);
    });
  }

  describe('summary', () => {
    it('colaborador tem métricas escopadas ao próprio userId', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await service.summary(collaborator);

      const groupByCalls = prisma.lead.groupBy.mock.calls.map(
        (call) => call[0] as { where?: { userId?: string } },
      );
      expect(
        groupByCalls.every((call) => call.where?.userId === 'user-collab'),
      ).toBe(true);
      expect(result.totals.total).toBe(6);
      expect(result.totals.approved).toBe(3);
      expect(result.totals.pending).toBe(2);
      expect(result.totals.rejected).toBe(1);
      expect(result.totals.conversionRate).toBeCloseTo(0.5);
      expect(result.byUser).toEqual([]);
    });

    it('colaborador ignora userId passado na request', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      await service.summary(collaborator, 'user-admin');

      const groupByCalls = prisma.lead.groupBy.mock.calls.map(
        (call) => call[0] as { where?: { userId?: string } },
      );
      expect(
        groupByCalls.every((call) => call.where?.userId === 'user-collab'),
      ).toBe(true);
    });

    it('admin vê métricas gerais sem filtro', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);
      prisma.users.findMany.mockResolvedValue([
        { id: 'user-collab', name: 'Colab', email: 'colab@test.com' },
      ]);

      const result = await service.summary(admin);

      const groupByCalls = prisma.lead.groupBy.mock.calls.map(
        (call) => call[0] as { where?: { userId?: string } },
      );
      expect(
        groupByCalls.some((call) => call.where?.userId === undefined),
      ).toBe(true);
      expect(result.byUser).toHaveLength(1);
      expect(result.byUser[0].total).toBe(6);
      expect(result.byUser[0].user?.email).toBe('colab@test.com');
    });

    it('admin filtra métricas por cliente', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      await service.summary(admin, 'user-collab');

      const groupByCalls = prisma.lead.groupBy.mock.calls.map(
        (call) => call[0] as { where?: { userId?: string } },
      );
      expect(
        groupByCalls.every((call) => call.where?.userId === 'user-collab'),
      ).toBe(true);
    });

    it('calcula delta mensal', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValueOnce(5).mockResolvedValueOnce(4);
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await service.summary(admin);

      expect(result.totals.newThisMonth).toBe(5);
      expect(result.totals.previousMonth).toBe(4);
      expect(result.totals.monthDeltaPct).toBe(25);
    });

    it('escopa métricas ao mês informado', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      await service.summary(admin, undefined, '2026-03');

      const groupByCalls = prisma.lead.groupBy.mock.calls.map(
        (call) =>
          call[0] as {
            where?: { createdAt?: { gte?: Date; lt?: Date } };
          },
      );
      for (const call of groupByCalls) {
        expect(call.where?.createdAt?.gte).toEqual(
          new Date(Date.UTC(2026, 2, 1)),
        );
        expect(call.where?.createdAt?.lt).toEqual(
          new Date(Date.UTC(2026, 3, 1)),
        );
      }
    });

    it('mantém tendência mensal sem filtro de mês', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      await service.summary(admin, undefined, '2026-03');

      const queryRawCall = prisma.$queryRaw.mock.calls[0]?.[0] as
        { values?: unknown[] } | undefined;
      expect(queryRawCall?.values).toEqual([]);
    });

    it('calcula delta relativo ao mês selecionado', async () => {
      mockStatusGroups();
      prisma.lead.count.mockResolvedValueOnce(5).mockResolvedValueOnce(4);
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await service.summary(admin, undefined, '2026-03');

      expect(result.totals.newThisMonth).toBe(5);
      expect(result.totals.previousMonth).toBe(4);
      expect(result.totals.monthDeltaPct).toBe(25);

      const countCalls = prisma.lead.count.mock.calls.map(
        (call) =>
          call[0] as {
            where?: { createdAt?: { gte?: Date; lt?: Date } };
          },
      );
      expect(countCalls[0]?.where?.createdAt).toEqual({
        gte: new Date(Date.UTC(2026, 2, 1)),
        lt: new Date(Date.UTC(2026, 3, 1)),
      });
      expect(countCalls[1]?.where?.createdAt).toEqual({
        gte: new Date(Date.UTC(2026, 1, 1)),
        lt: new Date(Date.UTC(2026, 2, 1)),
      });
    });
  });
});
