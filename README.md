# Smart Queue Management System

Full-stack queue/ticketing app with live updates.

## Stack
- **Frontend:** React
- **Backend:** Spring Boot (REST + WebSocket/STOMP for live queue updates)
- **Database:** MySQL

## Running the backend (requires JDK 17 + Maven + a running MySQL instance)
```bash
cd backend
mvn spring-boot:run
```
By default it connects to `localhost:3306`, database `smart_queue_db`, user `root`,
password `password`. Override with env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

## Running the frontend (requires Node.js)
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000 and expects the backend on http://localhost:8080.

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/queues | List all queues |
| POST | /api/queues | Create a queue |
| GET | /api/queues/{id}/tickets | List waiting tickets |
| POST | /api/queues/{id}/tickets | Issue a new ticket |
| POST | /api/queues/{id}/tickets/call-next | Call the next customer |
| PUT | /api/queues/{id}/tickets/{ticketId}/serve | Mark a ticket as served |

Live updates are pushed over WebSocket (STOMP) on `/ws`, topic `/topic/queue/{queueId}`.
