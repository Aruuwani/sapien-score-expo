import React, { useEffect } from 'react';
import './SuccessMessageModal.css';

interface SuccessMessageModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SuccessMessageModal: React.FC<SuccessMessageModalProps> = ({
  visible,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDelay, onClose]);

  if (!visible) return null;

  return (
    <div className="success-message-overlay" onClick={onClose}>
      <div className="success-message-wrapper">
        <div className="success-message-container" onClick={(e) => e.stopPropagation()}>
          <div className="success-message-content">
            <p className="success-message-text">{message}</p>
          </div>
        </div>
        <div className="success-message-bubble-large" />
        <div className="success-message-bubble-small" />
      </div>
    </div>
  );
};

export default SuccessMessageModal;

