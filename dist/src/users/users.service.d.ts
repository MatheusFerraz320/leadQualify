import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("../generated/prisma/internal/prismaNamespace.js").PrismaPromise<{
        id: string;
        name: string;
        email: string;
        role: import("../generated/prisma/enums.js").UserRole;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("../generated/prisma/enums.js").UserRole;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    updateProfile(id: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("../generated/prisma/enums.js").UserRole;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<void>;
}
