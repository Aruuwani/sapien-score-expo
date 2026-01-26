import React from 'react';
import { ChevronRight } from 'lucide-react';
import './ShareScreen.css';

interface ShareScreenProps {
  person: { id?: string; name?: string; email?: string; phone_number?: string; work_email?: string };
  onDismiss: () => void;
  onSelectNextSapien: () => void;
}

const ShareScreen: React.FC<ShareScreenProps> = ({
  person,
  onDismiss,
  onSelectNextSapien,
}) => {
  // Determine display name - prefer name, fallback to email/phone/work_email
  const displayName = person?.name || person?.email || person?.phone_number || person?.work_email || 'Unknown';

  return (
    <div className="share-screen-container">
      <div className="share-screen-content">
        {/* Main Card - SapienScore shared with */}
        <div className="share-screen-main-card">
          <p className="share-screen-title">SapienScore shared with</p>
          <h2 className="share-screen-person-name">{displayName}</h2>
        </div>

        {/* Info Card */}
        <div className="share-screen-info-card">
          <p className="share-screen-help-text">help your loved ones improve</p>
          <p className="share-screen-info-text">
            Share and receive SapienScores,<br />
            ANONYMOUSLY
          </p>
        </div>

        {/* Action Buttons */}
        <div className="share-screen-buttons">
          <button className="share-screen-primary-button" onClick={onSelectNextSapien}>
            <span>Score next Sapien</span>
            <ChevronRight size={24} />
          </button>

          <button className="share-screen-secondary-button" onClick={onDismiss}>
            <span>I'll do it later</span>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareScreen;
