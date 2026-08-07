import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { prismaErrorCode } from '../common/utils/prisma-error.util.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.users.findMany({ omit: { password: true } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data = { ...dto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    try {
      return await this.prisma.users.update({
        where: { id },
        data,
        omit: { password: true },
      });
    } catch (error) {
      if (prismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Email já cadastrado');
      }
      if (prismaErrorCode(error) === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw error;
    }
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const data = { ...dto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    try {
      return await this.prisma.users.update({
        where: { id },
        data,
        omit: { password: true },
      });
    } catch (error) {
      if (prismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Email já cadastrado');
      }
      if (prismaErrorCode(error) === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.users.delete({ where: { id } });
    } catch (error) {
      if (prismaErrorCode(error) === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      throw error;
    }
  }
}
