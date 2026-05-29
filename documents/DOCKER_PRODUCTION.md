# Docker Production Notes

Operational guidance for running Trackify outside local development.

## Environment Matrix

| Variable | Required | Services | Description |
|----------|----------|----------|-------------|
| `JWT_SECRET` | Yes | All backend | Shared JWT signing secret (min 32 chars). Must match across services. |
| `MYSQL_ROOT_PASSWORD` | Yes | db | MySQL root password |
| `SPRING_DATASOURCE_USERNAME` | Yes | auth, tenant, project, notification | DB user |
| `SPRING_DATASOURCE_PASSWORD` | Yes | auth, tenant, project, notification | DB password |
| `INTERNAL_API_KEY` | Prod recommended | tenant, project | Protects internal service-to-service calls |
| `RATE_LIMIT_ENABLED` | No | api-gateway | Default `true` |
| `RATE_LIMIT_RPM` | No | api-gateway | Per-IP requests/minute (default `120`) |
| `STORAGE_PROVIDER` | No | project | `local` (default) or `s3` |
| `STORAGE_LOCAL_PATH` | No | project | Local upload directory when `STORAGE_PROVIDER=local` |
| `STORAGE_MAX_FILE_BYTES` | No | project | Max attachment size (default 10 MB) |
| `S3_BUCKET` | When S3 | project | S3 bucket name |
| `S3_REGION` | When S3 | project | AWS region (default `us-east-1`) |
| `S3_ENDPOINT` | Optional | project | Custom endpoint for MinIO / LocalStack |
| `S3_ACCESS_KEY` | When S3 | project | Access key |
| `S3_SECRET_KEY` | When S3 | project | Secret key |
| `S3_KEY_PREFIX` | No | project | Object key prefix (default `attachments`) |
| `MAIL_HOST` | When email | notification | SMTP host |
| `MAIL_PORT` | When email | notification | SMTP port |
| `MAIL_USERNAME` | When email | notification | SMTP user |
| `MAIL_PASSWORD` | When email | notification | SMTP password |
| `VITE_API_BASE_URL` | Build time | frontends | Public API URL baked into frontend images |

Copy `.env.example` to `.env` and set production values before deploy.

## Health and Readiness

Each backend service exposes:

| Endpoint | Purpose |
|----------|---------|
| `/health` | Simple legacy health (gateway + services) |
| `/actuator/health/liveness` | Process is alive (K8s liveness) |
| `/actuator/health/readiness` | Ready to accept traffic (K8s readiness) |

Docker Compose uses `/actuator/health/liveness` for backend healthchecks.

## API Documentation

- Static spec: `GET /openapi.yaml` (also in `documents/openapi.yaml`)
- Swagger UI: `GET /swagger-ui.html`
- OpenAPI JSON: `GET /v3/api-docs`

## Request Tracing

All servlet services register `X-Correlation-Id` via `common-lib`. The gateway forwards this header to downstream services and includes it in proxy logs (not Authorization or Cookie).

## Rate Limiting

The gateway applies per-IP token-bucket rate limiting (Bucket4j). Health, actuator, and OpenAPI paths are excluded. Returns HTTP 429 when exceeded.

## Attachment Storage

### Local (default)

```env
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=/data/uploads
```

Mount a persistent volume at the upload path in production.

### S3 / MinIO

```env
STORAGE_PROVIDER=s3
S3_BUCKET=trackify-attachments
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
# Optional for MinIO:
S3_ENDPOINT=https://minio.example.com
```

To test S3 locally with Docker Compose:

```bash
docker compose --profile s3 up -d
```

This starts MinIO and configures `project-service` with S3 settings.

## Recommended Production Checklist

1. Generate a strong `JWT_SECRET` and rotate if ever exposed.
2. Set `INTERNAL_API_KEY` for tenant ↔ project internal notifications.
3. Use managed MySQL with backups and separate credentials per environment.
4. Enable `STORAGE_PROVIDER=s3` with a private bucket and IAM-scoped credentials.
5. Put TLS termination in front of the gateway (nginx, ALB, or ingress).
6. Configure liveness/readiness probes in your orchestrator.
7. Restrict actuator exposure at the network layer (only internal networks).
8. Set `RATE_LIMIT_RPM` appropriate for your traffic profile.
9. Run `notification-service` with valid SMTP credentials or disable email features.
10. Build frontends with the public `VITE_API_BASE_URL` for each environment.

## Docker Compose Profiles

| Profile | Adds |
|---------|------|
| (default) | Core stack: db, gateway, auth, tenant, project, frontends, nginx |
| `full` | Includes `notification-service` |
| `s3` | MinIO + S3-backed attachments on `project-service` |

## Scaling Notes

- **Gateway**: Stateless; scale horizontally behind a load balancer. Ensure sticky sessions are not required.
- **Auth / tenant / project**: Stateless HTTP; scale after shared MySQL and JWT secret are configured.
- **MySQL**: Use managed RDS/Aurora or equivalent; tenant DBs are provisioned per tenant by `tenant-service`.
- **Attachments**: Use S3 in multi-instance deployments; local disk is single-node only.

## Security

- Never commit `.env` or real credentials.
- Do not expose MySQL port publicly in production.
- Gateway logs correlation IDs only — not Authorization headers.
- File uploads are validated for size, extension blocklist, and content type allowlist.
