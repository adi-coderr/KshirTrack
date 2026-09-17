import { io, Socket } from 'socket.io-client';
import { Reading, SessionInfo, SimulatorStatus } from '@/types';

export function getApiBase(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:4000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const base = getApiBase();
    socket = io(base, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export async function fetchRecentReadings(limit = 100, since?: string): Promise<Reading[]> {
  try {
    const base = getApiBase();
    const url = new URL(`${base}/api/readings`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('order', 'asc');
    if (since) url.searchParams.set('since', since);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch readings');
    const data = await res.json();
    return data.readings || [];
  } catch (err) {
    console.error('fetchRecentReadings error:', err);
    return [];
  }
}

export async function fetchCurrentSession(): Promise<SessionInfo | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/session/current`);
    if (!res.ok) throw new Error('Failed to fetch session');
    return await res.json();
  } catch (err) {
    console.error('fetchCurrentSession error:', err);
    return null;
  }
}

export async function startNewSession(initialHours = 8.0, batchName?: string): Promise<SessionInfo | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initial_hours: initialHours, batch_name: batchName }),
    });
    if (!res.ok) throw new Error('Failed to start session');
    const data = await res.json();
    return data.session;
  } catch (err) {
    console.error('startNewSession error:', err);
    return null;
  }
}

export async function changeMilkSession(initialHours = 8.0, batchName?: string): Promise<SessionInfo | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/session/change-milk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initial_hours: initialHours, batch_name: batchName }),
    });
    if (!res.ok) throw new Error('Failed to change milk session');
    const data = await res.json();
    return data.session;
  } catch (err) {
    console.error('changeMilkSession error:', err);
    return null;
  }
}

export async function setSimulator(active: boolean, scenario?: string, intervalMs?: number): Promise<SimulatorStatus | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/readings/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active, scenario, intervalMs }),
    });
    if (!res.ok) throw new Error('Failed to configure simulator');
    const data = await res.json();
    return data.status;
  } catch (err) {
    console.error('setSimulator error:', err);
    return null;
  }
}

export async function fetchSimulatorStatus(): Promise<SimulatorStatus | null> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/readings/simulate/status`);
    if (!res.ok) throw new Error('Failed to fetch simulator status');
    return await res.json();
  } catch (err) {
    console.error('fetchSimulatorStatus error:', err);
    return null;
  }
}

export async function clearAllReadings(): Promise<boolean> {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/readings`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('clearAllReadings error:', err);
    return false;
  }
}

export function getExportUrl(): string {
  const base = getApiBase();
  return `${base}/api/readings/export`;
}
