import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { signupWithPassword } from '@/api/authApi';
import { toast } from 'react-toastify';
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';
import './NewSignupScreen.css';

interface NewSignupScreenProps {
  onProceed?: (data: { phone: string; email: string; workEmail: string; password: string }) => void;
  onBack?: () => void;
  onSignin?: () => void;
}

const NewSignupScreen: React.FC<NewSignupScreenProps> = ({
  onProceed,
  onBack,
  onSignin,
}) => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [workEmailError, setWorkEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [workEmailErrorMessage, setWorkEmailErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    if (phone) setPhoneError(false);
  }, [phone]);

  useEffect(() => {
    if (email) setEmailError(false);
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError(false);
  }, [password]);

  useEffect(() => {
    if (confirmPassword) setConfirmPasswordError(false);
  }, [confirmPassword]);

  useEffect(() => {
    if (workEmail) setWorkEmailError(false);
  }, [workEmail]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return phone.length === 10;
  };

  const handleSignup = async () => {
    let hasError = false;

    setPhoneError(false);
    setPhoneErrorMessage('');
    setEmailError(false);
    setEmailErrorMessage('');
    setWorkEmailError(false);
    setWorkEmailErrorMessage('');
    setPasswordError(false);
    setConfirmPasswordError(false);

    if (!phone) {
      setPhoneError(true);
      setPhoneErrorMessage('Phone number is required');
      hasError = true;
    } else if (phone.length !== 10) {
      setPhoneError(true);
      setPhoneErrorMessage('Phone number must be 10 digits');
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError(true);
      setPhoneErrorMessage('Please enter a valid phone number');
      hasError = true;
    }

    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address');
      hasError = true;
    }

    // Work email is optional but validate format if provided
    if (workEmail && !validateEmail(workEmail)) {
      setWorkEmailError(true);
      setWorkEmailErrorMessage('Please enter a valid work email address');
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      hasError = true;
    }

    if (!confirmPassword || password !== confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    }

    if (!acceptTerms) {
      hasError = true;
      toast.error('Please accept the terms and conditions');
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await signupWithPassword(formattedPhone, email, password, acceptTerms, workEmail);

      if (response.token) {
        setShowSuccess(true);
        toast.success('Account created successfully!');
        setTimeout(() => {
          if (onSignin) {
            onSignin();
          } else {
            navigate('/login');
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      const errorMessage = error.error || error.message || 'Something went wrong';

      if (errorMessage.toLowerCase().includes('phone')) {
        setPhoneError(true);
        setPhoneErrorMessage(errorMessage);
      } else if (errorMessage.toLowerCase().includes('work') && errorMessage.toLowerCase().includes('email')) {
        setWorkEmailError(true);
        setWorkEmailErrorMessage(errorMessage);
      } else if (errorMessage.toLowerCase().includes('email')) {
        setEmailError(true);
        setEmailErrorMessage(errorMessage);
      } else if (errorMessage.toLowerCase().includes('password')) {
        setPasswordError(true);
      } else {
        setPhoneError(true);
        setPhoneErrorMessage(errorMessage);
      }
      toast.error(errorMessage);
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
    <div className="signup-container">
      <div className="signup-scroll-content">
        {/* Top White Section with Back Button */}
        <div className="signup-top-section">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={24} color="#000" />
          </button>
        </div>

        {/* Content Container with Gray Background */}
        <div className="signup-content">
          {/* Phone Number Input */}
          <div className="input-group">
            <label className="input-label">Phone number</label>
            <div className={`phone-input-wrapper ${phoneError ? 'input-error' : ''}`}>
              <span className="phone-prefix">+91</span>
              <input
                type="tel"
                className="phone-input"
                placeholder="9993324823"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                  if (phoneError) {
                    setPhoneError(false);
                    setPhoneErrorMessage('');
                  }
                }}
                maxLength={10}
              />
            </div>
            {phoneError && phoneErrorMessage && (
              <span className="error-message">{phoneErrorMessage}</span>
            )}
          </div>

          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Personal Email Address</label>
            <input
              type="email"
              className={`text-input ${emailError ? 'input-error' : ''}`}
              placeholder="Rhebhek@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError(false);
                  setEmailErrorMessage('');
                }
              }}
            />
            {emailError && emailErrorMessage && (
              <span className="error-message">{emailErrorMessage}</span>
            )}
          </div>

          {/* Work Email Input */}
          <div className="input-group">
            <label className="input-label">Work Email Address</label>
            <input
              type="email"
              className={`text-input ${workEmailError ? 'input-error' : ''}`}
              placeholder="john.doe@company.com"
              value={workEmail}
              onChange={(e) => {
                setWorkEmail(e.target.value);
                if (workEmailError) {
                  setWorkEmailError(false);
                  setWorkEmailErrorMessage('');
                }
              }}
            />
            {workEmailError && workEmailErrorMessage && (
              <span className="error-message">{workEmailErrorMessage}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`password-input ${passwordError ? 'input-error' : ''}`}
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
                className={`password-input ${confirmPasswordError ? 'input-error' : ''}`}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div className="checkbox-container">
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
          </div>

          {/* Signup Button */}
          <button
            className={`signup-button ${loading ? 'signup-button-disabled' : ''}`}
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Signup'}
          </button>

          {/* Sign in link */}
          <div className="signin-container">
            <span className="signin-text">Have an Account? </span>
            <button
              type="button"
              className="signin-link"
              onClick={() => onSignin ? onSignin() : navigate('/login')}
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-animation">
            <div className="success-checkmark">✓</div>
            <p className="success-message">Registered</p>
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

export default NewSignupScreen;
