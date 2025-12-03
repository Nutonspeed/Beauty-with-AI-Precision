# Environment & Secrets

This project uses environment variables for local development, CI, and production. Keep secrets out of source control.

Files
- `.env.local` — Local developer secrets (gitignored). Use this for local runs and E2E. **Do not commit.**
- `.env.example` — Template (committed) with variable names and placeholders.

Local setup (PowerShell)

1. Create or update your local `.env.local` file in the repository root with the required variables. Do not commit this file.

2. A simple way is to open `.env.local` in your editor and paste the environment variables (one per line) using the names in `.env.example`.

3. Start the app with your usual commands, e.g. `pnpm run dev` or `pnpm run build`.

CI / Deployment providers

- Vercel: Add the same variables under the project Settings → Environment Variables. Use the keys shown in `.env.example`.
- GitHub Actions: Add secrets in the repository Settings → Secrets and variables → Actions. Reference them in your workflow as `env: MY_VAR: ${{ secrets.MY_VAR }}`.

Security recommendations

- Never commit `.env.local` or other files containing secret values.
- Use least-privilege service keys for CI and automated tasks (do not use admin or service-role keys in client-side code).
- Rotate keys if they are accidentally exposed.

Seeding test users

If you need to run the local E2E tests and want the test users seeded, use the script at `scripts/seed-test-users.js`. It reads Postgres connection details from your environment and will exit if required env vars are missing.

Example (PowerShell) to run the seed script after making sure `.env.local` is present:

```powershell
# ensure .env.local is present and then run:
pnpm run db:seed:test
```

If you prefer manual seeding, use the SQL snippets in `docs/SEED_TEST_USERS.md`.