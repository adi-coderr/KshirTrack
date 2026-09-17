'use client';

import React from 'react';
import { Play, Square, FastForward, ShieldCheck, AlertTriangle, AlertOctagon, RotateCcw, Sliders } from 'lucide-react';
import { SimulatorStatus } from '@/types';

interface SimulatorControlsProps {
  status: SimulatorStatus | null;
  onToggle: () => void;
  onSelectScenario: (scenario: SimulatorStatus['scenario']) => void;
  onSelectInterval: (intervalMs: number) => void;
  onResetData: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  status,
  onToggle,
  onSelectScenario,
  onSelectInterval,
  onResetData,
}) => {
  const currentScenario = status?.scenario || 'normal_cooling';
  const isActive = status?.active ?? false;
  const currentInterval = status?.intervalMs || 3000;

  return (
    <div className="simulator-light-bar">
      <div className="sim-bar-left">
        <div className="sim-badge-dot">
          <span className={`pulse-bubble ${isActive ? 'pulse-green' : 'pulse-gray'}`} />
          <span className="sim-bar-title">DEMO BENCH:</span>
        </div>

        <div className="sim-scenarios-group">
          <button
            type="button"
            onClick={() => onSelectScenario('fresh_milk_cooling')}
            className={`sim-pill-btn ${currentScenario === 'fresh_milk_cooling' ? 'active' : ''}`}
            title="Fresh Warm Milk (20.5°C -> Cools down to 4–8°C to start timer)"
          >
            <span>🥛 Fresh Milk (Cooling)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('normal_cooling')}
            className={`sim-pill-btn ${currentScenario === 'normal_cooling' ? 'active' : ''}`}
            title="Safe Chilling (4.8°C, pH 6.65)"
          >
            <ShieldCheck size={13} className="text-green" />
            <span>Safe (4.8°C)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('temperature_warning')}
            className={`sim-pill-btn ${currentScenario === 'temperature_warning' ? 'active' : ''}`}
            title="Warming Warning (8.8°C)"
          >
            <AlertTriangle size={13} className="text-amber" />
            <span>Warm Alert (8.8°C)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('temperature_spoilage')}
            className={`sim-pill-btn ${currentScenario === 'temperature_spoilage' ? 'active' : ''}`}
            title="Thermal Spoilage (>11°C)"
          >
            <AlertOctagon size={13} className="text-red" />
            <span>Spoilage (&gt;11°C)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('acidification_spoilage')}
            className={`sim-pill-btn ${currentScenario === 'acidification_spoilage' ? 'active' : ''}`}
            title="Milk Souring (pH < 6.0)"
          >
            <span>🧪 Acidic (&lt;6.0)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('rapid_demo')}
            className={`sim-pill-btn fast-demo-btn ${currentScenario === 'rapid_demo' ? 'active' : ''}`}
            title="Judge Fast-Cycle (40s all states)"
          >
            <FastForward size={13} />
            <span>⚡ Fast Cycle (40s)</span>
          </button>
        </div>
      </div>

      <div className="sim-bar-right">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={onToggle}
          className={`sim-action-toggle ${isActive ? 'btn-stop' : 'btn-start'}`}
        >
          {isActive ? <Square size={12} /> : <Play size={12} />}
          <span>{isActive ? 'Pause Feed' : 'Start Feed'}</span>
        </button>

        {/* Speed */}
        <div className="rate-segmented">
          {[
            { label: '1.5s', val: 1500 },
            { label: '3s', val: 3000 },
            { label: '10s', val: 10000 },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => onSelectInterval(item.val)}
              className={`rate-opt ${currentInterval === item.val ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onResetData}
          className="sim-reset-icon-btn"
          title="Reset Test Data"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
};
