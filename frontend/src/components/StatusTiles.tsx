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

  useEffect(() => {
    if (!session?.started_at) return;

    const updateTimer = () => {
      const start = new Date(session.started_at).getTime();
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
  }, [session?.started_at]);

  const tempVal = currentReading ? currentReading.temperature_c : null;
  const phVal = currentReading ? currentReading.ph : null;
  const tempStatus = currentReading ? currentReading.temp_status : 'waiting';
  const phStatus = currentReading ? currentReading.ph_status : 'waiting';
  const overallStatus = currentReading ? currentReading.status : 'waiting';
  const hoursRemaining = currentReading ? currentReading.estimated_hours_remaining : 8.0;

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
          <span className="kpi-number">{tempVal !== null ? tempVal.toFixed(1) : '--'}°C</span>
          <span className={`kpi-tag ${getTagClass(tempStatus)}`}>
            {tempStatus === 'safe' ? 'Safe 4–8°C' : tempStatus === 'warning' ? 'Warning' : tempStatus === 'spoiling' ? 'Critical' : 'Awaiting ESP32'}
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
          <span className="kpi-number">{phVal !== null ? phVal.toFixed(2) : '--'}</span>
          <span className={`kpi-tag ${getTagClass(phStatus)}`}>
            {phStatus === 'safe' ? '≥6.40 Fresh' : phStatus === 'warning' ? 'Acidifying' : phStatus === 'spoiling' ? 'Sour / Curdled' : 'Awaiting ESP32'}
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
          <span className={`kpi-tag ${getTagClass(overallStatus)}`}>
            {overallStatus === 'safe' ? '1.0x Safe rate' : '2.0x Penalty'}
          </span>
        </div>
        <div className="kpi-subtext">Dynamic cold-chain decay heuristic</div>
      </div>

      <div className="kpi-divider" />

      {/* 4. Elapsed Storage Timer */}
      <div className="kpi-col">
        <div className="kpi-header">
          <div className="kpi-icon-circle">
            <Timer size={16} className="icon-indigo" />
          </div>
          <span className="kpi-label">Storage Session Time</span>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-number font-mono">{elapsedString}</span>
          <span className="kpi-tag tag-blue">Active session</span>
        </div>
        <div className="kpi-subtext">Elapsed since milk poured into can</div>
      </div>
    </section>
  );
};
