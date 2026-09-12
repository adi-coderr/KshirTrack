'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Reading } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LiveChartsProps {
  readings: Reading[];
}

export const LiveCharts: React.FC<LiveChartsProps> = ({ readings }) => {
  const [dataWindow, setDataWindow] = useState<number>(30);

  const displayedReadings = dataWindow > 0 ? readings.slice(-dataWindow) : readings;

  const labels = displayedReadings.map((r) => {
    const d = new Date(r.timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const tempValues = displayedReadings.map((r) => r.temperature_c);
  const phValues = displayedReadings.map((r) => r.ph);

  const latestTemp = tempValues.length > 0 ? tempValues[tempValues.length - 1] : 5.4;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempValues,
        borderColor: '#4F46E5', // Royal Cobalt Blue matching screenshot
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(79, 70, 229, 0.08)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.22)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: displayedReadings.length <= 1 ? 6 : (displayedReadings.length > 40 ? 1.5 : 4),
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#4F46E5',
        yAxisID: 'yTemp',
      },
      {
        label: 'Acidity (pH)',
        data: phValues,
        borderColor: '#EC4899', // Coral Pink matching screenshot
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: displayedReadings.length <= 1 ? 6 : (displayedReadings.length > 40 ? 1.5 : 4),
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 1.5,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#EC4899',
        yAxisID: 'yPH',
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 350,
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#94A3B8',
          font: { family: 'Outfit', size: 10 },
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      yTemp: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 16,
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#64748B',
          font: { family: 'Outfit', size: 10 },
          callback: (v) => `${v}°C`,
          stepSize: 4,
        },
        border: { display: false },
      },
      yPH: {
        type: 'linear',
        position: 'right',
        min: 5.0,
        max: 7.5,
        grid: { display: false },
        ticks: {
          color: '#EC4899',
          font: { family: 'Outfit', size: 10 },
          callback: (v) => `${Number(v).toFixed(1)}pH`,
          stepSize: 0.5,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false }, // Custom legend used in header
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 10,
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const val = context.parsed.y != null ? context.parsed.y.toFixed(2) : '--';
            return ` ${label}: ${val}`;
          },
        },
      },
    },
  };

  return (
    <div id="charts-section" className="white-panel-card chart-panel-main">
      <div className="panel-header">
        <div className="chart-title-group">
          <span className="card-section-title">Cold-Chain Trends</span>
          <div className="floating-metric-badge">
            <span>{latestTemp.toFixed(1)}°C Live</span>
          </div>
        </div>

        {/* Legend matching screenshot dots */}
        <div className="chart-custom-legend">
          <div className="legend-item">
            <span className="legend-dot dot-blue" />
            <span className="legend-label">Temperature (°C)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-pink" />
            <span className="legend-label">Acidity (pH)</span>
          </div>

          <div className="timeframe-selector">
            <button
              type="button"
              onClick={() => setDataWindow(30)}
              className={`tf-pill ${dataWindow === 30 ? 'active' : ''}`}
            >
              30m
            </button>
            <button
              type="button"
              onClick={() => setDataWindow(60)}
              className={`tf-pill ${dataWindow === 60 ? 'active' : ''}`}
            >
              1h
            </button>
            <button
              type="button"
              onClick={() => setDataWindow(0)}
              className={`tf-pill ${dataWindow === 0 ? 'active' : ''}`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      <div className="chart-canvas-wrapper">
        {displayedReadings.length === 0 ? (
          <div className="chart-empty">Waiting for live sensor data stream...</div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};
