# Training Tracker

Lightweight local workout tracker for a multi-sport athlete (weightlifting, biking, running). No dependencies — just Node.js.

## Run it

You need [Node.js](https://nodejs.org) 18 or newer. Then, from this folder:

```
npm start        # or: node server.js
```

Then open http://localhost:3000

## Use it yourself (clone from GitHub)

```
git clone <this-repo-url>
cd training-tracker
npm start
```

Your workout log lives only on your machine in `data/workouts.json`, which is **git-ignored** — cloning gets you the app, not anyone else's data, and your own entries are never committed. Back that file up (or let a cloud-synced folder handle it) if you care about your history.

## How it works

- **Calendar-first**: the main screen is a month calendar. Each day shows chips for what was done (colored by sport, muted/dashed if only planned, struck-through if skipped). Click a day to open its editor in a side drawer; navigate months with ‹ › and jump back with **Today**.
- **Data** is saved automatically (debounced ~0.5s after any edit) to `data/workouts.json`. Opening a day and closing it without editing does *not* create an entry — only real edits are saved.
- **Multiple activities per day**: each day holds a list of activities ("+ Add activity…" in the drawer footer) — e.g. a run and a bike on the same day, or a lift plus a ride. Each activity has its own type and Done/Skip status.
- **Per-set weightlifting**: each exercise records every set individually (reps + weight per set), so fatigue across sets is captured (e.g. 135×8, 135×7, 135×5). "+ Add set" prefills from the previous set for fast entry.
- **Structured cardio**: bike/run activities have a workout title, a list of **segments** (Warmup / Interval / Recovery / Steady / Cooldown, each with an amount like "5 min" or "400 m" and a target like "400 W" or "5:30/mi"), plus recorded totals (distance, duration, elevation gain, avg power for bike, HR/effort).
- **Carry-forward**: opening a fresh day prepopulates from the same weekday in a recent week (up to 4 weeks back) — same activities, lift sets/weights as defaults, and the cardio interval plan — with recorded totals cleared and status reset to planned. Days with no history use the default sport for that weekday (Mon/Wed/Fri lift, Tue/Thu bike, Sat run).
- **Skipped workouts**: hit "Skip" on any activity; it stays in the log marked skipped.
- **Clear day**: the 🗑 button in the drawer removes all entries for that day.
- **Export for Claude**: header button opens an export dialog where you pick a **date range** (defaults to all your data, with quick "Last 4 wks" / "Last 12 wks" presets), then copy the markdown to clipboard or download it as `.md` / `.json`. Paste the markdown into Claude for analysis of where to improve.

## Files

- `server.js` — tiny Node HTTP server (static files + load/save API), bound to localhost
- `public/index.html` — the whole app (UI + logic)
- `data/workouts.json` — your training log (created on first save; git-ignored, local only)

## License

MIT — see [LICENSE](LICENSE). Edit the copyright line to your name if you like.
