import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StaffManagement } from './components/StaffManagement';
import { RoleManagement } from './components/RoleManagement';
import { DispatchView } from './components/DispatchView';
import { AuthModal } from './components/AuthModal';
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import api, { getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('staff');
  const [currentStaff, setCurrentStaff] = useState(null);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  // Fetch logged in staff profile if token exists
  const loadProfile = async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const res = await api.getStaffMe();
      if (res?.data?.staff) {
        setCurrentStaff(res.data.staff);
      }
    } catch {
      // User might be authenticated without a staff profile or token expired
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    setCurrentStaff(null);
    showToast('Logged out successfully', 'success');
  };

  const handleAuthSuccess = ({ user }) => {
    setCurrentUser(user);
    loadProfile();
  };

  return (
    <div className={`app-layout theme-${theme}`}>
      <div className="ambient-glow" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStaff={currentStaff}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Sticky Top Header */}
        <header className="top-bar">
          <div className="page-heading">
            <span>
              {activeTab === 'staff' && 'Staff Directory & Access Profiles'}
              {activeTab === 'roles' && 'Role Definitions & Permissions Matrix'}
              {activeTab === 'dispatch' && 'Live Fleet & Telemetry Dispatch'}
            </span>
          </div>

          <div className="top-actions">
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

            {!currentStaff && (
              <button
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                <Shield size={14} /> Staff Login
              </button>
            )}
          </div>
        </header>

        {/* Viewport Content */}
        <div className="content-body">
          {activeTab === 'staff' && <StaffManagement showToast={showToast} />}
          {activeTab === 'roles' && <RoleManagement showToast={showToast} />}
          {activeTab === 'dispatch' && <DispatchView />}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
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

export default App;
