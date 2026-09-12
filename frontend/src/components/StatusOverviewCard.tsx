'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Check, Play, ExternalLink } from 'lucide-react';
import { Reading } from '@/types';

interface StatusOverviewCardProps {
  currentReading: Reading | null;
  onOpenSchematic: () => void;
}

export const StatusOverviewCard: React.FC<StatusOverviewCardProps> = ({
  currentReading,
  onOpenSchematic,
}) => {
  const temp = currentReading?.temperature_c ?? 5.4;
  const ph = currentReading?.ph ?? 6.64;
  const status = currentReading?.status ?? 'safe';
  const hoursRemaining = currentReading?.estimated_hours_remaining ?? 8.0;

  const isSafe = status === 'safe';
  const isWarning = status === 'warning';

  return (
    <div className="status-overview-card">
      <div className="overview-header">
        <span className="card-section-title">Can Core Telemetry Status</span>
        <button type="button" className="more-dots-btn">•••</button>
      </div>

      <div className="overview-body">
        <div className="status-entity-wrap">
          <div className="status-avatar-circle">
            <span style={{ fontSize: '20px' }}>🥛</span>
            <span className={`avatar-status-dot ${isSafe ? 'dot-safe' : isWarning ? 'dot-warning' : 'dot-danger'}`} />
          </div>
          <div className="status-entity-details">
            <div className="entity-role">
              {isSafe ? 'Cold Chain Fully Secured' : isWarning ? 'Temperature Warning Active' : 'Critical Spoilage Alert'}
            </div>
            <div className="entity-name">
              Unit #CAN-40L (40L Insulated Can)
            </div>
          </div>
        </div>

        <div className="status-metric-col">
          <div className="metric-col-label">Current Readings</div>
          <div className="metric-col-val">
            <strong>{temp.toFixed(1)}°C</strong> &bull; {ph.toFixed(2)} pH
          </div>
        </div>

        <div className="status-metric-col">
          <div className="metric-col-label">Preservation Window</div>
          <div className="metric-col-val">
            <strong>{hoursRemaining.toFixed(1)} hrs</strong> remaining
          </div>
        </div>

        <div className="status-actions-col">
          <button
            type="button"
            onClick={onOpenSchematic}
            className="btn-pill-outline"
          >
            View Blueprint
          </button>
          <div className={`btn-round-action ${isSafe ? 'bg-green' : isWarning ? 'bg-amber' : 'bg-red'}`}>
            {isSafe ? <Check size={16} color="#FFF" /> : <AlertTriangle size={16} color="#FFF" />}
          </div>
        </div>
      </div>
    </div>
  );
};
