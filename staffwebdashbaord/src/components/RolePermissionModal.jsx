import React from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Award, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RolePermissionModal({ isOpen, onClose }) {
  const { currentStaff, roleName, department, permissions, isSuperAdmin } = useAuth();

  if (!isOpen) return null;

  // Group catalog of all system permissions by operational domain
  const PERMISSION_GROUPS = [
    {
      category: 'Roles & Access Control',
      perms: [
        { code: 'roles:read', label: 'View Role Catalog & Permissions' },
        { code: 'roles:write', label: 'Create & Edit Roles' },
        { code: 'roles:delete', label: 'Delete Roles' },
      ],
    },
    {
      category: 'Staff Operations',
      perms: [
        { code: 'staff:read', label: 'View Staff Directory & Profiles' },
        { code: 'staff:write', label: 'Register & Edit Staff Members' },
        { code: 'staff:delete', label: 'Deactivate / Delete Staff' },
      ],
    },
    {
      category: 'User Accounts & Verification',
      perms: [
        { code: 'users:read', label: 'View User Profiles' },
        { code: 'users:write', label: 'Update User Status & Details' },
        { code: 'users:verify_national_id', label: 'Fayda National ID Verification' },
      ],
    },
    {
      category: 'Drivers & Fleet Vehicles',
      perms: [
        { code: 'drivers:read', label: 'View Driver Rosters' },
        { code: 'drivers:verify', label: 'Approve & Verify Driver Documents' },
        { code: 'drivers:write', label: 'Edit Driver Status & Accounts' },
        { code: 'vehicles:read', label: 'View Fleet Vehicles' },
        { code: 'vehicles:write', label: 'Register & Inspect Vehicles' },
      ],
    },
    {
      category: 'Deliveries & Dispatch',
      perms: [
        { code: 'deliveries:read', label: 'View Live Delivery Tracking' },
        { code: 'deliveries:create', label: 'Create Direct Dispatch Requests' },
        { code: 'deliveries:dispatch', label: 'Assign & Dispatch Drivers' },
        { code: 'deliveries:cancel', label: 'Cancel & Re-route Deliveries' },
      ],
    },
    {
      category: 'Finance & Reconciliations',
      perms: [
        { code: 'finance:read', label: 'View Financial Ledgers & COD' },
        { code: 'finance:settle', label: 'Execute Driver Payouts & Settlements' },
        { code: 'finance:refund', label: 'Process Customer Refunds' },
      ],
    },
    {
      category: 'Audit & Safety',
      perms: [
        { code: 'audit:read', label: 'Inspect System Audit Logs' },
        { code: 'incidents:read', label: 'Review Safety Incident Reports' },
        { code: 'incidents:resolve', label: 'Resolve & Close Incidents' },
      ],
    },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#E6F4EE',
                color: '#00684A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="modal-title">Assigned Role & Permissions</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Granular operational privileges granted by backend RBAC matrix
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Summary Card */}
        <div
          style={{
            margin: '1.25rem 1.5rem 0.5rem',
            padding: '1rem 1.25rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <Award size={13} /> Active Role
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
              {roleName || 'Unassigned'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <Briefcase size={13} /> Department
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem', textTransform: 'capitalize' }}>
              {department || 'Operations'}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              <Hash size={13} /> Staff ID
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {currentStaff?.staffCode || 'N/A'}
            </div>
          </div>
        </div>

        {/* Scrollable Permissions List */}
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 }}>
          {isSuperAdmin && (
            <div
              style={{
                background: 'rgba(0, 104, 74, 0.08)',
                border: '1px solid #CCE9DC',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#00684A',
              }}
            >
              <ShieldCheck size={20} />
              <div>
                <strong>Super Admin Privilege Active</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                  This role possesses wildcard root clearance across every operational and administrative API endpoint.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {PERMISSION_GROUPS.map((group) => (
              <div
                key={group.category}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-secondary)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    marginBottom: '0.65rem',
                  }}
                >
                  {group.category}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {group.perms.map((perm) => {
                    const isGranted = isSuperAdmin || permissions.includes(perm.code);
                    return (
                      <div
                        key={perm.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          background: isGranted ? 'rgba(0, 104, 74, 0.04)' : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {isGranted ? (
                            <CheckCircle2 size={16} color="var(--brand-primary)" />
                          ) : (
                            <XCircle size={16} color="var(--text-dim)" />
                          )}
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isGranted ? 'var(--text-main)' : 'var(--text-dim)' }}>
                              {perm.label}
                            </div>
                            <code style={{ fontSize: '0.72rem', color: isGranted ? 'var(--brand-primary-light)' : 'var(--text-dim)' }}>
                              {perm.code}
                            </code>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: isGranted ? '#E6F4EE' : 'var(--bg-tertiary)',
                            color: isGranted ? '#00684A' : 'var(--text-dim)',
                            border: `1px solid ${isGranted ? '#CCE9DC' : 'var(--border-subtle)'}`,
                          }}
                        >
                          {isGranted ? 'Authorized' : 'Restricted'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-actions" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}

export default RolePermissionModal;
