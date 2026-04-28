# Fetchlinks Webapp

This repository contains the web UI for Fetchlinks. The active application is the Next.js app in `web/`.

The previous Flask implementation has been removed. Its routes, templates, model assumptions, and behavior to preserve are documented in `flask_baseline.md` for reference during the migration.

## Development

```bash
cd web
npm install
npm run dev
```

See `web/README.md` for runtime, environment, and validation commands.
