# Roadmap Progress Tracker

Last updated: July 2026

Track implementation status against [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md).

**Overall:** Phase A ~90% complete · Phase B ~75% complete · Phase C ~25% complete · Feature tier 1 ~60%

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

| Item | Status |
|------|--------|
| Kanban drag-and-drop polish | Done |
| Issue panel tabs | Done |
| Master tenant detail drawer | Done |
| Mobile bottom nav | Done |
| Notification WebSocket/SSE | Partial | 15s polling + issue-key deep links; WebSocket deferred |

---

## Phase C — Premium polish

| Item | Status | Notes |
|------|--------|-------|
| Tenant white-labeling UI | Done | `TenantBrandingEffect` applies `--primary`; workspace settings page |
| Expanded onboarding wizard | Done | Dashboard checklist includes sprint + issue steps |
| WCAG accessibility audit | Partial | Reduced-motion support; focus traps exist; full audit deferred |
| Optimistic Kanban updates | Done | Status + priority optimistic updates with rollback |

---

## Feature tiers

| Tier | Item | Status | Notes |
|------|------|--------|-------|
| 1 | Labels + saved filters | Partial | Saved filter views (localStorage); issue labels API deferred |
| 1 | Sprint ceremonies + burndown | Done | Start/complete + `SprintBurndownChart` |
| 1 | Workspace settings | Done | Admin page + `PATCH /tenants/{id}/branding` |
| 1 | Bulk issue actions | Done | Multi-select status updates in backlog |
| 2 | Plan limits enforcement | Partial | Plan limits displayed in workspace settings; enforcement deferred |
| 2 | Per-tenant usage dashboard | Partial | User counts in master tenant drawer |
| 2 | Platform audit log | Done | `GET /tenants/audit-logs` + master audit page |

---

## Deferred (future phases)

| Item | Reason |
|------|--------|
| Real-time WebSocket notifications | Requires new backend transport layer |
| Issue labels/tags API | Needs schema + backend model |
| Stripe billing / seat limits enforcement | External integration |
| Custom workflows, epics, time tracking | Tier 3 scope |
| AI features | Tier 4 scope |
| GitHub/Slack integrations | Tier 3 scope |

---

## Tests added for roadmap work

| Test file | Coverage |
|-----------|----------|
| `tenant-app/src/test/confirmDialog.test.jsx` | `ConfirmDialog`, `useConfirmDialog` |
| `tenant-app/src/test/issueDetailPanel.test.jsx` | Issue panel tabs |
| `tenant-app/src/test/kanbanBoard.test.jsx` | Kanban drag/drop + quick priority |
| `master-app/src/test/tenantDetailDrawer.test.jsx` | Tenant detail drawer |
| Existing tenant + master test suites | Regression |

---

## Next up (recommended order)

1. WebSocket/SSE notifications
2. Issue labels backend + UI
3. Plan limit enforcement on create actions

---

## Changelog

### July 2026 — Roadmap completion pass

- Shared: `useFormFields`, `PasswordStrength`, `KeyboardShortcutsPanel`, `useRecentItems`, `useKeyboardShortcuts`
- Tenant app: mobile bottom nav, workspace settings page, tenant branding CSS vars, saved filter views
- Sprint burndown chart, bulk backlog status updates, faster notification polling + deep links
- Master app: platform audit log page + API
- Backend: `PATCH /tenants/{id}/branding`, `GET /tenants/audit-logs`, login returns `plan`
- Accessibility: `prefers-reduced-motion` support

### July 2026 — Master tenant detail drawer

- `GET /tenants/{id}` returns `TenantDetailResponse` with DB info and user counts
- Slide-in drawer on tenant table row click

### July 2026 — Kanban polish

- Drag handle, drop zones, rollback on failed moves, quick priority edit

### July 2026 — Phase B start

- Issue detail panel tabs

### July 2026 — Phase A kickoff

- Shared UX primitives, master search, toasts, ConfirmDialog migration
