# Trackify Product Roadmap

Last updated: July 2026

This document outlines a practical plan to improve Trackify's UI/UX and introduce new functionality. It is grounded in the current codebase (master admin + tenant workspace, Kanban, sprints, notifications, global search, dark/light theme).

See also: [CODEBASE_STATUS.md](./CODEBASE_STATUS.md) · [ENVIRONMENT.md](./ENVIRONMENT.md) · [ROADMAP_PROGRESS.md](./ROADMAP_PROGRESS.md)

---

## Current baseline

| Area | Today |
|------|--------|
| **Master app** | Login, dashboard charts, tenant CRUD, provision modal, tenant search, detail drawer, platform audit log, toasts, `ErrorBoundary` |
| **Tenant app** | Landing, auth, dashboard widgets + onboarding checklist, projects, Kanban (drag/drop, optimistic updates, card status/priority quick-edit), backlog/sprints + burndown, team, approvals, profile, global search + keyboard shortcuts, notifications (SSE + polling + grouping), workspace settings, saved filters, issue labels, per-tenant themes |
| **Design system** | `@trackify/shared` tokens + components (`Button`, `Input`, `Select`, `ConfirmDialog`, `PasswordStrength`, `KeyboardShortcutsPanel`, skeletons, mobile nav styles) |
| **Backend** | Multi-tenant auth, projects/issues/sprints, notifications SSE stream, issue labels, plan limits (`FREE`/`PRO`/`ENTERPRISE`), tenant branding PATCH, platform audit log |
| **Remaining gaps** | Stripe billing, GitHub/Slack integrations, tenant impersonation, gateway SSE proxy, custom workflows/epics, AI features, @mentions, attachment previews |

> **Implementation tracker:** [ROADMAP_PROGRESS.md](./ROADMAP_PROGRESS.md) — Phase A ~98%, Phase B ~95%, Phase C ~60%, Tier 1 features ~95% complete (July 2026).

---

## Part 1 — UI/UX improvements

### Phase A — Quick wins (1–2 weeks) ✅ *Mostly complete*

*High impact, low effort. Polish what exists.*

#### 1. Design system consistency

- Replace inline styles in modals (`CreateProjectModal`) with shared `input-wrap`, `Input`, and `Select` components.
- Add shared components: `Select`, `Textarea`, `ConfirmDialog`, and standardized toast patterns (replace all `window.confirm`).
- Standardize form patterns: label → field → hint → error (as in the tenant provision modal).

#### 2. Feedback and empty states

- Skeleton loaders everywhere data loads (extend to tables, Kanban, issue panel).
- Success toasts after create/update/delete (tenant-app uses `react-hot-toast`; extend to master-app).
- Richer empty states with contextual CTAs (e.g. "No sprints → Create sprint", "No assignee → Invite teammate").

#### 3. Form UX

- Inline validation on blur (not only on submit).
- Disable submit while invalid or loading.
- Field-level `aria-describedby` for accessibility.
- Password strength indicator on register and profile pages.

#### 4. Navigation and wayfinding

- Breadcrumbs on project detail (`Projects / Apollo / Board`).
- Persistent project context in sidebar when inside a project.
- "Recent" section in sidebar (last 3 projects/issues visited).
- Keyboard shortcuts panel (`?` to open): `/` search, `c` create issue, `g d` go dashboard.

#### 5. Dark/light mode polish

- Audit all hardcoded colors; use CSS variables only.
- Theme-aware charts (Recharts tooltip/axis colors from design tokens).
- Respect `prefers-color-scheme` as default before localStorage override.

---

### Phase B — Core experience (3–5 weeks) ✅ *Mostly complete*

*Make daily use feel modern and fast.*

#### 6. Kanban and issue panel

```
┌─────────┬──────────────┬─────────────┐
│ Backlog │ Board        │ Issue panel │
│ (list)  │ (drag/drop)  │ (slide-in)  │
└─────────┴──────────────┴─────────────┘
```

- Smooth drag-and-drop with column drop zones and visual affordances.
- Quick-edit on card: status, assignee, priority without opening full panel.
- Issue panel tabs: Details | Activity | Comments (sticky header with issue key).
- @mentions in comments with autocomplete.
- Image/PDF preview for attachments (not just download).

#### 7. Master app parity

- Add `ErrorBoundary` (tenant-app already has one).
- Wire up master top-bar search (filter tenants by name/domain/plan/status).
- Tenant detail drawer: view provisioning info, admin email, plan, branding, usage stats.
- Replace browser confirms with `ConfirmDialog` for suspend/delete tenant.

#### 8. Mobile and responsive

- Collapsible sidebar (tenant-app has mobile menu; refine touch targets).
- Kanban horizontal scroll on mobile with snap columns.
- ~~Bottom nav on mobile: Dashboard | Projects | Search | Notifications | Profile.~~ **Removed** — hamburger + top bar used instead.
- Modal → full-screen sheet on small viewports. **Done**

#### 9. Dashboard personalization

- Drag-and-drop widget layout (My Issues, Activity, Recent Projects).
- "My work" default view for `USER` role vs admin overview. **Done** — non-admin users see widgets + insights; admin charts are admin-only.
- Date range filter on charts (7d / 30d / 90d). **Done**
- Click-through from chart segments → filtered issue list. **Done**

#### 10. Notification UX

- ~~Real-time feel: WebSocket or SSE instead of 60s polling.~~ **Done** — SSE `/notifications/stream` with 60s polling fallback.
- Group notifications ("3 comments on ALP-12"). **Done**
- ~~Mark as read on view; notification preferences page.~~ **Done** — preferences page + in-app type toggles.
- ~~Deep-link directly to issue key URL (`/projects/1/issue/ALP-12`).~~ **Done**

---

### Phase C — Premium polish (6–10 weeks) 🔄 *In progress*

*Differentiation and enterprise feel.*

#### 11. Tenant white-labeling

Backend supports `brandTheme`, `primaryColor`, and `logoUrl`.

- Apply branding across buttons, sidebar, and auth pages. **Partial** — post-login via `TenantBrandingEffect` + workspace theme picker.
- Custom subdomain landing (`acme.trackify.io` branded login).
- Email templates with tenant branding.

#### 12. Onboarding and guided setup

- Expand onboarding checklist: invite team → create project → create issue → complete sprint.
- First-run wizard for new tenant admins.
- Sample/demo project option at provisioning time.

#### 13. Accessibility (WCAG 2.1 AA target)

- Focus traps in modals (partially via `useFocusTrap`).
- Screen reader labels on Kanban columns and drag operations.
- Color contrast audit in dark mode.
- Reduced motion preference support.

#### 14. Performance UX

- Optimistic updates for Kanban drag, comment post, status change. **Done**
- Virtualized lists for large backlogs (100+ issues).
- Route prefetch on sidebar hover. **Done**
- Stale-while-revalidate for dashboard widgets.

---

## Part 2 — New functionalities

Grouped by value and fit with the current architecture.

### Tier 1 — High value, builds on existing backend

| Feature | Status | Notes |
|---------|--------|-------|
| **Issue assignee and labels** | Done | Labels column + API, filter bar, create modal, card chips |
| **Saved filters and views** | Done | `IssueFilterBar` saved views in localStorage |
| **Sprint ceremonies UI** | Done | Start/complete + `SprintBurndownChart` |
| **Project templates** | Done | Blank, software, marketing, and operations presets in create modal |
| **Bulk actions** | Done | Multi-select backlog → change status |
| **Export** | Done | CSV export from project detail |
| **Audit log (tenant)** | Done | Workspace audit page + `GET /activity/workspace` |
| **Workspace settings** | Done | Admin page + `PATCH /tenants/{id}/branding` |

### Tier 2 — Platform and master-app capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| **Plan limits enforcement** | Done | `PlanLimits` on project + user creation; shown in workspace settings |
| **Usage dashboard per tenant** | Done | Master drawer: users, projects, issues, active sprints, plan limit meters |
| **Tenant impersonation** | Not started | Master admin "login as tenant admin" for support |
| **Provisioning status** | Partial | Step checklist shown during master provision modal submit |
| **Platform audit log** | Done | `GET /tenants/audit-logs` + master audit page |
| **Billing hooks (Stripe)** | Not started | Plan upgrade, seat limits, invoices |

### Tier 3 — Collaboration and workflow depth

| Feature | Why | Effort |
|---------|-----|--------|
| **Custom workflows** | Beyond TODO → IN_PROGRESS → DONE (e.g. Review, QA) | High |
| **Subtasks and checklists** | Break issues into smaller work | Medium |
| **Epics / parent issues** | Group issues under initiatives | High |
| **Time tracking** | Log hours per issue, reports | Medium |
| **Roadmap view** | Timeline of epics/sprints | High |
| **Integrations** | Slack/Teams notifications, GitHub PR linking | High |
| **Webhooks and API keys** | Tenant-level API access for automation | High |

### Tier 4 — AI and automation (future differentiators)

| Feature | Why | Effort |
|---------|-----|--------|
| **Smart issue creation** | Natural language → title, description, priority | Medium |
| **Duplicate detection** | Suggest similar issues when creating | Medium |
| **Sprint summary** | Auto-generate sprint recap from activity | Low |
| **Assignment suggestions** | Based on workload and past assignments | Medium |

---

## Recommended 12-week roadmap

### Month 1 — Trust and polish ✅

1. ~~Shared `ConfirmDialog`, form components, toast in master-app~~ **Done**
2. ~~Kanban drag UX + issue panel tabs~~ **Done**
3. ~~Master tenant detail drawer + working search~~ **Done**
4. ~~ErrorBoundary + consistent loading states~~ **Done**

### Month 2 — Productivity ✅

5. ~~Labels, saved filters, bulk actions~~ **Done**
6. ~~Sprint start/complete + burndown~~ **Done**
7. ~~Workspace settings (branding, defaults)~~ **Done**
8. ~~Notification deep-links~~ **Done**; ~~notification preferences~~ **Done**

### Month 3 — Platform scale ✅

9. ~~Plan limits per tier~~ **Done**
10. ~~Per-tenant usage metrics~~ **Done**
11. ~~Platform audit log~~ **Done**; ~~tenant audit log~~ **Done**
12. ~~Real-time notifications (SSE)~~ **Done** (WebSocket/gateway streaming deferred)

### Timeline overview

| Phase | Focus | Status |
|-------|--------|--------|
| A | Design system cleanup, ConfirmDialog, form patterns | ~98% complete |
| B | Kanban polish, master app parity, mobile pass | ~95% complete |
| C | Branding, onboarding, accessibility, performance | ~60% complete |
| Features v1 | Labels, sprint ceremonies, workspace settings | ~95% complete |
| Platform v1 | Plan limits, usage dashboard, real-time notifications | ~90% complete |

---

## UX principles

1. **Progressive disclosure** — Simple default views; advanced filters behind "More filters".
2. **Zero dead ends** — Every empty state has a clear next action.
3. **Keyboard-first** — Power users can work without the mouse (search, create, navigate).
4. **Consistent danger flows** — Destructive actions always use the same confirmation pattern.
5. **Role-aware UI** — `USER` sees "My work"; `ADMIN` sees team/workspace controls.
6. **Tenant branding everywhere** — Logo and primary color on auth, sidebar, emails.

---

## Success metrics

| Metric | Target |
|--------|--------|
| Time to create first project (new tenant) | < 3 minutes |
| Issue create → visible on board | < 2 seconds (optimistic) |
| Mobile usability score (Lighthouse) | > 85 |
| Accessibility (axe violations) | 0 critical |
| User task completion (E2E) | Login → project → issue → done |
| Support tickets for "can't find X" | Down after search + breadcrumbs |

---

## Recommended next builds

Highest value remaining work:

1. **Stripe billing + seat upgrades** — monetize plan tiers already enforced in code
2. **Tenant impersonation** — master admin support login
3. **GitHub/Slack integrations** — tier 3 collaboration depth
4. **Custom workflows and epics** — beyond TODO → IN_PROGRESS → DONE
5. **Gateway SSE streaming proxy** — live notifications through API gateway
6. **Branded auth + email templates** — complete white-label onboarding

---

## Related documentation

- [CODEBASE_STATUS.md](./CODEBASE_STATUS.md) — current implementation and gaps
- [ENVIRONMENT.md](./ENVIRONMENT.md) — configuration reference
- [SPRING_PROFILES.md](./SPRING_PROFILES.md) — Spring profile setup
