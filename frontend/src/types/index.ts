export type HealthStatus = 'safe' | 'warning' | 'spoiling';

export interface Reading {
  id: number;
  timestamp: string;
  temperature_c: number;
  ph: number;
  temp_status: HealthStatus;
  ph_status: HealthStatus;
  status: HealthStatus;
  estimated_hours_remaining: number;
  session?: {
    id: number;
    started_at: string;
    chilling_reached_at?: string | null;
    state?: 'cooling' | 'chilled' | 'ended';
    batch_name?: string;
    initial_hours: number;
  };
}

export interface SessionInfo {
  id: number;
  started_at: string;
  chilling_reached_at: string | null;
  ended_at: string | null;
  initial_hours: number;
  batch_name?: string;
  state: 'cooling' | 'chilled' | 'ended';
  active: boolean;
}

export interface SimulatorStatus {
  active: boolean;
  scenario: 'fresh_milk_cooling' | 'normal_cooling' | 'temperature_warning' | 'temperature_spoilage' | 'acidification_spoilage' | 'rapid_demo';
  intervalMs: number;
  currentTemp: number;
  currentPH: number;
}
