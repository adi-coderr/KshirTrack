'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { StatusTiles } from '@/components/StatusTiles';
import { StatusOverviewCard } from '@/components/StatusOverviewCard';
import { LiveCharts } from '@/components/LiveCharts';
import { RightColumnCards } from '@/components/RightColumnCards';
import { RecentReadingsTable } from '@/components/RecentReadingsTable';
import { SimulatorControls } from '@/components/SimulatorControls';
import { AlertBanner } from '@/components/AlertBanner';
import { CanSchematic } from '@/components/CanSchematic';
import { ScrollReveal } from '@/components/ScrollReveal';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import {
  getSocket,
  fetchRecentReadings,
  fetchCurrentSession,
  startNewSession,
  setSimulator,
  fetchSimulatorStatus,
  clearAllReadings,
} from '@/lib/api';
import { Reading, SessionInfo, SimulatorStatus } from '@/types';

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [currentReading, setCurrentReading] = useState<Reading | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus | null>(null);
  const [showSchematic, setShowSchematic] = useState(false);

  // Initialize data and WebSocket
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [pastReadings, currentSess, simStatus] = await Promise.all([
          fetchRecentReadings(120),
          fetchCurrentSession(),
          fetchSimulatorStatus(),
        ]);

        if (!isMounted) return;

        setReadings(pastReadings);
        if (pastReadings.length > 0) {
          setCurrentReading(pastReadings[pastReadings.length - 1]);
        }
        setSession(currentSess);
        setSimulatorStatus(simStatus);
      } catch (err) {
        console.error('Failed to initialize dashboard data:', err);
      }
    }

    init();

    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewReading = (reading: Reading) => {
      setCurrentReading(reading);
      setReadings((prev) => {
        const next = [...prev, reading];
        if (next.length > 200) next.shift();
        return next;
      });
      if (reading.session) {
        setSession((prev) => (prev ? { ...prev, ...reading.session } : (reading.session as SessionInfo)));
      }
    };

    const onSessionUpdate = (newSession: SessionInfo) => setSession(newSession);
    const onSimulatorStatus = (status: SimulatorStatus) => setSimulatorStatus(status);
    const onReadingsCleared = () => {
      setReadings([]);
      setCurrentReading(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-reading', onNewReading);
    socket.on('session-update', onSessionUpdate);
    socket.on('simulator-status', onSimulatorStatus);
    socket.on('readings-cleared', onReadingsCleared);

    if (socket.connected) setIsConnected(true);

    return () => {
      isMounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-reading', onNewReading);
      socket.off('session-update', onSessionUpdate);
      socket.off('simulator-status', onSimulatorStatus);
      socket.off('readings-cleared', onReadingsCleared);
    };
  }, []);

  const handleResetSession = useCallback(async () => {
    if (confirm('Start a new storage session? This resets the elapsed timer.')) {
      const newSess = await startNewSession(8.0);
      if (newSess) setSession(newSess);
    }
  }, []);

  const handleToggleSimulator = useCallback(async () => {
    const nextActive = !simulatorStatus?.active;
    const updated = await setSimulator(nextActive, simulatorStatus?.scenario || 'normal_cooling');
    if (updated) setSimulatorStatus(updated);
  }, [simulatorStatus]);

  const handleSelectScenario = useCallback(async (scenario: SimulatorStatus['scenario']) => {
    const updated = await setSimulator(true, scenario, simulatorStatus?.intervalMs || 3000);
    if (updated) setSimulatorStatus(updated);
  }, [simulatorStatus]);

  const handleSelectInterval = useCallback(async (intervalMs: number) => {
    const updated = await setSimulator(simulatorStatus?.active ?? true, simulatorStatus?.scenario || 'normal_cooling', intervalMs);
    if (updated) setSimulatorStatus(updated);
  }, [simulatorStatus]);

  const handleResetData = useCallback(async () => {
    if (confirm('Clear all past readings from SQLite?')) {
      await clearAllReadings();
      setReadings([]);
      setCurrentReading(null);
    }
  }, []);

  const scrollToSchematic = () => {
    setShowSchematic(true);
    const el = document.getElementById('schematic-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-viewport-wrapper">
      {/* Dynamic Scroll Progress Bar & Floating Quick-Scroll Button */}
      <ScrollProgressBar />

      {/* 1. Left Vertical Sidebar Dock */}
      <Sidebar
        onResetSession={handleResetSession}
        onOpenSimulator={handleToggleSimulator}
        isSimulating={simulatorStatus?.active}
      />

      {/* 2. Main Window Application Frame */}
      <main className="app-window-frame">
        {/* Top Header */}
        <Navbar
          isConnected={isConnected}
          onResetSession={handleResetSession}
          simulatorStatus={simulatorStatus}
          onToggleSimulator={handleToggleSimulator}
          currentReading={currentReading}
        />

        {/* Floating / Compact Simulator Bench Toolbar */}
        <SimulatorControls
          status={simulatorStatus}
          onToggle={handleToggleSimulator}
          onSelectScenario={handleSelectScenario}
          onSelectInterval={handleSelectInterval}
          onResetData={handleResetData}
        />

        {/* Alert Banner (visible on warning/spoilage) */}
        <AlertBanner currentReading={currentReading} />

        {/* 3. Top 4-Column KPI Strip */}
        <ScrollReveal direction="bidirectional" delay={40}>
          <StatusTiles currentReading={currentReading} session={session} />
        </ScrollReveal>

        {/* 4. Middle Content Split: Left (68%) & Right (32%) */}
        <div className="dashboard-content-split">
          {/* Left Column */}
          <div className="dashboard-main-col">
            {/* Status Overview Card */}
            <ScrollReveal direction="bidirectional" delay={60}>
              <StatusOverviewCard
                currentReading={currentReading}
                onOpenSchematic={scrollToSchematic}
              />
            </ScrollReveal>

            {/* Physical Can Hardware & Cross-Section Blueprint */}
            <ScrollReveal direction="bidirectional" delay={80}>
              <CanSchematic currentReading={currentReading} />
            </ScrollReveal>

            {/* Cold-Chain Trends Line Chart */}
            <ScrollReveal direction="bidirectional" delay={100}>
              <LiveCharts readings={readings} />
            </ScrollReveal>

            {/* Recent Telemetry Table */}
            <ScrollReveal direction="bidirectional" delay={120}>
              <RecentReadingsTable readings={readings} />
            </ScrollReveal>
          </div>

          {/* Right Column (Insights & Hardware Status) */}
          <div className="dashboard-side-col">
            <ScrollReveal direction="bidirectional" delay={90}>
              <RightColumnCards currentReading={currentReading} />
            </ScrollReveal>
          </div>
        </div>
      </main>
    </div>
  );
}
