# LeadQualify API

Backend do LeadQualify: API de qualificação de leads.

## Propósito

O LeadQualify atende equipes que recebem leads pelo **RD Station Marketing** e precisam qualificá-los antes de entrar no funil comercial. O fluxo é:

1. O RD Station dispara os leads capturados para um webhook da API.
2. A API grava os leads, na conta de cada cliente, via upsert por `(userId, email)` — sem sobrescrever a qualificação já feita.
3. O time qualifica cada lead manualmente (Aprovado, Pendente ou Reprovado).
4. O dashboard mostra as métricas da operação: conversão, top produtos/campanhas, evolução mensal e desempenho por cliente.

Colaboradores enxergam apenas os próprios leads; administradores enxergam tudo e gerenciam o time.

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| ORM | Prisma 7 + driver adapter (`@prisma/adapter-pg`) |
| Banco de dados | PostgreSQL (Neon) |
| Autenticação | JWT em cookie HttpOnly + bcrypt |
| Validação | class-validator / class-transformer |
| Testes | Jest + ts-jest |
| Lint / Formatação | ESLint 9 + Prettier |

## Funcionalidades

### Autenticação — `Module: Auth`

| Rota | Método | Acesso | Descrição |
|---|---|---|---|
| `/health` | GET | público | Checa se a API está de pé |
| `/auth/signup` | POST | admin | Cria usuário (senha com hash, gera o token do RD Station) |
| `/auth/login` | POST | público | Valida credenciais e define o cookie de sessão |
| `/auth/me` | GET | autenticado | Retorna o usuário da sessão atual |
| `/auth/logout` | POST | público | Limpa o cookie de sessão |

### Usuários — `Module: Users`

| Rota | Método | Acesso | Descrição |
|---|---|---|---|
| `/users` | GET | admin | Lista usuários (sem senha/token) |
| `/users/:id/rdstation-token` | GET | admin | Lê o token do webhook do RD Station |
| `/users/:id/rdstation-token` | POST | admin | Rotaciona o token do webhook |
| `/users/:id` | PATCH | admin | Atualiza nome/email/role/senha |
| `/users/:id` | DELETE | admin | Remove usuário |
| `/users/me` | PATCH | autenticado | Edita o próprio perfil |

### Leads — `Module: Leads`

| Rota | Método | Acesso | Descrição |
|---|---|---|---|
| `/leads` | GET | autenticado | Lista leads com filtros de status, busca (nome/email) e cliente (admin) |
| `/leads/by-user` | GET | admin | Total de leads por cliente |
| `/leads/:id` | GET | autenticado | Detalhe do lead (somente se pertencer ao usuário, salvo admin) |
| `/leads/:id` | PATCH | admin | Atualiza dados e/ou status do lead |
| `/leads/:id` | DELETE | autenticado | Remove o lead |

### Webhook do RD Station — `Module: Leads`

| Rota | Método | Descrição |
|---|---|---|
| `/webhooks/rdstation/:token` | GET | Validação do webhook (usada pelo RD na inicialização) |
| `/webhooks/rdstation/:token` | POST | Recebe os leads do RD Station e os grava na conta do cliente |

Detalhes da ingestão:
- O token da URL identifica o cliente dono dos leads; token inválido retorna `404` e nada é gravado.
- Suporta o formato atual (`leads[]`) e o legado (`contact`), com merge de campos do payload.
- Usa campos personalizados do RD (configuráveis por env) para `product` e `finality`, e campos `cf_utm_*` para campanha, grupo de anúncio e palavra-chave.
- Faz upsert por `(userId, email)` e **não sobrescreve** o status de qualificação em atualizações.
- Leads sem email são ignorados; a resposta informa `accepted`, `processed`, `created`, `updated`, `skipped`.

### Dashboard — `Module: Dashboard`

| Rota | Método | Acesso | Descrição |
|---|---|---|---|
| `/dashboard/summary` | GET | autenticado | Métricas gerais, com filtro de cliente (admin) |

Retorna: totais (geral, pendentes, aprovados, reprovados, conversão, novos no mês com variação), distribuição por status, evolução dos últimos 12 meses, top produtos e top campanhas, e painéis de taxa de aprovação/reprovação por campanha e grupo de anúncio.

## Modelo de dados

- `Users` — nome, email (único), senha (hash bcrypt), role (`ADMIN` | `COLLABORATOR`), token do webhook do RD Station (único), timestamps.
- `Lead` — dados de contato, produto de interesse, finalidade, campos de UTM, `status` (`APPROVED` | `PENDING` | `REJECTED`), relacionado a um `Users`.

Consultas do dashboard usam SQL raw para as agregações mensais. As regras de negócio estão documentadas em `docs/business-rules-spec.md`.

## Segurança

- Sessão em **cookie HttpOnly** (`SameSite=Lax`, configurável via env) com JWT; fallback para header `Bearer` no guard.
- `password` e `rdWebhookToken` são omitidos de qualquer resposta não dedicada.
- `RolesGuard` + scoping por cliente: colaborador só acessa os próprios dados, nem por ID.

## Como rodar

Requisitos: Node.js 20+, um PostgreSQL (local ou Neon).

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e JWT_SECRET
```

Aplique o schema e crie o usuário admin inicial:

```bash
npx prisma migrate dev   # aplica as migrações
npm run seed             # cria o admin padrão (SEED_USER_* do .env)
```

Suba em desenvolvimento:

```bash
npm run start:dev
```

Para produção, `npm run build` já roda `prisma generate` + `prisma migrate deploy` + build do Nest. Suba com `npm run start:prod`.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | URL de conexão do PostgreSQL |
| `JWT_SECRET` | sim | Segredo para assinar o JWT |
| `JWT_EXPIRES_IN` | não | Duração da sessão (padrão `7d`) |
| `FRONTEND_URL` | não | Origem do frontend liberada no CORS (padrão `http://localhost:5173`) |
| `COOKIE_NAME` | não | Nome do cookie de sessão (padrão `access_token`) |
| `COOKIE_SECURE` | não | `true` em produção/HTTPS |
| `COOKIE_SAMESITE` | não | `lax` (padrão), `strict` ou `none` |
| `RD_FIELD_PRODUCT` | não | Identifier do campo personalizado do RD para produto (padrão `cf_produto_ou_servico`) |
| `RD_FIELD_FINALITY` | não | Identifier do campo personalizado do RD para finalidade (padrão `cf_finalidade`) |

## Scripts

| Script | Descrição |
|---|---|
| `npm run start:dev` | Sobe a API com watch |
| `npm run build` | Gera Prisma, aplica migrações e compila |
| `npm run start:prod` | Sobe a versão compilada (`node dist/main`) |
| `npm run lint` | ESLint com auto-fix |
| `npm run format` | Prettier em `src` e `test` |
| `npm test` | Roda os testes unitários |
| `npm run test:cov` | Testes com cobertura |
| `npm run seed` | Roda o seed do banco |

## Testes

Cobertura unitária das quatro áreas principais: autenticação, usuários, leads (incluindo a ingestão do webhook com payloads reais do RD) e dashboard (scoping por role e taxas de aprovação).

## Documentação

A documentação é spec-driven e fica em [`docs/`](./docs/README.md): specs de produto, stack e regras de negócio.

## Melhorias futuras

- **Paginação** em `GET /leads` e `GET /dashboard/summary` — hoje a listagem retorna tudo de uma vez.
- **Validação do payload** do webhook em runtime (hoje só existem tipos TS) e rate limiting (`@nestjs/throttler`) para os endpoints de login e webhook.
- **Recuperação de senha** — hoje só existe troca pela conta logada.
- **Soft delete** — o schema tem `deletedAt` no `Users`, mas os serviços ainda removem do banco.
- **Logs** com mascaramento do token do webhook na URL (o path `/webhooks/rdstation/:token` não deve persistir em logs de acesso).
- **Testes e2e**, pipeline de CI/CD e observabilidade (métricas/health checks mais completos).
- **Documentar `PORT`, `NODE_ENV` e `SEED_USER_*`** no `.env.example`.

---

# English

## LeadQualify API

Lead qualification API — backend for teams that receive leads from **RD Station Marketing** and need to qualify them before they enter the sales pipeline.

## How it works

1. RD Station sends captured leads to an API webhook.
2. The API stores them under each client's account, upserting by `(userId, email)` — without overwriting an existing qualification.
3. The team qualifies each lead manually (`APPROVED`, `PENDING`, `REJECTED`).
4. The dashboard shows conversion metrics, top products/campaigns, monthly trends and per-client performance.

Collaborators only see their own leads; admins see everything and manage the team.

## Stack

NestJS 11 · Prisma 7 (`@prisma/adapter-pg`) · PostgreSQL (Neon) · JWT in HttpOnly cookie + bcrypt · class-validator · Jest · ESLint 9 + Prettier.

## Main endpoints

| Module | Purpose |
|---|---|
| Auth | `/auth/signup` (admin), `/auth/login`, `/auth/me`, `/auth/logout` |
| Users | Admin CRUD, self profile, RD Station webhook token read/rotate |
| Leads | Filtered listing, per-user counts, get/update/delete (role-scoped) |
| Webhook | `POST /webhooks/rdstation/:token` ingests leads; token maps to a client |
| Dashboard | `/dashboard/summary` with totals, monthly trend, top products/campaigns, per-campaign and ad-group rates |

## Data model

- `Users` — name, unique email, hashed password, role (`ADMIN` | `COLLABORATOR`), unique RD webhook token.
- `Lead` — contact data, product, finality, UTM fields, status (`APPROVED` | `PENDING` | `REJECTED`), belongs to a `Users`.

## Security

- Session via **HttpOnly cookie** + JWT (Bearer header as fallback).
- `password` and `rdWebhookToken` are omitted from all non-dedicated responses.
- Role guard + row scoping: collaborators are always limited to their own data.

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run seed           # creates the default ADMIN (SEED_USER_*)
npm run start:dev
```

`npm run build` runs `prisma generate`, `prisma migrate deploy` and the Nest build for production (`npm run start:prod`).

## Docs

Spec-driven documentation lives in [`docs/`](./docs/README.md): product, stack and business rules specs.

## Roadmap

- Pagination for `GET /leads` and `GET /dashboard/summary`.
- Runtime validation of webhook payloads + rate limiting (`@nestjs/throttler`).
- Password recovery (only signed-in password change today).
- Soft delete using the existing `deletedAt` field.
- Logging with the webhook token masked.
- E2E tests, CI/CD and observability.