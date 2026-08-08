import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadStatus, UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LeadsService } from './leads.service.js';
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
  users: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  lead: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    groupBy: jest.fn(),
  },
};

const config = { get: jest.fn() };

describe('LeadsService', () => {
  let service: LeadsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    config.get.mockReturnValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(LeadsService);
  });

  describe('ingestFromWebhook', () => {
    const user = { id: 'user-collab', name: 'Colab', email: 'colab@test.com' };

    it('cria lead com token válido e campos mapeados', async () => {
      prisma.users.findUnique.mockResolvedValue(user);
      prisma.lead.upsert.mockResolvedValue({ id: 'lead-1' });
      config.get.mockImplementation((key: string) =>
        key === 'RD_FIELD_PRODUCT' ? 'cf_produto' : 'cf_finalidade',
      );

      await service.ingestFromWebhook('token-x', {
        event_type: 'WEBHOOK.CONVERTED',
        contact: {
          email: 'A@B.COM',
          name: 'João',
          personal_phone: '48 9999-9999',
          cf_produto: ['Plano Pro'],
          cf_finalidade: 'Compra',
        },
      });

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { rdWebhookToken: 'token-x' },
      });
      expect(prisma.lead.upsert).toHaveBeenCalledWith({
        where: { userId_email: { userId: 'user-collab', email: 'a@b.com' } },
        create: {
          userId: 'user-collab',
          email: 'a@b.com',
          name: 'João',
          phone: '48 9999-9999',
          product: 'Plano Pro',
          finality: 'Compra',
        },
        update: {
          name: 'João',
          phone: '48 9999-9999',
          product: 'Plano Pro',
          finality: 'Compra',
        },
      });
    });

    it('usa defaults para os campos customizados quando não configurados', async () => {
      prisma.users.findUnique.mockResolvedValue(user);
      prisma.lead.upsert.mockResolvedValue({ id: 'lead-1' });

      await service.ingestFromWebhook('token-x', {
        contact: { email: 'joao@test.com', name: 'João' },
      });

      const args = prisma.lead.upsert.mock.calls[0][0] as {
        create: Record<string, unknown>;
      };
      expect(args.create.product).toBe('');
      expect(args.create.finality).toBe('');
      expect(args.create.phone).toBe('');
    });

    it('rejeita token inexistente', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.ingestFromWebhook('token-invalido', {
          contact: { email: 'a@b.com', name: 'A' },
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('aceita payload sem email sem gravar', async () => {
      prisma.users.findUnique.mockResolvedValue(user);

      const result = await service.ingestFromWebhook('token-x', {
        contact: { name: 'Sem Email' },
      });

      expect(result).toEqual({ accepted: false, reason: 'missing_email' });
      expect(prisma.lead.upsert).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('colaborador vê apenas os próprios leads', async () => {
      await service.findAll(collaborator, {});

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-collab' },
        }),
      );
    });

    it('admin vê todos e pode filtrar por userId', async () => {
      await service.findAll(admin, { userId: 'user-collab' });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-collab' },
        }),
      );
    });

    it('aplica filtros de status e busca', async () => {
      await service.findAll(admin, {
        status: LeadStatus.PENDING,
        search: 'maria',
      });

      const where = prisma.lead.findMany.mock.calls[0][0] as {
        where: { status: LeadStatus; OR: unknown[] };
      };
      expect(where.where.status).toBe(LeadStatus.PENDING);
      expect(where.where.OR).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('colaborador não encontra lead de outro usuário', async () => {
      prisma.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('lead-outro', collaborator),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.lead.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lead-outro', userId: 'user-collab' },
        }),
      );
    });

    it('admin encontra lead de qualquer usuário', async () => {
      const lead = { id: 'lead-1', userId: 'user-collab' };
      prisma.lead.findFirst.mockResolvedValue(lead);

      const result = await service.findOne('lead-1', admin);

      expect(result).toBe(lead);
    });
  });

  describe('update', () => {
    it('colaborador atualiza apenas lead próprio', async () => {
      prisma.lead.findFirst.mockResolvedValue({
        id: 'lead-1',
        userId: 'user-collab',
      });
      prisma.lead.update.mockResolvedValue({ id: 'lead-1' });

      await service.update('lead-1', collaborator, {
        status: LeadStatus.APPROVED,
      });

      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: { status: LeadStatus.APPROVED },
        include: expect.anything(),
      });
    });

    it('lança NotFound se não é dono', async () => {
      prisma.lead.findFirst.mockResolvedValue(null);

      await expect(
        service.update('lead-outro', collaborator, {
          status: LeadStatus.APPROVED,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('colaborador não exclui lead de outro usuário', async () => {
      prisma.lead.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.remove('lead-outro', collaborator),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.lead.deleteMany).toHaveBeenCalledWith({
        where: { id: 'lead-outro', userId: 'user-collab' },
      });
    });

    it('admin exclui qualquer lead', async () => {
      prisma.lead.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.remove('lead-1', admin)).resolves.toBeUndefined();
    });
  });

  describe('findByUser', () => {
    it('retorna contagem agrupada por usuário', async () => {
      prisma.lead.groupBy.mockResolvedValue([
        { userId: 'user-collab', _count: { _all: 3 } },
        { userId: 'user-admin', _count: { _all: 1 } },
      ]);
      prisma.users.findMany.mockResolvedValue([
        { id: 'user-collab', name: 'Colab', email: 'colab@test.com' },
        { id: 'user-admin', name: 'Admin', email: 'admin@test.com' },
      ]);

      const result = await service.findByUser();

      expect(result).toEqual([
        { userId: 'user-collab', user: expect.anything(), total: 3 },
        { userId: 'user-admin', user: expect.anything(), total: 1 },
      ]);
    });
  });
});
