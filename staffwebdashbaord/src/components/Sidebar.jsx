import React from 'react';
import {
  Users,
  ShieldCheck,
  MapPin,
  FileText,
  LogOut,
  Bike,
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, currentStaff, onLogout, onOpenLogin }) {
  const navItems = [
    { id: 'staff', label: 'Staff Directory', icon: Users, badge: 'Phase 3' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck, badge: 'Phase 3' },
    { id: 'dispatch', label: 'Live Fleet Dispatch', icon: MapPin, badge: 'Phase 8' },
    { id: 'audit', label: 'Audit Trail Logs', icon: FileText, badge: 'Phase 2' },
  ];

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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} className="nav-icon" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
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
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {currentStaff ? (
          <div className="user-badge">
            <div className="user-avatar">
              {currentStaff.userId?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentStaff.userId?.fullName || 'Staff User'}</div>
              <div className="user-role-tag">
                {currentStaff.roleId?.name || currentStaff.department}
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
