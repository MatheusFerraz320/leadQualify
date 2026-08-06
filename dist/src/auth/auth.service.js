var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
const SALT_ROUNDS = 10;
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const existing = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email já cadastrado');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.prisma.users.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: passwordHash,
            },
            omit: { password: true },
        });
        return user;
    }
    async login(dto) {
        const user = await this.prisma.users.findUnique({
            where: { email: dto.email },
        });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });
        return { access_token: accessToken };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map