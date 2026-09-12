'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Activity,
  History,
  Sliders,
  RefreshCw,
  Cpu,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  onResetSession?: () => void;
  onOpenSimulator?: () => void;
  isSimulating?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onResetSession,
  onOpenSimulator,
  isSimulating,
}) => {
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Geometric Icon at Top */}
      <div className="sidebar-logo">
        <div className="logo-geometric">
          <div className="logo-circle circle-1" />
          <div className="logo-circle circle-2" />
          <div className="logo-circle circle-3" />
          <div className="logo-circle circle-4" />
        </div>
      </div>

      {/* Main Nav Icons */}
      <nav className="sidebar-nav">
        <Link
          href="/"
          className={`nav-icon-btn ${pathname === '/' ? 'active' : ''}`}
          title="Dashboard Overview"
        >
          <LayoutGrid size={18} />
        </Link>

        <button
          type="button"
          onClick={() => scrollToSection('charts-section')}
          className="nav-icon-btn"
          title="Telemetry Trends"
        >
          <Activity size={18} />
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('schematic-section')}
          className="nav-icon-btn"
          title="Can Hardware Schematic"
        >
          <Cpu size={18} />
        </button>

        <Link
          href="/history"
          className={`nav-icon-btn ${pathname === '/history' ? 'active' : ''}`}
          title="Raw Telemetry History & CSV"
        >
          <History size={18} />
        </Link>

        <button
          type="button"
          onClick={onOpenSimulator}
          className={`nav-icon-btn ${isSimulating ? 'simulating-pulse' : ''}`}
          title="Sensor Stream Simulator"
        >
          <Sliders size={18} />
        </button>

        <button
          type="button"
          onClick={onResetSession}
          className="nav-icon-btn"
          title="New Storage Session"
        >
          <RefreshCw size={18} />
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-icon-btn"
          title="Settings / Config"
        >
          <Settings size={18} />
        </button>
        <Link
          href="/history"
          className="nav-icon-btn exit-btn"
          title="Export CSV & Audit"
        >
          <LogOut size={16} />
        </Link>
      </div>
    </aside>
  );
};
