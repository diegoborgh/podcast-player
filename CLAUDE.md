# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm start         # Start server at http://localhost:3000
```

No test runner or linter is configured.

## Environment Setup

Create a `.env` file in the root with:

```
AUTH_KEY='your_api_key'
SECRET_KEY='your_api_secret'
USER_AGENT='Your_app_name'
API_ENDPOINT='https://api.podcastindex.org/api/1.0'
```

Sign up for credentials at [Podcast Index](https://podcastindex.org/).

## Architecture

**Two-layer design: Node/Express proxy + vanilla JS SPA**

- `server.js` — Express server that serves `public/` as static files and exposes three API proxy routes. It signs every request to the Podcast Index API using SHA1 (via `crypto-js`) to keep credentials server-side.
  - `GET /api/search?q=` — proxies to Podcast Index `/search/byterm`
  - `GET /api/episodes?feedId=&max=` — proxies to Podcast Index `/episodes/byitunesid`
  - `GET /api/trending?max=` — proxies to Podcast Index `/podcasts/trending`

- `public/script.js` — all frontend logic in a single `init()` IIFE. No framework, no build step.

- `public/service-worker.js` — PWA service worker that caches static assets (cache name `airwave-v5`). Bump the version string when deploying changes that need to invalidate the cache.

**Global state** lives in a single `S` object and is partially persisted to `localStorage`:

| Key in `S`  | localStorage key | Description |
|-------------|-----------------|-------------|
| `queue`     | `aw_q`          | Episode objects for the playback queue |
| `favs`      | `aw_favs`       | Saved podcast objects |
| `hist`      | `aw_hist`       | Recently played episode objects |
| `played`    | `aw_done`       | Array of episode IDs marked as played |
| `sh`        | `aw_sh`         | Search history strings |
| `cur`       | `aw_ps` (via `savePS()`) | Current episode + playback position |
| `trending`  | —               | In-memory only; loaded from API or `TRENDING_FALLBACK` |

**Navigation** is a three-view SPA (`home`, `search`, `detail`) toggled by `showView(n)`, which adds/removes the `active` class. `goBack()` restores `S.prevView`. The sidebar (Queue / Favorites / History panels) is always visible and toggled with `switchTab()`.

**Podcast routing** — `clickPodcast(p)` dispatches based on whether the podcast object has an `itunesId`:
- With `itunesId` → `openPodcastAPI(p)`: fetches real episodes from `/api/episodes`
- Without → `openPodcast(p)`: renders `MOCK_EPS` placeholder episodes

**Episode object shape** (passed to `playEp`, `addQ`, serialised into onclick attributes):
```js
{ id, title, date, dur, src, podcastTitle, podcastEmoji, podcastBg, artwork }
```

**`J(obj)`** — helper that JSON-serialises an object and escapes single/double quotes so it can be safely inlined in HTML `onclick='fn(…)'` attributes. Always use `J()` when injecting object data into HTML strings.

**"New from Your Podcasts" section** — `renderNewFromFavs()` generates synthetic episode cards from `S.favs` using the `NEW_EP_TITLES` rotation and placeholder dates/durations. Episodes have `src: ''` so they show in the player UI but produce no audio. This section re-renders whenever favorites change.

**Image loading** — podcast artwork is lazy-loaded via the `loading="lazy"` attribute on `<img>` tags.

**Episodes use iTunes ID** (`itunesId` / `feedId`) as the primary key for fetching episodes, not the RSS feed URL.

## API Documentation

https://podcastindex-org.github.io/docs-api/#overview--libraries
