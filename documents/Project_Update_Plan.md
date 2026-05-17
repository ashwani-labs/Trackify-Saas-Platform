==========================================
TRACKIFY — PROJECT UPDATE PLAN
==========================================

Document Version: 1.0  
Created: May 2026  
Status: Proposed  
Related Docs: Development_Plan.md, PRD.md, Backend_Architecture.md, Frontend_Architecture_Document.md

--------------------------------------------

1. PURPOSE
----------

This document defines a phased plan to improve Trackify from its current
“active development / portfolio-ready” state toward a production-shaped,
maintainable SaaS platform.

Goals:
- Fix security and configuration gaps
- Improve code quality, tests, and CI
- Polish UI/UX and complete half-finished features
- Align documentation with the real codebase
- Add high-value product features without over-scoping

--------------------------------------------

2. CURRENT STATE SUMMARY (BASELINE)
-----------------------------------

Strengths:
- Microservices: auth, tenant, project, notification, api-gateway, common-lib
- Multi-tenant DB-per-tenant routing (TenantRoutingDataSource)
- Dual frontend: master-app (platform admin), tenant-app (end users)
- Core flows: auth, tenant onboarding, projects, issues, Kanban, sprints/backlog,
  comments, attachments, user approval, dashboards
- Docker Compose + nginx for local full-stack runs
- Global exception handling, Redux Toolkit, lazy routes, theme toggle

Gaps (from codebase review):
- Secrets committed in docker-compose.yml (JWT, mail credentials)
- API base URL hardcoded in many frontend files (localhost:8080)
- README outdated (“React planned”, “Docker planned”)
- Minimal automated tests (backend ~5 test files, frontend none)
- No CI/CD pipeline
- No schema migration tool (Flyway/Liquibase)
- UI: non-functional Search and Create buttons; dark theme token issues
- Master dashboard uses placeholder chart data
- Duplicated patterns between master-app and tenant-app

--------------------------------------------

3. TARGET OUTCOMES
------------------

| Area              | Target (3–4 months)                                      |
|-------------------|----------------------------------------------------------|
| Security          | No secrets in git; env-based config everywhere           |
| Quality           | CI on every PR; 60%+ coverage on critical backend paths  |
| Frontend          | Single API client; shared UI tokens/components           |
| UX                | Working search/create; consistent light/dark themes      |
| Ops               | Flyway migrations; OpenAPI published at gateway            |
| Product           | Notifications inbox; activity log; README matches reality  |

--------------------------------------------

4. PHASE OVERVIEW
-----------------

PHASE 0 — Critical fixes (Week 1)          [MUST DO FIRST]
PHASE 1 — Foundation & hygiene (Weeks 2–3)
PHASE 2 — Quality & automation (Weeks 4–6)
PHASE 3 — UI/UX polish (Weeks 7–9)
PHASE 4 — Product features (Weeks 10–14)
PHASE 5 — Scale & hardening (Ongoing)

--------------------------------------------

5. PHASE 0 — CRITICAL FIXES (WEEK 1) ✅ COMPLETED
------------------------------------------------

Priority: P0 — Blockers for any public repo or deployment

Status: Implemented (see git history). Remaining manual step: rotate JWT/mail
credentials if they were ever committed to a remote repository.

TASK 0.1 — Rotate and remove committed secrets
- Rotate Gmail app password and JWT secret used in docker-compose.yml
- Remove MAIL_PASSWORD, JWT_SECRET, and real email from version control
- Use .env (gitignored) + docker-compose env_file or Docker secrets
- Add documents/ or root .env.example with placeholder keys only

Acceptance:
- docker-compose.yml contains no real credentials
- App still starts via documented .env setup

TASK 0.2 — Centralize frontend API configuration
- Add VITE_API_BASE_URL to tenant-app and master-app (.env.example)
- Refactor all slices/services to use shared axios instance (baseURL + interceptors)
- Remove duplicate API_BASE_URL constants and manual getAuthHeader() where redundant

Files to touch (tenant-app):
- src/utils/axios.js
- src/features/auth/authSlice.js
- src/features/projects/projectSlice.js
- src/features/issues/issueSlice.js
- src/features/users/userSlice.js
- src/pages/ForgotPasswordPage.jsx
- src/pages/ResetPasswordPage.jsx
- src/components/issues/IssueDetailPanel.jsx

Files to touch (master-app):
- src/services/authApi.js
- src/services/tenantApi.js

Acceptance:
- One env variable controls API URL in dev and Docker builds

TASK 0.3 — Update README.md
- Mark React, Docker, Kanban, comments/attachments as implemented
- Add “Quick start” with docker-compose + env prerequisites
- Link to this document for the improvement roadmap

Acceptance:
- New contributor can onboard without confusion about “planned” features

--------------------------------------------

6. PHASE 1 — FOUNDATION & HYGIENE (WEEKS 2–3)
---------------------------------------------

TASK 1.1 — Shared frontend package (optional but recommended)
- Create packages/shared or Frontend/shared/
- Move: design tokens (CSS variables), axios factory, route constants, role enums
- Both apps import shared module via workspace (npm/pnpm workspaces)

Acceptance:
- index.css tokens defined once; both apps consume them

TASK 1.2 — API response consistency audit
- Verify all services return same envelope (e.g. data, message, status)
- Align frontend thunks with Api_Contract_Document.md
- Fix any endpoints returning raw entities without wrapper

TASK 1.3 — Error handling on frontend
- Map backend ErrorResponse to toast messages consistently
- On 401: clear token and redirect to login (single place in axios interceptor)

TASK 1.4 — Docker profiles
- docker-compose.override.yml.example for local mail (optional notification-service)
- Document which services are required vs optional for minimal dev

--------------------------------------------

7. PHASE 2 — QUALITY & AUTOMATION (WEEKS 4–6)
---------------------------------------------

TASK 2.1 — GitHub Actions CI
- Workflow: backend — mvn -B test (all modules)
- Workflow: frontend — npm ci, lint, build (master-app + tenant-app)
- Run on pull_request and push to main

Acceptance:
- PRs cannot merge with failing build (branch protection when ready)

TASK 2.2 — Expand backend tests
Priority services:
- IssueService (status transitions, assignee, comments)
- TenantService (tenant DB provisioning edge cases)
- AuthService (login, password reset)
- JwtAuthenticationFilter / gateway routing (integration tests if feasible)

Target: 15–25 meaningful unit tests on critical paths

TASK 2.3 — Add frontend tests
- Vitest + React Testing Library
- Minimum smoke tests:
  1. Login form renders and submits
  2. Protected route redirects when no token
  3. Kanban renders columns for a mocked issue list

TASK 2.4 — Database migrations (Flyway)
- Master DB: V1__master_schema.sql from Backend/master.sql
- Tenant template: versioned script used when provisioning tenant DB
- Stop relying on inline DDL in Java where possible (tenant-service)

Acceptance:
- Fresh environment applies migrations without manual SQL runs

TASK 2.5 — OpenAPI / Swagger
- springdoc-openapi on api-gateway or per-service aggregation
- Export openapi.yaml to documents/ for frontend reference
- Optional: generate TypeScript types for tenant-app

--------------------------------------------

8. PHASE 3 — UI/UX POLISH (WEEKS 7–9)
--------------------------------------

TASK 3.1 — Fix dark theme
- Change dark --bg-main from accent blue to neutral dark (#1D2125 / #22272B)
- Replace hardcoded Kanban colors (#EBECF0, #F4F5F7) with CSS variables
- Verify charts, modals, inputs in dark mode

TASK 3.2 — Implement global Search
- Debounced search in top bar
- Search issues + projects (backend endpoint or client filter for MVP)
- Keyboard shortcut: "/" focuses search

TASK 3.3 — Wire Create button
- Dropdown: Create issue | Create project
- Context-aware default when inside a project

TASK 3.4 — Remove or replace placeholder UI
- Master dashboard: real tenant growth API or remove fake Jan/Feb/Mar chart
- Sidebar "Project Context": show current project name when on /projects/:id
- Remove unused imports (e.g. ChevronLeft/Right if not used)

TASK 3.5 — Component extraction (reduce inline styles)
- Create reusable: Button, Input, Modal, Badge, StatCard, EmptyState
- Migrate highest-traffic pages first: LoginPage, ProjectsPage, ProjectDetailPage

TASK 3.6 — Accessibility pass
- Focus visible on interactive elements
- aria-label on icon-only buttons
- Modal focus trap and Escape to close
- Kanban: optional keyboard move (arrow keys) or documented drag-only

--------------------------------------------

9. PHASE 4 — PRODUCT FEATURES (WEEKS 10–14)
--------------------------------------------

Align with PRD and README roadmap. Implement in order of user impact.

TASK 4.1 — Notifications (UI + backend integration)
- In-app notification list (assignment, approval, password reset)
- Consume notification-service APIs from tenant-app
- Mark read / unread; link to issue or project

TASK 4.2 — Activity / audit log
- Log: issue status change, assignee change, comment added, sprint move
- Show timeline on IssueDetailPanel and project activity tab

TASK 4.3 — Issue keys (Jira-style)
- Display PROJ-123 keys in Kanban cards and URLs
- Backend: issue_key or computed from project prefix + sequence

TASK 4.4 — Role-based UI (beyond route guards)
- Hide admin actions for USER role in issue panel, members modal, etc.
- Disable buttons instead of only failing on API 403

TASK 4.5 — Email templates
- HTML templates for: welcome, approval, assignment, password reset
- Centralize in notification-service; no raw strings in project-service

TASK 4.6 — Empty states and onboarding
- First-time tenant: empty projects CTA, sample project optional
- Pending users: clear admin instructions

Future (Phase 4+ backlog):
- Custom fields / labels
- Webhooks (Slack/GitHub)
- Real-time updates (WebSocket/SSE)
- File storage to S3 instead of local only

--------------------------------------------

10. PHASE 5 — SCALE & HARDENING (ONGOING)
-----------------------------------------

- Rate limiting at API gateway
- Request ID / correlation ID in logs
- Health checks aggregated for monitoring
- Kubernetes manifests (if moving beyond Compose)
- Performance: pagination everywhere lists are unbounded
- Caching: tenant datasource metadata, JWT validation
- Security review: CORS, CSP, file upload validation, virus scan hook

--------------------------------------------

11. WHAT TO REMOVE OR AVOID
---------------------------

Remove / simplify:
- Duplicate API_BASE_URL and manual Authorization headers in thunks
- Fake analytics data on master dashboard (unless backed by API)
- Committed secrets in any YAML or properties file
- Outdated "planned" language in README for shipped features

Do NOT remove (core value):
- Microservices split and common-lib
- DB-per-tenant routing
- Separate master-app and tenant-app
- api-gateway as single entry point

Avoid (scope creep):
- Rewriting entire frontend in TypeScript in one pass (migrate incrementally if desired)
- Adding Kubernetes before CI and migrations are stable
- New microservices until existing ones have tests and OpenAPI

--------------------------------------------

12. FILE & FOLDER CHANGES (PLANNED)
-----------------------------------

New files:
- .env.example (root or per-app)
- .github/workflows/ci.yml
- documents/openapi.yaml (generated)
- Backend/*/src/main/resources/db/migration/ (Flyway)
- Frontend/tenant-app/vitest.config.js + src/__tests__/
- packages/shared/ (if monorepo workspace adopted)

Update files:
- README.md
- docker-compose.yml (env_file, no secrets)
- All frontend API slices → use shared axios
- documents/Api_Contract_Document.md (sync with OpenAPI)

--------------------------------------------

13. SUCCESS METRICS
-------------------

| Metric                         | Current (est.) | Target        |
|--------------------------------|----------------|---------------|
| Secrets in git                 | Yes            | None          |
| Backend unit test files        | ~5             | 20+           |
| Frontend test files            | 0              | 10+           |
| CI pipeline                    | No             | Yes           |
| Hardcoded API URLs (frontend)  | 15+            | 0             |
| OpenAPI spec                   | Manual doc     | Auto-generated|
| Non-functional top-bar actions | 2              | 0             |

--------------------------------------------

14. WEEK-BY-WEEK CHECKLIST (QUICK REFERENCE)
--------------------------------------------

Week 1  [x] Rotate secrets (remove from compose — rotate if previously exposed)  [x] .env.example  [x] Axios refactor  [x] README
Week 2  [ ] Shared CSS/package  [ ] 401 redirect  [ ] Docker docs
Week 3  [ ] API contract audit  [ ] Error toast consistency
Week 4  [ ] GitHub Actions  [ ] 5+ new backend tests
Week 5  [ ] Flyway master schema  [ ] Vitest setup + 3 tests
Week 6  [ ] OpenAPI + publish to documents/
Week 7  [ ] Dark theme fix  [ ] CSS variables in Kanban
Week 8  [ ] Global search  [ ] Create button
Week 9  [ ] Component library (Button, Modal, Input) on 3 pages
Week 10 [ ] Notifications UI
Week 11 [ ] Activity log
Week 12 [ ] Issue keys
Week 13 [ ] Role-based UI polish
Week 14 [ ] Email templates + empty states

--------------------------------------------

15. RISKS & MITIGATIONS
-----------------------

| Risk                              | Mitigation                                      |
|-----------------------------------|-------------------------------------------------|
| Secret already exposed on GitHub  | Rotate immediately; audit git history           |
| Flyway + dynamic tenant DBs       | Separate master migrations vs tenant template   |
| Large frontend refactor breaks UI | One slice/page per PR; keep CI green            |
| Two apps drift further apart      | Shared package in Phase 1                       |

--------------------------------------------

16. REVIEW & MAINTENANCE
------------------------

- Revisit this plan after each phase; mark tasks DONE in git or project board
- Update Api_Contract_Document.md when endpoints change
- After Phase 2, require tests for new backend service methods
- After Phase 3, require screenshot or Storybook check for UI changes

--------------------------------------------

END OF DOCUMENT
