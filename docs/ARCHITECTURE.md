# Architecture

## Overview

Trackify is a multi-tenant SaaS platform for project and issue management. Platform operators provision organizations from the master console; each organization runs in an isolated MySQL database and is accessed through the tenant workspace app.

The backend is a Maven multi-module Spring Boot 3.3 system. The frontend is an npm workspaces monorepo with two Vite/React apps and a shared UI package.

## High-level diagram

```text
┌─────────────┐   ┌─────────────┐
│ master-app  │   │ tenant-app  │
│   :5173     │   │   :5174     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                ▼
         api-gateway :8080
         (JWT, rate limit, proxy)
                │
    ┌───────────┼───────────┬────────────────┐
    ▼           ▼           ▼                ▼
 auth :8081  tenant :8082  project :8083  notify :8084
    │           │              │
    └───── trackify_master ────┘
                   │
                   ▼
         trackify_tenant_<code>
```

## Directory map

### Backend

| Path | Role |
|------|------|
| `Backend/pom.xml` | Parent POM, dependency BOM, Spotless / compiler pluginManagement |
| `Backend/common-lib` | Shared JWT, `ApiResponse`, exceptions, themes/plans, email client |
| `Backend/api-gateway` | Servlet reverse proxy + filters (not Spring Cloud Gateway) |
| `Backend/auth-service` | Login, password flows, master Flyway migrations |
| `Backend/tenant-service` | Tenant lifecycle, user registry, branding, platform stats |
| `Backend/project-service` | Domain work: projects, issues, sprints, attachments, SSE |
| `Backend/notification-service` | SMTP (or console) email sender |

Typical package layout per service:

```text
com.trackify.<service>/
  controller | service | repository | entity | dto | config | filter | client
```

### Frontend

| Path | Role |
|------|------|
| `Frontend/master-app` | Platform admin UI |
| `Frontend/tenant-app` | Workspace + marketing landing |
| `Frontend/packages/trackify-shared` | Buttons, forms, themes, API helpers, CSS tokens |

## Data model

### Master database (`trackify_master`)

Owned primarily by `auth-service` Flyway migrations. Holds:

- Platform master users
- Tenant registry (DB connection metadata, plan, status, branding)
- Global user lookup (email → tenant)
- Platform audit log (written by tenant-service)

### Tenant databases (`trackify_tenant_<code>`)

Created at provision time from a SQL template in `tenant-service`. Contain users, projects, issues, sprints, comments, attachments metadata, in-app notifications, etc.

`project-service` routes queries with `TenantContext` + `AbstractRoutingDataSource`. Schema drift on older tenant DBs is repaired by `TenantSchemaUpgrader` at runtime.

## Request flow

1. Browser calls `VITE_API_BASE_URL` (gateway).
2. `JwtGatewayFilter` validates Bearer tokens on protected routes; public paths include `/auth/login`, health, Swagger.
3. Gateway proxies by path prefix to auth / tenant / project services.
4. Downstream services re-validate JWT (defense in depth) and apply role checks.
5. Project APIs resolve `tenantId` from the token, set `TenantContext`, and hit the tenant DB.

## Important modules

| Module | Why it matters |
|--------|----------------|
| `JwtUtil` / `SecurityConstants` | Shared token creation and header parsing |
| `EmailNotificationClient` | Soft-fail email posts to notification-service |
| `TenantService` | Provisioning, invites, approvals, branding |
| `TenantRoutingDataSource` | Per-request DB selection |
| `TenantSchemaUpgrader` | Idempotent tenant schema patches |
| `@trackify/shared` | Keeps both apps visually and behaviorally aligned |

## Design decisions

| Decision | Rationale |
|----------|-----------|
| Database per tenant | Strong isolation; simpler backups/export per customer |
| Custom servlet gateway | Lightweight for this scale; Cloud Gateway is a future option |
| Dual React apps | Separate auth cookies/tokens and product surfaces |
| Flyway on master only | Tenant DBs are templated at create time; upgrader handles evolution |
| Soft-fail email | Provisioning must succeed even if SMTP is down |
| Shared `common-lib` | Avoid duplicating JWT and error envelopes |

## Security notes

- JWT secret must be identical on every service (`JWT_SECRET`).
- Internal project notifications require `INTERNAL_API_KEY`.
- Notification-service email API is intended for private network use; do not expose it publicly without auth.
- Tenant DB credentials are stored in the master `tenants` table — treat master DB access carefully.

## Related docs

- [SETUP.md](./SETUP.md) — local development
- [API.md](./API.md) — endpoint map
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production checklist
- [CONTRIBUTING.md](./CONTRIBUTING.md) — contribution workflow
