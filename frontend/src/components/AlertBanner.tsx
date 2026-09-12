'use client';

import React from 'react';
import { AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Reading } from '@/types';

interface AlertBannerProps {
  currentReading: Reading | null;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ currentReading }) => {
  if (!currentReading) return null;

  const { status, temp_status, ph_status, temperature_c, ph } = currentReading;

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
