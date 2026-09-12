'use client';

import React from 'react';
import { Reading } from '@/types';
import { Cpu, Zap, Radio, Layers, Wind, ShieldCheck, Thermometer, Droplets } from 'lucide-react';

interface CanSchematicProps {
  currentReading: Reading | null;
}

export const CanSchematic: React.FC<CanSchematicProps> = ({ currentReading }) => {
  const temp = currentReading?.temperature_c ?? 5.4;
  const ph = currentReading?.ph ?? 6.64;
  const isSafe = (currentReading?.status ?? 'safe') === 'safe';
  const isWarning = currentReading?.status === 'warning';

  const milkFill = isSafe ? '#E0F2FE' : isWarning ? '#FEF3C7' : '#FEE2E2';
  const accentColor = isSafe ? '#10B981' : isWarning ? '#F59E0B' : '#EF4444';

  return (
    <div id="schematic-section" className="white-panel-card schematic-panel-clean">
      <div className="panel-header">
        <div>
          <span className="card-section-title">Physical Can Hardware & Cross-Section</span>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            40-Liter Vacuum Insulated Smart Chilling Can with integrated ESP32 Telemetry Node
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge-pill-light">
            <Radio size={12} color="#10B981" />
            <span>ESP32 WiFi Node</span>
          </span>
          <span className="badge-pill-light">
            <Zap size={12} color="#4F46E5" />
            <span>3.94V LiFePO4</span>
          </span>
        </div>
      </div>

      <div className="schematic-layout-grid">
        {/* Left: Vector Cutaway Container */}
        <div className="schematic-can-box">
          <div className="can-wireframe">
            {/* Top Lid */}
            <div className="schematic-lid">
              <span className="chip-badge">ESP32 GATEWAY</span>
            </div>

            {/* Cylinder Body */}
            <div className="schematic-cylinder">
              {/* Milk Liquid Fill */}
              <div className="schematic-liquid" style={{ backgroundColor: milkFill }}>
                <span className="capacity-label">40L CAPACITY</span>
              </div>

              {/* Temp Probe */}
              <div className="schematic-probe temp-probe">
                <div className="wire-line wire-blue" />
                <div className="probe-sensor" style={{ borderColor: accentColor }}>
                  <span className="sensor-tag">{temp.toFixed(1)}°C DS18B20</span>
                </div>
              </div>

              {/* pH Probe */}
              <div className="schematic-probe ph-probe">
                <div className="wire-line wire-pink" />
                <div className="probe-sensor" style={{ borderColor: accentColor }}>
                  <span className="sensor-tag">{ph.toFixed(2)} pH PROBE</span>
                </div>
              </div>
            </div>

            {/* Base Core */}
            <div className="schematic-base">
              <span>❄️ EUTECTIC COLD CORE</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Pinout Specs */}
        <div className="schematic-tech-info">
          <div className="tech-spec-row">
            <div className="tech-icon-circle">
              <Thermometer size={16} color="#4F46E5" />
            </div>
            <div className="tech-desc">
              <div className="tech-label">DS18B20 TEMPERATURE SENSOR</div>
              <div className="tech-val">Digital 1-Wire protocol &bull; Pin GPIO 4 (with 4.7kΩ pull-up)</div>
            </div>
          </div>

          <div className="tech-spec-row">
            <div className="tech-icon-circle">
              <Droplets size={16} color="#EC4899" />
            </div>
            <div className="tech-desc">
              <div className="tech-label">ANALOG pH PROBE MODULE</div>
              <div className="tech-val">Analog ADC input &bull; Pin GPIO 34 (ADC1_CH6 calibrated)</div>
            </div>
          </div>

          <div className="tech-spec-row">
            <div className="tech-icon-circle">
              <Cpu size={16} color="#10B981" />
            </div>
            <div className="tech-desc">
              <div className="tech-label">LOCAL EXPRESS + SQLITE SERVER</div>
              <div className="tech-val">Zero cloud dependency &bull; Local WiFi hotspot streaming</div>
            </div>
          </div>

          <div className="tech-spec-row">
            <div className="tech-icon-circle">
              <ShieldCheck size={16} color="#4F46E5" />
            </div>
            <div className="tech-desc">
              <div className="tech-label">COLD CHAIN PRESERVATION ALGORITHM</div>
              <div className="tech-val">Safe band: 4.0–8.0°C &bull; Accelerated decay penalty active if exceeded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
