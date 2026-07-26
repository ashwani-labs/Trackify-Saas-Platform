# Trackify — Local Setup Guide

Run the full Trackify stack on your machine for development.

**Related:** [README](../README.md) · [Architecture](./ARCHITECTURE.md) · [.env.example](../.env.example)

---

## What you are running

| Component | Port | Purpose |
|-----------|------|---------|
| `api-gateway` | 8080 | Entry point, JWT, rate limiting, Swagger |
| `auth-service` | 8081 | Login, JWT issuance, master Flyway |
| `tenant-service` | 8082 | Tenant provisioning, users, branding |
| `project-service` | 8083 | Projects, issues, sprints, in-app notifications |
| `notification-service` | 8084 | Email (optional locally) |
| `master-app` | 5173 | Platform admin UI |
| `tenant-app` | 5174 | Workspace UI |

```text
Browser
  ├── master-app (:5173) ──┐
  └── tenant-app (:5174) ──┼──► api-gateway (:8080)
                           │         ├── auth-service (:8081)      → trackify_master
                           │         ├── tenant-service (:8082)    → master + tenant DBs
                           │         └── project-service (:8083)   → per-tenant MySQL
                           └── notification-service (:8084)  ← optional
```

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **JDK** | 17 | `java -version` |
| **Maven** | 3.9+ | `mvn -version` |
| **Node.js** | 20+ | `node -v` |
| **MySQL** | 8.x | Running on `localhost:3306` |

On Windows, set `JAVA_HOME` to JDK 17 if Maven cannot find Java.

---

## 1. Clone and install

```bash
git clone https://github.com/ashwani-labs/trackify-saas-platform.git
cd trackify-saas-platform
```

### Frontend

```bash
cd Frontend
npm install
```

### Backend

```bash
cd Backend
mvn -pl common-lib install
```

---

## 2. Environment

Copy the example file to the **repository root**:

```bash
cp .env.example .env
```

Backend services load this file via `trackify-env-imports.yml` (walks up from the service directory). Vite apps load `VITE_*` from the same root (`envDir` in each app’s `vite.config.js`).

### Minimum required

```env
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
INTERNAL_API_KEY=change-me-internal-api-key
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
VITE_API_BASE_URL=http://localhost:8080
```

| Variable | Why |
|----------|-----|
| `JWT_SECRET` | Must match on gateway and every backend service |
| `INTERNAL_API_KEY` | Tenant → project internal notifications |
| `SPRING_DATASOURCE_*` | MySQL for master DB and provisioning |
| `VITE_API_BASE_URL` | Frontend API base (gateway) |

### Optional

| Variable | Default | Use |
|----------|---------|-----|
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_RPM` | `true` / `120` | Gateway throttling |
| `STORAGE_PROVIDER` | `local` | `local` or `s3` attachments |
| `MAIL_*` | empty | SMTP; unset → console logs in notification-service |
| `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` | unset | Known password when provisioning tenants |
| `TRACKIFY_DEV_MASTER_PASSWORD` | `admin123` (local profile) | Seeds `master@trackify.com` on first auth-service boot |
| `VITE_TENANT_APP_PORT` | `5174` | Workspace URL helpers in the UI |

Never commit `.env`.

---

## 3. MySQL

Start MySQL 8 on `localhost:3306`.

`trackify_master` is created on first `auth-service` boot (`createDatabaseIfNotExist=true`). Flyway applies master migrations.

Tenant databases (`trackify_tenant_<code>`) are created when you provision an organization from the master app.

---

## 4. Start the backend

Use separate terminals (or IDE run configs). Order matters:

### Auth (Flyway first)

```bash
cd Backend
mvn -pl auth-service -am spring-boot:run
```

Port **8081**. First boot:

- Runs Flyway (`V1__master_schema.sql`, `V2__add_tenant_brand_theme.sql`)
- Seeds master user: `master@trackify.com` / `admin123`

### Tenant

```bash
mvn -pl tenant-service -am spring-boot:run
```

Port **8082**.

### Project

```bash
mvn -pl project-service -am spring-boot:run
```

Port **8083**. Runs `TenantSchemaUpgrader` for existing tenant DBs as needed.

### Gateway

```bash
mvn -pl api-gateway -am spring-boot:run
```

Port **8080**. Start after the three services above.

### Notification (optional)

```bash
mvn -pl notification-service -am spring-boot:run
```

Port **8084**. Without it, emails fail softly; with empty `MAIL_USERNAME`/`MAIL_PASSWORD`, messages are logged to the console.

### Verify

| Check | URL |
|-------|-----|
| Gateway health | http://localhost:8080/actuator/health |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## 5. Start the frontend

```bash
cd Frontend

npm run dev:tenant    # http://localhost:5174
npm run dev:master    # http://localhost:5173
```

Both apps read `VITE_API_BASE_URL` from the repo-root `.env`.

For local subdomain-style tenant URLs, `tenant-service` local profile uses `http://<code>.lvh.me:5174` (`lvh.me` → `127.0.0.1`).

---

## 6. First walkthrough

### Master admin

1. Open http://localhost:5173
2. Log in: `master@trackify.com` / `admin123`
3. **Tenants** → **Create Tenant**
4. Submit — creates a MySQL database and admin user

Tenant admin password is random unless `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` is set and `tenant-service` was restarted.

### Tenant workspace

1. Open http://localhost:5174
2. Log in with the provisioned admin credentials
3. Create a project and issues; open the Kanban board

### Additional users

Self-register at `/register` (needs the organization code). Accounts stay **pending** until an admin approves them under team approvals.

---

## 7. Database notes

| Topic | Detail |
|-------|--------|
| Migrations | Master: Flyway in `auth-service` |
| Tenant template | SQL under `tenant-service` resources |
| Legacy tenants | `project-service` `TenantSchemaUpgrader` |
| Seed data | Master user on first auth boot; tenants via UI |

---

## 8. Testing

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend
npm ci
npm run lint
npm run test
npm run build
```

CI mirrors this on push/PR to `main` (`.github/workflows/ci.yml`).

---

## 9. Production-oriented setup

See [DEPLOYMENT.md](./DEPLOYMENT.md). Locally you use the `local` Spring profile by default; production uses `prod` + environment variables.

Docker Compose is not included yet — run JARs and static builds directly, or containerize yourself.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `401` / JWT errors | Mismatched `JWT_SECRET` | Same value in `.env`; restart **all** backend services |
| MySQL connection refused | DB down / wrong creds | Start MySQL; check `SPRING_DATASOURCE_*` |
| `JAVA_HOME` missing | JDK not configured | Point `JAVA_HOME` at JDK 17 |
| Frontend cannot reach API | Wrong base URL | `VITE_API_BASE_URL=http://localhost:8080` in root `.env`; restart Vite |
| Unknown tenant password | Random provision password | Notification logs, or `TRACKIFY_DEV_FIXED_ADMIN_PASSWORD` |
| Missing branding columns | Flyway not applied | Restart `auth-service` |
| Legacy tenant schema errors | Old DB | Restart `project-service` |
| Emails missing | SMTP / service down | Start notification-service; set `MAIL_*` or read console |
| Gateway 502 | Upstream down | Start auth, tenant, project before gateway |

---

## Verification checklist

- [ ] `http://localhost:8080/actuator/health` returns UP
- [ ] Swagger loads at `/swagger-ui.html`
- [ ] Master login works
- [ ] Creating a tenant succeeds (DB appears in MySQL)
- [ ] Tenant login works
- [ ] Creating a project / issue works on the Kanban board

---

## Quick reference

| App | URL | Credentials |
|-----|-----|-------------|
| Master | http://localhost:5173 | `master@trackify.com` / `admin123` |
| Tenant | http://localhost:5174 | From provisioning |
| Gateway | http://localhost:8080 | — |
| Swagger | http://localhost:8080/swagger-ui.html | — |
