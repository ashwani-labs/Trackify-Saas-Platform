# Spring Profiles

Every backend service supports three Spring profiles:

| Profile | Purpose | When to use |
|---------|---------|-------------|
| **`local`** (default) | IDE / bare-metal on your machine | `localhost` URLs, SQL logging enabled, dev JWT fallback |
| **`dev`** | Docker Compose and shared dev servers | Container hostnames (`db`, `auth-service`, …) |
| **`prod`** | Production deployments | Secrets required from environment, SQL logging off, stricter settings |

## Default

Each service sets `spring.profiles.active: local` in `application.yml`. No extra configuration is needed for local IDE runs.

## Switching profiles

### IDE or terminal

```bash
# Linux / macOS
export SPRING_PROFILES_ACTIVE=prod

# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE = "prod"

mvn -pl auth-service -am spring-boot:run
```

### Docker Compose

Compose sets `SPRING_PROFILES_ACTIVE=dev` for all backend services automatically.

### Production (Kubernetes, VM, etc.)

Set `SPRING_PROFILES_ACTIVE=prod` and provide all required environment variables (see [DOCKER_PRODUCTION.md](./DOCKER_PRODUCTION.md)).

## Profile files per service

```text
Backend/<service>/src/main/resources/
├── application.yml          # Shared config + active profile default
├── application-local.yml    # localhost endpoints
├── application-dev.yml      # Docker / shared dev hostnames
└── application-prod.yml     # Production overrides
```

## Key differences

| Setting | local | dev | prod |
|---------|-------|-----|------|
| Database host | `localhost:3306` | `db:3306` (Compose) | `${SPRING_DATASOURCE_URL}` |
| Service URLs | `localhost:808x` | Docker service names | `${SERVICES_*}` env vars |
| `show-sql` | `true` | `false` | `false` |
| JWT secret fallback | Dev default allowed | From `.env` | **Required** — no default |
| Rate limit (gateway) | 120 rpm | 120 rpm | 60 rpm default |

## Environment variables

All profiles load the repo-root `.env` via `trackify-env-imports.yml` in `common-lib`. Copy `.env.example` to `.env` before starting services.

For production, prefer injecting secrets through your orchestrator rather than a `.env` file on disk.
