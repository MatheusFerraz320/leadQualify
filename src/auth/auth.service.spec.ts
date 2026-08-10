import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';

jest.unstable_mockModule('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

type AuthModule = typeof import('./auth.service.js');
type BcryptModule = typeof import('bcrypt');

const prisma = {
  users: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const jwt = { signAsync: jest.fn() };

type CreateArg = { omit: Record<string, boolean> };

describe('AuthService', () => {
  let service: InstanceType<AuthModule['AuthService']>;
  let bcrypt: BcryptModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    const { AuthService } = await import('./auth.service.js');
    bcrypt = await import('bcrypt');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

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

  describe('login', () => {
    const user = {
      id: 'user-1',
      name: 'Admin',
      email: 'admin@test.com',
      password: 'hashed',
      role: UserRole.ADMIN,
    };

    it('retorna accessToken e user sem senha', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.users.findUnique.mockResolvedValue(user);
      jwt.signAsync.mockResolvedValue('token-jwt');

      const result = await service.login({
        email: 'admin@test.com',
        password: 'senha',
      });

      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        name: 'Admin',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });
      expect(result).toEqual({
        accessToken: 'token-jwt',
        user: {
          id: 'user-1',
          name: 'Admin',
          email: 'admin@test.com',
          role: UserRole.ADMIN,
        },
      });
    });

    it('lança Unauthorized para credenciais inválidas', async () => {
      prisma.users.findUnique.mockResolvedValue(user);

      await expect(
        service.login({ email: 'admin@test.com', password: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });
});
