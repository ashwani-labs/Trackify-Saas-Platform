# Deployment

Trackify does not yet ship Docker Compose. Production is expected to run the five Spring Boot JARs behind a reverse proxy (or the included `api-gateway`) plus two static frontend builds (or CDN).

## Checklist

1. Provision MySQL 8 with a user that can create databases (tenant provisioning runs `CREATE DATABASE` / `CREATE USER`).
2. Set strong secrets via environment variables (never commit `.env`).
3. Build backend JARs and frontend assets.
4. Start services in dependency order (or use an orchestrator with health checks).
5. Point DNS / TLS termination at the gateway (or edge proxy → gateway).
6. Serve `master-app` and `tenant-app` static files (or separate hosts/subdomains).

## Build

```bash
# Backend
cd Backend
mvn -pl common-lib,api-gateway,auth-service,tenant-service,project-service,notification-service \
  -am package -DskipTests

# Frontend
cd Frontend
npm ci
npm run build
```

Artifacts:

| Component | Artifact |
|-----------|----------|
| Services | `Backend/*/target/*.jar` |
| Tenant UI | `Frontend/tenant-app/dist` |
| Master UI | `Frontend/master-app/dist` |

## Environment

Use the variables in [.env.example](../.env.example). Production-oriented keys:

| Variable | Notes |
|----------|-------|
| `JWT_SECRET` | Strong secret; identical on all services |
| `INTERNAL_API_KEY` | Random long string |
| `SPRING_DATASOURCE_URL` | Master JDBC URL |
| `SPRING_DATASOURCE_USERNAME` / `PASSWORD` | Master DB credentials |
| `SERVICES_AUTH_URL` / `TENANT_URL` / `PROJECT_URL` | Gateway upstreams |
| `SERVICES_NOTIFICATION_URL` | Used by auth/tenant/project |
| `TENANT_DATASOURCE_DEFAULT_HOST` | Host written into new tenant records |
| `TENANT_APP_URL_PATTERN` | e.g. `https://%s.yourdomain.com` |
| `MAIL_*` | Real SMTP for production email |
| `STORAGE_PROVIDER=s3` + `S3_*` | If attachments should not be local disk |
| `VITE_API_BASE_URL` | Build-time for frontends (gateway public URL) |

Spring profiles: services default to `local`. For production, activate `prod` (`SPRING_PROFILES_ACTIVE=prod`) so `application-prod.yml` is applied.

## Process model

Suggested order / readiness:

1. MySQL healthy
2. `auth-service` (Flyway migrates master schema; seeds master user on first boot only if configured for local — verify seed behavior before production)
3. `tenant-service`
4. `project-service`
5. `notification-service`
6. `api-gateway`
7. Static frontends / CDN

Health checks:

- `http://<gateway>/actuator/health`
- Per-service actuator endpoints if exposed on private network only

## Networking

- Expose **only** the gateway (and static sites) publicly.
- Keep MySQL, notification-service, and internal ports on a private network.
- Prefer TLS at a load balancer or reverse proxy in front of the gateway.

## Multi-tenant DNS

Locally, tenant URLs often use `*.lvh.me`. In production, set `TENANT_APP_URL_PATTERN` to your wildcard subdomain scheme and configure DNS accordingly.

## Database operations

- Back up `trackify_master` and every `trackify_tenant_*` database.
- Master schema changes go through Flyway in `auth-service`.
- Tenant schema changes either update the SQL template (new tenants) and/or extend `TenantSchemaUpgrader` (existing tenants).

## Security hardening

- Rotate `JWT_SECRET` and `INTERNAL_API_KEY` on a schedule; plan for forced re-login when JWT secret rotates.
- Disable or protect Swagger in production if not needed.
- Ensure notification email endpoint is not internet-facing.
- Use least-privilege MySQL accounts where possible (provisioning still needs elevated DDL rights).

## Observability

- Actuator health/liveness/readiness are enabled via shared `trackify-management.yml`.
- Correlation IDs are attached by `CorrelationIdFilter` (`X-Correlation-Id`).
- Prefer shipping logs to your platform of choice; set `logging.level.com.trackify=INFO` in prod.

## Docker (future)

Compose is on the roadmap. Until then, wrap the JAR + Node static serving in your own images, or run on a JVM-friendly PaaS with managed MySQL.
