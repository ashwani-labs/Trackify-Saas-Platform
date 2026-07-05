# Trackify Product Roadmap

Last updated: July 2026

This document outlines a practical plan to improve Trackify's UI/UX and introduce new functionality. It is grounded in the current codebase (master admin + tenant workspace, Kanban, sprints, notifications, global search, dark/light theme).

See also: [CODEBASE_STATUS.md](./CODEBASE_STATUS.md) · [ENVIRONMENT.md](./ENVIRONMENT.md) · [ROADMAP_PROGRESS.md](./ROADMAP_PROGRESS.md)

---

## Current baseline

| Area | Today |
|------|--------|
| **Master app** | Login, dashboard charts, tenant CRUD, provision modal |
| **Tenant app** | Landing, auth, dashboard widgets, projects, Kanban, backlog/sprints, team, approvals, profile, global search, notifications |
| **Design system** | `@trackify/shared` tokens + components (Button, Input, Modal, etc.) |
| **Known UX gaps** | `window.confirm` dialogs, mixed styling (`input-field` vs `input`), master search is decorative, no ErrorBoundary in master-app, limited mobile polish |

---

## Part 1 — UI/UX improvements

### Phase A — Quick wins (1–2 weeks)

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

### Phase B — Core experience (3–5 weeks)

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
- Bottom nav on mobile: Dashboard | Projects | Search | Notifications | Profile.
- Modal → full-screen sheet on small viewports.

#### 9. Dashboard personalization

- Drag-and-drop widget layout (My Issues, Activity, Recent Projects).
- "My work" default view for `USER` role vs admin overview.
- Date range filter on charts (7d / 30d / 90d).
- Click-through from chart segments → filtered issue list.

#### 10. Notification UX

- Real-time feel: WebSocket or SSE instead of 60s polling.
- Group notifications ("3 comments on ALP-12").
- Mark as read on view; notification preferences page.
- Deep-link directly to issue key URL (`/projects/1/issue/ALP-12`).

---

### Phase C — Premium polish (6–10 weeks)

*Differentiation and enterprise feel.*

#### 11. Tenant white-labeling

Backend partially supports `primaryColor` and `logoUrl` at provision time.

- Apply branding across buttons, sidebar, and auth pages.
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

- Optimistic updates for Kanban drag, comment post, status change.
- Virtualized lists for large backlogs (100+ issues).
- Route prefetch on sidebar hover.
- Stale-while-revalidate for dashboard widgets.

---

## Part 2 — New functionalities

Grouped by value and fit with the current architecture.

### Tier 1 — High value, builds on existing backend

| Feature | Why | Effort |
|---------|-----|--------|
| **Issue assignee and labels** | Backend has assignee; add labels/tags for filtering | Medium |
| **Saved filters and views** | Extend `IssueFilterBar` — save "My high priority" views | Medium |
| **Sprint ceremonies UI** | Start/complete sprint, burndown chart (`SprintStatus` exists) | Medium |
| **Project templates** | Software / Marketing / Ops templates with default columns | Low |
| **Bulk actions** | Multi-select issues → assign, move sprint, change status | Medium |
| **Export** | CSV export of issues, project summary PDF | Low |
| **Audit log (tenant)** | Activity feed exists — expose admin audit page | Medium |
| **Workspace settings** | Admin page: branding, default workflow, invite policy | Medium |

### Tier 2 — Platform and master-app capabilities

| Feature | Why | Effort |
|---------|-----|--------|
| **Plan limits enforcement** | FREE/PREMIUM/ENTERPRISE enums exist but no enforcement UI | Medium |
| **Usage dashboard per tenant** | Users, projects, storage, API calls | Medium |
| **Tenant impersonation** | Master admin "login as tenant admin" for support | High |
| **Provisioning status** | Show provisioning progress (DB create, schema, email) | Medium |
| **Platform audit log** | Who created/suspended/deleted tenants | Medium |
| **Billing hooks (Stripe)** | Plan upgrade, seat limits, invoices | High |

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

### Month 1 — Trust and polish

1. Shared `ConfirmDialog`, form components, toast in master-app
2. Kanban drag UX + issue panel tabs
3. Master tenant detail drawer + working search
4. ErrorBoundary + consistent loading states

### Month 2 — Productivity

5. Labels, saved filters, bulk actions
6. Sprint start/complete + burndown
7. Workspace settings (branding, defaults)
8. Notification deep-links + preferences

### Month 3 — Platform scale

9. Plan limits per tier
10. Per-tenant usage metrics
11. Audit logs (master + tenant)
12. Real-time notifications (WebSocket)

### Timeline overview

| Phase | Focus | Duration |
|-------|--------|----------|
| A | Design system cleanup, ConfirmDialog, form patterns | Weeks 1–3 |
| B | Kanban polish, master app parity, mobile pass | Weeks 4–7 |
| C | Branding, onboarding, accessibility, performance | Weeks 8–12 |
| Features v1 | Labels, sprint ceremonies, workspace settings | Weeks 6–9 |
| Platform v1 | Plan limits, usage dashboard, real-time notifications | Weeks 10–12 |

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

## Recommended first builds

Highest UX lift with reasonable effort:

1. **Shared `ConfirmDialog` + form component library** — removes the biggest UX inconsistency today
2. **Kanban quick actions + better issue panel** — core daily workflow
3. **Workspace settings + branding** — uses data already collected at tenant provision
4. **Sprint burndown + ceremony buttons** — makes sprint feature feel complete
5. **Master tenant detail + usage** — makes platform admin useful beyond a table

---

## Related documentation

- [CODEBASE_STATUS.md](./CODEBASE_STATUS.md) — current implementation and gaps
- [ENVIRONMENT.md](./ENVIRONMENT.md) — configuration reference
- [SPRING_PROFILES.md](./SPRING_PROFILES.md) — Spring profile setup
