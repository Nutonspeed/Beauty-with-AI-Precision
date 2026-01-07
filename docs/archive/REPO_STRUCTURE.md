# Repository Structure

This repository contains the main Next.js application plus several subprojects and supporting configuration.

## Top-level directories

### `app/`, `components/`, `lib/`, `public/`, `styles/`
Main Next.js application source.

### `supabase/`
Database migrations, SQL functions, and Supabase configuration.

### `scripts/`
Project scripts (migration helpers, QA checks, utilities).

### `docs/`
Project documentation.

## Subprojects

To keep the repository root clean, subprojects are grouped under `apps/` and `services/`.

### `apps/`
Standalone application projects.

- `apps/scanning-project/`  
  TypeScript scanning utility project (has its own `package.json` and `tsconfig.json`).

### `services/`
Standalone services that can be deployed independently.

- `services/ai-service/`  
  Python FastAPI AI service (Docker-ready). See `docs/AI_SERVICE_DEPLOYMENT_GUIDE.md`.

- `services/python/`  
  Python utilities / APIs used for AI-related experiments.

- `services/server/`  
  Node signaling server for WebRTC/video-call related features.

## Docker Compose

Docker Compose files are kept under:

- `docker/compose/`

Use:

- `pnpm docker:dev`
- `pnpm docker:staging`
- `pnpm docker:prod`

See `docs/deployment/DOCKER_COMPOSE_USAGE.md`.

## Legacy configs

Legacy / superseded configuration files are moved under:

- `config/legacy/`

This is intentional to reduce root clutter while keeping historical references for troubleshooting.
