# Trackify SaaS Platform

Trackify is a **multi-tenant SaaS platform** for project and issue management — inspired by Jira, built for isolated workspaces, Kanban workflows, and sprint planning.

The platform combines a **Spring Boot microservices backend**, **per-tenant MySQL databases**, an **API gateway**, and **two React applications**: one for platform administrators and one for tenant users.

![Trackify tenant landing page](./Docs/screenshots/tenant-landing.png)

## At a glance

| | |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, MySQL, JWT, Flyway (master DB) |
| **Frontend** | React 19, Vite 8, Redux Toolkit, shared design system |
| **Status** | v1 feature-complete — see [Docs/PRODUCT_ROADMAP.md](./Docs/PRODUCT_ROADMAP.md) |
| **Docs** | [`Docs/`](./Docs/) — codebase status, Spring profiles, env reference |

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

Full analysis: **[Docs/CODEBASE_STATUS.md](./Docs/CODEBASE_STATUS.md)**

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
│   ├── screenshots/          # README captures (Playwright)
│   ├── PRODUCT_ROADMAP.md
│   ├── CODEBASE_STATUS.md
│   ├── SPRING_PROFILES.md
│   └── ENVIRONMENT.md
├── scripts/
│   └── capture-screenshots.mjs
└── .env.example
```

## Quick start

### Prerequisites

- **MySQL 8** running on `localhost:3306`
- **Node.js 20+**
- **JDK 17** and **Maven**

### 1. Configure environment

```bash
cp .env.example .env
```

Set at minimum:

```env
JWT_SECRET=replace-with-a-long-random-secret
INTERNAL_API_KEY=change-me-internal-api-key
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
```

See [`.env.example`](./.env.example) and [Docs/ENVIRONMENT.md](./Docs/ENVIRONMENT.md) for all variables.

### 2. Start the backend

Start MySQL, then run each service (separate terminals or IDE run configs):

```bash
cd Backend
mvn -pl common-lib install
mvn -pl auth-service -am spring-boot:run      # port 8081 — runs Flyway on first boot
mvn -pl tenant-service -am spring-boot:run    # port 8082
mvn -pl project-service -am spring-boot:run   # port 8083
mvn -pl api-gateway -am spring-boot:run       # port 8080
```

Optional — email notifications:

```bash
mvn -pl notification-service -am spring-boot:run   # port 8084
```

The **`local`** Spring profile is active by default (see [Docs/SPRING_PROFILES.md](./Docs/SPRING_PROFILES.md)).

### 3. Start the frontend

```bash
cd Frontend
npm install
npm run dev:tenant    # http://localhost:5174
npm run dev:master    # http://localhost:5173
```

Each app reads `VITE_API_BASE_URL` from `.env` or `.env.local` (default: `http://localhost:8080`).

### 4. Open the apps

| App | URL | Default login |
|-----|-----|---------------|
| Tenant app (landing) | http://localhost:5174 | Tenant admin (set at provisioning) |
| Master app | http://localhost:5173 | `master@trackify.com` / `admin123` |
| API gateway | http://localhost:8080 | — |
| Swagger UI | http://localhost:8080/swagger-ui.html | — |

### 5. Capture README screenshots (optional)

With the full stack running:

```bash
cd Frontend
npm install --no-save playwright@1.52.0
npx playwright install chromium
npm run screenshots
```

Outputs land in `Docs/screenshots/`. For automated tenant dashboard captures, either set `TENANT_EMAIL` and `TENANT_PASSWORD`, or add `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD=admin123` to `.env` and restart `tenant-service` so the script can provision a demo workspace with a known password.

## Build and test

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend && npm ci && npm run lint && npm run test && npm run build
```

CI runs on every push/PR to `main` (`.github/workflows/ci.yml`).

## Project status

**v1 is feature-complete** for the scoped roadmap in [Docs/PRODUCT_ROADMAP.md](./Docs/PRODUCT_ROADMAP.md). Post-v1 items (Stripe billing, impersonation, integrations) are documented there as deferred.

| Strengths | Notes |
|-----------|-------|
| Strong per-tenant DB isolation | Flyway on master; tenant schema via template + upgrader |
| Gateway auth, rate limiting, OpenAPI | Custom gateway (no circuit breaking) |
| Shared design system + dual apps | Playwright screenshot script for docs |
| GitHub Actions CI | Integration/E2E tests planned post-v1 |

Full merits/demerits: **[Docs/CODEBASE_STATUS.md](./Docs/CODEBASE_STATUS.md)**

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
