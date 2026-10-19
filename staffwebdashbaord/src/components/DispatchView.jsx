import React from 'react';
import { MapPin, Radio, Compass, AlertCircle } from 'lucide-react';

export function DispatchView() {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Live Fleet Dispatch & Delivery Tracking</h2>
          <p className="panel-description">
            Phase 8: High-frequency GPS tracking and dispatch controls (Collection 18: delivery_tracking)
          </p>
        </div>
        <div className="connection-indicator">
          <span className="dot-live" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
          <span>Awaiting Phase 8 Fleet Stream</span>
        </div>
      </div>

      <div className="empty-state" style={{ padding: '5rem 2rem' }}>
        <div
          className="empty-icon"
          style={{
            width: '72px',
            height: '72px',
            background: '#E6F4EE',
            color: '#00684A',
          }}
        >
          <Compass size={36} />
        </div>
        <div className="empty-title">Fleet Dispatch Engine Scheduled for Phase 8</div>
        <div className="empty-desc" style={{ maxWidth: '480px' }}>
          Per the project architectural roadmap, real-time live map monitoring, delivery offers, and
          driver GPS socket relays will activate upon reaching <strong>Phase 8 (Deliveries & Tracking)</strong>.
          No mock drivers or stubbed telemetry coordinates are simulated.
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            background: 'var(--bg-tertiary)',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <AlertCircle size={14} color="#f59e0b" />
          <span>Zero Active Deliveries in Queue</span>
        </div>
      </div>
    </div>
  );
}

export default DispatchView;
