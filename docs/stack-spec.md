# Stack Spec

## Metadados

| Campo | Valor |
| --- | --- |
| Documento ID | STACK-001 |
| Status | Draft |
| Versão | 0.1.0 |
| Autor | _(preencher)_ |

## Stack por camada

| Camada | Escolha | Justificativa |
| --- | --- | --- |
| Frontend | React + React Router + Tailwind CSS + Lucide React + Sonner | React pelo ecossistema; React Router para navegação; Tailwind para estilização; Lucide React para ícones; Sonner para toasts. |
| Backend | NestJS (versão com TypeScript que já possui `Omit` nativo) | Estrutura modular e opinada; `Omit` nativo do TS para projeção segura de campos. |
| Autenticação | JWT + bcrypt | JWT para sessão stateless; bcrypt para hash de senhas. |
| Banco de dados | PostgreSQL + Prisma ORM | Relacional robusto; Prisma type-safe com `omit` nativo para excluir campos sensíveis (ex: senha). |
| Infraestrutura/Cloud | Dev: PostgreSQL . Produção (MVP): Neon (serverless Postgres) | produção; Neon tem tier gratuito, branches para staging/PR e compatibilidade nativa com Prisma. |
| Observabilidade | _(preencher)_ | _(preencher)_ |

## Padrões a seguir

_(Listar padrões de projeto, convenções de código, qualidade, etc.)_

## Decisões pendentes

- _(lista de decisões ainda não tomadas)_
