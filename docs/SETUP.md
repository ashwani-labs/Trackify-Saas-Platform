# Trackify — Local Setup Guide

This guide walks you through running the full Trackify stack on your machine for development.

**Related:** [README](../README.md) · [.env.example](../.env.example)

---

## What you are running

| Component | Port | Purpose |
|-----------|------|---------|
| `api-gateway` | 8080 | Single entry point, JWT validation, rate limiting, Swagger UI |
| `auth-service` | 8081 | Login, JWT issuance, master DB (Flyway migrations) |
| `tenant-service` | 8082 | Tenant provisioning, user lookup, workspace admin APIs |
| `project-service` | 8083 | Projects, issues, sprints, notifications, attachments |
| `notification-service` | 8084 | Email delivery (optional locally) |
| `master-app` | 5173 | Platform admin UI |
| `tenant-app` | 5174 | Workspace / marketing UI |

```text
Browser
  ├── master-app (5173)  ──┐
  └── tenant-app (5174)  ──┼──► api-gateway (8080)
                           │         ├── auth-service (8081)     → trackify_master
                           │         ├── tenant-service (8082)   → trackify_master + tenant DBs
                           │         └── project-service (8083)    → per-tenant MySQL
                           └── notification-service (8084)  ← optional
```

---

## Prerequisites

Install these before you start:

| Tool | Version | Notes |
|------|---------|-------|
| **JDK** | 17 | `java -version` |
| **Maven** | 3.9+ | `mvn -version` |
| **Node.js** | 20+ | `node -version` |
| **MySQL** | 8.x | Running on `localhost:3306` |

On Windows, ensure `JAVA_HOME` points to your JDK 17 install if Maven reports it missing.

---

## 1. Clone and install dependencies

```bash
git clone <repository-url>
cd trackify-saas-platform
```

### Frontend

```bash
cd Frontend
npm install
```

### Backend

No global install required — Maven resolves dependencies on first build.

```bash
cd Backend
mvn -pl common-lib install
```

---

## 2. Configure environment

Copy the example env file to the **repository root**:

```bash
cp .env.example .env
```

Every backend service imports this file automatically via `trackify-env-imports.yml` (searches `.env` in the repo root regardless of which service directory you start from).

### Minimum required variables

```env
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
INTERNAL_API_KEY=change-me-internal-api-key
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
VITE_API_BASE_URL=http://localhost:8080
```

| Variable | Why it matters |
|----------|----------------|
| `JWT_SECRET` | Must be **identical** on gateway and all backend services or login/API calls fail |
| `INTERNAL_API_KEY` | Used for service-to-service calls (e.g. tenant → project notifications) |
| `SPRING_DATASOURCE_*` | MySQL credentials for `trackify_master` and tenant database provisioning |
| `VITE_API_BASE_URL` | Where the React apps send API requests (gateway URL) |

### Optional variables

| Variable | Default | Use |
|----------|---------|-----|
| `RATE_LIMIT_ENABLED` | `true` | Gateway rate limiting |
| `RATE_LIMIT_RPM` | `120` | Requests per minute per client |
| `STORAGE_PROVIDER` | `local` | `local` or `s3` for issue attachments |
| `MAIL_*` | unset | SMTP for real emails; without it, emails log to the notification-service console |
| `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` | unset | Local only — use a known password when provisioning tenants (handy for demos/screenshots) |

Never commit `.env` to version control.

---

## 3. Start MySQL

Ensure MySQL 8 is running and accepting connections on `localhost:3306`.

The master database `trackify_master` is created automatically on first `auth-service` boot (`createDatabaseIfNotExist=true` in the JDBC URL). Flyway migrations in `auth-service` apply the master schema.

**Tenant databases** (`trackify_tenant_<code>`) are created when you provision an organization from the master app.

---

## 4. Start the backend

Open **separate terminals** (or use your IDE run configurations). Start services in this order:

### Terminal 1 — Auth service (run Flyway first)

```bash
cd Backend
mvn -pl auth-service -am spring-boot:run
```

Wait until you see the app listening on port **8081**. On first boot:

- Flyway runs `V1__master_schema.sql` and `V2__add_tenant_brand_theme.sql`
- A default master user is seeded: `master@trackify.com` / `admin123`

### Terminal 2 — Tenant service

```bash
cd Backend
mvn -pl tenant-service -am spring-boot:run
```

Port **8082**.

### Terminal 3 — Project service

```bash
cd Backend
mvn -pl project-service -am spring-boot:run
```

Port **8083**. Connects to per-tenant databases; runs schema upgrades for legacy tenant DBs on demand.

### Terminal 4 — API gateway

```bash
cd Backend
mvn -pl api-gateway -am spring-boot:run
```

Port **8080**. Start this **after** the three services above so routes can reach healthy upstreams.

### Terminal 5 — Notification service (optional)

```bash
cd Backend
mvn -pl notification-service -am spring-boot:run
```

Port **8084**. Without this service, welcome/invitation emails are skipped or fail silently; local SMTP is optional because unsent emails are logged to the console when `MAIL_USERNAME` / `MAIL_PASSWORD` are unset.

### Verify backend

| Check | URL |
|-------|-----|
| Gateway health | http://localhost:8080/actuator/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## 5. Start the frontend

From the `Frontend` directory:

```bash
# Terminal A — tenant workspace app
npm run dev:tenant    # http://localhost:5174

# Terminal B — master admin app
npm run dev:master    # http://localhost:5173
```

Both apps read `VITE_API_BASE_URL` from the repo-root `.env`. If API calls fail, confirm it is set to `http://localhost:8080`.

For per-tenant subdomain testing locally, `tenant-service` uses `http://<code>.lvh.me:5174` in the `local` profile (`lvh.me` resolves to `127.0.0.1`).

---

## 6. First-time walkthrough

### Master admin

1. Open http://localhost:5173
2. Log in with `master@trackify.com` / `admin123`
3. Go to **Tenants** → **Create Tenant**
4. Fill organization name, domain code (e.g. `acme`), and admin email
5. Submit — provisioning creates a dedicated MySQL database and admin user

The tenant admin password is **random** unless you set `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` in `.env` and restart `tenant-service` before provisioning.

Welcome email includes login details when `notification-service` is running (or check its console logs when SMTP is not configured).

### Tenant workspace

1. Open http://localhost:5174
2. Log in with the tenant admin email and password from provisioning
3. Create a project, add issues, and explore the Kanban board

### Register additional users

Users can self-register at `/register` on the tenant app (they need the tenant ID from an admin). New accounts stay **pending** until a workspace admin approves them under **Team approvals**.

---

## 7. Capture README screenshots (optional)

With the full stack running:

```bash
cd Frontend
npm install --no-save playwright@1.52.0
npx playwright install chromium
npm run screenshots
```

Images are written to `docs/screenshots/`. For automated tenant dashboard captures:

- Set `TENANT_EMAIL` and `TENANT_PASSWORD`, **or**
- Set `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD=admin123`, restart `tenant-service`, and re-run with `SCREENSHOT_RECREATE=1`

---

## 8. Build and test

```bash
# Backend unit tests
cd Backend
mvn -B test

# Frontend lint, test, production build
cd Frontend
npm ci
npm run lint
npm run test
npm run build
```

CI runs the same checks on push/PR to `main` (`.github/workflows/ci.yml`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `401` / JWT errors on API calls | Mismatched `JWT_SECRET` | Use the same value in `.env` and restart **all** backend services |
| `Connection refused` to MySQL | MySQL not running | Start MySQL on `3306`; verify `SPRING_DATASOURCE_USERNAME` / `PASSWORD` |
| Maven: `JAVA_HOME` not defined | JDK not on PATH | Set `JAVA_HOME` to JDK 17 and add `%JAVA_HOME%\bin` to `PATH` |
| Frontend cannot reach API | Wrong API URL | Set `VITE_API_BASE_URL=http://localhost:8080` in `.env`; restart Vite dev servers |
| Tenant login fails after provision | Random admin password | Check welcome email / notification logs, or use `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` |
| Missing theme / branding columns | Flyway not applied | Restart `auth-service` so `V2__add_tenant_brand_theme.sql` runs |
| Legacy tenant DB schema errors | Old tenant database | Restart `project-service` (runs `TenantSchemaUpgrader`) |
| Emails not delivered | SMTP not configured | Start `notification-service`; set `MAIL_*` in `.env`, or read console output locally |
| Gateway 502 / upstream errors | Service not started | Ensure auth, tenant, and project services are up before the gateway |

---

## Service profiles

All services default to the **`local`** Spring profile (`application-local.yml`). Production overrides live in `application-prod.yml` per service.

When deploying, set production secrets via environment variables — do not rely on defaults in `application-local.yml`.

---

## Quick reference

| App | URL | Default credentials |
|-----|-----|---------------------|
| Master app | http://localhost:5173 | `master@trackify.com` / `admin123` |
| Tenant app | http://localhost:5174 | Set at tenant provisioning |
| API gateway | http://localhost:8080 | — |
| Swagger | http://localhost:8080/swagger-ui.html | — |
