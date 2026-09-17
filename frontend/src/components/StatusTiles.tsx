'use client';

import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Clock, Timer, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Reading, SessionInfo } from '@/types';

interface StatusTilesProps {
  currentReading: Reading | null;
  session: SessionInfo | null;
}

export const StatusTiles: React.FC<StatusTilesProps> = ({ currentReading, session }) => {
  const [elapsedString, setElapsedString] = useState('00:00:00');
  const isChilled = Boolean(session?.chilling_reached_at);

  useEffect(() => {
    if (!session?.chilling_reached_at) {
      setElapsedString('00:00:00');
      return;
    }

    const updateTimer = () => {
      const start = new Date(session.chilling_reached_at!).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsedString(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session?.chilling_reached_at]);

  const hasReading = Boolean(currentReading);
  const tempVal = hasReading ? currentReading!.temperature_c : 0.0;
  const phVal = hasReading ? currentReading!.ph : 0.0;
  const tempStatus = hasReading ? currentReading!.temp_status : 'waiting';
  const phStatus = hasReading ? currentReading!.ph_status : 'waiting';
  const overallStatus = hasReading ? currentReading!.status : 'waiting';
  const hoursRemaining = hasReading ? currentReading!.estimated_hours_remaining : 0.0;

  const getTagClass = (status: string) => {
    if (status === 'safe') return 'tag-green';
    if (status === 'warning') return 'tag-amber';
    if (status === 'spoiling') return 'tag-red';
    return 'tag-blue';
  };

  return (
    <section className="kpi-strip-card">
      {/* 1. Temperature */}
      <div className="kpi-col">
        <div className="kpi-header">
          <div className="kpi-icon-circle">
            <Thermometer size={16} className="icon-blue" />
          </div>
          <span className="kpi-label">Milk Temperature</span>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-number">{tempVal.toFixed(1)}°C</span>
          <span className={`kpi-tag ${hasReading ? getTagClass(tempStatus) : 'tag-blue'}`}>
            {!hasReading
              ? 'No Hardware (0.0°C)'
              : tempStatus === 'safe'
              ? 'Safe 4–8°C'
              : tempStatus === 'warning'
              ? 'Warning'
              : 'Critical'}
          </span>
        </div>
        <div className="kpi-subtext">DS18B20 1-Wire Digital Probe</div>
      </div>

      <div className="kpi-divider" />

      {/* 2. Acidity / pH */}
      <div className="kpi-col">
        <div className="kpi-header">
          <div className="kpi-icon-circle">
            <Droplets size={16} className="icon-purple" />
          </div>
          <span className="kpi-label">Acidity / pH Level</span>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-number">{phVal.toFixed(2)}</span>
          <span className={`kpi-tag ${hasReading ? getTagClass(phStatus) : 'tag-blue'}`}>
            {!hasReading
              ? 'No Sensor (0.00)'
              : phStatus === 'safe'
              ? '≥6.40 Fresh'
              : phStatus === 'warning'
              ? 'Acidifying'
              : 'Sour / Curdled'}
          </span>
        </div>
        <div className="kpi-subtext">Calibrated Analog Glass Electrode</div>
      </div>

      <div className="kpi-divider" />

      {/* 3. Remaining Shelf Life */}
      <div className="kpi-col">
        <div className="kpi-header">
          <div className="kpi-icon-circle">
            <Clock size={16} className="icon-cyan" />
          </div>
          <span className="kpi-label">Estimated Shelf Life</span>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-number">{hoursRemaining.toFixed(1)} hrs</span>
          <span className={`kpi-tag ${hasReading ? getTagClass(overallStatus) : 'tag-blue'}`}>
            {!hasReading
              ? 'Standby (0.0 hrs)'
              : overallStatus === 'safe'
              ? '1.0x Safe rate'
              : '2.0x Penalty'}
          </span>
        </div>
        <div className="kpi-subtext">Dynamic cold-chain decay heuristic</div>
      </div>

      <div className="kpi-divider" />

      {/* 4. Elapsed Storage Timer */}
      <div className="kpi-col">
        <div className="kpi-header">
          <div className="kpi-icon-circle">
            <Timer size={16} className={isChilled ? 'icon-indigo' : 'icon-amber'} />
          </div>
          <span className="kpi-label">Chilling Storage Timer</span>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-number font-mono">{elapsedString}</span>
          <span className={`kpi-tag ${isChilled ? 'tag-green' : 'tag-amber'}`}>
            {!hasReading ? 'Standby' : isChilled ? 'Chilled (4–8°C)' : 'Cooling to 4–8°C'}
          </span>
        </div>
        <div className="kpi-subtext">
          {!hasReading
            ? 'Awaiting hardware connection or simulation'
            : isChilled
            ? 'Elapsed cold-chain storage duration'
            : 'Timer locks in when temp reaches 4.0–8.0°C'}
        </div>
      </div>
    </section>
  );
};
