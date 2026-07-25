# Frontend

npm workspaces monorepo for Trackify’s React apps.

## Packages

| Workspace | Port | Role |
|-----------|------|------|
| `tenant-app` | 5174 | Workspace UI + landing |
| `master-app` | 5173 | Platform admin |
| `@trackify/shared` | — | Design system, themes, API helpers |

## Commands (from `Frontend/`)

```bash
npm install
npm run dev:tenant
npm run dev:master
npm run lint
npm run test
npm run build
npm run format
```

## Environment

Vite loads `VITE_*` from the **repository root** `.env` (`envDir` in each app config). See root `.env.example`.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API gateway URL |
| `VITE_TENANT_APP_PORT` | Optional; default `5174` |

## Notes

- Shared package is source-linked via Vite alias — no separate build step.
- Prefer `@trackify/shared` primitives (`Button`, `Input`, `Modal`, themes) over one-off styles when practical.
