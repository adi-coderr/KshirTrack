import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { evaluateReading } from './statusLogic.js';
import { ReadingSimulator, SimulationScenario } from './simulator.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Allow CORS from local Next.js frontend (localhost:3000) or any local IP on same network
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const prisma = new PrismaClient();
const simulator = new ReadingSimulator(prisma, io);

// Helper: retrieve or initialize current active session
async function getOrCreateActiveSession() {
  let session = await prisma.session.findFirst({
    where: { active: true },
    orderBy: { id: 'desc' },
  });

  if (!session) {
    session = await prisma.session.create({
      data: {
        started_at: new Date(),
        initial_hours: 8.0,
        active: true,
      },
    });
  }
  return session;
}

// -------------------------------------------------------------
// REST API
// -------------------------------------------------------------

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Milk Chilling Can Monitor API',
  });
});

/**
 * POST /api/readings - Called by ESP32 or test client
 * Body: { "temperature_c": 6.2, "ph": 6.55 }
 */
app.post('/api/readings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { temperature_c, ph } = req.body;

    if (temperature_c === undefined || ph === undefined || isNaN(Number(temperature_c)) || isNaN(Number(ph))) {
      res.status(400).json({ error: 'Valid numeric temperature_c and ph are required.' });
      return;
    }

    const tempVal = Number(temperature_c);
    const phVal = Number(ph);

    const session = await getOrCreateActiveSession();

    // Fetch recent readings in this session to calculate decay penalty
    const history = await prisma.reading.findMany({
      where: {
        timestamp: { gte: session.started_at },
      },
      orderBy: { timestamp: 'asc' },
      take: 100,
    });

    const evaluated = evaluateReading(
      tempVal,
      phVal,
      session.started_at,
      history,
      session.initial_hours
    );

    const newReading = await prisma.reading.create({
      data: {
        temperature_c: tempVal,
        ph: phVal,
        temp_status: evaluated.temp_status,
        ph_status: evaluated.ph_status,
        status: evaluated.status,
        estimated_hours_remaining: evaluated.estimated_hours_remaining,
      },
    });

    const broadcastPayload = {
      ...newReading,
      session: {
        id: session.id,
        started_at: session.started_at,
        initial_hours: session.initial_hours,
      },
    };

    // Broadcast over WebSocket to all connected dashboard clients
    io.emit('new-reading', broadcastPayload);

    res.status(201).json(broadcastPayload);
  } catch (err: any) {
    console.error('Error handling reading:', err);
    res.status(500).json({ error: 'Failed to record reading', details: err.message });
  }
});

/**
 * GET /api/readings?since=<ISO timestamp>&limit=<N>&order=asc|desc
 */
app.get('/api/readings', async (req: Request, res: Response) => {
  try {
    const since = req.query.since as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 300, 1000);
    const order = (req.query.order === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

    const where: any = {};
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        where.timestamp = { gte: sinceDate };
      }
    }

    const readings = await prisma.reading.findMany({
      where,
      orderBy: { timestamp: order },
      take: limit,
    });

    res.json({
      count: readings.length,
      readings,
    });
  } catch (err: any) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Failed to fetch readings', details: err.message });
  }
});

/**
 * GET /api/readings/export - Download CSV file
 */
app.get('/api/readings/export', async (req: Request, res: Response) => {
  try {
    const readings = await prisma.reading.findMany({
      orderBy: { timestamp: 'asc' },
    });

    const csvRows = [
      'id,timestamp,temperature_c,ph,temp_status,ph_status,status,estimated_hours_remaining',
    ];

    for (const r of readings) {
      csvRows.push(
        `${r.id},"${r.timestamp.toISOString()}",${r.temperature_c},${r.ph},"${r.temp_status}","${r.ph_status}","${r.status}",${r.estimated_hours_remaining}`
      );
    }

    const csvData = csvRows.join('\n');
    const filename = `milk_chilling_readings_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (err: any) {
    console.error('Error exporting readings:', err);
    res.status(500).json({ error: 'Failed to export readings', details: err.message });
  }
});

/**
 * DELETE /api/readings - Clear readings (for test resets)
 */
app.delete('/api/readings', async (req: Request, res: Response) => {
  try {
    await prisma.reading.deleteMany({});
    io.emit('readings-cleared', { timestamp: new Date() });
    res.json({ message: 'All readings cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear readings', details: err.message });
  }
});

/**
 * POST /api/session/start - Resets elapsed-time timer & starts storage session
 */
app.post('/api/session/start', async (req: Request, res: Response) => {
  try {
    const initialHours = Number(req.body.initial_hours) || 8.0;

    // End active session
    await prisma.session.updateMany({
      where: { active: true },
      data: {
        active: false,
        ended_at: new Date(),
      },
    });

    // Create fresh session
    const newSession = await prisma.session.create({
      data: {
        started_at: new Date(),
        initial_hours: initialHours,
        active: true,
      },
    });

    io.emit('session-update', newSession);

    res.status(201).json({
      message: 'New chilling session started',
      session: newSession,
    });
  } catch (err: any) {
    console.error('Error starting session:', err);
    res.status(500).json({ error: 'Failed to start session', details: err.message });
  }
});

/**
 * GET /api/session/current - Get active session
 */
app.get('/api/session/current', async (req: Request, res: Response) => {
  try {
    const session = await getOrCreateActiveSession();
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get current session', details: err.message });
  }
});

/**
 * POST /api/readings/simulate - Start / stop / update simulator
 * Body: { active: boolean, scenario?: 'normal_cooling' | 'temperature_warning' | 'temperature_spoilage' | 'acidification_spoilage' | 'rapid_demo', intervalMs?: number }
 */
app.post('/api/readings/simulate', (req: Request, res: Response) => {
  const { active, scenario, intervalMs } = req.body;

  if (active === true) {
    simulator.start(scenario as SimulationScenario || 'normal_cooling', intervalMs || 3000);
  } else if (active === false) {
    simulator.stop();
  } else if (scenario) {
    simulator.setScenario(scenario as SimulationScenario);
  }

  const status = simulator.getStatus();
  io.emit('simulator-status', status);
  res.json({
    message: `Simulator ${status.active ? 'active (' + status.scenario + ')' : 'stopped'}`,
    status,
  });
});

/**
 * GET /api/readings/simulate/status - Check simulator status
 */
app.get('/api/readings/simulate/status', (req: Request, res: Response) => {
  res.json(simulator.getStatus());
});

// -------------------------------------------------------------
// WebSocket setup
// -------------------------------------------------------------
io.on('connection', async (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current session info and simulator status on connection
  try {
    const session = await getOrCreateActiveSession();
    socket.emit('session-update', session);
    socket.emit('simulator-status', simulator.getStatus());
  } catch (err) {
    console.error('Error sending initial socket state:', err);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Milk Chilling Can Monitoring Server`);
  console.log(`📡 HTTP & WebSocket running at: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
