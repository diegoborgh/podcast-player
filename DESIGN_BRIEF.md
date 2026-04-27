# Podcast Player — Design Brief

## Current App

A two-view vanilla JS SPA (Search / Player) with no framework and no build step.

**What's already built:**
- Podcast search with history dropdown
- Favorites (star icon on podcast cards, persisted)
- Episode browsing per podcast
- Audio player: play/pause, skip ±15s, seekable progress bar, time display
- Queue: add/remove/play episodes, persisted
- Responsive layout (desktop + mobile tab navigation)
- PWA with service worker

**Current color scheme:** Gray/white background, black navbar, green accent (#1DB954)  
**Font:** Spartan (Google Fonts)  
**Icons:** FontAwesome 5

---

## Requested Improvements to Design For

### 1. Playback Speed Control
Button group below the progress bar: `0.75x` `1x` `1.25x` `1.5x` `2x`  
Active speed highlighted with the green accent.

### 2. Volume Control
Horizontal slider in the player UI with a mute/unmute icon toggle on the left.  
Sits near the progress bar or below the controls.

### 3. Dark Mode
Toggle button in the navbar (sun/moon icon).  
Dark variant: dark card backgrounds, dark navbar, same green accent.

### 4. "Mark as Played" on Episode Cards
Played episodes show a subtle visual indicator — checkmark badge or grayed-out state.  
Toggle on each episode card to mark/unmark.

### 5. Listen History Section
A new section (tab or panel alongside favorites) showing recently played episodes in reverse chronological order.  
Each entry shows thumbnail, title, and a "played" timestamp.

### 6. Queue Deduplication Toast
When a user tries to add an episode already in the queue, show a brief non-blocking toast notification ("Already in queue").

### 7. Trending / Home Screen
On first load (before any search), display a grid of trending podcasts instead of a blank page.  
Labeled "Trending Now" — same card style as search results.

### 8. New Brand Identity
Create a new brand name and logo with it's respective favicon

### 9. Redesign
Create a new design based on proven modern visual aesthetics. You hvae permission to change fonts/color scheme/icons
---

## Constraints for the Designer

- **No framework, no build step** — output must be plain HTML/CSS/JS
- **Two-view layout must stay** — Search view and Player view (toggled, not routed)
- **Player is always visible on desktop** — sidebar or bottom bar style works
- **Mobile:** tab-based nav (Search / Listen tabs at top or bottom)
- **localStorage is the only persistence layer** — no backend DB
