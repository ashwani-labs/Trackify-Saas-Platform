# Spring Profiles

Every backend service supports two Spring profiles:

| Profile | Purpose | When to use |
|---------|---------|-------------|
| **`local`** (default) | Development on your machine | `localhost` URLs, SQL logging enabled, dev JWT fallback |
| **`prod`** | Production deployments | Secrets required from environment, SQL logging off |

## Default

Each service sets `spring.profiles.active: local` in `application.yml`. No extra configuration is needed for local runs from your IDE or terminal.

## Switching to production

```bash
# Linux / macOS
export SPRING_PROFILES_ACTIVE=prod

# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE = "prod"

mvn -pl auth-service -am spring-boot:run
```

Set all required environment variables before starting (see [ENVIRONMENT.md](./ENVIRONMENT.md)).

## Profile files per service

```text
Backend/<service>/src/main/resources/
├── application.yml          # Shared config + active profile default
├── application-local.yml    # localhost endpoints (default)
└── application-prod.yml     # Production overrides
```

## Key differences

| Setting | local | prod |
|---------|-------|------|
| Database host | `localhost:3306` | `${SPRING_DATASOURCE_URL}` |
| Service URLs | `localhost:808x` | `${SERVICES_*}` env vars |
| `show-sql` | `true` | `false` |
| JWT secret fallback | Dev default allowed | **Required** — no default |
| Rate limit (gateway) | 120 rpm | 60 rpm default |

## Environment variables

All profiles load the repo-root `.env` via `trackify-env-imports.yml` in `common-lib`. Copy `.env.example` to `.env` before starting services.
