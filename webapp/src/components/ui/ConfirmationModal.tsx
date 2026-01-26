import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  submessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  submessage,
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
}) => {
  if (!visible) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onCancel}>
      <div className="confirmation-modal-wrapper">
        <div className="confirmation-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="confirmation-modal-content">
            <p className="confirmation-modal-message">{message}</p>
            {submessage && <p className="confirmation-modal-submessage">{submessage}</p>}
            <div className="confirmation-modal-buttons">
              <button className="confirmation-modal-cancel" onClick={onCancel}>
                {cancelText}
              </button>
              <button className="confirmation-modal-confirm" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
        <div className="confirmation-modal-bubble-large" />
        <div className="confirmation-modal-bubble-small" />
      </div>
    </div>
  );
};

export default ConfirmationModal;

