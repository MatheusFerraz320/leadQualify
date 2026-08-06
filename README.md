# LeadQualify API

API de qualificação de leads. Documentação spec-driven em [docs/](./docs/README.md).

## Setup

```bash
npm install
cp .env.example .env   # preencha a DATABASE_URL (Neon)
npx prisma migrate dev # aplica o schema no banco
```

## Rodar

```bash
npm run start:dev
```

## Stack

NestJS + Prisma + PostgreSQL (Neon) + JWT + bcrypt. Detalhes em [docs/stack-spec.md](./docs/stack-spec.md).
