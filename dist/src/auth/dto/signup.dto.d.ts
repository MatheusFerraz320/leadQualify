import { UserRole } from '../../generated/prisma/enums.js';
export declare class SignupDto {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: UserRole;
}
