import { UserRole } from '../../generated/prisma/enums.js';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    password?: string;
}
