import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

const prisma = {
  users: {
    findMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

type OmitArg = { omit: Record<string, boolean> };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('findAll omite o token de webhook', async () => {
    prisma.users.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prisma.users.findMany).toHaveBeenCalledWith({
      omit: { password: true, rdWebhookToken: true },
    });
  });

  it('update omite o token de webhook', async () => {
    prisma.users.update.mockResolvedValue({ id: '1' });

    await service.update('1', { name: 'Atualizado' });

    const arg = prisma.users.update.mock.calls[0][0] as OmitArg;
    expect(arg.omit.password).toBe(true);
    expect(arg.omit.rdWebhookToken).toBe(true);
  });

  it('updateProfile omite o token de webhook', async () => {
    prisma.users.update.mockResolvedValue({ id: '1' });

    await service.updateProfile('1', { name: 'Atualizado' });

    const arg = prisma.users.update.mock.calls[0][0] as OmitArg;
    expect(arg.omit.password).toBe(true);
    expect(arg.omit.rdWebhookToken).toBe(true);
  });

  it('getWebhookToken retorna o token pelo endpoint dedicado', async () => {
    prisma.users.findUniqueOrThrow.mockResolvedValue({
      id: '1',
      rdWebhookToken: 'token-abc',
    });

    const result = await service.getWebhookToken('1');

    expect(result).toEqual({ rdWebhookToken: 'token-abc' });
  });

  it('rotateWebhookToken gera token novo sem omitir', async () => {
    prisma.users.update.mockResolvedValue({
      id: '1',
      rdWebhookToken: 'token-novo',
    });

    const result = await service.rotateWebhookToken('1');

    expect(result.rdWebhookToken).toBe('token-novo');
    const arg = prisma.users.update.mock.calls[0][0] as OmitArg;
    expect(arg.omit.password).toBe(true);
    expect(arg.omit.rdWebhookToken).toBeUndefined();
  });
});
