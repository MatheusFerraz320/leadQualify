var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { prismaErrorCode } from '../common/utils/prisma-error.util.js';
const SALT_ROUNDS = 10;
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.users.findMany({ omit: { password: true } });
    }
    async update(id, dto) {
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
        }
        catch (error) {
            if (prismaErrorCode(error) === 'P2002') {
                throw new ConflictException('Email já cadastrado');
            }
            if (prismaErrorCode(error) === 'P2025') {
                throw new NotFoundException('Usuário não encontrado');
            }
            throw error;
        }
    }
    async updateProfile(id, dto) {
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
        }
        catch (error) {
            if (prismaErrorCode(error) === 'P2002') {
                throw new ConflictException('Email já cadastrado');
            }
            if (prismaErrorCode(error) === 'P2025') {
                throw new NotFoundException('Usuário não encontrado');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.prisma.users.delete({ where: { id } });
        }
        catch (error) {
            if (prismaErrorCode(error) === 'P2025') {
                throw new NotFoundException('Usuário não encontrado');
            }
            throw error;
        }
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map