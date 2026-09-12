'use client';

import React from 'react';
import Link from 'next/link';
import { Reading } from '@/types';
import { Download, ExternalLink, ArrowRight } from 'lucide-react';
import { getExportUrl } from '@/lib/api';

interface RecentReadingsTableProps {
  readings: Reading[];
}

export const RecentReadingsTable: React.FC<RecentReadingsTableProps> = ({ readings }) => {
  const recent = [...readings].reverse().slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    if (status === 'safe') return 'badge-pill-green';
    if (status === 'warning') return 'badge-pill-amber';
    return 'badge-pill-red';
  };

  return (
    <div className="white-panel-card table-panel-main">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="card-section-title">Telemetry Audit Stream</span>
          <span className="count-badge">{readings.length} total</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            href={getExportUrl()}
            download
            className="btn-export-light"
            title="Download CSV report for judges"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </a>

          <Link href="/history" className="view-all-link">
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="light-table">
          <thead>
            <tr>
              <th>Node / Reading ID</th>
              <th>Server Timestamp</th>
              <th>Temperature</th>
              <th>pH Level</th>
              <th>Health Status</th>
              <th>Safe Window</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                  No readings recorded yet. Start the test feed or connect ESP32.
                </td>
              </tr>
            ) : (
              recent.map((row, idx) => (
                <tr key={row.id}>
                  <td>
                    <div className="table-entity-cell">
                      <div className="entity-avatar-sm">
                        <span>🥛</span>
                      </div>
                      <span className="entity-code">#042{row.id}</span>
                    </div>
                  </td>
                  <td className="text-muted">
                    {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: row.temp_status === 'safe' ? '#059669' : row.temp_status === 'warning' ? '#D97706' : '#DC2626' }}>
                      {row.temperature_c.toFixed(1)}°C
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: row.ph_status === 'safe' ? '#059669' : row.ph_status === 'warning' ? '#D97706' : '#DC2626' }}>
                      {row.ph.toFixed(2)} pH
                    </span>
                  </td>
                  <td>
                    <span className={`table-status-pill ${getStatusBadgeClass(row.status)}`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-mono text-muted">
                    {row.estimated_hours_remaining.toFixed(1)} hrs
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
