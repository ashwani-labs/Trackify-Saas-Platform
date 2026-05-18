==========================================
DOCKER LOCAL DEVELOPMENT GUIDE
==========================================

## Service profiles

| Profile | Command | Services |
|---------|---------|----------|
| **minimal** (default) | `docker compose up --build` | db, api-gateway, auth, tenant, project, master-app, tenant-app, nginx-proxy |
| **full** | `docker compose --profile full up --build` | minimal + notification-service (email) |

`notification-service` is optional for local work unless you are testing password reset or assignment emails.

## Required setup

1. Copy `.env.example` → `.env` at the repository root.
2. Set `JWT_SECRET` (required for all backend services).
3. For `--profile full`, set `MAIL_USERNAME` and `MAIL_PASSWORD`.

## Minimal stack (recommended)

```bash
docker compose up --build
```

| URL | Purpose |
|-----|---------|
| http://localhost:8080 | API gateway |
| http://localhost:3000 | Master app |
| http://localhost:3001 | Tenant app |
| http://localhost:80 | nginx proxy |

## Full stack (with email)

```bash
docker compose --profile full up --build
```

Or copy `docker-compose.override.yml.example` to `docker-compose.override.yml` and customize mail settings.

## Frontend monorepo

Both React apps depend on `@trackify/shared` under `Frontend/packages/trackify-shared`.

Local dev (from `Frontend/`):

```bash
npm install
npm run dev:tenant
npm run dev:master
```

Docker builds use `Frontend/` as context so the shared package is included.

## Troubleshooting

- **JWT errors**: ensure the same `JWT_SECRET` is in `.env` for every Java service.
- **Mail not sending**: start with `--profile full` and valid SMTP credentials in `.env`.
- **Frontend API errors**: set `VITE_API_BASE_URL` in `.env` before `docker compose build`.
