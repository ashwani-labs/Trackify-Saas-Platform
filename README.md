# Trackify SaaS Platform

Trackify is a **multi-tenant SaaS platform** for project and issue management — inspired by Jira, built for teams that need isolated workspaces, Kanban workflows, and sprint planning without enterprise complexity.

The platform combines a **Spring Boot microservices backend**, **per-tenant MySQL databases**, an **API gateway**, and **two React applications**: one for platform administrators and one for tenant users.

## At a glance

| | |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, MySQL, JWT, Flyway (master DB) |
| **Frontend** | React 19, Vite 8, Redux Toolkit, shared design system |
| **Ops** | Docker Compose, nginx, GitHub Actions CI |
| **Docs** | [`Docs/`](./Docs/) — architecture status, Spring profiles, production guide |

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
├── Docs/             # Documentation (status, profiles, production)
├── docker-compose.yml
└── nginx.conf
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
│   └── DOCKER_PRODUCTION.md
├── docker-compose.yml
├── docker-compose.override.yml.example
├── nginx.conf
└── .env.example
```

## Quick start

### Prerequisites

- Docker Desktop with Docker Compose (recommended)
- Node.js 20+ for local frontend dev
- JDK 17 + Maven for local backend dev

### 1. Configure environment

```bash
cp .env.example .env
```

Set at minimum:

```env
JWT_SECRET=replace-with-a-long-random-secret
INTERNAL_API_KEY=change-me-internal-api-key
```

See [`.env.example`](./.env.example) and [Docs/DOCKER_PRODUCTION.md](./Docs/DOCKER_PRODUCTION.md) for all variables.

### 2. Run with Docker

```bash
docker compose up --build
```

With email notifications:

```bash
docker compose --profile full up --build
```

### 3. Open the apps

| Service | URL |
|---------|-----|
| Tenant app (landing) | http://localhost:3001 |
| Master app | http://localhost:3000 |
| API gateway | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## Spring profiles (backend)

Each backend service defaults to the **`local`** profile for IDE runs. Docker Compose uses **`dev`**. Production uses **`prod`**.

```bash
# Override profile
export SPRING_PROFILES_ACTIVE=prod   # Linux/macOS
$env:SPRING_PROFILES_ACTIVE = "prod"  # PowerShell
```

Details: **[Docs/SPRING_PROFILES.md](./Docs/SPRING_PROFILES.md)**

## Local development (without Docker)

**Frontend:**

```bash
cd Frontend
npm install
npm run dev:tenant    # http://localhost:5174
npm run dev:master    # http://localhost:5173
```

**Backend** (requires MySQL on `localhost:3306`):

```bash
cd Backend
mvn -pl common-lib install
mvn -pl auth-service -am spring-boot:run
mvn -pl tenant-service -am spring-boot:run
mvn -pl project-service -am spring-boot:run
mvn -pl api-gateway -am spring-boot:run
```

## Build and test

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend && npm ci && npm run lint && npm run test && npm run build
```

CI runs on every push/PR to `main` (`.github/workflows/ci.yml`).

## Project status

**Active development.** Core product features are implemented across backend and frontend. The tenant app includes a marketing landing page and refreshed UI.

| Strengths | Gaps |
|-----------|------|
| Strong per-tenant DB isolation | Mixed schema strategy (Flyway vs Hibernate) |
| Gateway auth, rate limiting, OpenAPI | No integration/E2E tests |
| Good project-service unit tests | `master-app` and `notification-service` untested |
| Docker Compose + CI pipeline | Custom gateway (no circuit breaking) |

Full merits/demerits and roadmap: **[Docs/CODEBASE_STATUS.md](./Docs/CODEBASE_STATUS.md)**

## Troubleshooting

| Problem | Fix |
|---------|-----|
| JWT validation fails | Same `JWT_SECRET` on every backend service |
| Legacy tenant DB missing columns | Restart `project-service` (runs `TenantSchemaUpgrader`) |
| Frontend cannot reach API | Check `VITE_API_BASE_URL`, rebuild Docker images |
| Email does not send | `docker compose --profile full` + SMTP env vars |
| Wrong DB host in Docker | Ensure `SPRING_PROFILES_ACTIVE=dev` (set by Compose) |

## License

MIT License
