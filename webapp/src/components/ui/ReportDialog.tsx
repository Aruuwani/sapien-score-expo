import React, { useState } from 'react';
import { updateRatingStatus } from '@/api/ratingApi';
import eliseReportImage from '../../assets/images/elise-report.svg';
import './ReportDialog.css';

interface ReportDialogProps {
  visible: boolean;
  onClose: () => void;
  ratingId: string;
  onReportSuccess: () => void;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  visible,
  onClose,
  ratingId,
  onReportSuccess,
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  const reportOptions = [
    'Profanity',
    'Abusive language',
    'Hate speech',
    'Explicit wording',
  ];

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
  };

  const handleReport = async () => {
    if (!selectedOption) return;

    try {
      await updateRatingStatus(ratingId, 'reported');
      onReportSuccess();
      onClose();
      setSelectedOption('');
    } catch (error) {
      console.error('Error reporting:', error);
    }
  };

  const handleCancel = () => {
    setSelectedOption('');
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="report-dialog-overlay" onClick={handleCancel}>
      <div className="report-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-dialog-shape">
          {/* <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
            <path
              d="M 50,0 L 250,0 Q 300,0 300,50 L 300,150 Q 300,200 250,200 L 50,200 Q 0,200 0,150 L 0,50 Q 0,0 50,0 Z"
              fill="white"
            />
          </svg> */}
          <img src={eliseReportImage} alt='elise' width={600} height={600} />
        </div>

        <div className="report-dialog-container">
          <h3 className="report-dialog-title">report for</h3>

          <div className="report-options-container">
            {reportOptions.map((option, index) => (
              <button
                key={index}
                className={`report-option-item ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => handleOptionPress(option)}
              >
                <span className={`report-option-text ${selectedOption === option ? 'highlighted' : ''}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>

          <div className="report-button-container">
            <button className="report-cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="report-submit-button"
              onClick={handleReport}
              disabled={!selectedOption}
            >
              report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;

