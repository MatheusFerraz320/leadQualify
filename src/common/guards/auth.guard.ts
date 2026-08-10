import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { authCookieName } from '../cookies.js';

export interface AuthenticatedUser {
  sub: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      request.user =
        await this.jwtService.verifyAsync<AuthenticatedUser>(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }
  private extractToken(request: AuthenticatedRequest): string | undefined {
    const [type, bearerToken] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && bearerToken) {
      return bearerToken;
    }
    const cookieValue: string | undefined = request.cookies?.[
      authCookieName(this.config)
    ] as string | undefined;
    return cookieValue;
  }
}
