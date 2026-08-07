import { Prisma } from '../../generated/prisma/client.js';

export function prismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }
  return null;
}
