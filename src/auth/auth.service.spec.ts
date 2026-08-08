import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

const prisma = {
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const jwt = { signAsync: jest.fn() };

type CreateArg = { omit: Record<string, boolean> };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('signup omite o token de webhook', async () => {
    prisma.users.create.mockResolvedValue({ id: '1' });

    await service.signup({
      name: 'Colaborador',
      email: 'colab@test.com',
      password: 'senha12345',
      confirm_password: 'senha12345',
      role: UserRole.COLLABORATOR,
    });

    const arg = prisma.users.create.mock.calls[0][0] as CreateArg;
    expect(arg.omit.password).toBe(true);
    expect(arg.omit.rdWebhookToken).toBe(true);
  });
});
