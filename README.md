# Trackify SaaS Platform

Trackify is a **multi-tenant SaaS platform** for project and issue management — inspired by Jira, built for isolated workspaces, Kanban workflows, and sprint planning.

The platform combines a **Spring Boot microservices backend**, **per-tenant MySQL databases**, an **API gateway**, and **two React applications**: one for platform administrators and one for tenant users.

![Trackify tenant landing page](./Docs/screenshots/tenant-landing.png)

## At a glance

| | |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, MySQL, JWT, Flyway (master DB) |
| **Frontend** | React 19, Vite 8, Redux Toolkit, shared design system |
| **Status** | v1 feature-complete |
| **Docs** | [`Docs/`](./Docs/) — [setup guide](./Docs/SETUP.md), screenshots |

## Screenshots

All images below are **captured from the running application** (not generated). Re-capture anytime with `npm run screenshots` from `Frontend/` while the stack is running locally.

### Tenant workspace

| Landing | Login |
|---------|-------|
| ![Tenant landing](./Docs/screenshots/tenant-landing.png) | ![Tenant login](./Docs/screenshots/tenant-login.png) |

Marketing landing page and split-panel auth for workspace users.

### Master administration

| Dashboard | Tenant management |
|-----------|-------------------|
| ![Master dashboard](./Docs/screenshots/master-dashboard.png) | ![Master tenants](./Docs/screenshots/master-tenants.png) |

Platform overview with growth charts, plus centralized tenant provisioning and lifecycle controls.

| Master login |
|--------------|
| ![Master login](./Docs/screenshots/master-login.png) |

Dedicated master-panel sign-in with light/dark theme support.

## What it does

Trackify helps organizations onboard into **isolated workspaces**, manage teams, create projects, plan sprints, and move issues through a Kanban workflow.

### Core features

- **Platform admin** — tenant provisioning, audit log, dashboard analytics, plan/status management
- **Per-tenant isolation** — dedicated MySQL database and JWT-scoped routing per workspace
- **Authentication** — JWT auth, role-based access (`MASTER`, `ADMIN`, `USER`), password reset, change password
- **Team onboarding** — user registration with admin approval flow
- **Projects & Kanban** — boards with inline status quick-edit, comments (optimistic UI), attachments
- **Sprints & backlog** — sprint planning tied to issues
- **Dashboards** — date-filtered stats, chart drill-through, role-aware views (admin vs user)
- **Notifications** — grouped in-app bell; optional email via `notification-service`
- **Branding** — per-tenant theme presets (workspace settings)
- **Ops** — OpenAPI/Swagger, gateway rate limiting, health probes, optional S3 attachments

## Architecture

```text
trackify-saas-platform/
├── Backend/          # Spring Boot microservices
├── Frontend/         # React apps + shared package
└── Docs/             # Documentation + screenshots
```

| Layer | Components |
|-------|------------|
| Backend | `api-gateway`, `auth-service`, `tenant-service`, `project-service`, `notification-service`, `common-lib` |
| Frontend | `master-app` (admin), `tenant-app` (workspace), `@trackify/shared` |
| Database | MySQL master DB + one database per tenant |

```text
Browser → api-gateway (8080)
            ├── auth-service (8081)
            ├── tenant-service (8082)
            └── project-service (8083) → per-tenant MySQL
```

Full analysis and codebase notes: see service READMEs under `Backend/` and `Frontend/`.

## Repository structure

```text
trackify-saas-platform/
├── Backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── tenant-service/
│   ├── project-service/
│   ├── notification-service/
│   └── common-lib/
├── Frontend/
│   ├── packages/trackify-shared/
│   ├── master-app/
│   └── tenant-app/
├── Docs/
│   ├── SETUP.md              # Local development setup (start here)
│   └── screenshots/          # README captures (Playwright)
├── scripts/
│   └── capture-screenshots.mjs
└── .env.example
```

## Quick start

See **[Docs/SETUP.md](./Docs/SETUP.md)** for the full local setup guide (prerequisites, env, service startup order, first login, and troubleshooting).

### Prerequisites

- **MySQL 8** on `localhost:3306`
- **Node.js 20+**, **JDK 17**, **Maven**

### Short version

```bash
cp .env.example .env          # edit JWT_SECRET and MySQL credentials
cd Backend && mvn -pl common-lib install
# Start auth-service → tenant-service → project-service → api-gateway (separate terminals)
cd Frontend && npm install
npm run dev:tenant            # :5174
npm run dev:master            # :5173
```

Master login: `master@trackify.com` / `admin123` · Gateway: http://localhost:8080

## Build and test

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend && npm ci && npm run lint && npm run test && npm run build
```

CI runs on every push/PR to `main` (`.github/workflows/ci.yml`).

## Project status

**v1 is feature-complete** for the scoped roadmap. Post-v1 items (Stripe billing, impersonation, integrations) remain deferred.

| Strengths | Notes |
|-----------|-------|
| Strong per-tenant DB isolation | Flyway on master; tenant schema via template + upgrader |
| Gateway auth, rate limiting, OpenAPI | Custom gateway (no circuit breaking) |
| Shared design system + dual apps | Playwright screenshot script for docs |
| GitHub Actions CI | Integration/E2E tests planned post-v1 |

Full merits/demerits and architecture notes are in the repository source; see [Docs/SETUP.md](./Docs/SETUP.md) for running the stack locally.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| JWT validation fails | Same `JWT_SECRET` on every backend service |
| MySQL connection refused | Start MySQL on `localhost:3306`; check credentials in `.env` |
| Legacy tenant DB missing columns | Restart `project-service` (runs `TenantSchemaUpgrader`) |
| Frontend cannot reach API | Set `VITE_API_BASE_URL=http://localhost:8080` in `Frontend/*/.env.local` |
| Email does not send | Start `notification-service`; configure SMTP in `.env` (or read console logs locally) |
| Theme picker missing | Apply Flyway migration `V2__add_tenant_brand_theme.sql`; restart `tenant-service` |

## License

MIT License
