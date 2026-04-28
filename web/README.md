# Fetchlinks Web

This is the Next.js TypeScript application for the Fetchlinks web UI. It replaces the previous Flask implementation, whose baseline behavior is documented at the repository root.

## Runtime

The scaffold targets Node 24.15 or newer with npm 11.12 or newer.

## Environment

Copy `.env.example` to `.env.local` for local development and set `FETCHLINKS_DB` to the absolute path of the SQLite database written by the fetchlinks ingestion app. The web app treats this database as read-only.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

The development server listens on http://localhost:3000 by default.
