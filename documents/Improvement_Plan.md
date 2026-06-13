# Trackify Functionality and UI Improvement Plan

Last updated: June 2026

This file tracks practical improvements found during a repository scan. It is intentionally implementation-oriented: each item should become a small PR or commit.

## Current Baseline

Trackify is a multi-tenant project management SaaS with:

- Spring Boot microservices: `api-gateway`, `auth-service`, `tenant-service`, `project-service`, `notification-service`, `common-lib`
- MySQL master database plus tenant databases
- React/Vite frontend workspaces: `master-app`, `tenant-app`, and `@trackify/shared`
- JWT auth, tenant onboarding, user approval, projects, issues, Kanban, sprints/backlog, comments, attachments, and email notifications
- GitHub Actions CI for backend tests and frontend lint/build

## Scan Findings

### Functionality and Platform

| Priority | Finding | Evidence | Improvement |
|----------|---------|----------|-------------|
| P0 | ~~Service configs still include a fallback JWT secret~~ | `application.yml` uses `${JWT_SECRET}` | ~~Remove default JWT secrets and require `JWT_SECRET` through env/config~~ |
| P0 | ~~No schema migration tool~~ | Flyway in `auth-service`, tenant SQL scripts | ~~Add Flyway migrations for master schema and tenant schema provisioning~~ |
| P0 | ~~Backend test coverage is thin~~ | 14+ test files under `Backend/**/src/test` | ~~Add focused tests for issue transitions, tenant provisioning, auth, and gateway auth~~ |
| P0 | ~~No frontend tests~~ | Vitest + RTL in `tenant-app/src/test` | Expand smoke coverage for shared components and key pages (ongoing) |
| P1 | ~~API gateway has duplicate application packages~~ | `com.trackify.gateway` only | ~~Remove duplicate gateway package/classes~~ |
| P1 | ~~Gateway proxy is generic~~ | `GatewayController` + correlation IDs | Consider Spring Cloud Gateway routing (optional) |
| P1 | ~~Assignment emails are synchronous~~ | `NotificationEmailClient` + `@Async` | ~~Move notification dispatch behind a notification client~~ |
| P1 | ~~Global search is client-only~~ | `GET /search`, issue keys in results | ~~Add issue keys to search results~~ |
| P1 | ~~Master dashboard growth chart is fake~~ | `GET /tenants/dashboard-stats` | ~~Add provisioning rate (new per month) view~~ |
| P1 | Attachments use local storage by default | `STORAGE_PROVIDER=local`, optional S3 | Use S3 in multi-node production deployments |
| P2 | ~~In-app notifications missing~~ | Inbox + comment/status events | ~~Add more notification event types~~ |
| P2 | ~~Activity/audit log is missing~~ | Issue + project activity feeds | ~~Add project-level activity feed~~ |
| P2 | ~~Issue keys missing on legacy DBs~~ | `TenantSchemaUpgrader` backfill | ~~Backfill keys for legacy tenants~~ |
| P2 | ~~OpenAPI is missing~~ | `GET /openapi.yaml` at gateway | Keep spec updated when routes change (ongoing) |

### UI and UX

| Priority | Finding | Evidence | Improvement |
|----------|---------|----------|-------------|
| P0 | ~~Several pages use extensive inline styles~~ | Shared tokens + `components.css` | ~~Migrate to shared component classes and tokens~~ |
| P1 | ~~Master app duplicated UI primitives~~ | `@trackify/shared` imports | ~~Replace with `@trackify/shared` components~~ |
| P1 | ~~Accessibility pass incomplete~~ | Labels, focus trap, keyboard search | Further audit as new UI ships (ongoing) |
| P1 | ~~Responsive states need validation~~ | Mobile pass on key pages | Re-verify after major layout changes (ongoing) |
| P1 | ~~Empty states inconsistent~~ | `EmptyState` on list pages | Standardize remaining edge pages as needed |
| P2 | ~~Theme tokens not universal~~ | Semantic CSS variables | Replace stray hardcoded colors when touched |
| P2 | Dashboard information hierarchy | Master + tenant dashboards | Optional polish: unify stat card patterns further |

## Functionality Roadmap

### Phase 1: Stabilize Foundations

- [x] Remove fallback JWT secrets from every service config.
- [x] Add Flyway to `auth-service` or a shared migration strategy for `trackify_master`.
- [x] Extract tenant schema creation from inline Java SQL into a versioned tenant schema script.
- [x] Delete duplicate `api-gateway` application package and keep a single `com.trackify.gateway` entrypoint.
- [x] Add backend tests for:
  - [x] `IssueService` create/update/delete and sprint assignment
  - [x] status transitions and assignee changes
  - [x] `TenantService` provisioning failure cleanup
  - [x] `AuthService` invalid credentials and inactive users
  - [x] gateway unauthorized/authorized routes

### Phase 2: Improve Product Workflows

- [x] Add global search backend endpoint:
  - [x] projects by name/key/description
  - [x] issues by title/key/assignee/status
  - [x] users by email/name
- [x] Add in-app notifications:
  - [x] notification entity/table
  - [x] list unread/read notifications
  - [x] mark read/unread
  - [x] link to issue/project/user approval
  - [x] comment and status-change notification event types
- [x] Add activity log:
  - [x] issue status changed
  - [x] assignee changed
  - [x] comment added
  - [x] sprint started/completed
  - [x] project-level activity feed on project detail
- [x] Add Jira-style issue keys:
  - [x] project key + sequence
  - [x] display key on cards and detail panel
  - [x] route support for issue key deep links
  - [x] backfill keys for legacy tenant databases
- [x] Replace master dashboard fake growth chart with real tenant growth data.
- [x] Add master dashboard monthly provisioning rate chart (new tenants per month).
- [x] Dispatch assignment emails asynchronously via `NotificationEmailClient`.

### Phase 3: Operational Readiness

- [x] Add OpenAPI generation and publish `openapi.yaml`.
- [x] Add request correlation IDs through gateway and services.
- [x] Add rate limiting at gateway.
- [x] Add S3-compatible attachment storage and upload validation.
- [x] Add structured health checks and readiness checks.
- [x] Add Docker production notes and environment matrix.

### Phase 4: Production Hardening (optional / ongoing)

- [ ] Migrate gateway to Spring Cloud Gateway (optional).
- [ ] Default `STORAGE_PROVIDER=s3` in production compose profiles.
- [ ] Expand frontend smoke tests for `master-app` and shared components.
- [ ] Keep `Backend/api-gateway/src/main/resources/openapi.yaml` in sync with new routes.

## UI Improvement Roadmap

### Phase 1: Shared UI Consistency

- [x] Migrate `tenant-app` pages still using inline styles:
  - [x] `TeamPage.jsx`
  - [x] `DashboardPage.jsx`
  - [x] `ProfilePage.jsx`
  - [x] `RegisterPage.jsx`
  - [x] `ForgotPasswordPage.jsx`
  - [x] `ResetPasswordPage.jsx`
  - [x] `UserApprovalPage.jsx`
- [x] Migrate `master-app` UI primitives to `@trackify/shared`:
  - [x] `Button`
  - [x] `Input`
  - [x] `Modal`
  - [x] `Badge`
  - [x] `PageHeader`
  - [x] `EmptyState`
- [x] Replace remaining hardcoded colors with semantic tokens.

### Phase 2: Usability and Accessibility

- [x] Add keyboard navigation for global search results.
- [x] Add `aria-label` to icon-only buttons.
- [x] Add modal focus trap and Escape close behavior.
- [x] Add consistent loading, empty, and error states for every list page.
- [x] Verify mobile behavior for:
  - [x] tenant dashboard
  - [x] team management
  - [x] project board/backlog
  - [x] master tenant management

### Phase 3: Product Polish

- [x] Improve onboarding empty state for first project/team.
- [x] Add richer project cards with status and activity hints.
- [x] Add issue detail activity timeline.
- [x] Add quick filters for assignee, priority, sprint, and status.
- [x] Add dashboard widgets backed by real APIs.

## Suggested Next 10 Tasks

1. ~~Remove fallback JWT secrets from backend `application.yml` files.~~
2. ~~Add Flyway master schema migration.~~
3. ~~Extract tenant schema SQL from `TenantService`.~~
4. ~~Remove duplicate `api-gateway` package/classes.~~
5. ~~Add `IssueService` unit tests.~~
6. ~~Add Vitest + React Testing Library setup and smoke tests.~~
7. ~~Migrate `TeamPage.jsx` to shared UI components and token classes.~~
8. ~~Replace master dashboard fake growth chart.~~
9. ~~Add keyboard navigation to `GlobalSearch.jsx` (arrow keys / Enter).~~
10. ~~Add OpenAPI generation at the gateway or service level.~~
11. ~~Migrate `DashboardPage.jsx` to shared UI components and token classes.~~
12. ~~Add dashboard widgets backed by real APIs.~~

## Tracking Notes

- Keep this file updated after each task.
- Prefer one focused commit per checklist item or tightly related group.
- When a task changes API behavior, update README setup notes and frontend usage together.
