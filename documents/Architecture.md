==========================================
TRACKIFY — ARCHITECTURE
==========================================

Document Version: 2.0  
Last updated: May 2026  
Replaces: `Backend_Architecture.md`, `Frontend_Architecture_Document.md`

Related: `PRD.md`, `DB_Design_Document.md`, `Api_Contract_Document.md`, `Docker_Dev_Guide.md`

--------------------------------------------

1. SYSTEM OVERVIEW
------------------

Trackify is a multi-tenant SaaS platform for project and issue management (Jira-like).

| Layer | Stack |
|-------|--------|
| **Backend** | Java 17, Spring Boot 3.3, Spring Cloud Gateway, MySQL |
| **Frontend** | React 19, Vite 8, Redux Toolkit, React Router 7 |
| **Ops** | Docker Compose, nginx reverse proxy, GitHub Actions CI |

**Apps:**
- `Frontend/master-app` — platform admin (tenant onboarding)
- `Frontend/tenant-app` — end-user workspace (projects, Kanban, sprints)

**Entry point:** API Gateway (`:8080`) → microservices. JWT carries `tenant_id`, `user_id`, `role`.

--------------------------------------------

2. BACKEND ARCHITECTURE
-----------------------

### 2.1 Microservices

| Service | Responsibility |
|---------|----------------|
| **api-gateway** | Single entry, routing, JWT validation, header forwarding |
| **auth-service** | Login, JWT, password reset, master `user_lookup` |
| **tenant-service** | Tenant CRUD, dynamic DB provisioning, admin bootstrap |
| **project-service** | Projects, issues, sprints, comments, attachments, Kanban status |
| **notification-service** | Email (SMTP), async notifications (optional profile) |
| **common-lib** | Shared DTOs, JWT utils, exceptions, security constants |

### 2.2 Request flow

```
Client → API Gateway → Service
```

**Headers forwarded:** `Authorization`, `X-Tenant-ID`, `X-User-ID`, `X-User-Role`

### 2.3 Auth flow

1. Client sends email + password to auth-service (via gateway).
2. Master DB resolves tenant; tenant DB validates credentials.
3. JWT issued with `user_id`, `tenant_id`, `role`.
4. Subsequent requests: gateway validates JWT; services use tenant routing.

### 2.4 Multi-tenant data routing

- **Master DB:** tenants, `user_lookup`, platform users.
- **Per-tenant DB:** projects, issues, sprints, comments, attachments.
- **Implementation:** `TenantRoutingDataSource` + `ThreadLocal` tenant context (project-service, auth tenant operations).

### 2.5 API response envelope

```json
{
  "status": "success",
  "message": "...",
  "data": { }
}
```

Errors use shared `ErrorResponse` from common-lib. Frontend unwraps via `@trackify/shared` helpers.

### 2.6 Security

- JWT on all protected routes; 401 clears session in frontend axios interceptor.
- Role-based access: `MASTER`, `ADMIN`, `USER`.
- Tenant isolation enforced server-side; no DB credentials in frontend.

### 2.7 Inter-service communication

- **Sync:** REST (gateway routing; Feign where used).
- **Async (planned):** queue for notifications and activity logs.

### 2.8 Repository layout

```
Backend/
├── api-gateway/
├── auth-service/
├── tenant-service/
├── project-service/
├── notification-service/
├── common-lib/
├── pom.xml
└── master.sql          # Master schema reference
```

### 2.9 DevOps

- Docker Compose for local full stack; see `Docker_Dev_Guide.md`.
- CI: `.github/workflows/ci.yml` — `mvn test`, frontend lint + build.
- Planned: Flyway migrations, OpenAPI at gateway.

--------------------------------------------

3. FRONTEND ARCHITECTURE
------------------------

### 3.1 Monorepo workspaces

```
Frontend/
├── package.json              # npm workspaces root
├── packages/trackify-shared/ # tokens, axios factory, UI components, roles
├── tenant-app/
└── master-app/
```

Both apps import `@trackify/shared` for API client, design tokens (`tokens.css`, `components.css`), and shared components (`Button`, `Input`, `Modal`, etc.).

### 3.2 Tenant app structure

```
tenant-app/src/
├── features/          # Redux slices (auth, projects, issues, users, sprints)
├── pages/             # Route-level views
├── components/        # Feature + common UI
├── layouts/           # AuthLayout, DashboardLayout
├── hooks/             # useTheme, etc.
└── utils/axios.js     # Re-exports shared client
```

**State:** Redux Toolkit (`createSlice`, `createAsyncThunk`).  
**Routing:** React Router with lazy-loaded pages and protected routes.  
**API base URL:** `VITE_API_BASE_URL` (default `http://localhost:8080`).

### 3.3 Master app structure

```
master-app/src/
├── features/tenants/  # Tenant list, create
├── pages/             # Dashboard, login, tenant management
├── services/          # tenantApi, authApi
└── layouts/
```

### 3.4 Authentication (frontend)

1. Login → store JWT + user in Redux / `localStorage`.
2. Axios interceptor attaches `Authorization` header.
3. On 401 → logout and redirect to `/login`.

### 3.5 Key tenant routes

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Public auth |
| `/` | Dashboard |
| `/projects` | Project list |
| `/projects/:id` | Board / backlog |
| `/team`, `/pending-users` | Admin only |
| `/profile` | User profile |

### 3.6 Kanban

- Columns: `TODO`, `IN_PROGRESS`, `DONE`.
- Issues filtered by active sprint on board view; backlog for planning.
- Status updates via API on drag (project-service).

### 3.7 UI system

- CSS variables in `packages/trackify-shared/src/styles/tokens.css`.
- Component styles in `components.css`; app-specific layout in each app's `index.css`.
- Light/dark theme via `ThemeContext` and `data-theme` on root.

### 3.8 Performance

- Lazy route imports (code splitting).
- Pagination on project list and other large lists.

--------------------------------------------

4. CROSS-CUTTING CONCERNS
-------------------------

| Concern | Approach |
|---------|----------|
| **Logging** | Logback per service |
| **Errors** | Global handlers + toast on frontend |
| **Files** | Local storage in project-service (S3 planned) |
| **Email** | notification-service (optional Docker profile) |

### Future enhancements

- WebSocket / SSE for live board updates
- OpenAPI-generated client types
- Rate limiting and correlation IDs at gateway
- Kubernetes when CI and migrations are stable

--------------------------------------------

END OF DOCUMENT
