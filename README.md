# Nuvve — Blog API

API de blog em **NestJS 12 + TypeORM + PostgreSQL**: autores, posts (rascunho/publicado),
categorias, tags, busca pública e autenticação JWT.

O frontend Angular vive em `../client` e ainda não consome esta API.

## Requisitos

- Node.js 22+
- PostgreSQL 16 (ou Docker)

## Setup

```bash
npm ci
cp .env.example .env        # ajuste JWT_SECRET e credenciais
docker compose up -d db     # ou use um Postgres já existente
npm run migration:run
npm run seed
npm run start:dev
```

A API sobe em `http://localhost:3000/api`. Login criado pelo seed: `SEED_EMAIL` /
`SEED_PASSWORD` do `.env` (padrão `author@nuvve.dev` / `change-me-123`).

> Bancos criados antes das migrations (com `synchronize: true`) precisam ser recriados:
> `docker compose down -v && docker compose up -d db && npm run migration:run && npm run seed`.
> As migrations são a fonte da verdade — `DB_SYNCHRONIZE` fica `false` em todos os ambientes.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run start:dev` | API em watch mode |
| `npm run build` / `start:prod` | build e execução do `dist` |
| `npm test` | testes unitários (Jest) |
| `npm run test:e2e` | testes de API contra `nuvve_test` |
| `npm run test:cov` | cobertura |
| `npm run lint` | oxlint (type-aware) |
| `npm run migration:generate -- src/shared/db/migrations/Nome` | gera migration a partir das entidades |
| `npm run migration:run` / `migration:revert` | aplica/desfaz migrations |
| `npm run seed` / `seed:prod` | popula banco (dev / `dist`) |

### Testes e2e

Os testes esperam um Postgres acessível com o banco `nuvve_test` já criado
(`CREATE DATABASE nuvve_test;`). As migrations rodam automaticamente no `beforeAll`.

```bash
docker exec -it <container-do-postgres> createdb -U root nuvve_test
npm run test:e2e
```

## Variáveis de ambiente

Todas em `.env.example`. Destaques:

- `JWT_SECRET` (obrigatório em produção) e `JWT_EXPIRES_IN`
- `DB_*` e `DB_SYNCHRONIZE` (sempre `false`)
- `CORS_ORIGIN` (lista separada por vírgula)
- `SEED_EMAIL`, `SEED_PASSWORD`, `SEED_NAME`

## Endpoints

Prefixo global: `/api`. Rotas de escrita exigem `Authorization: Bearer <token>`;
as marcadas como **públicas** não exigem.

### Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | público | cria usuário + perfil de autor, retorna JWT |
| POST | `/auth/login` | público | retorna JWT |
| GET | `/auth/me` | privado | perfil do autor autenticado |

```bash
curl -s localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"author@nuvve.dev","password":"change-me-123"}'
```

### Posts do autor (CMS)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/creator/posts` | lista os posts do autor (rascunhos incluídos) |
| POST | `/creator/posts` | cria post (`status: draft \| published`) |
| PUT | `/creator/posts/:id` | atualiza (somente o próprio autor) |
| DELETE | `/creator/posts/:id` | remove (somente o próprio autor) |

### Leitura pública

| Método | Rota | Descrição |
|---|---|---|
| GET | `/read` | posts publicados, paginados |
| GET | `/read/:slug` | detalhe por slug |
| GET | `/health` | status do processo e do banco |

Query params de `/read`: `page` (1), `limit` (1–50, padrão 10), `search`,
`category` (slug), `tag` (slug). Resposta:

```json
{
  "data": [{ "id": "...", "title": "...", "author": { "id": "...", "name": "..." } }],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

### Taxonomia

| Método | Rota | Acesso |
|---|---|---|
| GET | `/categories`, `/categories/:id` | público |
| POST/PUT/DELETE | `/categories`, `/categories/:id` | privado |
| GET | `/tags`, `/tags/:id` | público |
| POST/PUT/DELETE | `/tags`, `/tags/:id` | privado |

## Estrutura

```
src/
  core/            guards, decorators, filters, security (scrypt) e health
  features/        auth, category, tag, post/creator, post/reader
  shared/          config, entities, data source, migrations, seed, enums
  app.module.ts    ConfigModule + TypeORM + Core + Features
  app.setup.ts     prefixo /api, ValidationPipe, serialização, CORS, filtro
test/              e2e (Postgres real)
```

Regras importantes:

- Erros de validação retornam 400 com a lista de mensagens; conflitos de slug/e-mail, 409.
- Senhas usam `scrypt` (`node:crypto`) e nunca são serializadas.
- `Author.userId` é excluído das respostas.
- Toda rota é privada por padrão; `@Public()` libera as rotas de leitura.

## Docker

```bash
docker compose up --build
```

Sobe `db` (Postgres 16) + `api` (migrations aplicadas no entrypoint). Em produção,
defina `NODE_ENV=production` e um `JWT_SECRET` real fora do repositório.
