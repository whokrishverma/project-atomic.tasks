# atomic.tasks

React + Vite. Data is saved in the browser (localStorage) for now.

## Run it
    npm install
    npm run dev        # opens at http://localhost:5173

## Deploy (Vercel)
Push to GitHub, then in Vercel: Add New -> Project -> import the repo. It detects Vite
(build: `npm run build`, output: `dist`). Every push redeploys.

## Structure
- `src/data/store.js`  the only file that knows where data lives. Swap its function bodies
  for Supabase (or any backend) later; the UI does not change.
- `src/components/`    Sidebar, TaskList, QuickAdd, RightPanel
- `src/styles.css`     all styling
- `src/lib.js`         views (inbox, today, ...) and date helpers
