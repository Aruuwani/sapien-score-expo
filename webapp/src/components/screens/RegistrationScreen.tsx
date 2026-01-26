import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getUserNames, updateUserProfile } from '@/api/userApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './RegistrationScreen.css';

interface RegistrationScreenProps {
  onProceed?: (userData: { name: string; username?: string }) => void;
  onBack?: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onProceed,
  onBack,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [availableUsernames, setAvailableUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const usernames = await getUserNames();
        setAvailableUsernames(usernames);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    };

    fetchUsernames();
  }, []);

  const handleProceed = async () => {
    const nameIsEmpty = !name?.trim();
    setNameError(nameIsEmpty);

    if (nameIsEmpty) {
      toast.error('Please fill your name');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({ name, username: username || undefined });
      toast.success('Profile updated successfully!');
      
      if (onProceed) {
        onProceed(username ? { name, username } : { name });
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setShowUsernameModal(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-content">
        <div className="top-section">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="form-content">
          <h1 className="title">Complete Your Profile</h1>
          <p className="subtitle">Please provide your name to continue</p>

          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              className={`text-input ${nameError ? 'input-error' : ''}`}
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(false);
              }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Username (Optional)</label>
            <div className="username-input-wrapper">
              <input
                type="text"
                className="text-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                readOnly
              />
              <button
                type="button"
                className="choose-username-button"
                onClick={() => setShowUsernameModal(true)}
              >
                Choose
              </button>
            </div>
          </div>

          <button
            className={`submit-button ${loading ? 'submit-button-disabled' : ''}`}
            onClick={handleProceed}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Continue'}
          </button>
        </div>
      </div>

      {showUsernameModal && (
        <div className="modal-overlay" onClick={() => setShowUsernameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Choose Username</h2>
            <div className="usernames-grid">
              {availableUsernames.map((uname, index) => (
                <button
                  key={index}
                  className="username-option"
                  onClick={() => handleUsernameSelect(uname)}
                >
                  {uname}
                </button>
              ))}
            </div>
            <button
              className="modal-close-button"
              onClick={() => setShowUsernameModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationScreen;
