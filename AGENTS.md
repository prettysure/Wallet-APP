# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single-package React + TypeScript SPA (`wallet-app`): e-wallet demo with register/login, dashboard, deposit/withdraw/transfer, and transactions. **No backend** — auth uses an in-memory user map plus `localStorage` for session/transactions. See `docs/PRD-E-Wallet.md` for product details.

### Services

| Service | Required? | How to run |
|---------|-----------|------------|
| Vite dev server | Yes (primary dev) | `npm run dev` → http://localhost:5173 |
| Vite preview | Alternative | `npm run build` then `npm run preview` |

No Docker, database, or external APIs are required for local development.

### Standard commands

Documented in `README.md` and `package.json`:

- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build (includes TypeScript check):** `npm run build`
- **Preview production build:** `npm run preview`

There are **no** configured `lint` or `test` scripts. Use `npm run build` (or `npx tsc -b`) for static typechecking.

### Non-obvious gotchas

1. **In-memory users:** New registrations live in an in-memory `Map` in `AuthContext`. A **full page reload** clears registered users (except what was persisted for the logged-in session). For manual/E2E testing, register and log in in the **same browser session** without a hard reload, or re-register after reload.
2. **Transaction password:** Deposit/withdraw flows may prompt for a transaction password; for demo accounts this is typically the same as the login password.
3. **Google Fonts:** Loaded from CDN in `index.html`; optional for local runs (app works if fonts fail to load).

### Hello-world verification

1. `npm install && npm run dev`
2. Open http://localhost:5173 → Register → Login → Dashboard → **+ Deposit** → complete flow
3. Confirm balance and **Transactions** page update
