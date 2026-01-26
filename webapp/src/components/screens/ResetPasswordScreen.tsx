import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { resetPassword } from '@/api/authApi';
import { toast } from 'react-toastify';
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';
import './ResetPasswordScreen.css';

interface ResetPasswordScreenProps {
  onProceed?: () => void;
  onBack?: () => void;
  code?: string;
  email?: string;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onProceed,
  onBack,
  code: propCode,
  email: propEmail,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateCode = location.state?.code;
  const stateEmail = location.state?.email;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');

  const handleReset = async () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    const email = propEmail || stateEmail;

    if (!email) {
      toast.error('Invalid reset session');
      return;
    }

    setLoading(true);
    try {
      // Note: Mobile app doesn't send verificationCode, just email and password
      await resetPassword(email, password);
      setShowSuccess(true);
      toast.success('Password reset successfully!');

      setTimeout(() => {
        if (onProceed) {
          onProceed();
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-scroll-content">
        {/* Top White Section (Empty for spacing) */}
        <div className="reset-password-top-section"></div>

        {/* Content Container with Gray Background */}
        <div className="reset-password-content">
          {/* Email Input (Read-only) */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="text-input"
              value={propEmail || stateEmail || ''}
              readOnly
            />
          </div>

          {/* New Password Input */}
          <div className="input-group">
            <label className="input-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} color="#666" /> : <EyeOff size={20} color="#666" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReset()}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <Eye size={20} color="#666" /> : <EyeOff size={20} color="#666" />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          {/* <div className="checkbox-container">
            <button
              type="button"
              className="checkbox-touchable"
              onClick={() => setAcceptTerms(!acceptTerms)}
            >
              <div className={`checkbox ${acceptTerms ? 'checkbox-checked' : ''}`}>
                {acceptTerms && <Check size={12} color="#FF8541" />}
              </div>
            </button>
            <div className="checkbox-text-container">
              <span className="checkbox-label">
                By Creating an Account, i accept Sapien Score{' '}
                <span
                  className="link-text"
                  onClick={() => {
                    setTermsModalType('terms');
                    setShowTermsModal(true);
                  }}
                >
                  terms of Use
                </span>
                {' '}and{' '}
                <span
                  className="link-text"
                  onClick={() => {
                    setTermsModalType('privacy');
                    setShowTermsModal(true);
                  }}
                >
                  Privacy Policy
                </span>
              </span>
            </div>
          </div> */}

          {/* Update Password Button */}
          <button
            className={`update-button ${loading ? 'update-button-disabled' : ''}`}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-animation">
            <div className="success-checkmark">✓</div>
            <p className="success-message">Password Changed</p>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      <TermsConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={termsModalType}
      />
    </div>
  );
};

export default ResetPasswordScreen;
