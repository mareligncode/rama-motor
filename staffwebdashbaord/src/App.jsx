import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StaffManagement } from './components/StaffManagement';
import { RoleManagement } from './components/RoleManagement';
import { DispatchView } from './components/DispatchView';
import { AuditView } from './components/AuditView';
import { AccessDenied } from './components/AccessDenied';
import { AuthModal } from './components/AuthModal';
import { RolePermissionModal } from './components/RolePermissionModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  ShieldAlert,
  Sun,
  Moon,
  KeyRound,
  LogIn,
  AlertCircle,
} from 'lucide-react';

function AppContent() {
  const {
    token,
    currentUser,
    currentStaff,
    roleName,
    department,
    isSuperAdmin,
    isAuthenticated,
    canAccessTab,
    login,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('staff');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [theme, setTheme] = useState(() => localStorage.getItem('rama_theme') || 'light');
  const [toasts, setToasts] = useState([]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('rama_theme', nextTheme);
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Health check
  useEffect(() => {
    const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:7000/api/v1').replace(/\/api\/v1\/?$/, '');
    fetch(`${apiHost}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.status === 'online') {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  // When staff logs in, adjust activeTab to their permitted module if current activeTab is unauthorized
  useEffect(() => {
    if (isAuthenticated && currentStaff) {
      if (!canAccessTab(activeTab)) {
        if (canAccessTab('dispatch')) setActiveTab('dispatch');
        else if (canAccessTab('staff')) setActiveTab('staff');
        else if (canAccessTab('roles')) setActiveTab('roles');
        else if (canAccessTab('audit')) setActiveTab('audit');
      }
    }
  }, [isAuthenticated, currentStaff]);

  const handleLogout = () => {
    logout();
    showToast('Logged out of staff operations successfully', 'success');
  };

  const handleAuthSuccess = ({ token, user }) => {
    login(token, user);
    showToast(`Welcome, ${user.fullName || 'Staff Member'}!`, 'success');
  };

  return (
    <div className={`app-layout theme-${theme}`}>
      <div className="ambient-glow" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onOpenPermissions={() => setIsPermissionsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Sticky Top Header */}
        <header className="top-bar">
          <div className="page-heading">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeTab === 'staff' && 'Staff Directory & Access Profiles'}
              {activeTab === 'roles' && 'Role Definitions & Permissions Matrix'}
              {activeTab === 'dispatch' && 'Live Fleet & Telemetry Dispatch'}
              {activeTab === 'audit' && 'Audit Trail & Compliance Ledger'}
            </span>
          </div>

          <div className="top-actions">
            {/* Authenticated Staff Status Pill */}
            {isAuthenticated && currentStaff && (
              <button
                onClick={() => setIsPermissionsModalOpen(true)}
                title="Click to view assigned permissions matrix"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-mint)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  color: 'var(--brand-primary)',
                  fontWeight: 600,
                }}
              >
                <Shield size={13} />
                <span>{roleName || 'Staff'}</span>
                <span style={{ opacity: 0.6 }}>•</span>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{department}</span>
              </button>
            )}

            {/* Three Type Brand Color Indicator */}
            <div
              title="Official 3 Brand Color Types: Forest Green (#00684A), Electric Mint (#008E5E), Warm Amber (#F59E0B)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.6rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00684A',
                  display: 'inline-block',
                }}
                title="Type 1: Forest Green #00684A"
              />
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#008E5E',
                  display: 'inline-block',
                }}
                title="Type 2: Electric Mint #008E5E"
              />
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#F59E0B',
                  display: 'inline-block',
                }}
                title="Type 3: Warm Amber #F59E0B"
              />
            </div>

            {/* Theme Toggle (Light / Dark) */}
            <button
              className="btn-icon"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              onClick={toggleTheme}
              style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-tertiary)',
              }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Connection Indicator */}
            <div className="connection-indicator">
              <span
                className="dot-live"
                style={{
                  background:
                    backendStatus === 'online'
                      ? 'var(--brand-green-500)'
                      : backendStatus === 'checking'
                      ? 'var(--brand-amber-500)'
                      : '#f43f5e',
                  boxShadow:
                    backendStatus === 'online'
                      ? '0 0 8px var(--brand-green-500)'
                      : 'none',
                }}
              />
              <span>
                Backend API: {backendStatus === 'online' ? 'Online (v1.0.0)' : backendStatus}
              </span>
            </div>

            {!isAuthenticated && (
              <button
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                <LogIn size={14} /> Staff Sign In
              </button>
            )}
          </div>
        </header>

        {/* Viewport Content with RBAC Protection */}
        <div className="content-body">
          {!isAuthenticated ? (
            <div
              className="panel-card"
              style={{
                maxWidth: '620px',
                margin: '3.5rem auto',
                textAlign: 'center',
                padding: '3.5rem 2rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(0, 104, 74, 0.12)',
                  color: '#00684A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  border: '1px solid rgba(0, 104, 74, 0.25)',
                }}
              >
                <Shield size={32} />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Rama Motor Operations Portal
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
                Access to employee profiles, roles configuration, dispatch controls, and audit trails requires authorization. Please sign in with your registered staff account to verify your role and permissions.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}
                >
                  <LogIn size={18} /> Sign In to Staff Operations
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Authenticated user without staff profile notice */}
              {!currentStaff && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertCircle size={20} color="#d97706" />
                    <span style={{ fontSize: '0.85rem', color: '#b45309' }}>
                      Authenticated as <strong>{currentUser?.fullName || currentUser?.phoneNumber}</strong>, but no Staff Profile is linked to your user account. Please contact an Operations Manager or Super Admin to assign your staff code and operational role.
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Tab Views with Granular RBAC Clearance */}
              {activeTab === 'staff' && (
                !canAccessTab('staff') ? (
                  <AccessDenied
                    requiredPermission="staff:read"
                    moduleName="Staff Directory"
                    onNavigate={setActiveTab}
                    onOpenPermissions={() => setIsPermissionsModalOpen(true)}
                  />
                ) : (
                  <StaffManagement showToast={showToast} />
                )
              )}

              {activeTab === 'roles' && (
                !canAccessTab('roles') ? (
                  <AccessDenied
                    requiredPermission="roles:read"
                    moduleName="Roles & Permissions"
                    onNavigate={setActiveTab}
                    onOpenPermissions={() => setIsPermissionsModalOpen(true)}
                  />
                ) : (
                  <RoleManagement showToast={showToast} />
                )
              )}

              {activeTab === 'dispatch' && (
                !canAccessTab('dispatch') ? (
                  <AccessDenied
                    requiredPermission="deliveries:read"
                    moduleName="Live Fleet Dispatch"
                    onNavigate={setActiveTab}
                    onOpenPermissions={() => setIsPermissionsModalOpen(true)}
                  />
                ) : (
                  <DispatchView />
                )
              )}

              {activeTab === 'audit' && (
                !canAccessTab('audit') ? (
                  <AccessDenied
                    requiredPermission="audit:read"
                    moduleName="Audit Trail Logs"
                    onNavigate={setActiveTab}
                    onOpenPermissions={() => setIsPermissionsModalOpen(true)}
                  />
                ) : (
                  <AuditView />
                )
              )}
            </>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
      />

      {/* Role & Permissions Inspector Modal */}
      <RolePermissionModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle size={18} color="var(--brand-green-500)" />
            ) : (
              <AlertTriangle size={18} color="#f43f5e" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
