import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/api/userApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import './ProfileScreen.css';

interface ProfileData {
  name: string;
  phone: string;
  email: string;
  workEmail: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  profession: string;
  website: string;
  profileURL: string;
  display_username: boolean;
  activate_social_profile: boolean;
  auto_approve: string;
  notify_score_updates: string;
  account_status: string;
}

interface ProfileInfoItemProps {
  label: string;
  field: string;
  value: string;
  isLink?: boolean;
  editable?: boolean;
  onChange?: (value: string) => void;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
  label,
  value,
  field,
  isLink = false,
  editable = false,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleEditPress = () => {
    if (editable) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(text);
    }
  };

  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <div className="info-content">
        {isEditing ? (
          <input
            className="info-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <span className={`info-value ${isLink ? 'link' : ''}`}>{text}</span>
        )}
        {editable && (
          <button className="edit-icon-btn" onClick={handleEditPress}>
            <Edit size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [imageURL, setImageURL] = useState<string>('');
  const [isActiveSocialEnabled, setIsActiveSocialEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDisplayUsernameEnabled, setIsDisplayUsernameEnabled] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: '',
    email: '',
    workEmail: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    profession: '',
    website: '',
    profileURL: '',
    display_username: false,
    activate_social_profile: false,
    auto_approve: '',
    notify_score_updates: '',
    account_status: '',
  });

  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      try {
        const response = await getUserProfile();
        const userData = response.user;
        setProfileData({
          name: userData.name,
          phone: userData.phone_number,
          email: userData.email,
          workEmail: userData.work_email,
          facebook: userData.social_links?.facebook || '',
          instagram: userData.social_links?.instagram || '',
          linkedin: userData.social_links?.linkedin || '',
          profession: userData.profession,
          website: userData.website,
          profileURL: userData.photo_url,
          display_username: userData.display_username,
          activate_social_profile: userData.activate_social_profile,
          auto_approve: userData.auto_approve,
          notify_score_updates: userData.notify_score_updates,
          account_status: userData.account_status,
        });
        setImageURL(userData.photo_url);
        setIsActiveSocialEnabled(userData.activate_social_profile);
        setIsDisplayUsernameEnabled(userData.display_username);
      } catch (error: any) {
        console.error('Failed to fetch user profile data:', error);
        toast.error('Failed to load profile');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfileData();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://sapio.one/node/api/upload/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.location) {
        setImageURL(data.location);
        // Save the photo URL to the database immediately
        await updateUserProfile({ photo_url: data.location });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const responsee = await getUserProfile();
      const userData = responsee.user;

      const updatedData: any = {
        name: profileData.name,
        email: profileData.email,
        social_links: {
          facebook: profileData.facebook || '',
          instagram: profileData.instagram || '',
          linkedin: profileData.linkedin || '',
        },
        profession: profileData.profession,
        website: profileData.website,
        photo_url: imageURL || profileData.profileURL,
        display_username: isDisplayUsernameEnabled,
        activate_social_profile: isActiveSocialEnabled,
        account_status: profileData.account_status,
        auto_approve: profileData.auto_approve,
        notify_score_updates: profileData.notify_score_updates
      };

      // Only include phone_number if it's being updated (not already set)
      if (!userData.phone_number && profileData.phone && profileData.phone.trim() !== '') {
        updatedData.phone_number = profileData.phone;
      }

      // Only include work_email if it's being updated (not already set)
      if (!userData.work_email && profileData.workEmail && profileData.workEmail.trim() !== '') {
        updatedData.work_email = profileData.workEmail;
      }

      // Remove null/undefined values to avoid backend validation issues
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === null || updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      console.log('📤 Updating profile with data:', updatedData);

      await updateUserProfile(updatedData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error('❌ Profile update failed:', error.response?.data);
      toast.error(errorMsg);
      if (error.response?.data?.error === 'Phone number already registered') {
        setProfileData({
          ...profileData,
          phone: '',
        });
      } else if (error.response?.data?.error?.includes('work email')) {
        setProfileData({
          ...profileData,
          workEmail: '',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="header-title">Profile</h1>
        </div>

        <div className="profile-scroll-content">
          {/* Profile Picture */}
          <div className="profile-image-container">
            <div className="profile-image">
              {isUploadingImage ? (
                <div className="spinner"></div>
              ) : imageURL ? (
                <img src={imageURL} alt="Profile" className="profile-img" />
              ) : (
                <User size={100} color="#fff" />
              )}
            </div>
            <label className={`edit-image-button ${isUploadingImage ? 'disabled' : ''}`}>
              <Edit size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="profile-info-section">
            <ProfileInfoItem
              label="Name"
              field="name"
              value={profileData.name || 'N/A'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, name: val }))}
            />
            <ProfileInfoItem
              label="Phone"
              field="phone"
              value={profileData.phone || 'N/A'}
              editable={!profileData.phone}
              onChange={(val) => {
                const formattedVal = val.startsWith('+91') ? val : `+91${val}`;
                setProfileData((prev) => ({ ...prev, phone: formattedVal }));
              }}
            />
            <ProfileInfoItem
              label="Email"
              field="email"
              value={profileData.email || 'N/A'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, email: val }))}
            />
            <ProfileInfoItem
              label="Work Email"
              field="work_email"
              value={profileData.workEmail || 'N/A'}
              editable={!profileData.workEmail}
              onChange={(val) => setProfileData((prev) => ({ ...prev, workEmail: val }))}
            />
            <ProfileInfoItem
              label="Facebook"
              field="facebook"
              isLink
              value={profileData.facebook || 'https://www.facebook.com/'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, facebook: val }))}
            />
            <ProfileInfoItem
              label="Instagram"
              field="instagram"
              isLink
              value={profileData.instagram || 'https://www.instagram.com/'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, instagram: val }))}
            />
            <ProfileInfoItem
              label="LinkedIn"
              field="linkedin"
              isLink
              value={profileData.linkedin || 'https://www.linkedin.com/'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, linkedin: val }))}
            />
            <ProfileInfoItem
              label="Profession"
              field="profession"
              value={profileData.profession || 'N/A'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, profession: val }))}
            />
            <ProfileInfoItem
              label="Website"
              field="website"
              isLink
              value={profileData.website || 'https://www.example.com/'}
              editable
              onChange={(val) => setProfileData((prev) => ({ ...prev, website: val }))}
            />
          </div>

          {/* Toggle Section */}
          <div className="toggle-section">
            <div className="toggle-row">
              <div className="toggle-text-container">
                <p className="toggle-label">Active Social Profile</p>
                <div className="toggle-description-list">
                  <p className="toggle-description">• display your top scored topics</p>
                  <p className="toggle-description">• collaborate with larger groups</p>
                  <p className="toggle-description">• promote your personal brand</p>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isActiveSocialEnabled}
                  onChange={(e) => setIsActiveSocialEnabled(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-text-container">
                <p className="toggle-label">Display Username</p>
                <p className="toggle-description">
                  show only your username to your sapien group and echo room messages
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDisplayUsernameEnabled}
                  onChange={(e) => setIsDisplayUsernameEnabled(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="bottom-spacing">
              <button
                className={`update-btn ${isUpdating ? 'disabled' : ''}`}
                onClick={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Navigation initialTab="PROFILE" />
    </div>
  );
};

export default ProfileScreen;
