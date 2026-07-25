# API overview

Interactive docs (gateway running):

**http://localhost:8080/swagger-ui.html**

OpenAPI source: `Backend/api-gateway/src/main/resources/openapi.yaml`

All JSON responses generally follow:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Errors use HTTP status codes with a message body (`ApiResponse` / `ErrorResponse`).

## Authentication

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/login` | Public | Master or tenant user; returns JWT |
| POST | `/auth/forgot-password` | Public | Sends reset email when possible |
| POST | `/auth/reset-password` | Public | Token + new password |
| POST | `/auth/change-password` | Bearer | Authenticated user |
| GET/PUT | `/auth/profile` (and photo) | Bearer | Profile management |

Send tokens as:

```http
Authorization: Bearer <jwt>
```

Claims typically include subject (email), role, `tenantId` (null for master), and `userId`.

## Tenants & platform

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/tenants` | MASTER | Provision org + DB + admin |
| GET | `/tenants` | MASTER | List / search |
| GET | `/tenants/{id}` | MASTER | Detail |
| PATCH | `/tenants/{id}/status` | MASTER | Activate / suspend |
| PATCH | `/tenants/{id}/branding` | ADMIN / MASTER | Theme |
| GET | `/platform/dashboard` | MASTER | Stats |
| GET | `/platform/audit` | MASTER | Audit log |
| POST | `/users/register` | Public* | Tenant self-registration |
| GET | `/users/pending` | ADMIN | Approval queue |
| PATCH | `/users/{id}/status` | ADMIN | Approve / reject |

\*Registration requires a valid organization / tenant identifier as defined by the request DTO.

## Projects, issues, sprints

Base paths are under the project-service (proxied by the gateway), typically:

| Area | Examples |
|------|----------|
| Projects | `GET/POST /projects`, project members, activity |
| Issues | CRUD, board updates, comments, attachments, filters |
| Sprints | Sprint CRUD, backlog assignment, burndown data |
| Dashboard | Aggregated workspace stats |
| Search | Cross-entity search within the tenant |
| Notifications | List, mark read, preferences, SSE stream |
| Internal | `/internal/notifications/...` with `X-Internal-Api-Key` |

Exact paths and schemas are in Swagger — prefer that as the source of truth when implementing clients.

## Notifications (email)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/notifications/email` | Network-local | `{ to, subject, body }` |

Called by auth/tenant/project services via `EmailNotificationClient` / project assignment client. Do not expose publicly without additional auth.

## Health

| Path | Purpose |
|------|---------|
| `GET /health` | Simple OK payload |
| `GET /actuator/health` | Spring Actuator |
| `GET /actuator/health/liveness` | Probe |
| `GET /actuator/health/readiness` | Probe |

## Rate limiting

Configured on the gateway (`RATE_LIMIT_ENABLED`, `RATE_LIMIT_RPM`). Exceeded clients receive HTTP 429.

## Versioning

APIs are currently unversioned (`/auth`, `/tenants`, `/projects`, …). Breaking changes should be coordinated with both frontends.
