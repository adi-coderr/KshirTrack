# Smart Milk Chilling Can — Frontend Dashboard

Next.js 16 (App Router) + React + Socket.IO real-time dashboard for monitoring smart milk chilling cans.

## Features
- **Real-Time WebSockets**: Instantly updates without page refreshes when ESP32 or simulator sends data.
- **KPI Tiles**: Current temperature, pH, quality index, and calculated shelf-life remaining.
- **Physical Can Blueprint**: Vector cross-section schematic showing internal probes and milk level.
- **Dual-Axis Live Charts**: Temperature and pH trend lines against official safety zones.
- **Built-in Presentation Simulator**: Toggle realistic normal, warning, or spoilage scenarios with 1 click.
- **Audit Logging & CSV Export**: Downloadable historical logs for regulatory compliance.

---

## 🚀 How to Run Frontend

To ensure stability during development and presentations, run the frontend and backend in separate terminal tabs.

```bash
# 1. Navigate into the frontend folder
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start the frontend development server
npm run dev
```

The dashboard will be live at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 Backend Connection

The frontend automatically connects to the backend at `http://localhost:4000`.

Make sure your backend is running in another terminal tab:
```bash
cd backend
npm run dev
```

To point to a different backend IP (e.g. for testing from a phone or other device on the same Wi-Fi), edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://<YOUR_IP>:4000
```
