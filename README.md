# Society Cricket League — Player Showcase

A modern, responsive React web app for browsing and viewing player profiles in a society cricket league.

## Features

- **Player Table** — Sortable, searchable, and filterable table of all players
- **Player Detail Pages** — Rich profile view with photo, stats, auction info, and description
- **Search & Filter** — Instantly search by name/team/role, or filter by dropdown
- **Responsive** — Works on desktop, tablet, and mobile
- **Local Data** — All player data lives in `src/data/players.json` (no server or database needed)
- **Local Photos** — Player photos are stored under `public/player-photos/`

## Tech Stack

| Concern       | Choice                        |
| ------------- | ----------------------------- |
| Framework     | React 19 + Vite               |
| Routing       | React Router v7               |
| UI Library    | Ant Design 6 + @ant-design/icons |
| Styling       | Ant Design tokens + CSS       |
| Data          | Local JSON (no backend)       |

**Why Ant Design?** Its `Table` component has built-in sorting, filtering, and pagination — ideal for a player roster. The overall design language is clean and professional with minimal custom CSS needed.

## Quick Start

```bash
cd cricket-league
npm install
npm run dev
```

Open `http://localhost:5173` in your browser (port may vary — check the terminal output).

## Project Structure

```
cricket-league/
├── public/
│   └── player-photos/         # SVG placeholder player photos
├── src/
│   ├── components/
│   │   ├── AppHeader.jsx      # Sticky top nav bar
│   │   └── PlayerTable.jsx    # Searchable, sortable player table
│   ├── data/
│   │   └── players.json       # All player data (edit here)
│   ├── hooks/
│   │   └── usePlayers.js      # Data layer: hooks + helpers
│   ├── pages/
│   │   ├── HomePage.jsx       # Table view
│   │   └── PlayerDetailPage.jsx # Player profile page
│   ├── App.jsx                # Router + layout shell
│   ├── App.css
│   ├── index.css              # Global styles
│   └── main.jsx               # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Customizing Player Data

Edit `src/data/players.json`. Each player object supports:

| Field        | Type      | Required | Notes                              |
| ------------ | --------- | -------- | ---------------------------------- |
| id           | number    | yes      | Unique identifier                  |
| name         | string    | yes      | Full name                          |
| price        | number    | yes      | Sold price (0 if unsold)           |
| basePrice    | number    | yes      | Base auction price                 |
| role         | string    | yes      | Batsman / Bowler / All-Rounder / Wicket-Keeper |
| team         | string    | no       | Team name (null if unassigned)     |
| photo        | string    | yes      | Path relative to `public/`         |
| description  | string    | yes      | Short bio                          |
| matches      | number    | yes      | Matches played                     |
| runs         | number    | yes      | Career runs                        |
| wickets      | number    | yes      | Career wickets                     |
| battingAvg   | number    | no       | Batting average                    |
| bowlingAvg   | number    | no       | Bowling average (null for batsmen) |
| strikeRate   | number    | yes      | Strike rate                        |
| sold         | boolean   | yes      | Whether the player has been sold   |

## Deploying for Free

Since this app has **no backend or database**, it's a pure static site — perfect for free hosting with HTTPS, custom domains, and CI/CD.

### Option 1: Vercel (Easiest — recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Click **"Add New Project"** → import your repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done. You get a live URL like `https://cricket-league.vercel.app`

Every push to `main` auto-deploys. Preview URLs for PRs. Zero config needed — `vercel.json` is already included.

### Option 2: GitHub Pages (Free with GitHub Actions CI/CD)

1. Push this repo to GitHub
2. In the repo → **Settings** → **Pages** → set Source to **GitHub Actions**
3. Push to `main` — the included workflow (`.github/workflows/deploy.yml`) will build and deploy automatically
4. Your site goes live at `https://<username>.github.io/cricket-league/`

> If your repo name isn't `cricket-league`, update the base path in `vite.config.js`.

### Option 3: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com), sign in, click **"Add new site"** → import from Git
3. Build command: `npm run build` — Publish directory: `dist`
4. Deploy. The `_redirects` file is already included for SPA routing.

### Which should I pick?

| Platform     | Setup effort | CI/CD          | Custom domain | Best for                  |
| ------------ | ------------ | -------------- | ------------- | ------------------------- |
| **Vercel**   | 1 click      | Automatic      | Free          | Fastest path to production |
| **GitHub Pages** | 2 min    | GitHub Actions | Free          | Already on GitHub          |
| **Netlify**  | 2 min        | Automatic      | Free          | If you prefer Netlify      |

All three are **completely free** for this type of app and give you a production URL with HTTPS.

## Adding Real Photos

Replace the SVG files in `public/player-photos/` with real images (PNG, JPG, or WebP). Update the `photo` field in `players.json` to match the new filename.

## Assumptions

- Prices are in Indian Rupees (₹), displayed in Lakhs format.
- The app is intended for local use — no authentication or backend.
- The roster size is small enough that client-side filtering/sorting is sufficient.
- SVG placeholders are used since real player photos are not available yet.
