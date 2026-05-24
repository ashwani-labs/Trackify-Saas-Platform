# Trackify SaaS Platform

A **multi-tenant SaaS platform** for project and issue management, inspired by tools like Jira. Built with a microservices backend, JWT authentication, and separate React apps for platform admins and tenant users.

---

## Overview

Trackify enables organizations to manage projects, track issues, and collaborate within isolated tenant environments.

**Focus areas:**

- Multi-tenancy (database-per-tenant)
- Microservices architecture with API gateway
- Role-based access (MASTER, ADMIN, USER)
- Kanban boards, sprints, comments, and attachments

---

## Core Features

- JWT authentication and role-based access
- Tenant management (creation, activation, isolation)
- User registration and approval workflow
- Project and issue management
- Kanban board with drag-and-drop status updates
- Sprints and backlog
- Issue comments and file attachments
- Email notifications (password reset, assignments — via notification-service)
- Master admin dashboard and tenant user application
- Light/dark theme (tenant app)

---

## Architecture

| Layer | Components |
|--------|------------|
| **Backend** | api-gateway, auth-service, tenant-service, project-service, notification-service, common-lib |
| **Frontend** | `Frontend/master-app` (platform admin), `Frontend/tenant-app` (tenant users) |
| **Data** | MySQL master DB + per-tenant databases |

See `documents/` for detailed design: [Architecture.md](documents/Architecture.md), [DB_Design_Document.md](documents/DB_Design_Document.md), [PRD.md](documents/PRD.md).

---

## Tech Stack

| Area | Stack |
|------|--------|
| Backend | Java 17, Spring Boot 3.3, Spring Security, MySQL, JWT |
| Frontend | React 19, Vite 8, Redux Toolkit, React Router, Recharts |
| DevOps | Docker Compose, nginx reverse proxy |

---

## Repository Structure

```
trackify-saas-platform/
├── Backend/           # Spring Boot microservices (Maven monorepo)
├── Frontend/
│   ├── master-app/    # Platform admin UI
│   └── tenant-app/    # Tenant user UI
├── documents/         # Architecture, PRD, API docs, plans
├── docker-compose.yml
├── nginx.conf
└── .env.example       # Copy to .env — required for Docker
```

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Node 20+ and JDK 17 for local dev without Docker

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

- `JWT_SECRET` — long random string (32+ characters)
- `MAIL_USERNAME` / `MAIL_PASSWORD` — only if you need email (optional for basic local testing)

**Security:** If this repository was ever pushed with real secrets in `docker-compose.yml`, rotate your JWT secret and mail app password before deploying.

### 2. Run with Docker

**Minimal stack** (no email service):

```bash
docker compose up --build
```

**Full stack** (includes notification-service for email):

```bash
docker compose --profile full up --build
```

See [documents/Docker_Dev_Guide.md](documents/Docker_Dev_Guide.md) for profiles and optional overrides.

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| Master app | http://localhost:3000 |
| Tenant app | http://localhost:3001 |
| MySQL | localhost:3306 |

### 3. Local frontend development (without Docker UI)

```bash
# Terminal 1 — backend (minimal)
docker compose up db api-gateway auth-service tenant-service project-service

# Terminal 2 — install workspaces once, then run apps
cd Frontend
npm install
npm run dev:tenant    # tenant app (port 5174)
npm run dev:master    # master app (port 5173)
```

Optional per-app env: copy `Frontend/tenant-app/.env.example` → `.env.local`.

API URL defaults to `http://localhost:8080`. Override with `VITE_API_BASE_URL` in `.env.local`.

### CI (GitHub Actions)

On push/PR to `main`, `.github/workflows/ci.yml` runs:

- **Backend**: `mvn -B test` in `Backend/`
- **Frontend**: `npm ci`, `npm run lint`, `npm run build` in `Frontend/`

---

## Improvement Roadmap

Active phased plan: **[documents/Project_Update_Plan.md](documents/Project_Update_Plan.md)**

- **Phase 0** (done): Secrets via `.env`, centralized API client, README updates
- **Phase 1** (done): `@trackify/shared` package, login ApiResponse, error helpers, Docker profiles
- **Phase 2** (in progress): GitHub Actions CI on push/PR; Flyway, Vitest, OpenAPI next
- **Phase 3** (mostly done): Shared UI tokens, search, Create menu, core page migrations
- **Phase 4+**: Notifications inbox, activity log, issue keys

---

## Status

Actively developed — portfolio and learning project.

---

## License

MIT License
