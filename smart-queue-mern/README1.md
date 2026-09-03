# Smart Queue Management System

A MERN-based queue management app for handling customer ticketing — customers join a queue, staff call the next ticket, and everyone sees live queue status.

**Live app:** https://smart-queue-management-system-bay.vercel.app
**Backend API:** https://smart-queue-management-system-wa0y.onrender.com

---

## Architecture

┌─────────────┐ ┌──────────────┐ ┌───────────────────┐
│ Vercel │──HTTP─▶│ Render │──driver▶│ MongoDB Atlas │
│ (Frontend) │ │ (Backend) │ │ (Database, M0) │
│ React+Vite │ │ Express/Node │ └───────────────────┘
└─────────────┘ └──────┬───────┘
│
├──remote_write──▶ Grafana Cloud (Metrics)
│
┌──────▼───────┐
│ UptimeRobot │ (external health checks, both services)
└──────────────┘


The app was originally built and containerized locally with Docker Compose (MongoDB + Redis + server + client, see Task 05), then migrated to fully managed free-tier cloud services for this task, since local Docker isn't reachable from the internet.

---

## Why these services

All services were chosen specifically because they offer genuinely free tiers with **no credit card required** — a hard constraint for this deployment.

| Layer | Service | Why |
|---|---|---|
| Frontend hosting | **Vercel** | Free static/SPA hosting, auto-deploys from GitHub, built-in CDN |
| Backend hosting | **Render** | Free Node web service tier, auto-deploys from GitHub |
| Database | **MongoDB Atlas (M0)** | Free forever tier, fully managed, replaces the local Docker Mongo container |
| Cache (provisioned, unused) | **Upstash Redis** | Free forever tier — created for future use, but the current app code doesn't use Redis at runtime (see note below) |
| Uptime monitoring | **UptimeRobot** | Free tier, checks every 5 minutes, alerts on downtime |
| Metrics/dashboards | **Grafana Cloud** | Free tier (10k metric series), hosted Prometheus-compatible backend |

**Note on Redis:** the original `docker-compose.yml` provisioned a Redis container, but a code review of `server.js`, `queueController.js`, and `queueRoutes.js` confirmed the application never actually calls Redis at runtime — it's Mongoose/MongoDB only. Upstash Redis was still set up (free, no cost) in case caching or session storage is added later, but it isn't wired into the current deployment.

---

## Deployment steps (how this was actually deployed)

### 1. Database — MongoDB Atlas
1. Created a free account at cloud.mongodb.com
2. Built an **M0 (free)** cluster in the **AWS Mumbai (ap-south-1)** region
3. Created a database user with `readWriteAnyDatabase` role
4. Whitelisted `0.0.0.0/0` under Network Access (required since Render doesn't provide static IPs)
5. Copied the connection string, inserting a database name before the query string:

mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/smart_queue_db?appName=Cluster0


### 2. Cache — Upstash Redis (provisioned, not wired in)
1. Created a free Redis database on upstash.com, region Mumbai (ap-south-1)
2. Retained the connection URL for potential future use

### 3. Backend — Render
1. Connected the GitHub repo to Render
2. Created a **Web Service** with:
   - Root directory: `smart-queue-mern/server`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Instance type: Free
3. Set environment variables:
   - `MONGO_URI` — the Atlas connection string above
   - `NODE_ENV=production`
   - `GRAFANA_PUSH_URL`, `GRAFANA_USER`, `GRAFANA_TOKEN` — for metrics (see Monitoring section)
4. Verified `/api/health` and `/` respond correctly on the live Render URL

### 4. Frontend — Vercel
1. Updated `client/src/App.jsx` to read the backend URL from an environment variable instead of a relative path (which only worked behind the local Nginx reverse proxy in Task 05):
```js
   const API_BASE = `${import.meta.env.VITE_API_URL}/api/queue`;
```
2. Added `client/.env.production`:

VITE_API_URL=https://smart-queue-management-system-wa0y.onrender.com

3. Connected the GitHub repo to Vercel, set root directory to `smart-queue-mern/client`, framework auto-detected as **Vite**
4. Added the same `VITE_API_URL` as an environment variable in the Vercel dashboard
5. Deployed — confirmed the live site loads the queue, and join/call-next actions correctly reach the Render backend

---

## Monitoring

### Uptime monitoring (UptimeRobot)
Two HTTP(s) monitors, checked every 5 minutes:
- Frontend: `https://smart-queue-management-system-bay.vercel.app`
- Backend: `https://smart-queue-management-system-wa0y.onrender.com/api/health`

Both report 100% uptime since setup. Screenshot: `docs/screenshots/uptimerobot.png`

### Metrics dashboard (Grafana Cloud + Prometheus)
Since there's no persistent server to run a separate scraping agent (Grafana Alloy) against a free-tier Render instance, metrics are **pushed directly** from the Express app itself, rather than scraped:

1. Added `prom-client` to expose default Node.js process metrics (memory, CPU, event loop lag, GC) plus a custom `http_requests_total` counter, all served at `GET /metrics`
2. Added `prometheus-remote-write` + `node-fetch` to push two custom metrics — `smart_queue_requests_total` and `smart_queue_memory_used_bytes` — directly to Grafana Cloud's `remote_write` endpoint every 30 seconds, using an Access Policy token generated in Grafana Cloud
3. Built a **"Smart Queue Monitoring"** dashboard in Grafana Cloud with two panels tracking these metrics live

Screenshot: `docs/screenshots/grafana-dashboard.png`

**Environment variables used for this** (set in Render, never committed to the repo):
- `GRAFANA_PUSH_URL`
- `GRAFANA_USER`
- `GRAFANA_TOKEN`

---

## Known limitations

- **Render free-tier cold starts**: the backend spins down after ~15 minutes of inactivity. The first request after idling can take 30-50 seconds to respond while the container wakes up. UptimeRobot's 5-minute pings help reduce (but don't eliminate) this, since Render's free tier still enforces the idle timeout regardless of external traffic patterns.
- **Upstash Redis is provisioned but unused** — see note above. No code changes were made to add caching, since it wasn't part of the original app's functionality.
- **MongoDB Atlas M0** has shared compute and a 512MB storage cap — sufficient for this project's scale, not for production traffic.
- **Grafana Cloud free tier** retains metrics for 14 days and caps at 10,000 active series — well within what this project uses (2 custom series).

---

## Screenshots

| Screenshot | Shows |
|---|---|
| `docs/screenshots/render-logs.png` | Full deploy log: build → MongoDB connected → live → metrics pushing |
| `docs/screenshots/atlas-metrics.png` | Live MongoDB Atlas cluster receiving real read/write operations |
| `docs/screenshots/grafana-dashboard.png` | Custom metrics dashboard (requests, memory) |
| `docs/screenshots/uptimerobot.png` | Both services monitored, 100% uptime |
| `docs/screenshots/live-app.png` | The deployed frontend in the browser |

---

## Local development (unchanged from Task 05)

The original Docker Compose setup still works for local development:

```bash
docker compose up
```

This runs MongoDB, Redis, the server, and the client as local containers, as documented in `LINUX_SERVER_SETUP.md` (Task 05).