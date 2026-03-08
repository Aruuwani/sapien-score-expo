import React, { useState } from 'react';
import NewLoginScreen from './NewLoginScreen';
import NewSignupScreen from './NewSignupScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import VerifyResetEmailScreen from './VerifyResetEmailScreen';
import ResetPasswordScreen from './ResetPasswordScreen';

type AuthScreen = 'login' | 'signup' | 'forgotPassword' | 'verifyReset' | 'resetPassword';

interface AuthFlowManagerProps {
  onAuthSuccess: (data: { email?: string; phone?: string }) => void;
  initialScreen?: AuthScreen;
}

const AuthFlowManager: React.FC<AuthFlowManagerProps> = ({
  onAuthSuccess,
  initialScreen = 'login',
}) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>(initialScreen);
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleLoginSuccess = (data: { phone?: string; password?: string }) => {
    if (onAuthSuccess) {
      onAuthSuccess({ phone: data.phone });
    }
  };

  const handleSignupSuccess = (data: { phone: string; email: string; password: string }) => {
    if (onAuthSuccess) {
      onAuthSuccess({ phone: data.phone, email: data.email });
    }
  };

  const handleForgotPasswordSubmit = (email: string) => {
    setResetEmail(email);
    setCurrentScreen('verifyReset');
  };

  const handleVerifyResetCode = (code: string) => {
    setVerificationCode(code);
    setCurrentScreen('resetPassword');
  };

  const handleResetPasswordSuccess = () => {
    // Navigate back to login after successful password reset
    // Clear the reset flow state
    setResetEmail('');
    setVerificationCode('');
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <NewLoginScreen
            onProceed={handleLoginSuccess}
            onForgotPassword={() => setCurrentScreen('forgotPassword')}
            onSignup={() => setCurrentScreen('signup')}
          />
        );

      case 'signup':
        return (
          <NewSignupScreen
            onProceed={handleSignupSuccess}
            onBack={() => setCurrentScreen('login')}
            onSignin={() => setCurrentScreen('login')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onProceed={handleForgotPasswordSubmit}
            onBack={() => setCurrentScreen('login')}
          />
        );

      case 'verifyReset':
        return (
          <VerifyResetEmailScreen
            email={resetEmail}
            onProceed={handleVerifyResetCode}
            onResend={() => {
              // Resend logic is handled in the component
            }}
          />
        );

      case 'resetPassword':
        return (
          <ResetPasswordScreen
            email={resetEmail}
            verificationCode={verificationCode}
            onProceed={handleResetPasswordSuccess}
          />
        );

      default:
        return (
          <NewLoginScreen
            onProceed={handleLoginSuccess}
            onForgotPassword={() => setCurrentScreen('forgotPassword')}
            onSignup={() => setCurrentScreen('signup')}
          />
        );
    }
  };

  return <>{renderScreen()}</>;
};

export default AuthFlowManager;

