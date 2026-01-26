import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { getTermsByType } from '@/api/termsApi';
import './TermsConditionsModal.css';

interface TermsConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  type?: 'terms' | 'privacy';
}

interface ContentSection {
  title: string;
  content: string;
  bullets?: string[];
}

const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  visible,
  onClose,
  type = 'terms',
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<ContentSection[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      fetchContent();
    }
  }, [visible, type]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTermsByType(type);

      if (response.success && response.data) {
        setTitle(response.data.title);
        setContent(response.data.content || []);
      } else {
        setError('Failed to load content');
      }
    } catch (err: any) {
      console.error('Error fetching terms:', err);
      setError('Failed to load content. Please try again.');
      // Fallback to default title
      setTitle(type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div className="terms-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="terms-modal-header">
          <h2 className="terms-modal-title">{title}</h2>
          <button className="terms-close-button" onClick={onClose}>
            <X size={24} color="#000" />
          </button>
        </div>

        {/* Content */}
        <div className="terms-modal-scroll">
          {loading ? (
            <div className="terms-loading-container">
              <div className="terms-spinner"></div>
              <p className="terms-loading-text">Loading...</p>
            </div>
          ) : error ? (
            <div className="terms-error-container">
              <AlertCircle size={48} color="#FF0000" />
              <p className="terms-error-text">{error}</p>
              <button className="terms-retry-button" onClick={fetchContent}>
                Retry
              </button>
            </div>
          ) : (
            <DynamicContent sections={content} />
          )}
        </div>

        {/* Footer Button */}
        <div className="terms-modal-footer">
          <button className="terms-accept-button" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const DynamicContent: React.FC<{ sections: ContentSection[] }> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="terms-empty-container">
        <p className="terms-empty-text">No content available</p>
      </div>
    );
  }

  return (
    <div>
      {sections.map((section, index) => (
        <div key={index}>
          <h3 className="terms-section-title">{section.title}</h3>
          <p className="terms-paragraph">{section.content}</p>
          {section.bullets && section.bullets.length > 0 && (
            <div>
              {section.bullets.map((bullet, bulletIndex) => (
                <p key={bulletIndex} className="terms-bullet-point">
                  • {bullet}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TermsConditionsModal;

