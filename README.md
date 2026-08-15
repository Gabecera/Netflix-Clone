# Netflix Clone — React

A Netflix-style browse UI built with **React + Vite**, backed by the original
**Express** server that handles sign-in and proxies TMDB (the API key never
reaches the browser).

## Getting started

```bash
npm install
npm run dev          # Express on :3000, Vite on :5173 — open http://localhost:5173
```

Sign in at `/login`, or use **Continue as Guest**.

For a production-style run:

```bash
npm run build        # bundles the three pages into dist/
npm start            # Express serves dist/ on :3000
```

`.env` is unchanged from before:

```
TMDB_API_KEY=...
APP_USERNAME=...
PASSWORD_HASH=...     # node scripts/hash-password.js
SESSION_SECRET=...
```

## How it fits together

The app is a **multi-page build** — the same three pages the original had, so
the server routes and URLs did not change:

| Page          | Entry              | What it does                                  |
| ------------- | ------------------ | --------------------------------------------- |
| `index.html`  | `src/main.jsx`     | Browse: hero, rows, search, My List           |
| `player.html` | `src/player-main.jsx` | Full-screen custom YouTube player          |
| `login.html`  | `src/login-main.jsx`  | Sign-in form (posts to Express)            |

In development Vite serves the pages on `:5173` and proxies `/api`, `/login`,
`/logout` and `/guest` through to Express on `:3000`. In production Express
serves `dist/` directly.

```
src/
├── api/
│   ├── tmdb.js          request de-duplication, caching, result normalising
│   └── genres.js        TMDB genre id → name (so cards render instantly)
├── components/
│   ├── Navbar.jsx       nav, search box, browse + profile dropdowns
│   ├── Hero.jsx         rotating featured title with autoplaying trailer
│   ├── Row.jsx          one horizontal row + its arrows
│   ├── MovieCard.jsx    poster, hover trailer, hover card, My List button
│   ├── MoreInfoModal.jsx
│   ├── LanguagesView.jsx
│   └── Footer.jsx
├── hooks/
│   ├── useMyList.js         localStorage-backed list, with validation
│   ├── useRowArrows.js      the arrow-scroll logic, written once
│   ├── usePageEffects.js    scroll state, wheel lock, click-outside
│   └── useYouTubePlayer.js  wraps the YouTube IFrame API
├── pages/
│   ├── Player.jsx
│   └── Login.jsx
├── rows.js              row definitions: title, endpoint, which views show it
└── App.jsx              view state, search, data loading
```

`server.js` is unchanged apart from serving `dist/` instead of the repo root —
auth, rate limiting, the endpoint allow-list, the response cache and the CSP
headers all work exactly as they did.

## Notes on the port

- Row data from TMDB already includes the overview, score and genre ids, so a
  card no longer makes a details request per poster. Only the trailer key is
  fetched, and only when a card is first hovered.
- `useRowArrows` replaces four near-identical copies of the same scroll code.
- Rows are declared in `rows.js` rather than hand-written as `<section>` blocks.
- Express now serves `dist/` rather than the project root, so `server.js`,
  `.env` and `node_modules` are no longer reachable over HTTP.
