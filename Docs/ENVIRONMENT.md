# Environment Variables

Reference for configuring Trackify when running locally or in production.

## Spring profiles

| Profile | Use case |
|---------|----------|
| `local` | Default — IDE and local terminal runs |
| `prod` | Production — set `SPRING_PROFILES_ACTIVE=prod` |

See [SPRING_PROFILES.md](./SPRING_PROFILES.md) for details.

## Variable reference

| Variable | Required | Services | Description |
|----------|----------|----------|-------------|
| `JWT_SECRET` | Yes | All backend | Shared JWT signing secret (min 32 chars). Must match across services. |
| `SPRING_DATASOURCE_USERNAME` | Yes | auth, tenant | MySQL username (default `root` locally) |
| `SPRING_DATASOURCE_PASSWORD` | Yes | auth, tenant | MySQL password |
| `INTERNAL_API_KEY` | Recommended | tenant, project | Protects internal service-to-service calls |
| `RATE_LIMIT_ENABLED` | No | api-gateway | Default `true` |
| `RATE_LIMIT_RPM` | No | api-gateway | Per-IP requests/minute (default `120`) |
| `STORAGE_PROVIDER` | No | project | `local` (default) or `s3` |
| `STORAGE_LOCAL_PATH` | No | project | Local upload directory |
| `STORAGE_MAX_FILE_BYTES` | No | project | Max attachment size (default 10 MB) |
| `S3_BUCKET` | When S3 | project | S3 bucket name |
| `S3_REGION` | When S3 | project | AWS region (default `us-east-1`) |
| `S3_ENDPOINT` | Optional | project | Custom S3-compatible endpoint |
| `S3_ACCESS_KEY` | When S3 | project | Access key |
| `S3_SECRET_KEY` | When S3 | project | Secret key |
| `S3_KEY_PREFIX` | No | project | Object key prefix (default `attachments`) |
| `MAIL_HOST` | When email | notification | SMTP host |
| `MAIL_PORT` | When email | notification | SMTP port |
| `MAIL_USERNAME` | When email | notification | SMTP user |
| `MAIL_PASSWORD` | When email | notification | SMTP password |
| `MAIL_FROM` | No | notification | Sender address (defaults to `MAIL_USERNAME`) |
| `VITE_API_BASE_URL` | No | frontends | API URL for Vite dev server / production build |

Copy `.env.example` to `.env` in the project root before starting services.

## Health endpoints

Each backend service exposes:

| Endpoint | Purpose |
|----------|---------|
| `/health` | Simple legacy health check |
| `/actuator/health/liveness` | Process is alive |
| `/actuator/health/readiness` | Ready to accept traffic |

## API documentation

- Static spec: `GET /openapi.yaml`
- Swagger UI: `GET /swagger-ui.html`
- OpenAPI JSON: `GET /v3/api-docs`

## Attachment storage

### Local (default)

```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
```

### S3

```env
STORAGE_PROVIDER=s3
S3_BUCKET=trackify-attachments
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

## Security notes

- Never commit `.env` or real credentials.
- Use a strong, unique `JWT_SECRET` (e.g. `openssl rand -base64 32`).
- Set `INTERNAL_API_KEY` for tenant ↔ project internal notifications.
- Do not expose MySQL publicly in production.
