# Docker Compose Usage

This project keeps Docker Compose files under `docker/compose/` to keep the repository root clean.

## Quick commands

Use the pnpm scripts (recommended):

- `pnpm docker:dev`
- `pnpm docker:staging`
- `pnpm docker:prod`
- `pnpm docker:down`

These scripts are defined in `package.json` and reference the compose files in `docker/compose/`.

## Compose file locations

- `docker/compose/docker-compose.yml`
- `docker/compose/docker-compose.staging.yml`
- `docker/compose/docker-compose.production.yml`

Legacy compose variants (kept for reference):

- `config/legacy/compose/docker-compose.prod.yml`

## Manual usage

If you prefer running Docker Compose directly:

```bash
# Dev
docker-compose -f docker/compose/docker-compose.yml up -d

# Staging
docker-compose -f docker/compose/docker-compose.staging.yml up -d

# Production
docker-compose -f docker/compose/docker-compose.production.yml up -d

# Stop
docker-compose down
```

## Notes

- `pnpm docker:clean` removes volumes and prunes Docker resources.
- For Vercel deployment, see `docs/deployment/DEPLOYMENT_STATUS.md` and `docs/guides/DEPLOYMENT_GUIDE.md`.
