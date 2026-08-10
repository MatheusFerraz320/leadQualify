import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import ms from 'ms';

export const DEFAULT_COOKIE_NAME = 'access_token';

type SameSite = 'lax' | 'strict' | 'none';

function isSameSite(value: string): value is SameSite {
  return ['lax', 'strict', 'none'].includes(value);
}

export function authCookieName(config: ConfigService): string {
  return config.get<string>('COOKIE_NAME') ?? DEFAULT_COOKIE_NAME;
}

export function authCookieOptions(
  config: ConfigService,
  expiresIn: string,
): CookieOptions {
  const secure =
    config.get<string>('COOKIE_SECURE') === 'true' ||
    (config.get<string>('NODE_ENV') ?? 'development') === 'production';

  const sameSiteValue = config.get<string>('COOKIE_SAMESITE') ?? 'lax';
  const sameSite = isSameSite(sameSiteValue) ? sameSiteValue : 'lax';

  const maxAge = ms(expiresIn as ms.StringValue) ?? 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge,
  };
}

export function setAuthCookie(
  response: Response,
  config: ConfigService,
  expiresIn: string,
  token: string,
): void {
  response.cookie(
    authCookieName(config),
    token,
    authCookieOptions(config, expiresIn),
  );
}

export function clearAuthCookie(
  response: Response,
  config: ConfigService,
): void {
  response.clearCookie(authCookieName(config), authCookieOptions(config, '1s'));
}
