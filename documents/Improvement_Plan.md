# Trackify Functionality and UI Improvement Plan

Last updated: May 2026

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
| P0 | Service configs still include a fallback JWT secret | `Backend/*/src/main/resources/application.yml` | Remove default JWT secrets and require `JWT_SECRET` through env/config |
| P0 | No schema migration tool | No `db/migration` files | Add Flyway migrations for master schema and tenant schema provisioning |
| P0 | Backend test coverage is thin | 5 test files under `Backend/**/src/test` | Add focused tests for issue transitions, tenant provisioning, auth, and gateway auth |
| P0 | No frontend tests | No `*.test.*` files under `Frontend/` | Add Vitest + React Testing Library smoke tests |
| P1 | API gateway has duplicate application packages | `com.trackify.gateway` and `com.trackify.apigateway` | Remove duplicate gateway package/classes and keep one application package |
| P1 | Gateway proxy is generic and logs full headers | `GatewayController` | Avoid logging sensitive headers, add request IDs, and consider Spring Cloud Gateway routing |
| P1 | Assignment emails are synchronous best-effort REST calls | `IssueService.sendAssignmentEmail` | Move notification dispatch behind a notification client or async queue abstraction |
| P1 | Global search is an MVP only | `GlobalSearch.jsx` searches projects and currently loaded issues | Add backend search endpoint for cross-project issues, users, and recent entities |
| P1 | Master dashboard growth chart is derived fake history | `DashboardPage.jsx` uses Jan/Feb/Mar from current tenant count | Add tenant growth API or remove historical chart |
| P1 | Attachments use local storage | `LocalStorageService` | Add S3-compatible storage provider and file validation |
| P2 | In-app notifications are not implemented | `notification-service` only sends email | Add notification inbox with read/unread state and links to issues/projects |
| P2 | Activity/audit log is missing | No activity timeline endpoints | Add issue/project activity events and surface them in UI |
| P2 | Issue keys are missing | Issues use numeric IDs only | Add Jira-style keys like `PROJ-123` and expose in URLs/cards |
| P2 | OpenAPI is missing | No generated OpenAPI spec | Add `springdoc-openapi` and publish generated API spec |

### UI and UX

| Priority | Finding | Evidence | Improvement |
|----------|---------|----------|-------------|
| P0 | Several pages still use extensive inline styles | `TeamPage.jsx`, `DashboardPage.jsx`, master pages | Migrate to shared component classes and tokens |
| P1 | Master app still has duplicated UI primitives | `Frontend/master-app/src/components/ui` | Replace with `@trackify/shared` components |
| P1 | Accessibility pass is incomplete | Icon buttons and modals need review | Add labels, focus handling, Escape behavior, and keyboard search navigation |
| P1 | Responsive states need full validation | Sidebar/search/cards use desktop-first patterns | Test and adjust mobile layouts for dashboard, team, project detail |
| P1 | Empty states are inconsistent | Some pages use cards, others inline blocks | Standardize `EmptyState` with clear CTAs |
| P2 | Theme tokens are not universal | Hardcoded hex values remain in pages | Replace page-level hex colors with semantic tokens |
| P2 | Dashboard information hierarchy can improve | Master and tenant dashboards mix charts/cards/lists | Add consistent page headers, stat cards, and action sections |

## Functionality Roadmap

### Phase 1: Stabilize Foundations

- [x] Remove fallback JWT secrets from every service config.
- [x] Add Flyway to `auth-service` or a shared migration strategy for `trackify_master`.
- [x] Extract tenant schema creation from inline Java SQL into a versioned tenant schema script.
- [x] Delete duplicate `api-gateway` application package and keep a single `com.trackify.gateway` entrypoint.
- [ ] Add backend tests for:
  - [x] `IssueService` create/update/delete and sprint assignment
  - [x] status transitions and assignee changes
  - [x] `TenantService` provisioning failure cleanup
  - [x] `AuthService` invalid credentials and inactive users
  - [x] gateway unauthorized/authorized routes

### Phase 2: Improve Product Workflows

- [ ] Add global search backend endpoint:
  - [ ] projects by name/key/description
  - [ ] issues by title/key/assignee/status
  - [ ] users by email/name
- [ ] Add in-app notifications:
  - [ ] notification entity/table
  - [ ] list unread/read notifications
  - [ ] mark read/unread
  - [ ] link to issue/project/user approval
- [ ] Add activity log:
  - [ ] issue status changed
  - [ ] assignee changed
  - [ ] comment added
  - [ ] sprint started/completed
- [ ] Add Jira-style issue keys:
  - [ ] project key + sequence
  - [ ] display key on cards and detail panel
  - [ ] route support for issue key deep links
- [ ] Replace master dashboard fake growth chart with real tenant growth data.

### Phase 3: Operational Readiness

- [ ] Add OpenAPI generation and publish `openapi.yaml`.
- [ ] Add request correlation IDs through gateway and services.
- [ ] Add rate limiting at gateway.
- [ ] Add S3-compatible attachment storage and upload validation.
- [ ] Add structured health checks and readiness checks.
- [ ] Add Docker production notes and environment matrix.

## UI Improvement Roadmap

### Phase 1: Shared UI Consistency

- [ ] Migrate `tenant-app` pages still using inline styles:
  - [ ] `TeamPage.jsx`
  - [ ] `DashboardPage.jsx`
  - [ ] `ProfilePage.jsx`
  - [ ] `RegisterPage.jsx`
  - [ ] `ForgotPasswordPage.jsx`
  - [ ] `ResetPasswordPage.jsx`
  - [ ] `UserApprovalPage.jsx`
- [ ] Migrate `master-app` UI primitives to `@trackify/shared`:
  - [ ] `Button`
  - [ ] `Input`
  - [ ] `Modal`
  - [ ] `Badge`
  - [ ] `PageHeader`
  - [ ] `EmptyState`
- [ ] Replace remaining hardcoded colors with semantic tokens.

### Phase 2: Usability and Accessibility

- [ ] Add keyboard navigation for global search results.
- [ ] Add `aria-label` to icon-only buttons.
- [ ] Add modal focus trap and Escape close behavior.
- [ ] Add consistent loading, empty, and error states for every list page.
- [ ] Verify mobile behavior for:
  - [ ] tenant dashboard
  - [ ] team management
  - [ ] project board/backlog
  - [ ] master tenant management

### Phase 3: Product Polish

- [ ] Improve onboarding empty state for first project/team.
- [ ] Add richer project cards with status and activity hints.
- [ ] Add issue detail activity timeline.
- [ ] Add quick filters for assignee, priority, sprint, and status.
- [ ] Add dashboard widgets backed by real APIs.

## Suggested Next 10 Tasks

1. Remove fallback JWT secrets from backend `application.yml` files.
2. Add Flyway master schema migration from `Backend/master.sql`.
3. Extract tenant schema SQL from `TenantService`.
4. Remove duplicate `api-gateway` package/classes.
5. Add `IssueService` unit tests.
6. Add Vitest + React Testing Library setup and smoke tests.
7. Migrate `TeamPage.jsx` to shared UI components and token classes.
8. Replace master dashboard fake growth chart.
9. Add keyboard navigation to `GlobalSearch.jsx`.
10. Add OpenAPI generation at the gateway or service level.

## Tracking Notes

- Keep this file updated after each task.
- Prefer one focused commit per checklist item or tightly related group.
- When a task changes API behavior, update README setup notes and frontend usage together.
