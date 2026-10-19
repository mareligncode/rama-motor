import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, Phone, ArrowRight } from 'lucide-react';
import api, { setStoredToken, setStoredUser } from '../services/api';

export function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('0911223344');
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(phoneNumber.trim(), 'login');
      showToast(res.message || 'OTP sent successfully', 'success');
      if (res.data?.devCode) {
        setDevCode(res.data.devCode);
        setOtpCode(res.data.devCode);
      }
      setStep('otp');
    } catch (err) {
      showToast(err.message || 'Failed to request OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      showToast('Please enter the OTP verification code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOtp(phoneNumber.trim(), otpCode.trim(), 'login');
      const token = res.data?.token;
      const user = res.data?.user;

      if (!token) {
        throw new Error('Authentication token not received');
      }

      setStoredToken(token);
      setStoredUser(user);

      showToast(`Welcome back, ${user.fullName || 'Staff Member'}!`, 'success');
      onAuthSuccess({ token, user });
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to verify OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#E6F4EE',
                color: '#00684A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 className="modal-title">Staff Portal Login</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Sign in to Rama Motor Operations Dashboard using your registered staff phone number.
            </p>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', width: '100%' }}
                  placeholder="e.g. 0911223344 or +251..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-actions" style={{ borderTop: 'none', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Request Access Code'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Enter the 6-digit verification code sent to <strong>{phoneNumber}</strong>
            </p>

            {devCode && (
              <div
                style={{
                  background: '#E6F4EE',
                  border: '1px solid #CCE9DC',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  fontSize: '0.82rem',
                  color: '#00684A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                <span>Development Test OTP:</span>
                <strong style={{ letterSpacing: '0.1em', fontSize: '1rem', color: '#00684A' }}>{devCode}</strong>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Verification Code (OTP)</label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: '2.4rem',
                    width: '100%',
                    letterSpacing: '0.2em',
                    fontSize: '1.1rem',
                  }}
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                onClick={() => setStep('phone')}
              >
                Change Phone
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Enter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
