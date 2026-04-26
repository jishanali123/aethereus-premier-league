# Aethereus Premier League — Project Documentation

> Aethereus society cricket tournament web app with player showcase, live auction, team management, and sponsor pages.
>
> **Last updated:** April 26, 2026

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Pages & Routes](#pages--routes)
4. [Data Files (The "Database")](#data-files-the-database)
5. [State Management (LeagueContext)](#state-management-leaguecontext)
6. [Components](#components)
7. [How To: Common Changes](#how-to-common-changes)
8. [Deployment](#deployment)
9. [Feature Status](#feature-status)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Bundler | Vite | 8.x |
| UI Library | Ant Design | 6.x |
| Icons | @ant-design/icons | 6.x |
| Routing | react-router-dom | 7.x |
| Language | JavaScript (JSX) | ES2022 |
| Hosting | Vercel (primary), GitHub Pages (secondary) | — |

**No backend / server.** All data lives in static JSON files under `src/data/` and runtime changes persist in the browser's `localStorage`.

---

## Project Structure

```
aethereus-premier-league/
├── public/
│   ├── images/
│   │   ├── apl-banner.png          # Main hero banner
│   │   └── apl-banner-2.png        # Secondary banner
│   ├── player-photos/
│   │   └── player-01.svg … player-12.svg   # Placeholder player avatars
│   ├── icons.svg
│   └── _redirects                   # Netlify SPA fallback
│
├── src/
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Root: theme, routes, layout
│   ├── index.css                    # Global styles, responsive nav
│   │
│   ├── context/
│   │   └── LeagueContext.jsx        # Central state + localStorage persistence
│   │
│   ├── data/
│   │   ├── players.json             # All player records (75 players)
│   │   ├── teams.json               # Team definitions (4 teams)
│   │   └── sponsors.json            # Sponsor records (6 sponsors)
│   │
│   ├── components/
│   │   ├── AppHeader.jsx            # Sticky nav header (desktop + mobile drawer)
│   │   ├── PlayerTable.jsx          # Searchable/filterable player table
│   │   └── PlayerEditModal.jsx      # Modal form to add/edit players (currently unused)
│   │
│   └── pages/
│       ├── LandingPage.jsx          # Home: banner, stats, teams preview, sponsors
│       ├── PlayersPage.jsx          # Player roster with table
│       ├── PlayerDetailPage.jsx     # Single player profile + auction details
│       ├── TeamsPage.jsx            # Team cards with rosters and purse info
│       ├── AuctionPage.jsx          # Live auction room (currently disabled)
│       └── SponsorsPage.jsx         # Sponsors by tier
│
├── index.html                       # Vite HTML entry
├── package.json
├── vite.config.js
├── vercel.json                      # Vercel SPA rewrite rules
├── eslint.config.js
└── .github/workflows/deploy.yml     # GitHub Pages deploy workflow
```

---

## Pages & Routes

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `LandingPage` | Hero banner, quick stats, team cards, sponsor preview |
| `/players` | `PlayersPage` | Searchable player table (name, role, ratings, status) |
| `/players/:id` | `PlayerDetailPage` | Player profile card + auction details card |
| `/teams` | `TeamsPage` | 4 team cards with roster, purse spent/remaining |
| `/auction` | `AuctionPage` | Bidding room (**currently disabled** from nav & landing) |
| `/sponsors` | `SponsorsPage` | Sponsors grouped by tier (title / gold / silver) |

---

## Data Files (The "Database")

All data lives in `src/data/*.json`. These are the **initial/seed** values. At runtime, data is loaded into React state and any changes are persisted to `localStorage`.

### players.json

Each player object has these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `name` | string | Player's display name |
| `role` | string | `"Batsman"`, `"Bowler"`, `"All-Rounder"`, or `"Wicket-Keeper"` |
| `basePrice` | number | Auction starting price (currently ₹500 for all) |
| `price` | number | Final sold price (0 if unsold) |
| `sold` | boolean | Whether player has been sold |
| `team` | string \| null | Assigned team name, or null if unassigned |
| `photo` | string | Path to avatar SVG (e.g. `/player-photos/player-01.svg`) |
| `description` | string | Player bio (currently empty for all) |
| `battingRating` | number | Batting skill rating (0–5 stars) |
| `bowlingRating` | number | Bowling skill rating (0–5 stars) |
| `matches` | number | Matches played |
| `runs` | number | Total runs scored |
| `wickets` | number | Total wickets taken |
| `battingAvg` | number \| null | Batting average |
| `bowlingAvg` | number \| null | Bowling average |
| `strikeRate` | number | Strike rate |

### teams.json

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Slug identifier (e.g. `"royal-strikers"`) |
| `name` | string | Display name (e.g. `"Royal Strikers"`) |
| `shortName` | string | Abbreviation (e.g. `"RS"`) |
| `color` | string | Hex color for branding (e.g. `"#1677ff"`) |
| `totalPurse` | number | Total auction budget |

**Current teams:** Royal Strikers, Thunder Kings, Blaze Warriors, Supreme Challengers

### sponsors.json

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique identifier |
| `name` | string | Sponsor name |
| `tier` | string | `"title"`, `"gold"`, or `"silver"` |
| `description` | string | Short tagline |
| `logo` | string \| null | Path to logo image (e.g. `/images/sponsors/hotel-durga.png`) |
| `website` | string | URL or `"#"` |

**Current sponsors:** Hotel Durga (title), Premium Decor (gold), Bird Valley (gold), QuickBite Cafe (silver), TechHub Solutions (silver), Metro Pharmacy (silver)

---

## State Management (LeagueContext)

File: `src/context/LeagueContext.jsx`

### How it works

1. On app load, checks `localStorage` for saved data with matching `DATA_VERSION`
2. If found, uses stored data; otherwise loads from JSON seed files
3. Any mutation (update/add/delete) writes to both React state and `localStorage`
4. Bumping `DATA_VERSION` forces a reset to fresh JSON data (useful after changing seed files)

### API (returned by `useLeague()` hook)

| Property/Method | Type | Description |
|----------------|------|-------------|
| `players` | array | Current player list |
| `teams` | array | Team definitions |
| `sponsors` | array | Current sponsor list |
| `teamStats` | object | Per-team computed stats: `{ roster, spent, remaining, count }` |
| `updatePlayer(id, changes)` | function | Merge changes into a player by ID |
| `addPlayer(player)` | function | Add new player (auto-assigns ID) |
| `deletePlayer(id)` | function | Remove a player |
| `updateSponsor(id, changes)` | function | Merge changes into a sponsor |
| `addSponsor(sponsor)` | function | Add new sponsor (auto-assigns ID) |
| `deleteSponsor(id)` | function | Remove a sponsor |
| `resetAllData()` | function | Clear localStorage, restore all seed data |
| `resetAuction()` | function | Set all players to unsold, price=0, team=null |

### Helper export

| Function | Description |
|----------|-------------|
| `formatPrice(amount)` | Formats number as `₹500`, `₹50K`, `₹5.0L`, or `"Unsold"` |

---

## Components

### AppHeader (`src/components/AppHeader.jsx`)
- Sticky gradient header with "APL" logo
- Desktop: horizontal nav menu (Home, Players, Teams, Auction, Sponsors)
- Mobile (<768px): hamburger icon opens a Drawer with vertical menu
- Auction link is currently **disabled**

### PlayerTable (`src/components/PlayerTable.jsx`)
- Ant Design `Table` with columns: Player (avatar+name), Role, Batting Rating, Bowling Rating, Status
- Search input filters by name or role
- Role dropdown filter
- Click row → navigates to `/players/:id`

### PlayerEditModal (`src/components/PlayerEditModal.jsx`)
- Modal form for adding/editing players
- Fields: name, role, team, description, basePrice, price, sold, matches, runs, wickets, batting/bowling averages, strike rate
- **Currently not wired up** (editing features disabled)

---

## How To: Common Changes

### Change a player's name or details
Edit `src/data/players.json`, find the player by name, update the fields. Then bump `DATA_VERSION` in `src/context/LeagueContext.jsx` to force browsers to reload fresh data.

### Add a new player
Add a new object to the `players.json` array with a unique `id` (use the next highest number). Include all fields. Bump `DATA_VERSION`.

### Remove a player
Delete the player object from `players.json`. Bump `DATA_VERSION`.

### Change a sponsor
Edit `src/data/sponsors.json` — update name, tier, description, or logo path. Bump `DATA_VERSION`.

### Add a sponsor logo
1. Place the image file in `public/images/sponsors/` (e.g. `hotel-durga.png`)
2. Set the `logo` field in `sponsors.json` to `"/images/sponsors/hotel-durga.png"`
3. Bump `DATA_VERSION`

### Change team names/colors/purse
Edit `src/data/teams.json`. If you rename a team, also update any players in `players.json` that reference the old team name. Bump `DATA_VERSION`.

### Update the banner images
Replace files in `public/images/`:
- `apl-banner.png` — main hero banner on landing page
- `apl-banner-2.png` — secondary banner below stats

### Enable the Auction feature
1. In `src/components/AppHeader.jsx` — remove `disabled: true` from the Auction nav item
2. In `src/pages/LandingPage.jsx` — change the "Auction — Coming Soon" button back to enabled with `onClick={() => navigate('/auction')}`

### Enable player editing
1. In `src/pages/PlayersPage.jsx` — add back the "Add Player" button that opens `PlayerEditModal`
2. In `src/pages/PlayerDetailPage.jsx` — add Edit/Delete buttons using `updatePlayer`/`deletePlayer` from context

### Force browsers to reload fresh data
Increment `DATA_VERSION` in `src/context/LeagueContext.jsx`. This invalidates any cached localStorage and forces the app to re-read from JSON seed files.

### Change the base price for all players
In `players.json`, find-and-replace all `"basePrice": OLD_VALUE` with `"basePrice": NEW_VALUE`. Bump `DATA_VERSION`.

---

## Deployment

### Vercel (Primary)
- **Auto-deploys** on push to `main` branch
- Config: `vercel.json` rewrites all non-asset paths to `index.html` (SPA)
- Build command: `npm run build` (runs `vite build`)
- Output directory: `dist/`

### GitHub Pages (Secondary)
- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main` or manual dispatch
- Sets `GITHUB_PAGES=true` which changes Vite `base` to `/cricket-league/`
- Copies `index.html` → `404.html` for client-side routing

### Local Development
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Landing page with banner | Active | Two banners displayed |
| Player roster table | Active | Search, role filter, batting/bowling ratings |
| Player detail page | Active | Profile section + auction details section |
| Teams page | Active | Shows all 4 teams (empty rosters pre-auction) |
| Sponsors page | Active | 6 sponsors across 3 tiers, read-only |
| Auction room | **Disabled** | Page exists but nav/buttons disabled |
| Player add/edit/delete | **Disabled** | Modal exists but buttons removed from UI |
| Sponsor add/edit/delete | **Disabled** | Functions exist in context but buttons removed |
| Data persistence | Active | localStorage with version-gated resets |
| Responsive/mobile | Active | Hamburger nav, responsive table columns |
| Vercel deployment | Active | Auto-deploys on push to main |

---

*This document should be updated whenever pages, data structures, features, or deployment config change.*
