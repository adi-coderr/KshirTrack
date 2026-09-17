import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { evaluateReading } from './statusLogic.js';

export type SimulationScenario = 
  | 'fresh_milk_cooling'
  | 'normal_cooling'
  | 'temperature_warning'
  | 'temperature_spoilage'
  | 'acidification_spoilage'
  | 'rapid_demo';

export class ReadingSimulator {
  private timer: NodeJS.Timeout | null = null;
  private scenario: SimulationScenario = 'normal_cooling';
  private intervalMs: number = 3000;
  private prisma: PrismaClient;
  private io: SocketIOServer;
  private stepCount: number = 0;

  // State trackers
  private currentTemp: number = 7.5;
  private currentPH: number = 6.68;

  constructor(prisma: PrismaClient, io: SocketIOServer) {
    this.prisma = prisma;
    this.io = io;
  }

  public getStatus() {
    return {
      active: this.timer !== null,
      scenario: this.scenario,
      intervalMs: this.intervalMs,
      currentTemp: Math.round(this.currentTemp * 10) / 10,
      currentPH: Math.round(this.currentPH * 100) / 100,
    };
  }

  public start(scenario: SimulationScenario = 'normal_cooling', intervalMs: number = 3000) {
    this.stop();
    this.scenario = scenario;
    this.intervalMs = intervalMs;
    this.stepCount = 0;

    // Reset initial points based on scenario
    if (scenario === 'fresh_milk_cooling') {
      this.currentTemp = 20.5; // Fresh warm milk poured into can
      this.currentPH = 6.68;
    } else if (scenario === 'normal_cooling') {
      this.currentTemp = 6.8;
      this.currentPH = 6.68;
    } else if (scenario === 'temperature_warning') {
      this.currentTemp = 8.2;
      this.currentPH = 6.55;
    } else if (scenario === 'temperature_spoilage') {
      this.currentTemp = 11.2;
      this.currentPH = 6.45;
    } else if (scenario === 'acidification_spoilage') {
      this.currentTemp = 6.2;
      this.currentPH = 6.1;
    } else if (scenario === 'rapid_demo') {
      this.currentTemp = 5.5;
      this.currentPH = 6.65;
    }

    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);

    // Immediate initial tick
    this.tick();
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public reset() {
    this.stop();
    this.stepCount = 0;
    this.currentTemp = 0.0;
    this.currentPH = 0.0;
  }

  public setScenario(scenario: SimulationScenario) {
    this.scenario = scenario;
    this.stepCount = 0;
    if (scenario === 'fresh_milk_cooling') {
      this.currentTemp = 20.5;
      this.currentPH = 6.68;
    }
  }

  private async tick() {
    this.stepCount++;
    const noiseTemp = (Math.random() - 0.5) * 0.15;
    const noisePH = (Math.random() - 0.5) * 0.03;

    switch (this.scenario) {
      case 'fresh_milk_cooling':
        // Fresh warm milk cooling down towards 4-8°C target
        if (this.currentTemp > 8.0) {
          this.currentTemp -= 1.8;
        } else if (this.currentTemp > 4.8) {
          this.currentTemp -= 0.3;
        } else {
          this.currentTemp += (Math.random() - 0.5) * 0.1;
        }
        this.currentPH = Math.max(6.5, Math.min(6.75, 6.68 + noisePH));
        break;

      case 'normal_cooling':
        // Cools gently towards ~4.8C, stays safely in 4.5-5.5C
        if (this.currentTemp > 4.8) {
          this.currentTemp -= 0.15;
        } else {
          this.currentTemp += (Math.random() - 0.5) * 0.1;
        }
        this.currentPH = Math.max(6.5, Math.min(6.75, 6.68 + noisePH));
        break;

      case 'temperature_warning':
        // Drifts into 8.5C - 9.8C warning zone
        if (this.currentTemp < 9.2) {
          this.currentTemp += 0.25;
        } else {
          this.currentTemp += (Math.random() - 0.5) * 0.15;
        }
        this.currentPH = Math.max(6.2, 6.5 + noisePH);
        break;

      case 'temperature_spoilage':
        // Climbs steadily into severe spoilage zone (11C - 16C)
        this.currentTemp += 0.35 + Math.random() * 0.2;
        this.currentPH = Math.max(5.7, this.currentPH - 0.04);
        break;

      case 'acidification_spoilage':
        // Temp stays okay (5.5C) but pH souring drops below 6.0
        this.currentTemp = 5.5 + noiseTemp;
        this.currentPH = Math.max(5.5, this.currentPH - 0.08);
        break;

      case 'rapid_demo':
        // Every 5 steps changes condition so judges see all alerts in 45s:
        // Steps 1-6: Normal safe (5.0C, pH 6.65)
        // Steps 7-12: Warming warning (8.8C, pH 6.45)
        // Steps 13-18: Critical spoilage (11.5C, pH 5.85)
        // Steps 19+: Recovery back to safe (5.2C, pH 6.6)
        if (this.stepCount <= 6) {
          this.currentTemp = 5.2 + noiseTemp;
          this.currentPH = 6.66 + noisePH;
        } else if (this.stepCount <= 12) {
          this.currentTemp = 8.9 + noiseTemp;
          this.currentPH = 6.35 + noisePH;
        } else if (this.stepCount <= 18) {
          this.currentTemp = 11.8 + noiseTemp;
          this.currentPH = 5.82 + noisePH;
        } else {
          // Recovery
          this.currentTemp = 4.9 + noiseTemp;
          this.currentPH = 6.62 + noisePH;
          if (this.stepCount > 25) {
            this.stepCount = 1; // loop
          }
        }
        break;
    }

    const temp_c = Math.round((this.currentTemp + noiseTemp) * 10) / 10;
    const ph = Math.round((this.currentPH + noisePH) * 100) / 100;

    try {
      // Find or create active session
      let session = await this.prisma.session.findFirst({
        where: { active: true },
        orderBy: { id: 'desc' },
      });

      if (!session) {
        session = await this.prisma.session.create({
          data: {
            started_at: new Date(),
            chilling_reached_at: null,
            state: 'cooling',
            initial_hours: 8.0,
            active: true,
          },
        });
      }

      // If fresh milk cooling started on step 1, ensure chilling_reached_at is null
      if (this.scenario === 'fresh_milk_cooling' && this.stepCount === 1) {
        session = await this.prisma.session.update({
          where: { id: session.id },
          data: {
            chilling_reached_at: null,
            state: 'cooling',
          },
        });
        this.io.emit('session-update', session);
      }

      // Lock in chilling timer when temp enters 4.0 - 8.0°C
      let chillingReachedAt = session.chilling_reached_at;
      if (!chillingReachedAt && temp_c >= 4.0 && temp_c <= 8.0) {
        chillingReachedAt = new Date();
        session = await this.prisma.session.update({
          where: { id: session.id },
          data: {
            chilling_reached_at: chillingReachedAt,
            state: 'chilled',
          },
        });
        this.io.emit('session-update', session);
      }

      // Recent session readings
      const history = await this.prisma.reading.findMany({
        where: {
          timestamp: { gte: session.started_at },
        },
        orderBy: { timestamp: 'asc' },
        take: 50,
      });

      const evaluated = evaluateReading(
        temp_c,
        ph,
        session.started_at,
        chillingReachedAt,
        history,
        session.initial_hours
      );

      const savedReading = await this.prisma.reading.create({
        data: {
          temperature_c: temp_c,
          ph: ph,
          temp_status: evaluated.temp_status,
          ph_status: evaluated.ph_status,
          status: evaluated.status,
          estimated_hours_remaining: evaluated.estimated_hours_remaining,
        },
      });

      const payload = {
        ...savedReading,
        session: {
          id: session.id,
          started_at: session.started_at,
          chilling_reached_at: session.chilling_reached_at,
          state: session.state,
          batch_name: session.batch_name,
          initial_hours: session.initial_hours,
        },
      };

      this.io.emit('new-reading', payload);
    } catch (err) {
      console.error('Error generating simulated reading:', err);
    }
  }
}
