import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;
async function main() {
    const name = process.env.SEED_USER_NAME ?? 'Admin';
    const role = 'ADMIN';
    const email = process.env.SEED_USER_EMAIL ?? 'admin@leadqualify.dev';
    const password = process.env.SEED_USER_PASSWORD ?? 'admin12345';
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.users.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: { name, email, password: passwordHash, role },
        omit: { password: true },
    });
    console.log(`Seed: user garantido (${user.email})`);
}
main()
    .catch((error) => {
    console.error('Seed falhou:', error);
    process.exitCode = 1;
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map