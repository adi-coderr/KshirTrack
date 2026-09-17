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
  const hasReading = Boolean(currentReading);
  const temp = hasReading ? currentReading!.temperature_c : 0.0;
  const ph = hasReading ? currentReading!.ph : 0.0;
  const status = hasReading ? currentReading!.status : 'waiting';
  const hoursRemaining = hasReading ? currentReading!.estimated_hours_remaining : 0.0;

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
            <span
              className={`avatar-status-dot ${!hasReading
                  ? 'dot-neutral'
                  : isSafe
                    ? 'dot-safe'
                    : isWarning
                      ? 'dot-warning'
                      : 'dot-danger'
                }`}
              style={!hasReading ? { backgroundColor: '#94A3B8' } : undefined}
            />
          </div>
          <div className="status-entity-details">
            <div className="entity-role">
              {!hasReading
                ? 'Standby (Awaiting Sensor Telemetry)'
                : isSafe
                  ? 'Cold Chain Fully Secured'
                  : isWarning
                    ? 'Temperature Warning Active'
                    : 'Critical Spoilage Alert'}
            </div>
            <div className="entity-name">
              Unit #CAN
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
          <div
            className={`btn-round-action ${!hasReading ? 'bg-blue' : isSafe ? 'bg-green' : isWarning ? 'bg-amber' : 'bg-red'
              }`}
            style={!hasReading ? { backgroundColor: '#94A3B8' } : undefined}
          >
            {isSafe ? <Check size={16} color="#FFF" /> : <AlertTriangle size={16} color="#FFF" />}
          </div>
        </div>
      </div>
    </div>
  );
};
