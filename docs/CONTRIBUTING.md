# Contributing

Thanks for helping improve Trackify. Keep changes focused and consistent with the existing modules.

## Workflow

1. Fork / branch from `main`.
2. Make a focused change (one concern per PR when practical).
3. Run the relevant checks locally.
4. Open a PR with a short summary of **why** and how to verify.

## Development setup

Follow [SETUP.md](./SETUP.md). You will need JDK 17, Maven, Node 20+, and MySQL 8.

## Code style

| Area | Tooling |
|------|---------|
| Java | Google Java Format via Spotless (`mvn spotless:apply`) |
| Frontend | Prettier + ESLint (`npm run format`, `npm run lint`) |

Guidelines:

- Prefer clarity over cleverness.
- Reuse `@trackify/shared` and `common-lib` instead of copying helpers.
- Comments only when they explain non-obvious intent or constraints.
- Do not commit secrets, `.env`, or local uploads.

## Tests

```bash
# Backend
cd Backend && mvn -B test

# Frontend
cd Frontend && npm run test
```

Add or update tests when you change behavior in services, filters, or non-trivial UI utils.

## PR checklist

- [ ] Behavior preserved unless the PR intentionally fixes a bug
- [ ] Docs updated if setup, env vars, or architecture changed
- [ ] Lint / tests pass for the areas you touched
- [ ] No leftover debug logging or dead code

## Project conventions

- Backend modules under `com.trackify.<service>`
- Tenant isolation via JWT `tenantId` + routing datasource — never trust a client-supplied tenant id for authorization without validating the token
- Soft-fail external email so core flows stay available

## Questions

Open an issue describing the problem, expected behavior, and environment (OS, Java/Node versions).
