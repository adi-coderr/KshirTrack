'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import {
  fetchRecentReadings,
  fetchCurrentSession,
  fetchSimulatorStatus,
  setSimulator,
  startNewSession,
  getExportUrl,
  clearAllReadings,
} from '@/lib/api';
import { Reading, SessionInfo, SimulatorStatus } from '@/types';
import { Download, ArrowLeft, Trash2, Database, BarChart3 } from 'lucide-react';

export default function HistoryPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReadings, sess, sim] = await Promise.all([
        fetchRecentReadings(500),
        fetchCurrentSession(),
        fetchSimulatorStatus(),
      ]);
      setReadings(allReadings);
      setSession(sess);
      setSimulatorStatus(sim);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetSession = async () => {
    if (confirm('Start a new storage session?')) {
      const newSess = await startNewSession(8.0);
      if (newSess) setSession(newSess);
    }
  };

  const handleToggleSimulator = async () => {
    const nextActive = !simulatorStatus?.active;
    const updated = await setSimulator(nextActive, simulatorStatus?.scenario || 'normal_cooling');
    if (updated) setSimulatorStatus(updated);
  };

  const handleClearReadings = async () => {
    if (confirm('Are you sure you want to delete all historical readings from SQLite?')) {
      await clearAllReadings();
      setReadings([]);
    }
  };

  // Compute Summary Metrics
  const totalCount = readings.length;
  const avgTemp = totalCount > 0
    ? (readings.reduce((sum, r) => sum + r.temperature_c, 0) / totalCount).toFixed(1)
    : '--';
  const minTemp = totalCount > 0
    ? Math.min(...readings.map((r) => r.temperature_c)).toFixed(1)
    : '--';
  const maxTemp = totalCount > 0
    ? Math.max(...readings.map((r) => r.temperature_c)).toFixed(1)
    : '--';
  const avgPH = totalCount > 0
    ? (readings.reduce((sum, r) => sum + r.ph, 0) / totalCount).toFixed(2)
    : '--';
  const minPH = totalCount > 0
    ? Math.min(...readings.map((r) => r.ph)).toFixed(2)
    : '--';

  return (
    <div className="app-viewport-wrapper">
      <Sidebar
        onResetSession={handleResetSession}
        onOpenSimulator={handleToggleSimulator}
        isSimulating={simulatorStatus?.active}
      />

      <main className="app-window-frame">
        <Navbar
          isConnected={true}
          onResetSession={handleResetSession}
          simulatorStatus={simulatorStatus}
          onToggleSimulator={handleToggleSimulator}
          currentReading={readings.length > 0 ? readings[readings.length - 1] : null}
        />

        {/* Page Sub-Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Link href="/" className="btn-pill-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px', textDecoration: 'none' }}>
              <ArrowLeft size={13} />
              <span>Back to Live Dashboard</span>
            </Link>
            <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-dark)' }}>
              Historical Telemetry Log & Audit Trail
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Permanent audit records stored locally in SQLite database (dev.db) via Prisma ORM
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              id="btn-export-csv"
              href={getExportUrl()}
              download
              className="action-pill-btn"
              style={{ background: 'var(--primary-blue)', color: '#FFFFFF', border: 'none' }}
            >
              <Download size={14} />
              <span>Export CSV Report</span>
            </a>

            <button
              onClick={handleClearReadings}
              className="action-pill-btn"
              style={{ color: '#DC2626' }}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="white-panel-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LOGGED READINGS</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{totalCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Streamed from ESP32 gateway</div>
          </div>

          <div className="white-panel-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE TEMPERATURE</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#4F46E5' }}>{avgTemp}°C</div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Min: {minTemp}°C &bull; Max: {maxTemp}°C</div>
          </div>

          <div className="white-panel-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE pH LEVEL</div>
            <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', color: '#EC4899' }}>{avgPH}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Min recorded pH: {minPH}</div>
          </div>

          <div className="white-panel-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>STORAGE ENGINE</div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
              <Database size={18} />
              <span>SQLite + Prisma</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>Local dev.db file (No Cloud)</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="white-panel-card">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
              <BarChart3 size={17} color="#4F46E5" />
              <span>Raw Telemetry Stream Records ({readings.length} entries)</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Sorted newest first
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              Loading historical data...
            </div>
          ) : readings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              No readings recorded yet. Start the test feed or connect ESP32.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="light-table">
                <thead>
                  <tr>
                    <th>Reading ID</th>
                    <th>Server Timestamp</th>
                    <th>Temperature</th>
                    <th>Acidity (pH)</th>
                    <th>Temp Health</th>
                    <th>pH Health</th>
                    <th>Overall Status</th>
                    <th>Remaining Shelf</th>
                  </tr>
                </thead>
                <tbody>
                  {[...readings].reverse().map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{row.id}</td>
                      <td className="text-muted">{new Date(row.timestamp).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: row.temp_status === 'safe' ? '#059669' : row.temp_status === 'warning' ? '#D97706' : '#DC2626' }}>
                        {row.temperature_c.toFixed(1)}°C
                      </td>
                      <td style={{ fontWeight: 700, color: row.ph_status === 'safe' ? '#059669' : row.ph_status === 'warning' ? '#D97706' : '#DC2626' }}>
                        {row.ph.toFixed(2)} pH
                      </td>
                      <td>
                        <span className={`table-status-pill ${row.temp_status === 'safe' ? 'badge-pill-green' : row.temp_status === 'warning' ? 'badge-pill-amber' : 'badge-pill-red'}`}>
                          {row.temp_status}
                        </span>
                      </td>
                      <td>
                        <span className={`table-status-pill ${row.ph_status === 'safe' ? 'badge-pill-green' : row.ph_status === 'warning' ? 'badge-pill-amber' : 'badge-pill-red'}`}>
                          {row.ph_status}
                        </span>
                      </td>
                      <td>
                        <span className={`table-status-pill ${row.status === 'safe' ? 'badge-pill-green' : row.status === 'warning' ? 'badge-pill-amber' : 'badge-pill-red'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="font-mono text-muted">{row.estimated_hours_remaining.toFixed(1)} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
