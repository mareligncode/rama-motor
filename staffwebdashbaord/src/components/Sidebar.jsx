import React from 'react';
import {
  Users,
  ShieldCheck,
  MapPin,
  FileText,
  LogOut,
  Bike,
  Lock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab, onLogout, onOpenLogin, onOpenPermissions }) {
  const { currentStaff, roleName, department, canAccessTab, isAuthenticated, isSuperAdmin } = useAuth();

  const navItems = [
    {
      id: 'staff',
      label: 'Staff Directory',
      icon: Users,
      badge: 'Phase 3',
      requiredPerm: 'staff:read',
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: ShieldCheck,
      badge: 'Phase 3',
      requiredPerm: 'roles:read',
    },
    {
      id: 'dispatch',
      label: 'Live Fleet Dispatch',
      icon: MapPin,
      badge: 'Phase 8',
      requiredPerm: 'deliveries:read',
    },
    {
      id: 'audit',
      label: 'Audit Trail Logs',
      icon: FileText,
      badge: 'Phase 2',
      requiredPerm: 'audit:read',
    },
  ];

  // Helper to determine role badge colors
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Super Admin':
        return { bg: 'rgba(0, 104, 74, 0.15)', text: '#00684A', border: '#CCE9DC' };
      case 'Operations Manager':
        return { bg: 'rgba(0, 142, 94, 0.15)', text: '#008E5E', border: '#A7F3D0' };
      case 'Dispatcher':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#FDE68A' };
      case 'Finance Officer':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563EB', border: '#BFDBFE' };
      case 'Compliance & Auditor':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#7C3AED', border: '#DDD6FE' };
      default:
        return { bg: 'var(--bg-tertiary)', text: 'var(--text-muted)', border: 'var(--border-subtle)' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(roleName);

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-section">
        <div className="brand-logo">
          <Bike size={22} color="white" />
        </div>
        <div>
          <div className="brand-title">RAMA MOTOR</div>
          <div className="brand-subtitle">Staff Operations</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        <div
          style={{
            padding: '0 0.5rem 0.5rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
          }}
        >
          Operational Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const hasAccess = isAuthenticated ? canAccessTab(item.id) : false;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={hasAccess ? item.label : `Requires ${item.requiredPerm} permission`}
              style={{
                opacity: isAuthenticated && !hasAccess ? 0.65 : 1,
                position: 'relative',
              }}
            >
              <Icon size={18} className="nav-icon" />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>

              {isAuthenticated && !hasAccess ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    fontSize: '0.62rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}
                  title={`Locked: Requires ${item.requiredPerm}`}
                >
                  <Lock size={10} /> Locked
                </span>
              ) : item.badge ? (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(0, 142, 94, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#34d399' : '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile & RBAC Indicator */}
      <div className="sidebar-footer">
        {currentStaff ? (
          <div>
            <div className="user-badge" style={{ marginBottom: '0.5rem' }}>
              <div className="user-avatar">
                {currentStaff.userId?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="user-info">
                <div className="user-name" title={currentStaff.userId?.fullName}>
                  {currentStaff.userId?.fullName || 'Staff User'}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    background: badgeStyle.bg,
                    color: badgeStyle.text,
                    border: `1px solid ${badgeStyle.border}`,
                    display: 'inline-block',
                    marginTop: '0.15rem',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={roleName || department}
                >
                  {roleName || department}
                </div>
              </div>
              <button
                className="btn-icon"
                title="Logout"
                onClick={onLogout}
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Quick RBAC Action Buttons */}
            <button
              onClick={onOpenPermissions}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--brand-primary)';
                e.currentTarget.style.borderColor = 'var(--border-mint)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <KeyRound size={13} />
              <span>Inspect Role Permissions</span>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={onOpenLogin}
          >
            Staff Authenticate
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
