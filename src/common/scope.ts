import { Prisma } from '../generated/prisma/client.js';
import { UserRole } from '../generated/prisma/enums.js';
import type { AuthenticatedUser } from './guards/auth.guard.js';

export function scopeWhere(
  user: AuthenticatedUser,
  userId?: string,
  extra: Prisma.LeadWhereInput = {},
): Prisma.LeadWhereInput {
  if (user.role === UserRole.ADMIN) {
    return userId ? { ...extra, userId } : extra;
  }
  return { ...extra, userId: user.sub };
}
