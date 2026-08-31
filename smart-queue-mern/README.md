# Smart Queue Management System — Docker guide (from zero)

This is a real, working MERN app: customers join a queue, staff call
the next ticket, everyone sees live status. You will containerize it
yourself, step by step.

## 0. Install Docker (one-time setup)

1. Download **Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop
2. Install it and restart your computer if it asks.
3. Open Docker Desktop and wait until it says "Docker is running".
4. In a terminal, confirm:
   ```
   docker --version
   docker compose version
   ```

## 1. What each file does

| File | What it is |
|---|---|
| `server/Dockerfile` | Builds the backend (Express + MongoDB) into a small image |
| `client/Dockerfile` | Builds the frontend (React) into a small image |
| `client/nginx.conf` | Forwards `/api/*` calls from the browser to the backend container |
| `docker-compose.yml` | Starts mongo, redis, server, and client together |
| `.env.example` | Copy to `.env` and edit if you want different credentials |

An **image** is a saved snapshot — everything your app needs to run,
built once. A **container** is a running instance of that image.

## 2. First-time setup

Open a terminal in this folder (the one with `docker-compose.yml`) and run:

```
copy .env.example .env
```
(PowerShell: `Copy-Item .env.example .env`)

## 3. Build the images

```
docker compose build --no-cache > build-log.txt 2>&1
```

This builds `server` and `client` from scratch and saves the full log —
this file is your task's required "build logs" proof. Open
`build-log.txt` afterward to see everything that happened.

## 4. Start everything

```
docker compose up -d
docker compose ps
```

All 4 services (mongo, redis, server, client) should show
`running`/`healthy` within about 30 seconds.

## 5. Try it

Open **http://localhost:8080**.

- Type a name and click "Join Queue" a few times to add tickets.
- Click "Call Next (staff)" to advance the queue — the currently
  serving ticket updates at the top.
- The list auto-refreshes every 4 seconds.

## 6. Look at logs

```
docker compose logs server
docker compose logs mongo
```

## 7. Check image sizes (task requires under 150MB)

```
docker images
```
Look at the `SIZE` column for the server and client images.

## 8. Test volume persistence

```
docker compose restart mongo
```
Refresh the browser — your queue tickets should still be there. This
proves the `mongo-data` volume is really persisting data.

## 9. Confirm non-root user

```
docker compose exec server whoami
docker compose exec client whoami
```
Should print `appuser` and `nginx` — never `root`.

## 10. Stop everything

```
docker compose down
```

## 11. Submit

Commit all these files (Dockerfiles, docker-compose.yml,
build-log.txt, this README, and the app source) to your GitHub repo
and submit that link.

---

### If something goes wrong

- **"port is already allocated"** — something else is using port 5000,
  8080, 27017, or 6379. Change the left-hand number in the `ports:`
  section of `docker-compose.yml`.
- **Queue doesn't load / stuck on "Loading..."** — check
  `docker compose logs server` and confirm `docker compose ps` shows
  `server` as healthy first.
- **Still stuck** — run `docker compose logs` (no service name) and
  paste the error back for help.
