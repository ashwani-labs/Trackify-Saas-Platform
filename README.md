# Trackify SaaS Platform

Trackify is a **personal multi-tenant SaaS platform** for project and issue management — inspired by Jira, built for isolated workspaces, Kanban workflows, and sprint planning.

The platform combines a **Spring Boot microservices backend**, **per-tenant MySQL databases**, an **API gateway**, and **two React applications**: one for platform administrators and one for tenant users.

## At a glance

| | |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, MySQL, JWT, Flyway (master DB) |
| **Frontend** | React 19, Vite 8, Redux Toolkit, shared design system |
| **Docs** | [`Docs/`](./Docs/) — codebase status, Spring profiles, env reference |

## What it does

Trackify helps organizations onboard into **isolated workspaces**, manage teams, create projects, plan sprints, and move issues through a Kanban workflow.

### Core features

- Platform tenant management from the master app
- Tenant database provisioning and tenant-aware routing
- JWT authentication and role-based access (`MASTER`, `ADMIN`, `USER`)
- Tenant user registration and admin approval flow
- Project creation, member management, and Kanban boards
- Issue tracking with comments, attachments, and priority
- Sprint/backlog planning and dashboard analytics
- Email notifications (optional `notification-service`)
- Marketing landing page and modern tenant UI
- OpenAPI spec, Swagger UI, gateway rate limiting, health probes
- Optional S3 attachment storage

## Architecture

```text
trackify-saas-platform/
├── Backend/          # Spring Boot microservices
├── Frontend/         # React apps + shared package
└── Docs/             # Documentation
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
│   ├── README.md
│   ├── CODEBASE_STATUS.md
│   ├── SPRING_PROFILES.md
│   └── ENVIRONMENT.md
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

| App | URL |
|-----|-----|
| Tenant app (landing) | http://localhost:5174 |
| Master app | http://localhost:5173 |
| API gateway | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## Build and test

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend && npm ci && npm run lint && npm run test && npm run build
```

CI runs on every push/PR to `main` (`.github/workflows/ci.yml`).

## Project status

**Active personal project.** Core features are implemented across backend and frontend.

| Strengths | Gaps |
|-----------|------|
| Strong per-tenant DB isolation | Mixed schema strategy (Flyway vs Hibernate) |
| Gateway auth, rate limiting, OpenAPI | No integration/E2E tests |
| Good project-service unit tests | `master-app` and `notification-service` untested |
| GitHub Actions CI | Custom gateway (no circuit breaking) |

Full merits/demerits: **[Docs/CODEBASE_STATUS.md](./Docs/CODEBASE_STATUS.md)**

## Troubleshooting

| Problem | Fix |
|---------|-----|
| JWT validation fails | Same `JWT_SECRET` on every backend service |
| MySQL connection refused | Start MySQL on `localhost:3306`; check credentials in `.env` |
| Legacy tenant DB missing columns | Restart `project-service` (runs `TenantSchemaUpgrader`) |
| Frontend cannot reach API | Set `VITE_API_BASE_URL=http://localhost:8080` in `Frontend/*/.env.local` |
| Email does not send | Start `notification-service` and configure SMTP in `.env` |

## License

MIT License
