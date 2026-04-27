# Handoff: Airwave — Podcast Player Redesign

## Overview

A full redesign and feature expansion of an existing vanilla JS podcast player SPA. The app connects to the Podcast Index API via a Node/Express proxy and lets users search, browse, and play podcasts with a persistent right-sidebar player on desktop.

This handoff covers the complete visual redesign ("Airwave" brand direction) plus 8 new features added to the existing codebase.

---

## About the Design Files

The HTML files in this bundle are **high-fidelity design prototypes** — not production code. They demonstrate the intended look, layout, interactions, and behavior of the redesigned app.

Your task is to **recreate these designs in the existing vanilla JS codebase** (`public/script.js` + `public/index.html`) following its established patterns (no framework, no build step, plain HTML/CSS/JS, `localStorage` for persistence, `/api/search` and `/api/episodes` proxy endpoints).

**Primary reference:** `Airwave Podcast Player.html`  
**Alternate direction:** `Sonar Podcast Player (v1 reference).html` (lighter palette, violet accent — pick whichever the team prefers)

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, border radii, shadows, and interactions are all final and should be matched precisely. The prototype is pixel-accurate.

---

## Brand

| Token | Value |
|---|---|
| Brand name | **Airwave** |
| Logo shape | Rounded square (9px radius), solid accent fill |
| Logo icon | SVG sonar/radio wave — concentric arcs left and right of a center dot |
| Favicon | Same icon, 32×32, accent background |

### Tagline
None. The brand speaks through the logomark only.

---

## Design Tokens

### Colors (Dark mode — primary)

| Variable | Value | Usage |
|---|---|---|
| `--accent` | `#F97316` | Primary actions, active states, links, progress fill |
| `--accent-h` | `#EA6A0A` | Hover state of accent |
| `--accent-soft` | `rgba(249,115,22,0.12)` | Accent backgrounds (active cards, pills) |
| `--accent-glow` | `rgba(249,115,22,0.28)` | Focus rings, button glow |
| `--green` | `#34D399` | "Played" badge, success states |
| `--pink` | `#F472B6` | Favorited heart icon |
| `--bg` | `#0C0C0E` | Page background |
| `--surface` | `#141416` | Card / sidebar / navbar background |
| `--surface2` | `#1C1C20` | Input backgrounds, hover states, chip backgrounds |
| `--surface3` | `#252529` | Active chip backgrounds, deeper surfaces |
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border-s` | `rgba(255,255,255,0.12)` | Stronger borders (inputs, focused) |
| `--text` | `#F4F3F8` | Primary text |
| `--text-m` | `#72717E` | Secondary / muted text |
| `--text-s` | `#3A3940` | Subtle / placeholder text |

### Colors (Light mode overrides)

| Variable | Value |
|---|---|
| `--bg` | `#F7F6F3` |
| `--surface` | `#FFFFFF` |
| `--surface2` | `#EEEDE9` |
| `--surface3` | `#E2E0DC` |
| `--border` | `rgba(0,0,0,0.07)` |
| `--border-s` | `rgba(0,0,0,0.13)` |
| `--text` | `#18170F` |
| `--text-m` | `#7A7870` |
| `--text-s` | `#C4C2BC` |

### Shadows

```css
--sh-sm: 0 1px 3px rgba(0,0,0,0.5);
--sh:    0 4px 20px rgba(0,0,0,0.4);
--sh-lg: 0 12px 48px rgba(0,0,0,0.55);
```

### Border Radius

```css
--r:    14px   /* cards, panels, artwork */
--r-sm: 9px    /* inputs, buttons, small cards */
--r-xs: 5px    /* tiny chips, icon buttons */
```

### Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Display / headings | Plus Jakarta Sans | 800 | 17–28px | Letter-spacing -0.02em on large sizes |
| UI labels / body | Instrument Sans | 400–600 | 11–15px | Default body font |
| Numbers | Instrument Sans | 400 | 11px | `font-variant-numeric: tabular-nums` on timestamps |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap
```

### Spacing

| Name | Value | Used for |
|---|---|---|
| XS | 4–6px | Icon button padding, gap between tight elements |
| SM | 8–10px | Intra-card gaps, control spacing |
| MD | 12–14px | Card padding, section internal spacing |
| LG | 20–24px | Section padding, between major blocks |

### Transitions

```css
--t: 0.18s cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Layout

### Desktop Grid

```
┌──────────────────────────────────────────────────┬─────────────────┐
│  NAVBAR  (58px tall, full width)                  │                 │
├──────────────────────────────────────────────────┤                 │
│                                                  │  RIGHT SIDEBAR  │
│  MAIN CONTENT AREA  (scrollable)                 │  300px wide     │
│                                                  │  (fixed)        │
│                                                  │                 │
└──────────────────────────────────────────────────┴─────────────────┘
```

- CSS Grid: `grid-template-columns: 1fr 300px`
- Navbar spans full width via `grid-column: 1 / -1`
- Main area scrolls vertically; sidebar does not scroll externally (inner panels scroll)

### Mobile (≤768px)

- Sidebar moves below main content, max-height 48vh
- Single column layout
- Player artwork hidden on mobile (space saving)
- Category strip + trending grid use `minmax(130px, 1fr)` columns

---

## Screens / Views

The app is a two-view SPA — views are toggled by show/hide, no routing library.

### 1. Home View (`#view-home`)

**Purpose:** Discovery — featured podcast, category browsing, trending grid, new episodes from saved podcasts.

**Layout (top → bottom):**

#### Hero Banner
- Full-width, `height: 220px`, `overflow: hidden`
- Background: gradient matching the featured podcast (changes on each load)
- Left-to-right gradient overlay: `linear-gradient(to right, rgba(0,0,0,0.85) 40%, transparent)`
- Content absolutely positioned, left-aligned, `padding: 0 28px`
- Elements:
  - **Label row:** 10px / 700 weight / uppercase / letter-spacing 0.12em / accent color. Preceded by an 18px × 2px accent line
  - **Title:** Plus Jakarta Sans 800 / 28px / -0.02em letter-spacing / white / max-width 340px
  - **Subtitle:** 13px / `rgba(255,255,255,0.55)`
  - **CTA button:** accent fill, 99px border-radius, 9px 16px padding, 13px/600 weight, play icon + "Listen Now". Glow shadow: `0 4px 16px var(--accent-glow)`. Hover: lift + darken.

#### Category Strip
- Horizontal scroll row, `padding: 0 24px 18px`, `scrollbar-width: none`
- Each chip: 5px 12px padding, 99px radius, 12px/600 weight, surface2 bg + muted text → accent bg + white when active

#### New from Your Podcasts section
- `padding: 22px 24px`
- Section title: Plus Jakarta Sans 700 / 17px + muted count badge
- Content: horizontal scrollable row of episode cards (`width: 220px` each, `flex-shrink: 0`)
- **Episode card:**
  - Background: `var(--surface)`, border: 1px `var(--border)`, border-radius: `var(--r)`, padding: 12px 13px
  - Top row: 36×36px emoji thumb (8px radius) + show name (11px/600/accent) + date (10px/muted)
  - Episode title: Plus Jakarta Sans 700 / 13px / 1.35 line-height / 2-line clamp
  - Action row: Play button (accent fill, 5px 10px, 6px radius) + Queue button (surface2 fill)
- **Empty state** (no favorites yet): dashed border, bookmark icon, nudge copy

#### Trending Now Grid
- `padding: 22px 24px`
- `display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px`
- **Podcast card:**
  - Surface bg, 1px border, `var(--r)` radius
  - Artwork: square aspect ratio, gradient + emoji (placeholder), or `<img>` from API
  - Rank badge: top-left, `rgba(0,0,0,0.6)` pill, white text, backdrop-filter blur
  - Favorite button: top-right, 26×26px circle, `rgba(0,0,0,0.5)` backdrop, heart icon. Active state: `var(--pink)` icon.
  - Card body: 10px 11px 12px padding. Title: Plus Jakarta Sans 700 / 13px / 2-line clamp. Author: 12px / muted.
  - Hover: `translateY(-2px)` + shadow

---

### 2. Search Results View (`#view-search`)

**Purpose:** Display API results for a user query.

**Layout:**
- Section header with quoted search term
- Same podcast grid as Trending (podcast cards, API images where available)
- Loading state: centered spinner during fetch
- Empty state: magnifying glass icon + "No results found"
- Error/offline fallback: renders trending podcasts instead

---

### 3. Podcast Detail View (`#view-detail`)

**Purpose:** Show episodes for a selected podcast.

**Layout:**

#### Back button
- `padding: 16px 24px 12px` (note: outside the section container)
- Left arrow icon + "Back" label, 13px / muted, hover → accent

#### Podcast header
- `display: flex; gap: 16px; padding: 0 24px; margin-bottom: 22px`
- Artwork: 100×100px, `var(--r)` radius, gradient bg + emoji or `<img>` from API
- Info: title (Plus Jakarta Sans 800 / 20px / -0.02em), author (13px / muted), category badge + Save button

#### Episode List
- `display: flex; flex-direction: column; gap: 1px`
- Each episode is a row: `padding: 13px 16px`, surface bg, bottom border
- First child: top radius. Last child: bottom radius. Single child: full radius.
- **Playing state:** accent-soft bg + 2px accent left border
- **Played state:** 50% opacity
- Structure: 48×48px emoji thumb (8px radius) | text info block | action buttons
  - Title: 600 / 14px / 1.35 / 2-line clamp
  - Meta: 12px / muted — date, duration, optional "Played" tag (green check)
  - Actions: Mark Played toggle (check icon, accent when active) + Add to Queue (+)
- Hover: surface2 background

---

## Right Sidebar

Fixed 300px width, surface background, left border.

### Player Section

**Padding:** 16px all sides. **Border-bottom** separates from tabs.

**Now Playing pill:** accent-soft bg, accent text, 10px/700/uppercase. Has pulsing dot animation. Hidden when nothing is loaded.

**Artwork:**
- Full width, square aspect ratio, `var(--r)` radius
- Placeholder: surface2 gradient bg + emoji
- **Waveform overlay:** 7 animated bars at bottom-center of artwork, white/0.75 opacity, appear only while playing. Each bar has different height (8–18px) and `scaleY` animation with staggered delays (0–0.36s).

**Track info:**
- Title: Plus Jakarta Sans 700 / 13px / 2-line clamp
- Show name: 11px / accent / 600 weight

**Progress bar:**
- 3px height, `var(--surface3)` track, accent fill, 99px radius
- Hover reveals a 10px circular thumb at current position (accent color, glow ring)
- Times below: 10px / muted / tabular-nums, space-between

**Controls row:**
- Skip back 15s | Play/Pause | Skip forward 30s
- Skip buttons: 34×34px circles, transparent bg, muted icon + small label below
- Play/Pause: 42×42px circle, accent fill, glow shadow `0 4px 14px var(--accent-glow)`

**Speed selector:**
- 5 buttons: `0.75× 1× 1.25× 1.5× 2×`
- Each: 3px 6px padding, 4px radius, 11px/600
- Default border + muted text → accent fill + white when active

**Volume control:**
- Row: volume icon button (12px) | range slider
- Slider: 3px height, gradient fill matching volume % via CSS custom property `--vp`
- Thumb: 11×11px accent circle
- Mute toggles icon between volume-xmark / volume-low / volume-high

### Sidebar Tabs

3 tabs: Queue | Favorites | History

- 10px 5px padding each, 11px/600/uppercase/0.07em spacing
- Active: accent color + 2px bottom border

### Tab Panel Items

Each item (episode/podcast in queue, favorites, or history):
- `padding: 9px 14px`, bottom border, hover → surface2
- 36×36px emoji thumb (6px radius) | title (12px/600) + subtitle (11px/muted) | optional action button
- Queue items have an ✕ remove button

---

## New Features — Behavior Spec

### 1. Trending / Home Screen
Show `TRENDING` array (8 mock podcasts) on first load. Filter by category chip. Featured hero cycles randomly on each load. On real implementation, replace `TRENDING` with a call to `GET /api/trending` or similar.

### 2. New from Your Podcasts
Appears on home view below category strip. One "latest episode" card per saved (favorited) podcast. In production, fetch the most recent episode per subscribed feed. Strips update immediately when a podcast is saved or removed.

### 3. Playback Speed
`audio.playbackRate = speed`. Active button highlighted. Speeds: 0.75, 1, 1.25, 1.5, 2.

### 4. Volume Control
`audio.volume = value / 100`. Mute toggle uses `audio.muted`. Track gradient fill via CSS custom property `--vp`.

### 5. Dark Mode Toggle
`document.documentElement.setAttribute('data-theme', 'dark'|'light')`. Persisted to `localStorage` key `aw_theme`. Sun icon = currently dark (click for light). Moon icon = currently light (click for dark).

### 6. Mark as Played
Array of episode IDs in `localStorage` key `aw_done`. Toggle per episode. Played episodes render at 50% opacity with a green checkmark badge in meta row.

### 7. Listen History
Array of episode objects (with `at` ISO timestamp) in `localStorage` key `aw_hist`. Most recent first. Max 50 entries. Visible in History sidebar tab.

### 8. Queue Deduplication Toast
Before adding to queue, check `queue.find(q => q.id === ep.id)`. If found, show toast "Already in queue" instead of adding. Toast appears at bottom-center, pill-shaped, fades in/out.

### Toast system
```
bottom: 20px, left: 50%, transform: translateX(-50%)
background: var(--text), color: var(--bg)
padding: 8px 16px, border-radius: 99px, font-size: 13px
Animation: fade + translateY(8px) in, translateY(-6px) out
Duration: 2.8s default
```

---

## State / localStorage Keys

| Key | Type | Contents |
|---|---|---|
| `aw_q` | Array | Queued episode objects |
| `aw_favs` | Array | Favorited podcast objects |
| `aw_hist` | Array | Played episode objects with `at` timestamp |
| `aw_done` | Array | Episode IDs marked as played |
| `aw_sh` | Array | Search history strings (max 10) |
| `aw_theme` | String | `"dark"` or `"light"` |
| `aw_ps` | Object | `{ ep: episodeObject, t: currentTime }` — player state |

Player state is saved every 5 seconds during playback and on `timeupdate`. Restored on page load.

---

## Animations

| Element | Animation | Spec |
|---|---|---|
| Waveform bars | `scaleY` pulse | 0.9s ease-in-out infinite, 7 bars with 0–0.36s stagger |
| Now playing dot | Scale + opacity pulse | 1.3s ease infinite |
| Toast in | `opacity 0→1, translateY 8px→0` | 0.2s |
| Toast out | `opacity 1→0, translateY 0→-6px` | 0.2s |
| Card hover | `translateY(-2px)` | `var(--t)` = 0.18s |
| Play button | `translateY(-1px)` on hover | `var(--t)` |
| Podcast card hover | `translateY(-2px)` + box-shadow | `var(--t)` |

---

## Icons

Font Awesome 6 Free (CDN):
```
https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css
```

Key icons used:

| Icon | Class | Usage |
|---|---|---|
| Search | `fa-magnifying-glass` | Search input, navbar |
| Play | `fa-play` | Play button |
| Pause | `fa-pause` | Play button (playing state) |
| Skip back | `fa-rotate-left` | -15s control |
| Skip forward | `fa-rotate-right` | +30s control |
| Heart (solid) | `fa-solid fa-heart` | Active favorite |
| Heart (outline) | `fa-regular fa-heart` | Inactive favorite |
| Circle check (solid) | `fa-solid fa-circle-check` | Played |
| Circle check (outline) | `fa-regular fa-circle-check` | Not played |
| Plus | `fa-plus` | Add to queue |
| X | `fa-xmark` | Remove from queue |
| Volume | `fa-volume-high/low/xmark` | Volume control |
| Moon / Sun | `fa-moon / fa-sun` | Theme toggle |
| Clock | `fa-clock-rotate-left` | History tab empty state |
| List | `fa-list-music` | Queue empty state |
| Bookmark | `fa-bookmark` | New episodes empty state |
| Arrow left | `fa-arrow-left` | Back button |

---

## Files

| File | Purpose |
|---|---|
| `Airwave Podcast Player.html` | **Primary design reference** — full hi-fi prototype |


---

## Notes for Claude Code

- The existing codebase lives in `public/script.js` and `public/index.html`. Integrate changes there rather than shipping the prototype HTML directly.
- The API proxy routes (`/api/search`, `/api/episodes`) are already implemented in `server.js` — no changes needed there.
- localStorage key prefix changed from `podcast-player` to `aw_` in this design. Decide whether to migrate existing user data or start fresh.
- The service worker cache name is `podcast-player-v2` — bump it to `airwave-v1` (or similar) when deploying to invalidate stale caches.
- The Tweaks panel in the prototype is a **design tool only** — do not ship it in production.
- Screenshot the prototype at 1440px wide for the truest representation of the intended desktop layout.
