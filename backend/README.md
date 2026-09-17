# Smart Milk Chilling Can — Backend API & Telemetry Engine

Node.js, Express, TypeScript, Prisma ORM, SQLite, and Socket.IO real-time server.

## Features
- **HTTP Ingestion**: `POST /api/readings` receives `{ temperature_c, ph }` packets from ESP32 nodes.
- **Quality Engine**: Evaluates milk health (safe, warning, spoiling) and calculates remaining shelf-life using dynamic non-linear decay heuristics.
- **WebSocket Broadcast**: Emits `new-reading` events via Socket.IO to connected web dashboards in real time.
- **Built-in Simulator**: Generates realistic telemetry streams for live presentations.
- **Data Persistence & Export**: Stored in SQLite via Prisma with full CSV export support.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/readings` | Ingests sensor reading from ESP32 |
| `GET` | `/api/readings` | Fetches recent historical readings |
| `GET` | `/api/readings/export` | Downloads telemetry logs as CSV |
| `DELETE`| `/api/readings` | Clears all telemetry records |
| `POST` | `/api/session/start` | Starts/resets a chilling storage session |
| `GET` | `/api/session/current` | Fetches active session metadata |
| `POST` | `/api/readings/simulate` | Starts/stops the telemetry simulator |

## Development

Run from root directory:
```bash
npm run dev
```

Or run standalone backend:
```bash
npm run dev
```
Runs at `http://localhost:4000`.
