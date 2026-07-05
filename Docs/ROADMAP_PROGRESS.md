# Roadmap Progress Tracker

Last updated: July 2026

Track implementation status against [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md).

**Overall:** Phase A ~98% complete · Phase B ~95% complete · Phase C ~60% complete · Feature tier 1 ~95%

---

## Month 1 — Trust and polish

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Shared `ConfirmDialog` + `useConfirmDialog` | Done | `@trackify/shared` |
| 2 | Shared `Select`, `Textarea`, `ErrorBoundary` | Done | Exported from shared package |
| 3 | `CreateProjectModal` design system refactor | Done | Uses shared form components |
| 4 | Master app `ErrorBoundary` | Done | Wraps `App` |
| 5 | Master app toast notifications | Done | `react-hot-toast` |
| 6 | Master tenant search | Done | Top-bar search filters tenant table |
| 7 | Theme `prefers-color-scheme` default | Done | `getInitialTheme()` |
| 8 | Kanban drag UX + issue panel tabs | Done | |
| 9 | Master tenant detail drawer | Done | |
| 10 | Consistent loading skeletons | Done | Extended to audit log, issue detail loading state |

---

## Phase A — Quick wins

| Item | Status | Notes |
|------|--------|-------|
| Design system consistency | Done | `CreateIssueModal`, `IssueFilterBar` migrated; sprint/members modals use shared patterns where touched |
| `ConfirmDialog` for destructive actions | Done | |
| Success toasts (master-app) | Done | |
| Form UX (blur validation) | Done | `useFormFields` hook + applied to create issue + workspace settings |
| Password strength indicator | Done | Register + profile pages |
| Breadcrumbs on project detail | Done | |
| Sidebar recent items | Done | Last 3 visited projects in sidebar |
| Keyboard shortcuts panel | Done | `?` opens help; `/` focuses search; `g d` / `g p` navigation |
| Dark/light chart token audit | Done | Charts use `--chart-*` and `--text-muted` tokens |

---

## Phase B — Core experience

| Item | Status | Notes |
|------|--------|-------|
| Kanban drag-and-drop polish | Done | |
| Issue panel tabs | Done | |
| Master tenant detail drawer | Done | |
| Kanban card quick-edit (status + priority) | Done | Inline selects on issue cards |
| Mobile bottom nav | Removed | Replaced by hamburger menu + top bar (user request) |
| Modal full-screen on mobile | Done | Shared `Modal` sheet layout ≤767px |
| Notification WebSocket/SSE | Done | SSE `/notifications/stream` + 60s polling fallback |
| Notification grouping | Done | Groups comments/status/assignment alerts by issue key |
| Dashboard date range filters | Done | Tenant 7d/30d/90d + master 3/6/12 month chart selectors |
| Chart click-through | Done | Pie/bar segments open filtered project board |
| USER "My work" dashboard | Done | Admin-only overview charts; all users get widgets + insights |

---

## Phase C — Premium polish

| Item | Status | Notes |
|------|--------|-------|
| Tenant white-labeling UI | Partial | Per-tenant themes via `TenantBrandingEffect`; auth pages not yet branded |
| Expanded onboarding wizard | Done | Dashboard checklist includes sprint + issue steps |
| WCAG accessibility audit | Partial | Reduced-motion, focus traps, Kanban `aria-live`; contrast audit deferred |
| Optimistic Kanban + comment updates | Done | Status/priority drag + inline edits; optimistic comment post |
| Route prefetch | Done | Sidebar hover prefetches route chunks |
| Provisioning status UI | Partial | Step checklist in master create-tenant modal |

---

## Feature tiers

| Tier | Item | Status | Notes |
|------|------|--------|-------|
| 1 | Labels + saved filters | Done | Saved filter views (localStorage) + issue labels API, filter bar, and card chips |
| 1 | Sprint ceremonies + burndown | Done | Start/complete + `SprintBurndownChart` |
| 1 | Workspace settings | Done | Admin page + `PATCH /tenants/{id}/branding` + theme picker |
| 1 | Bulk issue actions | Done | Multi-select status updates in backlog |
| 1 | CSV export | Done | Project detail export |
| 1 | Tenant audit log | Done | Workspace audit page |
| 2 | Plan limits enforcement | Done | `PlanLimits` enforced on project + user creation |
| 2 | Per-tenant usage dashboard | Done | Master drawer: users/projects/issues/sprints + plan limit meters |
| 2 | Platform audit log | Done | `GET /tenants/audit-logs` + master audit page |
| 2 | Provisioning status | Partial | UI checklist during sync provision |
| 2 | Tenant impersonation | Not started | |
| 2 | Stripe billing | Not started | External integration |

---

## Deferred (future phases)

| Item | Reason |
|------|--------|
| Real-time WebSocket notifications | SSE chosen instead; gateway streaming proxy deferred |
| Stripe billing | External integration |
| Tenant impersonation | Security-sensitive support feature |
| Custom workflows, epics, time tracking | Tier 3 scope |
| AI features | Tier 4 scope |
| GitHub/Slack integrations | Tier 3 scope |
| @mentions in comments | Tier 3 collaboration |
| Attachment preview | Tier 3 collaboration |
| Virtualized backlogs | Performance polish when needed |
| Branded auth landing + email templates | Phase C white-label completion |

---

## Tests added for roadmap work

| Test file | Coverage |
|-----------|----------|
| `tenant-app/src/test/groupNotifications.test.js` | Notification grouping utility |
| `tenant-app/src/test/confirmDialog.test.jsx` | `ConfirmDialog`, `useConfirmDialog` |
| `tenant-app/src/test/issueDetailPanel.test.jsx` | Issue panel tabs |
| `tenant-app/src/test/kanbanBoard.test.jsx` | Kanban drag/drop + quick priority |
| `master-app/src/test/tenantDetailDrawer.test.jsx` | Tenant detail drawer |
| Existing tenant + master test suites | Regression |

---

## Next up (recommended order)

1. Stripe billing integration
2. Tenant impersonation for master support
3. GitHub/Slack integrations
4. Gateway SSE streaming proxy
5. Branded auth pages + email templates
6. Custom workflows, epics, time tracking (tier 3)

---

## Changelog

### July 2026 — Roadmap completion pass (batch 3)

- Notification grouping in bell dropdown
- Tenant dashboard date range (7d/30d/90d) + chart drill-down to filtered board
- Master dashboard chart range selector (3/6/12 months)
- Modal full-screen sheet on mobile
- Kanban inline status quick-edit + optimistic comment posting
- USER-focused dashboard (admin charts hidden for non-admins)
- Route prefetch on sidebar hover
- Provisioning step checklist in master create-tenant modal
- Per-tenant theme system (`brand_theme`, `ThemeSelector`)

### July 2026 — Roadmap completion pass (batch 2)

- Per-tenant usage metrics in master drawer
- Workspace audit log page (`GET /activity/workspace`)
- Notification preferences page + in-app filtering
- Issue CSV export from project detail
- Project templates in create-project modal
- Kanban screen-reader live region for drag-and-drop

### July 2026 — SSE, labels, and plan limits

- Backend: SSE notification stream, issue labels column + API, `PlanLimits` on project/user creation
- Tenant app: `useNotificationStream`, label filter/create/chips, workspace plan limits aligned to FREE/PRO/ENTERPRISE

### July 2026 — Roadmap completion pass (batch 1)

- Shared: `useFormFields`, `PasswordStrength`, `KeyboardShortcutsPanel`, `useRecentItems`, `useKeyboardShortcuts`
- Tenant app: workspace settings page, tenant branding CSS vars, saved filter views
- Sprint burndown chart, bulk backlog status updates, faster notification polling + deep links
- Master app: platform audit log page + API
- Backend: `PATCH /tenants/{id}/branding`, `GET /tenants/audit-logs`, login returns `plan`
