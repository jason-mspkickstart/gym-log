# Gym Log

Personal training log. Vite + React PWA, Supabase backend (Postgres + Auth + RLS).

## Run locally
    npm install
    npm run dev

## Deploy (GitHub Pages)
1. Push to a repo named `gym-log` on the `main` branch.
2. Repo Settings > Pages > Build and deployment > Source: GitHub Actions.
3. The included workflow builds and deploys on every push to main.
4. In Supabase > Authentication > URL Configuration, set the Site URL and add a Redirect URL of your Pages address (e.g. https://jason-mspkickstart.github.io/gym-log/).

Live at: https://jason-mspkickstart.github.io/gym-log/
