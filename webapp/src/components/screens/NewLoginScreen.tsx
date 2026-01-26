import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle, Info, Check } from 'lucide-react';
import { loginWithPassword } from '@/api/authApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './NewLoginScreen.css';

interface NewLoginScreenProps {
  onProceed?: (data: { phone?: string; password?: string }) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

const NewLoginScreen: React.FC<NewLoginScreenProps> = ({
  onProceed,
  onForgotPassword,
  onSignup,
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone) setPhoneError(false);
  }, [phone]);

  useEffect(() => {
    if (password) setPasswordError(false);
  }, [password]);

  const validatePhone = (phone: string): boolean => {
    return phone.length === 10;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setIsPendingUser(false);
    let hasError = false;

    if (!phone || !validatePhone(phone)) {
      setPhoneError(true);
      hasError = true;
    }

    if (!password) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      setErrorMessage('Please enter correct password');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      console.log('🔐 Attempting login with phone:', formattedPhone);

      const response = await loginWithPassword(formattedPhone, password);
      console.log('✅ Login response:', response);

      if (response.token) {
        await login(response.token);

        if (keepSignedIn) {
          localStorage.setItem('keep_signed_in', 'true');
        }

        if (onProceed) {
          onProceed({ phone: formattedPhone, password });
        } else {
          navigate('/dashboard');
        }
      } else {
        console.log('⚠️ No token in response');
        setErrorMessage('Login failed. Please try again.');
        setPasswordError(true);
      }
    } catch (error: any) {
      console.log('❌ Login error caught:', error);

      let errorMsg = 'Please enter correct password';

      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      if (errorMsg.includes('Account not activated') || errorMsg.includes('Please sign up')) {
        setIsPendingUser(true);
        setErrorMessage('Your account is not activated yet. Someone has rated you! Please sign up to activate your account and view your ratings.');
      } else {
        setErrorMessage(errorMsg);
      }

      setPasswordError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      navigate('/forgot-password');
    }
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="login-container">
      <div className="login-scroll-content">
        {/* Logo Header */}
        <div className="login-header-container">
          <h1 className="login-logo-text">
            Sapien<span>Score</span>
            {/* <img src="../assets/images/loginapplogo.svg" alt="" /> */}
          </h1>
        </div>

        {/* Content Container */}
        <div className="login-content">
          {/* Tagline Section */}
          <div className="login-tagline-section">
            <p className="login-tagline">Share and receive Feedback</p>
            <p className="login-tagline-highlight">anonymously</p>
          </div>

          {/* Create Account Button */}
          <button
            type="button"
            className="login-create-account-btn"
            onClick={handleSignup}
          >
            Create Account
          </button>

          {/* Or Divider */}
          <div className="login-or-divider">
            <span>or</span>
          </div>

          {/* Form Container */}
          <div className="login-form-container">
            {/* Phone Number Input */}
            <div className="login-input-group">
              <label className="login-input-label">Phone number</label>
              <div className={`login-phone-input-wrapper ${phoneError ? 'login-input-error' : ''}`}>
                <span className="login-phone-prefix">+91</span>
                <input
                  type="tel"
                  className="login-phone-input"
                  placeholder="9993324823"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  onKeyPress={handleKeyPress}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="login-input-group">
              <div className="login-password-label-container">
                <label className="login-input-label">Password</label>
                <button
                  type="button"
                  className="login-forgot-password"
                  onClick={handleForgotPassword}
                >
                  Forgot Password
                </button>
              </div>
              <div className="login-password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`login-password-input ${passwordError ? 'login-input-error' : ''}`}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="login-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} color="#666" /> : <EyeOff size={20} color="#666" />}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="login-error-message-container">
                  <div className="login-error-container">
                    {isPendingUser ? (
                      <Info size={16} color="#FF8541" />
                    ) : (
                      <AlertTriangle size={16} color="#EA2A2A" />
                    )}
                    <span className={`login-error-text ${isPendingUser ? 'login-pending-user-text' : ''}`}>
                      {errorMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Keep me signed in */}
            <div className="login-checkbox-container" onClick={() => setKeepSignedIn(!keepSignedIn)}>
              <div className={`login-checkbox ${keepSignedIn ? 'login-checkbox-checked' : ''}`}>
                {keepSignedIn && <Check size={14} color="#0B1222" />}
              </div>
              <span className="login-checkbox-label">Keep me signed in</span>
            </div>

            {/* Login Button */}
            <button
              className={`login-button ${loading ? 'login-button-disabled' : ''}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="login-spinner"></div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLoginScreen;
