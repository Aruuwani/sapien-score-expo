import React, { useState } from 'react';
import { ReportRoom } from '@/api/reportRoomApi';
import eliseReportImage from '../../assets/images/elise-report.svg';
import './ReportDialog.css';

interface ChatReportDialogProps {
    visible: boolean;
    onClose: () => void;
    roomId: string;
    onReportSuccess: () => void;
}

const ChatReportDialog: React.FC<ChatReportDialogProps> = ({
    visible,
    onClose,
    roomId,
    onReportSuccess,
}) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [loading, setLoading] = useState(false);

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
        if (!selectedOption || loading) return;

        setLoading(true);
        try {
            await ReportRoom(selectedOption, roomId);
            onReportSuccess();
            onClose();
            setSelectedOption('');
        } catch (error) {
            console.error('Error reporting room:', error);
        } finally {
            setLoading(false);
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
                                disabled={loading}
                            >
                                <span className={`report-option-text ${selectedOption === option ? 'highlighted' : ''}`}>
                                    {option}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="report-button-container">
                        <button className="report-cancel-button" onClick={handleCancel} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            className="report-submit-button"
                            onClick={handleReport}
                            disabled={!selectedOption || loading}
                        >
                            {loading ? '...' : 'report'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatReportDialog;
