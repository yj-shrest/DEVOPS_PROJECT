# OpsPilot Release Center

OpsPilot is a static DevOps release dashboard served by Nginx. It demonstrates a fuller application surface for a CI/CD lab while keeping the deployment model simple: Jenkins builds an Nginx image, Docker Compose runs the app, and Prometheus scrapes Nginx metrics through the exporter.

## Features

- Release overview with deployment, health, incident, and lead-time metrics
- Interactive deployment velocity chart with 7, 14, and 30 day ranges
- Pipeline stage timeline for the CI/CD flow
- Searchable and filterable service inventory
- Release runbook checklist persisted in browser local storage
- Responsive layout for desktop and mobile

## Run With Docker Compose

Build the app image first:

```bash
docker build -t devops-nginx-app:latest .
```

Start the stack:

```bash
docker compose up -d
```

Open:

- App: http://localhost
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Project Structure

```text
.
+-- assets/
|   +-- app.js
|   +-- styles.css
+-- monitoring/
|   +-- prometheus.yml
+-- nginx/
|   +-- default.conf
+-- docker-compose.yaml
+-- Dockerfile
+-- index.html
+-- Jenkinsfile
```
