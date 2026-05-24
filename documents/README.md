# Trackify — Project Documentation

Single reference for product scope, system design, and improvement roadmap.  
**Run the app:** see the [repository README](../README.md) (Quick Start, Docker, CI).

---

## 1. Product overview

Multi-tenant SaaS for project and issue tracking (Jira-like). Each tenant has an isolated MySQL database.

| Role | App | Purpose |
|------|-----|---------|
| **MASTER** | master-app | Create and manage tenants |
| **ADMIN** | tenant-app | Approve users, manage projects and team |
| **USER** | tenant-app | Work on assigned projects and issues |

**Core capabilities (shipped):** JWT auth, tenant onboarding, user registration/approval, projects, issues, Kanban (`TODO` → `IN_PROGRESS` → `DONE`), sprints/backlog, comments, attachments, email via notification-service (optional), light/dark theme.

**Personas & flows:** Master creates tenant → admin activates → users register (pending) → admin approves → projects/issues/Kanban.

---

## 2. System architecture

| Layer | Stack |
|-------|--------|
| **Backend** | Java 17, Spring Boot 3.3, Spring Cloud Gateway, MySQL |
| **Frontend** | React 19, Vite 8, Redux Toolkit, React Router 7 |
| **Ops** | Docker Compose, nginx, GitHub Actions CI |

**Entry point:** API Gateway (`:8080`) → microservices. JWT payload: `user_id`, `tenant_id`, `role`.

### 2.1 Backend services

| Service | Responsibility |
|---------|----------------|
| **api-gateway** | Routing, JWT validation, header forwarding |
| **auth-service** | Login, JWT, password reset, `user_lookup` |
| **tenant-service** | Tenant CRUD, dynamic DB provisioning |
| **project-service** | Projects, issues, sprints, comments, attachments |
| **notification-service** | SMTP email (Docker `--profile full`) |
| **common-lib** | DTOs, JWT utils, exceptions |

**Request flow:** `Client → Gateway → Service`  
**Headers:** `Authorization`, `X-Tenant-ID`, `X-User-ID`, `X-User-Role`

**Multi-tenant routing:** Master DB (`tenants`, `user_lookup`) + per-tenant DB (app data). `TenantRoutingDataSource` + thread-local tenant context in project-service.

**API envelope:**

```json
{ "status": "success", "message": "...", "data": {} }
```

**Schema source of truth:** `Backend/master.sql` and JPA entities in each service (not a separate doc).

**API source of truth:** Controller classes and gateway routes until OpenAPI is generated (Phase 2).

### 2.2 Frontend monorepo

```
Frontend/
├── packages/trackify-shared/   # tokens, axios, UI components, roles
├── tenant-app/                 # end users
└── master-app/                 # platform admin
```

- **State:** Redux Toolkit slices per feature  
- **API:** `VITE_API_BASE_URL` (default `http://localhost:8080`) via `@trackify/shared` axios  
- **UI:** `tokens.css` + `components.css`; theme via `data-theme`

**Tenant routes:** `/login`, `/register`, `/`, `/projects`, `/projects/:id`, `/team`, `/pending-users` (admin), `/profile`

### 2.3 Security

- JWT on protected routes; 401 → logout in axios interceptor  
- Roles: `MASTER`, `ADMIN`, `USER`  
- Tenant isolation enforced in backend only  

---

## 3. Local development (summary)

| Profile | Command |
|---------|---------|
| Minimal | `docker compose up --build` |
| With email | `docker compose --profile full up --build` |

| URL | Service |
|-----|---------|
| http://localhost:8080 | API gateway |
| http://localhost:3000 | Master app |
| http://localhost:3001 | Tenant app |

Copy `.env.example` → `.env`; set `JWT_SECRET`. For email, set mail vars and use `--profile full`.

**Frontend without Docker UI:** `cd Frontend && npm install && npm run dev:tenant` / `dev:master`

**CI:** `.github/workflows/ci.yml` — backend `mvn test`, frontend lint + build.

---

## 4. Improvement roadmap

| Phase | Status | Focus |
|-------|--------|--------|
| 0 — Critical fixes | Done | Secrets in `.env`, centralized API client |
| 1 — Foundation | Done | `@trackify/shared`, ApiResponse, Docker profiles |
| 2 — Quality | In progress | CI done; tests, Flyway, OpenAPI next |
| 3 — UI/UX | Mostly done | Tokens, search, Create menu, core pages |
| 4 — Product | Planned | Notifications UI, activity log, issue keys |
| 5 — Scale | Ongoing | Rate limits, observability, K8s |

**Next tasks (Week 4–6):** backend unit tests, Flyway, Vitest smoke tests, OpenAPI export.

**Later (Week 10+):** in-app notifications, audit timeline, Jira-style issue keys, role-based UI polish.

---

## 5. Repository map

```
trackify-saas-platform/
├── Backend/              # Maven microservices + master.sql
├── Frontend/             # npm workspaces (shared + 2 apps)
├── documents/README.md   # This file
├── docker-compose.yml
└── .env.example
```

---

*Last updated: May 2026*
