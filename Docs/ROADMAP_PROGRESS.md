# Roadmap Progress Tracker

Last updated: July 2026

Track implementation status against [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md).

**Overall:** Phase A ~45% complete · Phase B ~35% complete

---

## Month 1 — Trust and polish

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Shared `ConfirmDialog` + `useConfirmDialog` | Done | `@trackify/shared` — replaces all `window.confirm` |
| 2 | Shared `Select`, `Textarea`, `ErrorBoundary` | Done | Exported from shared package |
| 3 | `CreateProjectModal` design system refactor | Done | Uses shared form components + toasts |
| 4 | Master app `ErrorBoundary` | Done | Wraps `App` with shared component |
| 5 | Master app toast notifications | Done | `react-hot-toast` + tenant provision success toast |
| 6 | Master tenant search | Done | Top-bar search filters tenant table |
| 7 | Theme `prefers-color-scheme` default | Done | `getInitialTheme()` in both apps |
| 8 | Kanban drag UX + issue panel tabs | Done | Issue panel tabs + Kanban polish |
| 9 | Master tenant detail drawer | Done | Slide-in drawer with overview, branding, infra, usage |
| 10 | Consistent loading skeletons | Partial | Exists on some pages; not extended everywhere |

---

## Phase A — Quick wins

| Item | Status | Notes |
|------|--------|-------|
| Design system consistency | In progress | `CreateProjectModal` done; other modals pending |
| `ConfirmDialog` for destructive actions | Done | Tenant, team, issues, sprints, members |
| Success toasts (master-app) | Done | Tenant CRUD + provision |
| Form UX (blur validation) | Not started | |
| Password strength indicator | Not started | |
| Breadcrumbs on project detail | Done | Already present in `ProjectDetailPage` |
| Sidebar recent items | Not started | |
| Keyboard shortcuts panel | Not started | |
| Dark/light chart token audit | Not started | |

---

## Phase B — Core experience

| Item | Status |
|------|--------|
| Kanban drag-and-drop polish | Done |
| Issue panel tabs | Done |
| Master tenant detail drawer | Done |
| Mobile bottom nav | Not started |
| Notification WebSocket/SSE | Not started |

---

## Phase C — Premium polish

| Item | Status |
|------|--------|
| Tenant white-labeling UI | Not started |
| Expanded onboarding wizard | Not started |
| WCAG accessibility audit | Not started |
| Optimistic Kanban updates | Not started |

---

## Feature tiers

| Tier | Item | Status |
|------|------|--------|
| 1 | Labels + saved filters | Not started |
| 1 | Sprint ceremonies + burndown | Not started |
| 1 | Workspace settings | Not started |
| 1 | Bulk issue actions | Not started |
| 2 | Plan limits enforcement | Not started |
| 2 | Per-tenant usage dashboard | Not started |
| 2 | Platform audit log | Not started |

---

## Tests added for roadmap work

| Test file | Coverage |
|-----------|----------|
| `tenant-app/src/test/confirmDialog.test.jsx` | `ConfirmDialog`, `useConfirmDialog` |
| `tenant-app/src/test/issueDetailPanel.test.jsx` | Issue panel tabs |
| `tenant-app/src/test/kanbanBoard.test.jsx` | Kanban drag/drop + quick priority |
| `master-app/src/test/tenantDetailDrawer.test.jsx` | Tenant detail drawer sections + actions |
| Existing tenant + master test suites | Regression on form/modal changes |

---

## Next up (recommended order)

1. Inline form validation on blur
2. Workspace settings page (branding from provision data)
3. Mobile bottom nav

---

## Changelog

### July 2026 — Phase A kickoff

- Added `ConfirmDialog`, `useConfirmDialog`, `Select`, `Textarea`, `ErrorBoundary` to `@trackify/shared`
- Replaced all `window.confirm` usages across tenant and master apps
- Refactored `CreateProjectModal` to shared form patterns
- Master app: ErrorBoundary, toasts, functional tenant search
- Theme respects OS preference when no saved choice exists
- Added `btn--danger` and confirm/error-boundary styles

### July 2026 — Phase B start

- Issue detail panel: sticky header with key/title and Details / Activity / Comments tabs
- Panel section styles moved to shared CSS tokens

### July 2026 — Kanban polish

- Drag handle, improved drop zones, empty-column placeholder, and rollback on failed moves
- Quick priority edit on issue cards with optimistic updates
- Mobile horizontal scroll snap for board columns

### July 2026 — Master tenant detail drawer

- `GET /tenants/{id}` returns `TenantDetailResponse` with DB info and user counts
- Slide-in drawer on tenant table row click: overview, branding, infrastructure, usage
- Copy workspace URL, suspend/activate/delete actions from drawer footer
