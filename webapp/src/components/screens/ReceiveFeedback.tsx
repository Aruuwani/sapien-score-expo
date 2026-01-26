import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNames, updateUserProfile } from '@/api/userApi';
import { setProfileCache } from '@/routes/ProtectedRoute';
import { toast } from 'react-toastify';
import './ReceiveFeedback.css';

interface ReceiveFeedbackProps {
  onProceed?: (userData: { name: string; username?: string }) => void;
  onBack?: () => void;
}

const ReceiveFeedback: React.FC<ReceiveFeedbackProps> = ({
  onProceed,
  onBack,
}) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [nameError, setNameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [availableUsernames, setAvailableUsernames] = useState<string[]>([]);

  // Block browser back button - prevent users from leaving without completing profile
  useEffect(() => {
    // Push a state to handle popstate
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Prevent navigation
      window.history.pushState(null, '', window.location.href);
      toast.warning('Please complete your profile before continuing');
    };

    // Add beforeunload handler to warn on page refresh/close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'You have not completed your profile. Are you sure you want to leave?';
      return event.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Fetch available usernames on mount
  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const usernames = await getUserNames();
        setAvailableUsernames(usernames || []);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };
    fetchUsernames();
  }, []);

  const handleProceed = async () => {
    // Validate name field
    const nameIsEmpty = !name?.trim();
    setNameError(nameIsEmpty);

    if (nameIsEmpty) {
      toast.error('Please fill your name');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with name and optional username
      await updateUserProfile({
        name: name.trim(),
        username: username || undefined
      });

      // toast.success('Profile updated successfully!');

      // CRITICAL: Set cache to true BEFORE navigating
      // This prevents ProtectedRoute from redirecting back to /registration
      console.log('[ReceiveFeedback] Setting profile cache to true...');
      setProfileCache(true);

      console.log('[ReceiveFeedback] Navigating to /user-selection...');

      // Now navigate to user selection
      if (onProceed) {
        onProceed(username ? { name, username } : { name });
      }

      navigate('/user-selection');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setShowUsernameModal(false);
  };

  const handleBack = () => {
    // Prevent navigation - user must complete profile
    toast.warning('Please complete your profile before continuing');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-scroll-content">
        <div className="forgot-password-content">
          <h1 className="forgot-password-title">
            Receive feedback from friends and colleagues <span>anonymously</span>
          </h1>

          {/* Name Input */}
          <div className="forgot-password-input-container">
            <div className="inputcontainer">
              <input
                type="text"
                className={`text-input code-input ${nameError ? 'input-error' : ''}`}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError && e.target.value.trim()) {
                    setNameError(false);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleProceed()}
              />
              {nameError && (
                <span className="error-text">Please fill your name</span>
              )}
              <label className="input-label entercode">
                psst... All the sender names will be hidden
              </label>
            </div>
          </div>

          {/* Username Input */}
          <div className="forgot-password-input-container">
            <div className="inputcontainer">
              <input
                type="text"
                className="text-input code-input username-input"
                placeholder="Choose Username"
                value={username}
                readOnly
                onClick={() => setShowUsernameModal(true)}
              />
              <label className="input-label entercode">
                you can choose to show this later
              </label>
            </div>
          </div>

          <button
            className={`btn_divmain ${loading ? 'btn-disabled' : ''}`}
            onClick={handleProceed}
            disabled={loading}
          >
            {loading ? 'Proceeding...' : 'Proceed'}
          </button>
        </div>
      </div>

      {/* Username Selection Modal */}
      {showUsernameModal && (
        <div className="username-modal-overlay" onClick={() => setShowUsernameModal(false)}>
          <div className="username-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="username-modal-title">Choose Username</h2>
            <div className="username-grid">
              {availableUsernames.map((uname, index) => (
                <button
                  key={index}
                  className={`username-option ${username === uname ? 'selected' : ''}`}
                  onClick={() => handleUsernameSelect(uname)}
                >
                  {uname}
                </button>
              ))}
            </div>
            <button
              className="username-select-btn"
              onClick={() => setShowUsernameModal(false)}
            >
              Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveFeedback;
