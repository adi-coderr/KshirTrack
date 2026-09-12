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

  // Format timestamps into clean HH:MM:SS
  const labels = displayedReadings.map((r) => {
    const d = new Date(r.timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  const tempValues = displayedReadings.map((r) => r.temperature_c);
  const phValues = displayedReadings.map((r) => r.ph);

  const latestTemp = tempValues.length > 0 ? tempValues[tempValues.length - 1] : 5.4;
  const latestPH = phValues.length > 0 ? phValues[phValues.length - 1] : 6.64;

  // Calculate peak point indices to highlight dots like in reference image
  const peakTempIndex = tempValues.length > 0
    ? tempValues.indexOf(Math.max(...tempValues))
    : 0;

  const peakPHIndex = phValues.length > 0
    ? phValues.indexOf(Math.max(...phValues))
    : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempValues,
        borderColor: '#D49A38', // Golden Ochre / Mustard Amber matching reference image
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(212, 154, 56, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(212, 154, 56, 0.32)');
          gradient.addColorStop(0.65, 'rgba(212, 154, 56, 0.10)');
          gradient.addColorStop(1, 'rgba(212, 154, 56, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.48, // Smooth wave spline matching reference
        borderWidth: 2.2,
        pointRadius: (ctx: any) => {
          const idx = ctx.dataIndex;
          const total = tempValues.length;
          // Highlight peak or latest point with a large golden circle like reference image
          if (total <= 1 || idx === peakTempIndex || idx === total - 1) return 6.5;
          return total > 35 ? 0 : 3;
        },
        pointBackgroundColor: '#D49A38',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#D49A38',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2.5,
        yAxisID: 'yTemp',
      },
      {
        label: 'Acidity (pH)',
        data: phValues,
        borderColor: '#38524D', // Deep Slate Charcoal Teal matching reference image
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(56, 82, 77, 0.08)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(56, 82, 77, 0.26)');
          gradient.addColorStop(0.65, 'rgba(56, 82, 77, 0.08)');
          gradient.addColorStop(1, 'rgba(56, 82, 77, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.48, // Smooth wave spline matching reference
        borderWidth: 2.2,
        pointRadius: (ctx: any) => {
          const idx = ctx.dataIndex;
          const total = phValues.length;
          // Highlight peak or latest point with a slate circle like reference image
          if (total <= 1 || idx === peakPHIndex || idx === total - 1) return 6.5;
          return total > 35 ? 0 : 3;
        },
        pointBackgroundColor: '#38524D',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#38524D',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2.5,
        yAxisID: 'yPH',
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 350,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false, // Clean look matching reference
        },
        ticks: {
          color: '#8A9BA8',
          font: { family: 'Outfit', size: 11, weight: 500 },
          maxTicksLimit: 7,
          padding: 8,
        },
        border: { display: false },
      },
      yTemp: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 12,
        grid: {
          color: 'rgba(241, 245, 249, 0.9)',
          lineWidth: 1,
        },
        ticks: {
          color: '#8A9BA8',
          font: { family: 'Outfit', size: 11, weight: 500 },
          callback: (v) => `${v}`,
          stepSize: 2,
          padding: 8,
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
          color: '#38524D',
          font: { family: 'Outfit', size: 11, weight: 600 },
          callback: (v) => `${Number(v).toFixed(1)} pH`,
          stepSize: 0.5,
          padding: 8,
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        // Speech bubble tooltip style matching reference screenshot
        enabled: true,
        backgroundColor: '#283834', // Dark charcoal teal matching reference callout
        titleColor: '#FFFFFF',
        bodyColor: '#B2C6C1',
        cornerRadius: 12,
        caretSize: 8,
        caretPadding: 6,
        padding: { top: 10, bottom: 10, left: 16, right: 16 },
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
        titleFont: {
          family: 'Outfit',
          size: 15,
          weight: 'bold',
        },
        bodyFont: {
          family: 'Outfit',
          size: 11,
          weight: 500,
        },
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const first = items[0];
            const val = first.parsed.y != null ? first.parsed.y : 0;
            return first.datasetIndex === 0
              ? `${val.toFixed(1)}°C`
              : `${val.toFixed(2)} pH`;
          },
          label: (item) => {
            return item.datasetIndex === 0 ? 'Temperature' : 'Acidity Level';
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
          {/* Callout badge styled like the dark pill in the reference */}
          <div className="reference-callout-pill">
            <span className="callout-value">{latestTemp.toFixed(1)}°C</span>
            <span className="callout-label">Live Temp</span>
          </div>
        </div>

        {/* Custom Legend matching reference image colors */}
        <div className="chart-custom-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#D49A38' }} />
            <span className="legend-label" style={{ fontWeight: 600 }}>Temperature (°C)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#38524D' }} />
            <span className="legend-label" style={{ fontWeight: 600 }}>Acidity (pH)</span>
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

      <div className="chart-canvas-wrapper" style={{ height: '260px' }}>
        {displayedReadings.length === 0 ? (
          <div className="chart-empty">Waiting for live sensor data stream...</div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};
