import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyPasswordResetCode, sendPasswordResetEmail } from '@/api/authApi';
import { toast } from 'react-toastify';
import './VerifyResetEmailScreen.css';

interface VerifyResetEmailScreenProps {
  onProceed?: (code: string) => void;
  onBack?: () => void;
  email?: string;
}

const VerifyResetEmailScreen: React.FC<VerifyResetEmailScreenProps> = ({
  onProceed,
  onBack,
  email: propsEmail,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from props or navigation state
  const email = propsEmail || location.state?.email || 'your email';

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    setError(false);

    // Focus next input
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);

      // Focus last filled input or the next empty one
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError(true);
      // toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetCode(email, code);
      // toast.success('Code verified!');

      if (onProceed) {
        onProceed(code);
      } else {
        navigate('/reset-password', { state: { code, email } });
      }
    } catch (error: any) {
      console.error('Verify code error:', error);
      setError(true);
      // toast.error(error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(email);
      // toast.success('Verification code resent!');
      // Clear OTP
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      // toast.error(error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/forgot-password');
    }
  };

  return (
    <div className="forgot-password-container forgetnewscreen">
      <div className="forgot-password-scroll-content">
        <div className="forgot-password-top-section"></div>

        <div className="forgot-password-content">
          <div className="text-center-container">
            <h1 className="forgot-password-title">Please verify your<br />email address</h1>
            <p className="forgot-password-description">
              We've sent an email to<br />
              <span className="email-highlight">{email}</span>, please enter the code<br />below.
            </p>
          </div>

          <div className="forgot-password-input-container">
            <label className="input-label entercode">Enter Code</label>
            <div className="otp-inputs-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className={`text-input code-input ${error ? 'input-error' : ''}`}
                  placeholder="-"
                  value={data}
                  ref={el => { inputRefs.current[index] = el; }}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                />
              ))}
            </div>
            {error && <p className="error-text-center">{typeof error === 'string' ? error : 'Invalid OTP. Please try again.'}</p>}
          </div>

          <button
            className={`forgot-password-submit-button ${loading || otp.join('').length !== 6 ? 'submit-button-disabled' : ''}`}
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
          >
            {loading ? <div className="spinner"></div> : 'Verify & Reset'}
          </button>

          <div className="remeber-password-login-container flexcolunset">
            <div className="resend-container">
              <span className="resend-text">Didn't see your email? </span>
              <button
                type="button"
                className="forgot-password-login-link"
                onClick={handleResend}
                disabled={loading}
              >
                Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetEmailScreen;
