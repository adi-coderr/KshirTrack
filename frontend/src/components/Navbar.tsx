'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Play, Square, RefreshCw, Radio, User, Sliders } from 'lucide-react';
import { Reading, SimulatorStatus } from '@/types';

interface NavbarProps {
  isConnected: boolean;
  onResetSession: () => void;
  simulatorStatus: SimulatorStatus | null;
  onToggleSimulator: () => void;
  currentReading?: Reading | null;
  onOpenSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected,
  onResetSession,
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
          Smart Chilling Can <span className="text-highlight">#CAN-40L</span>
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
