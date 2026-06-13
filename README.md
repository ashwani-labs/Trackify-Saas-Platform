# Trackify SaaS Platform

Trackify is a multi-tenant SaaS platform for project and issue management, inspired by Jira. It includes a Spring Boot microservices backend, isolated tenant databases, an API gateway, and two React applications: one for platform administrators and one for tenant users.

## What It Does

Trackify helps organizations onboard into isolated workspaces, manage teams, create projects, plan sprints, and move issues through a Kanban workflow.

### Core Features

- Platform tenant management from the master app
- Tenant database provisioning and tenant-aware routing
- JWT authentication and role-based access (`MASTER`, `ADMIN`, `USER`)
- Tenant user registration and admin approval flow
- Project creation and member management
- Issue creation, assignment, priority, status, comments, and attachments
- Kanban board with `TODO`, `IN_PROGRESS`, and `DONE`
- Sprint/backlog planning
- Email notifications through optional `notification-service`
- Shared frontend package for API clients, roles, tokens, and reusable UI components
- Docker Compose development stack
- GitHub Actions CI for backend tests and frontend lint/build
- OpenAPI spec at `/openapi.yaml`, Swagger UI, gateway rate limiting, correlation IDs, actuator health probes
- Optional S3 attachment storage (see `documents/DOCKER_PRODUCTION.md`)

## Architecture Summary

| Layer | Components |
|-------|------------|
| Backend | `api-gateway`, `auth-service`, `tenant-service`, `project-service`, `notification-service`, `common-lib` |
| Frontend | `Frontend/master-app`, `Frontend/tenant-app`, `Frontend/packages/trackify-shared` |
| Database | MySQL master database plus per-tenant MySQL databases |
| Local ops | Docker Compose, nginx reverse proxy |
| CI | GitHub Actions |

### Backend Services

- `api-gateway`: single entry point, JWT validation, proxy routing
- `auth-service`: login, password reset, profile photo, JWT creation
- `tenant-service`: tenant CRUD, tenant database provisioning, user approval
- `project-service`: projects, issues, sprints, comments, attachments
- `notification-service`: SMTP email dispatch, optional in local development
- `common-lib`: shared enums, security helpers, exception and response objects

### Frontend Apps

- `master-app`: platform administration, tenant creation, tenant management dashboard
- `tenant-app`: user workspace, dashboard, projects, Kanban, team, profile, approvals
- `@trackify/shared`: shared axios factory, error helpers, roles, design tokens, and UI components

## Tech Stack

| Area | Stack |
|------|-------|
| Backend | Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA, MySQL |
| Frontend | React 19, Vite 8, Redux Toolkit, React Router, Recharts |
| UI | CSS variables, shared component CSS, Lucide icons |
| DevOps | Docker Compose, nginx, GitHub Actions |
| Testing | Maven/JUnit existing backend tests; frontend tests planned |

## Repository Structure

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
├── documents/
│   ├── Improvement_Plan.md
│   └── DOCKER_PRODUCTION.md
├── docker-compose.yml
├── docker-compose.override.yml.example
├── nginx.conf
└── .env.example
```

## Setup Plan

### 1. Prerequisites

Install:

- Docker Desktop with Docker Compose
- Node.js 20+ if running frontend locally
- JDK 17 and Maven if running backend locally without Docker

### 2. Configure Environment

Create a root `.env` file:

```bash
cp .env.example .env
```

Set at least:

```env
JWT_SECRET=replace-with-a-long-random-secret
INTERNAL_API_KEY=change-me-internal-api-key
MYSQL_ROOT_PASSWORD=root
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
VITE_API_BASE_URL=http://localhost:8080
```

`JWT_SECRET` is **required** for every backend service (no inline default in `application.yml`). Copy from `.env.example` for local dev or set in your IDE run configuration.

`INTERNAL_API_KEY` must match on `tenant-service` and `project-service` so admin user-approval in-app notifications work.

Email is optional for basic local development. To send real mail, set Gmail App Password values in `.env` (no spaces in the password). `notification-service` loads the root `.env` automatically on startup.

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM=your-email@gmail.com
```

For IntelliJ, set the run configuration **Working directory** to the repo root (`trackify-saas-platform`) or `Backend/notification-service`, then restart `notification-service`.

Security note: if real secrets were ever committed or pushed, rotate them before deployment.

## Running With Docker

### Minimal Stack

Runs MySQL, gateway, core backend services, both frontends, and nginx.

```bash
docker compose up --build
```

### Full Stack With Email

Includes `notification-service`.

```bash
docker compose --profile full up --build
```

Optional mail overrides:

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
```

### Local URLs

| Service | URL |
|---------|-----|
| API gateway | http://localhost:8080 |
| Master app | http://localhost:3000 |
| Tenant app | http://localhost:3001 |
| nginx proxy | http://localhost |
| MySQL | localhost:3306 |

## Running Frontend Locally

Use this when Docker is running backend services but you want Vite dev servers.

```bash
cd Frontend
npm install
npm run dev:master
npm run dev:tenant
```

Default Vite ports:

| App | URL |
|-----|-----|
| Master app | http://localhost:5173 |
| Tenant app | http://localhost:5174 |

Each app can override the API URL with `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Running Backend Locally

Docker is recommended for the full stack. For Java-only development:

1. Start MySQL:

```bash
docker compose up db
```

2. Start `auth-service` so Flyway applies `Backend/auth-service/src/main/resources/db/migration/V1__master_schema.sql` to `trackify_master` on first boot. Export `JWT_SECRET` in the shell or IDE before starting any service.

3. Run services from separate terminals, or from the IDE:

```bash
cd Backend
mvn -pl common-lib install
mvn -pl auth-service -am spring-boot:run
mvn -pl tenant-service -am spring-boot:run
mvn -pl project-service -am spring-boot:run
mvn -pl api-gateway -am spring-boot:run
```

Run notification service only when testing email:

```bash
mvn -pl notification-service -am spring-boot:run
```

## Build, Lint, and Test

### Backend

```bash
cd Backend
mvn -B test
```

### Frontend

```bash
cd Frontend
npm ci
npm run lint
npm run build
```

### CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`:

- Backend: `mvn -B test`
- Frontend: `npm ci`, `npm run lint`, `npm run build`

## Current Improvement Tracker

Roadmap and scan notes live in `documents/Improvement_Plan.md`. **Phases 1–3 are complete.**

Optional next work (Phase 4):

- Set `STORAGE_PROVIDER=s3` for multi-node production deployments
- Expand `master-app` Vitest smoke coverage
- Keep gateway OpenAPI spec updated when adding routes

Operational reminders:

- Set `INTERNAL_API_KEY` on `tenant-service` and `project-service` for user-approval notifications
- Legacy tenant DBs: restart `project-service` to auto-apply schema upgrades (sprints, issue keys) via `TenantSchemaUpgrader`

## Troubleshooting

| Problem | Fix |
|---------|-----|
| JWT validation fails | Set the same `JWT_SECRET` in `.env` / IDE env for every backend service |
| Missing `sprints` or `issue_key` on legacy tenant DB | Restart `project-service`; `TenantSchemaUpgrader` runs on first tenant request |
| Frontend cannot reach API | Check `VITE_API_BASE_URL`, rebuild Docker frontend images after changing it |
| Email does not send | Start with `--profile full` and configure SMTP env vars |
| Tenant app subdomain does not resolve locally | Use direct dev URL (`localhost:5174`) or configure local DNS/hosts as needed |
| Docker frontend misses shared package | Build from the root `Frontend/` context, as configured in `docker-compose.yml` |

## Project Status

Active development. Core product and UI roadmaps (Phases 1–3) are complete; see `documents/Improvement_Plan.md` Phase 4 for optional production hardening.

## License

MIT License
