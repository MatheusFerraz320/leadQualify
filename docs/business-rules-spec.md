# Business Rules Spec

## Metadados

| Campo | Valor |
| --- | --- |
| Documento ID | BR-001 |
| Status | Draft |
| Versão | 0.1.0 |
| Autor | _(preencher)_ |

## Regras

| Regra | Descrição |
| --- | --- |
| Email único por cliente | Um email não pode estar cadastrado em mais de um lead para o mesmo cliente. |
| Lead capturado não pode ter campos obrigatórios vazios | Um lead só é capturado com nome e email preenchidos (não vazios). |
| Ingestão via webhook RD Station | `POST /webhooks/rdstation/:token` ingere leads em tempo real. O token identifica o usuário dono (`Users.rdWebhookToken`). |
| Upsert por email do dono | O lead é criado ou atualizado pela chave `(userId, email)`. Em atualizações o `status` (APPROVED/REJECTED/PENDING) nunca é sobrescrito pelo webhook. |
| Lead sem email é ignorado | Lead do webhook (array `leads[]`) sem email é ignorado e não gravado; o webhook responde 2xx e segue para o próximo lead do batch. |
| Token inválido é rejeitado | Webhook com token inexistente retorna 404 e não grava o lead. |
| Visibilidade por role | Colaborador enxerga apenas leads com `userId` próprio. Admin enxerga todos, com filtro opcional por `userId`. |
| Token só em endpoint dedicado | `rdWebhookToken` nunca é retornado em `signup`, `update`, `updateProfile` nem `findAll`. Apenas `GET`/`POST /users/:id/rdstation-token` (admin) o retornam. |
| Campos `product`/`finality` via custom fields | Mapeados pelos identificadores `cf_<api_identifier>` configuráveis via `RD_FIELD_PRODUCT` e `RD_FIELD_FINALITY`. |

## Glossário

| Termo | Definição |
| --- | --- |
| Webhook RD Station | Endpoint público que recebe o payload de conversão do RD Station Marketing. |
| Token de webhook | Segredo por usuário usado na URL do webhook para vincular leads à conta RD. |

## Pendências de segurança

- **Masking de log**: quando houver request logging (ex: morgan/winston), mascarar o caminho `/webhooks/rdstation/:token` para não persistir o token em access logs.
