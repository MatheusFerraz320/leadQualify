import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
export interface AuthenticatedUser {
    sub: string;
    name: string;
    email: string;
    role: string;
}
export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}
export declare class AuthGuard implements CanActivate {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
