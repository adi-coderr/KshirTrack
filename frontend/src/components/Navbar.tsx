'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Play, Square, RefreshCw, Radio, User, Sliders, RotateCcw } from 'lucide-react';
import { Reading, SimulatorStatus } from '@/types';

interface NavbarProps {
  isConnected: boolean;
  onResetSession: () => void;
  onChangeMilk?: () => void;
  onResetData?: () => void;
  simulatorStatus: SimulatorStatus | null;
  onToggleSimulator: () => void;
  currentReading?: Reading | null;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected,
  onResetSession,
  onChangeMilk,
  onResetData,
  simulatorStatus,
  onToggleSimulator,
  currentReading,
  onOpenSimulator,
}) => {
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isSimulating = simulatorStatus?.active;

  return (
    <header className="main-header">
      {/* Left: Greeting & Status */}
      <div className="header-greeting-wrap">
        <h1 className="header-title">
          Smart Chilling Can
        </h1>
        <p className="header-subtitle">
          SIH Live Telemetry &bull; Local Cold-Chain Gateway
        </p>
      </div>

      {/* Middle: Segmented Pill Navigation */}
      <div className="header-segmented-nav">
        <Link
          href="/"
          className={`nav-pill ${pathname === '/' ? 'active' : ''}`}
        >
          Live Monitor
        </Link>
        <button
          type="button"
          onClick={() => scrollToSection('charts-section')}
          className="nav-pill"
        >
          Cold-Chain Trends
        </button>
        <button
          type="button"
          onClick={() => scrollToSection('schematic-section')}
          className="nav-pill"
        >
          Hardware Blueprint
        </button>
        <Link
          href="/history"
          className={`nav-pill ${pathname === '/history' ? 'active' : ''}`}
        >
          Audit Log
        </Link>
      </div>

      {/* Right: Actions, Node Status & Avatar */}
      <div className="header-right-actions">
        {/* Change Milk Batch Button */}
        <button
          type="button"
          onClick={onChangeMilk}
          className="action-pill-btn change-milk-header-btn"
          style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A' }}
          title="Change Milk Batch: Resets storage session & waits for 4.0–8.0°C"
        >
          <RotateCcw size={13} className="text-blue" />
          <span>Change Milk</span>
        </button>

        {/* Reset All to 0 (No Hardware Standby) */}
        <button
          type="button"
          onClick={onResetData}
          className="action-pill-btn"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
          title="Set everything to 0 (Standby mode when no hardware is connected)"
        >
          <RotateCcw size={13} />
          <span>Reset to 0</span>
        </button>

        {/* Simulator Toggle Button */}
        <button
          type="button"
          onClick={onToggleSimulator}
          className={`action-pill-btn ${isSimulating ? 'active-sim' : ''}`}
          title="Toggle Sensor Stream Simulator"
        >
          {isSimulating ? <Square size={13} /> : <Play size={13} />}
          <span>{isSimulating ? 'Streaming' : 'Test Feed'}</span>
        </button>

        {/* Reset Session Button */}
        <button
          type="button"
          onClick={onResetSession}
          className="action-icon-circle"
          title="Reset Storage Session"
        >
          <RefreshCw size={15} />
        </button>

        {/* Live ESP32 connection indicator */}
        <div
          className="action-icon-circle"
          title={isConnected ? 'ESP32 Node Online via Local WiFi' : 'Reconnecting to Gateway...'}
        >
          <Radio size={15} color={isConnected ? '#10B981' : '#EF4444'} />
          <span className={`status-bubble ${isConnected ? 'online' : 'offline'}`} />
        </div>

        {/* Notification Bell */}
        <div className="action-icon-circle" title="System Alerts">
          <Bell size={15} />
          {currentReading && currentReading.status !== 'safe' && (
            <span className="alert-badge-dot" />
          )}
        </div>

        {/* Operator / Team Profile Avatar */}
        <div className="operator-avatar" title="Team APEX • Cold-Chain Monitoring">
          <img
            src="/apex-logo.jpg"
            alt="APEX Logo"
            className="avatar-img"
          />
        </div>
      </div>
    </header>
  );
};
