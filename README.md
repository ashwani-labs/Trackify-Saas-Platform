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

See `documents/` for detailed design: `Backend_Architecture.md`, `Frontend_Architecture_Document.md`, `DB_Design_Document.md`.

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

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| Master app | http://localhost:3000 |
| Tenant app | http://localhost:3001 |
| MySQL | localhost:3306 |

### 3. Local frontend development (without Docker UI)

```bash
# Terminal 1 — start backend services (Docker or run each Spring app)
docker compose up db api-gateway auth-service tenant-service project-service

# Terminal 2 — tenant app
cd Frontend/tenant-app
cp .env.example .env.local   # optional
npm install
npm run dev

# Terminal 3 — master app
cd Frontend/master-app
cp .env.example .env.local   # optional
npm install
npm run dev
```

API URL defaults to `http://localhost:8080`. Override with `VITE_API_BASE_URL` in `.env.local`.

---

## Improvement Roadmap

Active phased plan: **[documents/Project_Update_Plan.md](documents/Project_Update_Plan.md)**

- **Phase 0** (done): Secrets via `.env`, centralized API client, README updates
- **Phase 1+**: Shared UI package, CI, Flyway, UI polish, notifications inbox

---

## Status

Actively developed — portfolio and learning project.

---

## License

MIT License
