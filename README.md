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

## Deployment

The example VM deployment runs the Next.js app with systemd on `127.0.0.1:3000` and exposes it through nginx. The example files live under `deploy/` and assume:

- The repository is deployed at `/opt/fetchlinks_webapp`.
- The service user and group are both `fetchlinks`.
- The SQLite database is readable at `/var/lib/fetchlinks/fetchlinks.db`.
- The public hostname is `fetchlinks.example.com`.
- npm is available at `/usr/bin/npm`.

Adjust those values for the target VM before installing the files.

```bash
sudo install -d -o fetchlinks -g fetchlinks /opt/fetchlinks_webapp
sudo -u fetchlinks git clone https://github.com/poptart-sommelier/fetchlinks_webapp.git /opt/fetchlinks_webapp
cd /opt/fetchlinks_webapp

sudo -u fetchlinks npm --prefix /opt/fetchlinks_webapp/web ci
sudo -u fetchlinks npm --prefix /opt/fetchlinks_webapp/web run validate:production

sudo install -d -m 0750 -o root -g fetchlinks /etc/fetchlinks
sudo install -m 0640 -o root -g fetchlinks deploy/systemd/fetchlinks-web.env.example /etc/fetchlinks/web.env
sudoedit /etc/fetchlinks/web.env

sudo install -m 0644 deploy/systemd/fetchlinks-web.service /etc/systemd/system/fetchlinks-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now fetchlinks-web
sudo systemctl status fetchlinks-web

sudo install -m 0644 deploy/nginx/fetchlinks-web.conf.example /etc/nginx/sites-available/fetchlinks-web
sudo ln -s /etc/nginx/sites-available/fetchlinks-web /etc/nginx/sites-enabled/fetchlinks-web
sudo nginx -t
sudo systemctl reload nginx
```

For updates after the initial install:

```bash
sudo -u fetchlinks git -C /opt/fetchlinks_webapp pull --ff-only
sudo -u fetchlinks npm --prefix /opt/fetchlinks_webapp/web ci
sudo -u fetchlinks npm --prefix /opt/fetchlinks_webapp/web run validate:production
sudo systemctl restart fetchlinks-web
```

`FETCHLINKS_DB` must be an absolute path in `/etc/fetchlinks/web.env`, and the `fetchlinks` service user must be able to read the database and its parent directories. The webapp opens the database read-only.
