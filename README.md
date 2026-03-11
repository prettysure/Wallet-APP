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

## Deploy

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
