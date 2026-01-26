import React, { useEffect } from 'react';
import './UpdateScoreMessageModal.css';

interface UpdateScoreMessageModalProps {
  visible: boolean;
  onClose: () => void;
}

const UpdateScoreMessageModal: React.FC<UpdateScoreMessageModalProps> = ({
  visible,
  onClose,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="update-score-message-overlay" onClick={onClose}>
      <div className="update-score-message-wrapper">
        <div className="update-score-message-container" onClick={(e) => e.stopPropagation()}>
          <div className="update-score-message-content">
            <p className="update-score-message-text">
              You can update this score after 24 hours from the time you scored
            </p>
          </div>
        </div>
        <div className="update-score-message-bubble-large" />
        <div className="update-score-message-bubble-small" />
      </div>
    </div>
  );
};

export default UpdateScoreMessageModal;

