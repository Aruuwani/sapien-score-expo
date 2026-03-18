import React from 'react';
import './InstaPost.css';
import { button } from 'framer-motion/client';

interface ScoreItem {
    label: string;
    score: number;
}

interface InstaPostProps {
    scores?: ScoreItem[];
    onClose?: () => void;
}

const defaultScores: ScoreItem[] = [
    { label: 'Integrity', score: 8.8 },
    { label: 'honesty', score: 7.8 },
    { label: 'Empathy', score: 8.0 },
];

const InstaPost: React.FC<InstaPostProps> = ({
    scores = defaultScores,
    onClose,
}) => {
    return (
        <div className="instapost-background">
            {/* Close Button */}
            <button className="instapost-close-btn" onClick={onClose} aria-label="Close">
                ✕
            </button>

            {/* Snapshot Card */}
            <div className="instapost-card">
                {/* Logo */}
                <div className="instapost-logo">
                    <img src="/assets/images/sapianlogo.svg" alt="Sapien Logo" style={{ width: '63px', height: '63px' }} />
                </div>

                {/* Title */}
                <h2 className="instapost-title">My Sapienscore snapshot</h2>
                <div className="instapost-divider" />

                {/* Score Items */}
                <div className="instapost-scores">
                    {scores.map((item, index) => {
                        let barWidth = '260px';
                        if (item.label.toLowerCase() === 'integrity') barWidth = '260px';
                        if (item.label.toLowerCase() === 'honesty') barWidth = '237px';
                        if (item.label.toLowerCase() === 'empathy') barWidth = '252px';

                        return (
                            <div key={index} className="instapost-score-row">
                                <div className="instapost-score-header">
                                    <span className="instapost-score-label">{item.label}</span>
                                    <span className="instapost-score-value">{item.score.toFixed(1)}</span>
                                </div>
                                <img
                                    src="/Rectangle.png"
                                    alt="score bar"
                                    className="instapost-bar-img"
                                    style={{ width: barWidth, height: '20px' }}
                                />
                                <div className="instapost-score-divider" />
                            </div>
                        );
                    })}
                </div>

                {/* Footer tagline */}
                <p className="instapost-tagline">anonymous peer feedback for professionals</p>
            </div>

            {/* Share Row */}
            <div className="instapost-share-row">
                <span className="instapost-share-text">Share your top scores on</span>

                {/* Instagram Icon */}
                <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instapost-social-icon"
                    aria-label="Share on Instagram"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                </a>

                {/* Facebook Icon */}
                <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instapost-social-icon"
                    aria-label="Share on Facebook"
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default InstaPost;
