# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

- **Frontend:** React + Vite SPA at repo root (`npm run dev` → http://localhost:5173)
- **Backend:** Express + SQLite in `server/` (`npm run dev` in `server/` → http://localhost:3001)

Vite proxies `/api` to the backend in local dev. Production frontend needs **`VITE_API_URL`** pointing at the deployed API (see `README.md`).

### Standard commands

| Task | Command |
|------|---------|
| Install frontend | `npm install` |
| Install backend | `npm install --prefix server` |
| Dev frontend | `npm run dev` |
| Dev backend | `npm run dev:server` |
| Build all | `npm run build && npm run build:server` |

### Gotchas

1. **Both services required locally** — login/register fail if only the frontend is running.
2. **Cross-device login** — works once the API is deployed publicly and `VITE_API_URL` is set on Vercel.
3. **SQLite path** — `server/data/wallet.db` (gitignored); Render uses persistent disk via `render.yaml`.
