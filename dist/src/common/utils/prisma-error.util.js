import { Prisma } from '../../generated/prisma/client.js';
export function prismaErrorCode(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return error.code;
    }
    return null;
}
//# sourceMappingURL=prisma-error.util.js.map