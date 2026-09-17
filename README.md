# 🥛 Smart Milk Chilling Can — IoT Cold-Chain Monitoring System

An end-to-end IoT and Real-Time Telemetry platform built for the **Smart India Hackathon (SIH)**. The system monitors milk temperature and pH inside a 40-Liter smart vacuum-insulated chilling can, evaluates cold-chain integrity and remaining shelf-life, and streams live telemetry to an interactive web dashboard over WebSockets.

---

## 🏗️ Architecture Overview

```
[DS18B20 Temp Sensor] (GPIO 4 / 1-Wire) ──┐
                                          ├─► [ESP32 Microcontroller]
[Analog pH Sensor]    (GPIO 34 / ADC1)   ──┘       │
                                                   │ 1. HTTP POST (JSON Payload every 30s)
                                                   ▼
                                     [Node.js + Express Backend]
                                                   │
                                   ┌───────────────┴───────────────┐
                                   ▼                               ▼
                       [Quality Logic Engine]             [Prisma + SQLite]
                       - Temp Safe: 4°C – 8°C             (dev.db - persisted)
                       - pH Safe: ≥ 6.4
                       - Shelf-Life Degradation Decay
                                   │
                                   ▼
                       [Socket.IO WebSocket Server]
                                   │
                                   │ 2. Broadcasts 'new-reading' event
                                   ▼
                       [Next.js 16 React Dashboard]
                       - Live KPI tiles & alert banner
                       - Physical Can cutaway cross-section schematic
                       - Real-time Recharts / Chart.js timelines
                       - Built-in simulation control panel
```

---

## 🚀 Quick Start: Running Locally

For maximum stability and to avoid port or process conflicts, **run the Backend and Frontend in two separate terminal tabs/windows**.

### Terminal 1: Backend Server

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies (first time only)
npm install
npx prisma generate
npx prisma db push

# 3. Start the backend server
npm run dev
```

* **Backend API & WebSockets live at:** `http://localhost:4000`
* **Health Check:** `http://localhost:4000/api/health`

---

### Terminal 2: Frontend Dashboard

Open a new terminal tab/window in the project root:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start the Next.js dev server
npm run dev
```

* **Web Dashboard live at:** 👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing & Data Simulation

You can push data to your dashboard in three different ways:

### Option A: Using the On-Screen Simulator (Easiest for Presentations)
1. Open the dashboard at `http://localhost:3000`.
2. Locate the **Simulation Toolbar** at the top.
3. Click any preset scenario:
   - **Normal Cooling**: Simulates healthy cold-chain maintenance (4°C – 6°C, 6.6 pH).
   - **Temp Warning**: Simulates insulation breach (8.5°C – 9.5°C).
   - **Spoilage Alert**: Simulates critical bacterial degradation (>12°C, <6.0 pH).

### Option B: Using cURL / Terminal
Send a mock telemetry packet directly to the backend:
```bash
curl -X POST http://localhost:4000/api/readings \
  -H "Content-Type: application/json" \
  -d '{"temperature_c": 5.2, "ph": 6.62}'
```
Watch the dashboard update immediately without reloading!

### Option C: Using Physical ESP32 Hardware
1. Connect ESP32, DS18B20 (GPIO 4 + 4.7kΩ pull-up), and pH Probe (GPIO 34).
2. Connect your laptop and ESP32 to the **same Wi-Fi network / mobile hotspot**.
3. Find your laptop's local IP using `ifconfig` (macOS/Linux) or `ipconfig` (Windows).
4. In `esp32_firmware/esp32_firmware.ino`:
   - Set `ssid` and `password`.
   - Update `serverUrl = "http://<YOUR_LAPTOP_IP>:4000/api/readings";`.
5. Flash via Arduino IDE (115200 baud).

---

## 📂 Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite Schema (Reading, Session models)
│   │   └── dev.db              # SQLite Database file
│   ├── src/
│   │   ├── server.ts           # Express REST endpoints & Socket.IO server
│   │   ├── statusLogic.ts      # Dairy safety thresholds & decay heuristic
│   │   └── simulator.ts        # Built-in live test scenario generator
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main dashboard view
│   │   │   └── layout.tsx      # Global layout & styles
│   │   ├── components/
│   │   │   ├── CanSchematic.tsx        # Cutaway cross-section of chilling can
│   │   │   ├── LiveCharts.tsx          # Dual-axis real-time charts
│   │   │   ├── StatusTiles.tsx         # 4 KPI cards (Temp, pH, Status, Shelf-Life)
│   │   │   ├── SimulatorControls.tsx   # Live demo control bar
│   │   │   └── AlertBanner.tsx         # Warning/Spoilage pop-down alerts
│   │   └── lib/api.ts          # REST client & Socket.IO consumer
│   └── package.json
│
├── esp32_firmware/
│   ├── esp32_firmware.ino      # C++ Arduino firmware (1-Wire + ADC1 reading)
│   └── README.md               # Pinout diagram & circuit wiring guide
│
└── package.json                # Project workspace configuration
```

---

## ⚙️ Cold-Chain Quality Thresholds

| Metric | Safe Zone (🟢) | Warning Zone (🟡) | Spoilage Zone (🔴) |
|---|---|---|---|
| **Temperature** | `4.0°C – 8.0°C` | `2.0°C – <4.0°C` or `>8.0°C – 10.0°C` | `< 2.0°C` or `> 10.0°C` |
| **pH Level** | `≥ 6.4` (Fresh milk: 6.5–6.7) | `6.0 – < 6.4` (Lactic acid rise) | `< 6.0` (Curdling / spoiled) |
| **Shelf-Life Decay** | 1.0× standard rate | 2.0× accelerated degradation | 3.0× or instant drop to 0.0 hrs |

---

## 🛠️ Port Conflict Troubleshooting

If you ever see `EADDRINUSE: 4000` or `Port 3000 is in use`, clear any hanging background processes:

```bash
# macOS / Linux
kill -9 $(lsof -t -i :3000 -i :4000)
```
Then start the backend and frontend in their respective terminals.
