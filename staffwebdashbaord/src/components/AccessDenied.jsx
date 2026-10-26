import React from 'react';
import { ShieldAlert, ArrowLeft, Key, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AccessDenied({ requiredPermission, moduleName, onNavigate, onOpenPermissions }) {
  const { roleName, department, currentStaff } = useAuth();

  return (
    <div className="panel-card" style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <ShieldAlert size={32} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
        Access Restricted: {moduleName}
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
        Your account role does not have authorization to view or manage the <strong>{moduleName}</strong> module.
        Access to this operational area requires the <code>{requiredPermission}</code> permission clearance.
      </p>

      {/* Staff Role Card */}
      <div
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'left',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Role
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {roleName || 'Unassigned Role'}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Department
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem', textTransform: 'capitalize' }}>
            {department || 'General'}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Staff Code
          </span>
          <div style={{ fontWeight: 600, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
            {currentStaff?.staffCode || 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={onOpenPermissions}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Key size={16} /> View My Permissions
        </button>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate('dispatch')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Return to Operations
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;
