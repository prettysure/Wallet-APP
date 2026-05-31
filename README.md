# E-Wallet App

An e-wallet app for depositing money, paying bills, and withdrawing to other funding sources. Includes user registration, login, and a dashboard with available balance, balance change metrics, and balance history.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output is in the `dist/` folder.

## Deploy (frontend + backend)

This app has two parts:

| Part | Host | Notes |
|------|------|--------|
| **Frontend** | Vercel / Netlify | Static SPA from `dist/` |
| **Backend API** | [Render](https://render.com) (recommended) | Express + SQLite — see `render.yaml` |

### Backend on Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** and connect the repo (uses `render.yaml`), or create a **Web Service** with root directory `server`.
3. Set **Build:** `npm install && npm run build`, **Start:** `npm start`.
4. Add env vars: `JWT_SECRET` (random string), `CORS_ORIGINS` (your Vercel URL, e.g. `https://wallet-app-s9io.vercel.app`).

### Frontend on Vercel

1. Import the repo on Vercel (build: `npm run build`, output: `dist`).
2. Add environment variable: **`VITE_API_URL`** = your Render API URL (e.g. `https://wallet-app-api.onrender.com`).
3. Redeploy.

Without `VITE_API_URL`, the frontend only talks to `/api` on the same origin (works locally via Vite proxy, not on static Vercel alone).

## Deploy (static only)

The app is a static SPA. You can deploy the `dist/` folder to any static host.

### Vercel (recommended)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New** → **Project** and import your repo.
4. Leave **Build Command** as `npm run build` and **Output Directory** as `dist`.
5. Click **Deploy**. Done.

`vercel.json` is already set so routes like `/login` and `/register` work.

### Netlify

1. Push your code to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
3. Connect the repo. Set **Build command**: `npm run build`, **Publish directory**: `dist`.
4. Deploy. The `public/_redirects` file ensures SPA routing works.

### GitHub Pages

1. In `vite.config.ts` set `base: '/your-repo-name/'` (e.g. `base: '/Wallet-APP/'`).
2. Run `npm run build`.
3. In the repo go to **Settings** → **Pages** → Source: **GitHub Actions** (or use the `gh-pages` package to push `dist` to the `gh-pages` branch).

### Other hosts

Upload the contents of `dist/` to any static host. Ensure the server is configured to serve `index.html` for all paths (SPA fallback) so `/login` and `/register` work when opened directly or refreshed.
