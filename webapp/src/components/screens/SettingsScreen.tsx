import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/api/userApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';
import './SettingsScreen.css';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [autoApprove, setAutoApprove] = useState(false);
  const [notifyScoreUpdates, setNotifyScoreUpdates] = useState(false);
  const [accountStatus, setAccountStatus] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        const user = response.user;
        setAccountStatus(user.account_status === 'true');
        setAutoApprove(user.auto_approve === 'true');
        setNotifyScoreUpdates(user.notify_score_updates === 'true');
        setUserData(user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load settings');
      }
    };
    fetchUserProfile();
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      console.log('🔧 Updating setting:', field, '=', value);
      console.log('📦 Current userData:', userData);

      // Send only settings-related fields to avoid validation errors on phone/email
      // The backend validates phone_number and work_email even if unchanged
      const updatedData: any = {
        name: userData.name,
        username: userData.username,
        display_username: userData.display_username,
        activate_social_profile: userData.activate_social_profile,
        account_status: userData.account_status,
        auto_approve: userData.auto_approve,
        notify_score_updates: userData.notify_score_updates,
        // Update the specific field
        [field]: value,
      };

      // Only include optional fields if they exist and have values
      if (userData.profession) updatedData.profession = userData.profession;
      if (userData.website) updatedData.website = userData.website;
      if (userData.photo_url) updatedData.photo_url = userData.photo_url;
      if (userData.social_links) updatedData.social_links = userData.social_links;

      // DO NOT send phone_number, email, or work_email to avoid validation errors

      console.log('📤 Sending to API:', updatedData);

      const response = await updateUserProfile(updatedData);

      console.log('✅ API Response:', response);

      // Update local state with the new value
      setUserData({
        ...userData,
        [field]: value,
      });

      toast.success('Settings updated');
    } catch (error: any) {
      console.error('❌ Update failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleDeleteAccount = async () => {
    const newStatus = !accountStatus;
    setAccountStatus(newStatus);
    await handleToggle('account_status', newStatus);
    setShowDeleteModal(false);
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        {/* Header */}
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="header-title">Settings</h1>
        </div>

        <div className="settings-main-content">
          {/* Settings Items */}
          <div className="setting-item">
            <span className="setting-text">Auto approve new requests</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => {
                  setAutoApprove(e.target.checked);
                  handleToggle('auto_approve', e.target.checked);
                }}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <span className="setting-text">Notify me on score updates</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifyScoreUpdates}
                onChange={(e) => {
                  setNotifyScoreUpdates(e.target.checked);
                  handleToggle('notify_score_updates', e.target.checked);
                }}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Logout Button */}
          <div className="left-tools">
            <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
              <span className="logout-text">Logout</span>
              <LogOut size={30} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <div className="footer-content">
            <button className="delete-button-settings" onClick={() => setShowDeleteModal(true)}>
              <span className="delete-text">delete account</span>
            </button>
            <button
              className="privacy-button"
              onClick={() => {
                setTermsModalType('privacy');
                setShowTermsModal(true);
              }}
            >
              <span className="link-text">privacy policy</span>
            </button>
          </div>

          <div className="links-container">
            <button
              className="terms-button"
              onClick={() => {
                setTermsModalType('terms');
                setShowTermsModal(true);
              }}
            >
              <span className="link-text">terms & conditions</span>
            </button>
            <p className="copyright-text">Sapien world pvt ltd all rights reserved 2025</p>
          </div>
        </div>

        <div className="gray-space"></div>
      </div>

      <Navigation initialTab="PROFILE" />

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <p className="modal-text">Are you sure?</p>
            <div className="modal-buttons-container">
              <button
                className="modal-button-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button-confirm"
                onClick={handleDeleteAccount}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <p className="modal-text">Are you sure you want to log out?</p>
            <div className="modal-buttons-container">
              <button
                className="modal-button-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button-confirm"
                onClick={() => {
                  handleLogout();
                  setShowLogoutModal(false);
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms/Privacy Modal */}
      <TermsConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={termsModalType}
      />
    </div>
  );
};

export default SettingsScreen;
