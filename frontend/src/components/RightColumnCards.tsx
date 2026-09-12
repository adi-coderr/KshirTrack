'use client';

import React from 'react';
import { ShieldCheck, Cpu, Database, Thermometer, Droplets, BatteryCharging } from 'lucide-react';
import { Reading } from '@/types';

interface RightColumnCardsProps {
  currentReading: Reading | null;
}

export const RightColumnCards: React.FC<RightColumnCardsProps> = ({ currentReading }) => {
  const temp = currentReading?.temperature_c ?? 5.4;
  const ph = currentReading?.ph ?? 6.64;

  const purityPct = ph >= 6.4 ? 99.2 : ph >= 6.0 ? 76.5 : 32.0;
  const chillingPct = temp <= 8.0 ? 94 : temp <= 10.0 ? 68 : 25;
  const insulationPct = 98;
  const suppressionPct = ph >= 6.4 ? 96 : 48;
  const batteryPct = 91;

  return (
    <div className="right-cards-col">
      {/* CARD 1: Quality & Preservation Insights (Matches Countries Insight in screenshot) */}
      <div className="white-panel-card">
        <div className="panel-header">
          <span className="card-section-title">Cold-Chain Insights</span>
          <button type="button" className="more-dots-btn">•••</button>
        </div>

        <div className="insights-list">
          {/* Item 1 */}
          <div className="insight-row">
            <div className="insight-name-wrap">
              <span className="insight-flag">🥛</span>
              <span className="insight-title">Grade A Milk Purity</span>
            </div>
            <div className="insight-bar-col">
              <div className="insight-bar-track">
                <div className="insight-bar-fill" style={{ width: `${purityPct}%` }} />
              </div>
            </div>
            <span className="insight-percent">{purityPct}%</span>
          </div>

          {/* Item 2 */}
          <div className="insight-row">
            <div className="insight-name-wrap">
              <span className="insight-flag">❄️</span>
              <span className="insight-title">Core Chilling Index</span>
            </div>
            <div className="insight-bar-col">
              <div className="insight-bar-track">
                <div className="insight-bar-fill" style={{ width: `${chillingPct}%`, backgroundColor: chillingPct < 50 ? '#EF4444' : '#4F46E5' }} />
              </div>
            </div>
            <span className="insight-percent">{chillingPct}%</span>
          </div>

          {/* Item 3 */}
          <div className="insight-row">
            <div className="insight-name-wrap">
              <span className="insight-flag">🛡️</span>
              <span className="insight-title">Vacuum Insulation</span>
            </div>
            <div className="insight-bar-col">
              <div className="insight-bar-track">
                <div className="insight-bar-fill" style={{ width: `${insulationPct}%` }} />
              </div>
            </div>
            <span className="insight-percent">{insulationPct}%</span>
          </div>

          {/* Item 4 */}
          <div className="insight-row">
            <div className="insight-name-wrap">
              <span className="insight-flag">🧪</span>
              <span className="insight-title">Acid Suppression</span>
            </div>
            <div className="insight-bar-col">
              <div className="insight-bar-track">
                <div className="insight-bar-fill" style={{ width: `${suppressionPct}%`, backgroundColor: suppressionPct < 50 ? '#F59E0B' : '#4F46E5' }} />
              </div>
            </div>
            <span className="insight-percent">{suppressionPct}%</span>
          </div>

          {/* Item 5 */}
          <div className="insight-row">
            <div className="insight-name-wrap">
              <span className="insight-flag">🔋</span>
              <span className="insight-title">Node Battery Backup</span>
            </div>
            <div className="insight-bar-col">
              <div className="insight-bar-track">
                <div className="insight-bar-fill" style={{ width: `${batteryPct}%` }} />
              </div>
            </div>
            <span className="insight-percent">{batteryPct}%</span>
          </div>
        </div>
      </div>

      {/* CARD 2: Active Sensors & Modules (Matches Current Vacancies in screenshot) */}
      <div className="white-panel-card">
        <div className="panel-header">
          <span className="card-section-title">Active Node Hardware</span>
          <button type="button" className="more-dots-btn">•••</button>
        </div>

        <div className="hardware-list">
          {/* Row 1 */}
          <div className="hw-row">
            <div className="hw-icon-circle hw-icon-blue">
              <Thermometer size={16} />
            </div>
            <div className="hw-text-col">
              <div className="hw-title">DS18B20 Temp Probe</div>
              <div className="hw-sub">GPIO 4 &bull; 1-Wire Digital</div>
            </div>
            <span className="hw-link-action">Active</span>
          </div>

          {/* Row 2 */}
          <div className="hw-row">
            <div className="hw-icon-circle hw-icon-purple">
              <Droplets size={16} />
            </div>
            <div className="hw-text-col">
              <div className="hw-title">Analog pH Electrode</div>
              <div className="hw-sub">GPIO 34 &bull; ADC1_CH6</div>
            </div>
            <span className="hw-link-action">Calibrated</span>
          </div>

          {/* Row 3 */}
          <div className="hw-row">
            <div className="hw-icon-circle hw-icon-indigo">
              <Database size={16} />
            </div>
            <div className="hw-text-col">
              <div className="hw-title">Local SQLite Engine</div>
              <div className="hw-sub">Prisma ORM &bull; dev.db</div>
            </div>
            <span className="hw-link-action">0 Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
