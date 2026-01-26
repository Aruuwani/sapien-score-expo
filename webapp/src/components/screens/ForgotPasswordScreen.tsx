import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from '@/api/authApi';
import { toast } from 'react-toastify';
import './ForgotPasswordScreen.css';

interface ForgotPasswordScreenProps {
  onProceed?: (email: string) => void;
  onBack?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onProceed,
  onBack,
}) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (email) setEmailError(false);
  }, [email]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      // toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setShowSuccess(true);
      // toast.success('Password reset email sent!');

      setTimeout(() => {
        if (onProceed) {
          onProceed(email);
        } else {
          navigate('/verify-reset', { state: { email } });
        }
      }, 2000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setEmailError(true);
      // toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-scroll-content">
        {/* Top White Section (Empty for spacing) */}
        <div className="forgot-password-top-section"></div>

        {/* Content Container with Gray Background */}
        <div className="forgot-password-content">
          <h1 className="forgot-password-title">Forgot Password</h1>
          <p className="forgot-password-description">
            Enter the email address registered with your account and we will send you a code to reset your password
          </p>

          {/* Email Input */}
          <div className="forgot-password-input-container">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className={`text-input ${emailError ? 'input-error' : ''}`}
              placeholder="Rhebhek@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {emailError && (
              <span className="error-message">Please enter a valid email address</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            className={`forgot-password-submit-button ${loading ? 'forgot-password-submit-button-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Submit'}
          </button>

          {/* Login Link */}
          <div className="remeber-password-login-container">
            <button
              type="button"
              className="remeber-password-login-link"
            // onClick={handleBack}
            >
              Remembered password?
            </button>
            <button
              type="button"
              className="forgot-password-login-link"
              onClick={handleBack}
            >
              Login to your account
            </button>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-animation">
            <div className="success-checkmark">✓</div>
            <p className="success-message">OTP sent to your email</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordScreen;
