# Codebase Status

Last reviewed: July 2026

This document summarizes the current state of the Trackify codebase based on a full repository analysis.

## Overview

Trackify is a **multi-tenant SaaS platform** for project and issue management (Jira-inspired). It ships as a **Spring Boot microservices backend**, **two React SPAs** (platform admin + tenant workspace), and **Docker Compose** for local development.

| Area | Count / stack |
|------|----------------|
| Backend deployables | 5 services + 1 shared library (`common-lib`) |
| Frontend apps | `master-app`, `tenant-app`, `@trackify/shared` |
| Backend unit tests | 15 Java test classes |
| Frontend tests | 21 Vitest tests (tenant-app only) |
| CI | GitHub Actions — Maven test + frontend lint/test/build |

## What is implemented

### Platform (master-app)

- Master admin login and JWT auth
- Tenant CRUD and status management
- Platform dashboard statistics

### Tenant workspace (tenant-app)

- Marketing landing page and auth flows (login, register, forgot/reset password)
- Dashboard with charts, widgets, and onboarding checklist
- Projects, Kanban board, issue detail panel, sprints/backlog
- Team management, pending user approval, profile
- Global search, in-app notifications, dark/light theme

### Backend capabilities

- JWT authentication and role-based access (`MASTER`, `ADMIN`, `USER`)
- Database-per-tenant isolation with dynamic datasource routing
- Tenant provisioning and user approval workflow
- Projects, issues, comments, attachments (local or S3/MinIO)
- Sprint planning, activity feed, dashboard aggregation, global search
- Email notifications (optional `notification-service`)
- API gateway with rate limiting, OpenAPI/Swagger, correlation IDs
- Actuator health probes for container orchestration

## Architecture patterns

```text
Browser → nginx / Vite → api-gateway (8080)
                              ├── auth-service (8081)     → trackify_master (Flyway)
                              ├── tenant-service (8082)   → trackify_master + tenant DB provisioning
                              └── project-service (8083)  → per-tenant MySQL via TenantRoutingDataSource
notification-service (8084) ← internal HTTP from tenant/project
```

- **Multi-tenant routing:** JWT `tenant_id` → `TenantContext` (ThreadLocal) → `TenantRoutingDataSource`
- **Security:** Gateway validates JWT; services use shared `JwtUtil` from `common-lib`
- **Frontend:** npm workspaces, Redux Toolkit, lazy routes, shared design tokens and components

## Merits

1. **Strong tenant isolation** — Separate MySQL database per tenant, not row-level filtering alone.
2. **Centralized auth at the gateway** — JWT validated before proxying; consistent security primitives in `common-lib`.
3. **Solid project-service test coverage** — 9 of 15 backend test classes cover core domain logic (issues, projects, search, dashboard, schema upgrades).
4. **Production-oriented gateway** — Rate limiting (Bucket4j), correlation ID propagation, OpenAPI exposure, health probes.
5. **Complete local stack** — Docker Compose with health checks, optional email (`full`) and S3 (`s3`) profiles, nginx front door.
6. **Shared frontend package** — DRY roles, axios client, and reusable UI components across both apps.
7. **Legacy tenant DB upgrades** — `TenantSchemaUpgrader` applies idempotent SQL for older tenant databases.
8. **Modern tenant UI** — Marketing landing page, split-panel auth, refreshed design system, 21 frontend tests in CI.

## Demerits and gaps

1. **Inconsistent schema management** — `auth-service` uses Flyway + `ddl-auto: validate`; `tenant-service` and `project-service` use Hibernate `ddl-auto: update`; tenant DBs also rely on hand-written `TenantSchemaUpgrader` SQL.
2. **No integration or E2E tests** — All backend tests are isolated unit/Mockito tests; no `@SpringBootTest`, API integration suite, or browser E2E tests.
3. **`notification-service` untested** — Zero test files for email dispatch despite being a deployable microservice.
4. **`master-app` test gap** — No Vitest setup or tests; CI only runs tenant-app tests.
5. **Uneven backend coverage** — No tests for sprint/member controllers, gateway rate limit filter, or `common-lib` utilities.
6. **Custom gateway proxy** — `RestTemplate` byte-proxy instead of Spring Cloud Gateway; no built-in circuit breaking, retries, or service discovery.
7. **Email off by default in Docker** — Requires `--profile full`; easy to miss in local testing.
8. **Documentation drift risk** — README and env examples must stay aligned with Spring profiles and JWT configuration as the project evolves.

## Recommended next steps

| Priority | Item |
|----------|------|
| High | Unify schema strategy (Flyway for all databases or documented Hibernate-only policy) |
| High | Add integration tests for auth + tenant provisioning happy path |
| Medium | Vitest smoke tests for `master-app` |
| Medium | Unit tests for `notification-service` |
| Medium | Set `STORAGE_PROVIDER=s3` for multi-node production |
| Low | Replace custom gateway with Spring Cloud Gateway or add resilience patterns |
| Low | E2E tests (Playwright) for login → create project → create issue |

See [SPRING_PROFILES.md](./SPRING_PROFILES.md) for environment configuration and [DOCKER_PRODUCTION.md](./DOCKER_PRODUCTION.md) for deployment guidance.
