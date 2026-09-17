'use client';

import React from 'react';
import { AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Reading, SessionInfo } from '@/types';

interface AlertBannerProps {
  currentReading: Reading | null;
  session?: SessionInfo | null;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ currentReading, session }) => {
  if (!currentReading || (currentReading.temperature_c === 0 && currentReading.ph === 0)) return null;

  const { status, temp_status, ph_status, temperature_c, ph } = currentReading;
  const isPreCooling = session?.state === 'cooling' || !session?.chilling_reached_at;

  // If in pre-cooling phase with fresh milk cooling down
  if (isPreCooling && temperature_c > 8.0 && ph >= 6.4) {
    return (
      <div className="light-alert-card alert-info" style={{ background: '#F0F9FF', borderColor: '#BAE6FD' }}>
        <div className="alert-left-group">
          <div className="alert-icon-wrap icon-blue" style={{ background: '#E0F2FE', color: '#0284C7' }}>
            <span style={{ fontSize: '18px' }}>🥛</span>
          </div>
          <div>
            <div className="alert-card-title" style={{ color: '#0369A1' }}>
              Fresh Milk Pre-Chilling in Progress ({temperature_c.toFixed(1)}°C)
            </div>
            <div className="alert-card-desc" style={{ color: '#0284C7' }}>
              Fresh batch loaded. Storage countdown timer will lock in automatically when milk reaches 4.0°C–8.0°C.
            </div>
          </div>
        </div>
        <div className="alert-right-badge">
          <span className="pill-badge" style={{ background: '#0284C7', color: '#FFF' }}>
            TARGETING 4.0–8.0°C
          </span>
        </div>
      </div>
    );
  }

  if (status === 'safe') {
    return null;
  }

  const isSpoiling = status === 'spoiling';

  let alertTitle = '';
  let alertDesc = '';

  if (temp_status !== 'safe' && ph_status !== 'safe') {
    alertTitle = isSpoiling ? 'Critical Temperature & Acidity Anomaly' : 'Thermal & pH Drift Detected';
    alertDesc = `Current: ${temperature_c.toFixed(1)}°C and ${ph.toFixed(2)} pH. Milk preservation window compromised.`;
  } else if (temp_status !== 'safe') {
    alertTitle = isSpoiling ? 'Critical Thermal Spoilage (>10°C)' : 'Temperature Warning (Outside 4–8°C Band)';
    alertDesc = `Milk core temperature is ${temperature_c.toFixed(1)}°C. Check chilling jacket immediately.`;
  } else {
    alertTitle = isSpoiling ? 'Milk Acidification Alert (<6.00 pH)' : 'Early Lactic Acidity Shift (6.00–6.39 pH)';
    alertDesc = `pH reading is ${ph.toFixed(2)}. Bacterial fermentation detected; do not mix with fresh bulk vat.`;
  }

  return (
    <div className={`light-alert-card ${isSpoiling ? 'alert-spoiling' : 'alert-warning'}`}>
      <div className="alert-left-group">
        <div className={`alert-icon-wrap ${isSpoiling ? 'icon-red' : 'icon-amber'}`}>
          {isSpoiling ? <AlertOctagon size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div>
          <div className="alert-card-title">{alertTitle}</div>
          <div className="alert-card-desc">{alertDesc}</div>
        </div>
      </div>
      <div className="alert-right-badge">
        <span className={`pill-badge ${isSpoiling ? 'badge-danger' : 'badge-warning'}`}>
          {isSpoiling ? 'SPOILAGE ALERT' : 'WARNING ACTIVE'}
        </span>
      </div>
    </div>
  );
};
