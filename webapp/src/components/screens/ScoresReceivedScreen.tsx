import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Flag, Ban } from 'lucide-react';
import { getRatingsForMe, updateRatingStatus } from '@/api/ratingApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import ConfirmationModal from '../ui/ConfirmationModal';
import ReportDialog from '../ui/ReportDialog';
import SuccessMessageModal from '../ui/SuccessMessageModal';
import './ScoresReceivedScreen.css';

interface ScoreCardProps {
  rating: any;
  onUpdate: () => void;
  onRemove: (id: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ rating, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockedSuccessModal, setShowBlockedSuccessModal] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);

  const sender = rating?.sender_id || {};
  const senderName = sender?.username || sender?.work_email || 'Anonymous';
  const relation = rating?.sender_relation_name || 'Unknown';
  const createdAt = formatDate(rating?.created_at);

  // Calculate average score
  const calculateAverage = () => {
    if (!rating?.rating_data || rating.rating_data.length === 0) return 0;
    const allScores: number[] = [];

    rating.rating_data.forEach((category: any) => {
      if (Array.isArray(category?.traits)) {
        category.traits.forEach((trait: any) => {
          if (typeof trait?.score === 'number' && !isNaN(trait.score)) {
            allScores.push(trait.score);
          }
        });
      }
    });

    return allScores.length > 0
      ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)
      : '0.0';
  };

  const averageScore = calculateAverage();

  // Filter dimensions with valid traits
  const filteredDimensions = Array.isArray(rating?.rating_data)
    ? rating.rating_data.filter((dim: any) => {
      const traits = Array.isArray(dim?.traits) ? dim.traits : [];
      const validTraits = traits.filter(
        (trait: any) => typeof trait?.score === 'number' && trait.score > 0
      );
      return validTraits.length >= 1;
    })
    : [];

  // Split into left and right columns
  const leftDimensions = filteredDimensions.filter((_: any, index: number) => index % 2 === 0);
  const rightDimensions = filteredDimensions.filter((_: any, index: number) => index % 2 === 1);

  const handleBlockClick = () => {
    setShowBlockModal(true);
  };

  const handleBlockConfirm = async () => {
    setShowBlockModal(false);
    setLoading(true);
    try {
      await updateRatingStatus(rating._id, 'blocked');
      onRemove(rating._id);
      setShowBlockedSuccessModal(true);
      setTimeout(() => {
        setShowBlockedSuccessModal(false);
        onUpdate();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  const handleReportSuccess = () => {
    setShowReportSuccessModal(true);
    setTimeout(() => {
      setShowReportSuccessModal(false);
      onUpdate();
    }, 3000);
  };

  return (
    <div className="score-card">
      <div className="score-card-header">
        <div className="score-card-info">
          <div className="name-row">
            <span className="score-card-name">{senderName}</span>
            <span className="new-badge">new</span>
          </div>
          <p className="score-card-relation">
            <span className="score-row">
              scored you <span className="score-value">{averageScore}</span>
            </span>
          </p>
        </div>
        <div className="score-card-date-box">
          <p className="date-label">last scored on</p>
          <p className="date-text">{createdAt}</p>
          {!expanded && (
            <button className="open-button" onClick={() => setExpanded(true)}>
              <span style={{ fontWeight: '500', marginRight: '20px', fontFamily: 'Poppins' }}>Open</span>
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="score-card-details">
          {/* Two-column dimension layout */}
          <div className="dimension-row">
            {/* Left column - odd indexed dimensions */}
            <div className="left-dimension">
              {leftDimensions.map((dim: any, idx: number) => {
                const traits = Array.isArray(dim?.traits) ? dim.traits : [];
                const validTraits = traits.filter(
                  (trait: any) => typeof trait?.score === 'number' && trait.score > 0
                );
                const avgScore = validTraits.length > 0
                  ? validTraits.reduce((acc: any, curr: any) => acc + (Number(curr?.score) || 0), 0) / validTraits.length
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`dimension-container trait-count-${validTraits.length}`}
                  >
                    <div className="dimension-header">
                      <span className="dimension-title" style={{ color: dim.color || '#FF8541' }}>
                        {dim.topic}
                      </span>
                      {avgScore > 0 && (
                        <span className="dimension-score" style={{ color: dim.color || '#FF8541' }}>
                          {avgScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {validTraits.map((item: any, i: number) => (
                      <div key={i} className="item-row">
                        <span className="item-name">{item.trait}</span>
                        <span className="item-score">{Number(item?.score)?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Right column - even indexed dimensions */}
            <div className="right-dimension">
              {rightDimensions.map((dim: any, idx: number) => {
                const traits = Array.isArray(dim?.traits) ? dim.traits : [];
                const validTraits = traits.filter(
                  (trait: any) => typeof trait?.score === 'number' && trait.score > 0
                );
                const avgScore = validTraits.length > 0
                  ? validTraits.reduce((acc: any, curr: any) => acc + (Number(curr?.score) || 0), 0) / validTraits.length
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`dimension-container trait-count-${validTraits.length}`}
                  >
                    <div className="dimension-header">
                      <span className="dimension-title" style={{ color: dim.color || '#FF8541' }}>
                        {dim.topic}
                      </span>
                      {avgScore > 0 && (
                        <span className="dimension-score" style={{ color: dim.color || '#FF8541' }}>
                          {avgScore.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {validTraits.map((item: any, i: number) => (
                      <div key={i} className="item-row">
                        <span className="item-name">{item.trait}</span>
                        <span className="item-score">{Number(item?.score)?.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comment section - using ScoreSlider component placeholder */}
          {/* Comment section - using ScoreSlider component placeholder */}
          {/* Comment section - exact copy from Scores Sent */}
          <div className="slider-container">
            {rating?.rating_data?.filter((dim: any) => dim?.comment && dim.comment.trim() !== '').map((dim: any, idx: number) => (
              <div key={idx} className="comment-section" style={{ minWidth: '240px', flexShrink: 0, marginRight: '10px', marginTop: 0 }}>
                <p className="comment-category" style={{
                  color: '#000000',
                  fontSize: '11px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  textTransform: 'capitalize'
                }}>
                  {dim.topic}
                </p>
                <p className="comment-text">
                  {dim.comment}
                </p>
              </div>
            ))}

            {(!rating?.rating_data || !rating.rating_data.some((dim: any) => dim?.comment && dim.comment.trim() !== '')) && (
              <p className="no-comments-text" style={{ paddingLeft: '12px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>No comments added</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="card-footer">
            <div className="action-buttons-row">
              <div className="block-button">
                <button
                  onClick={handleBlockClick}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins',
                    fontSize: '15px',
                    fontWeight: '500',
                    padding: 0,
                  }}
                >
                  Block
                </button>
              </div>
              <div>
                <button
                  className="report-button"
                  onClick={handleReportClick}
                  disabled={loading}
                >
                  Report
                </button>
              </div>
            </div>
            <button className="close-button" onClick={() => setExpanded(false)}>
              <span style={{ fontWeight: '500', marginRight: '4px', fontSize: '15px', fontFamily: 'Poppins' }}>
                Close
              </span>
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        visible={showBlockModal}
        message="Are you sure you want to block?"
        onCancel={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
        cancelText="Cancel"
        confirmText="Confirm"
      />

      <ReportDialog
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        ratingId={rating._id}
        onReportSuccess={handleReportSuccess}
      />

      <SuccessMessageModal
        visible={showBlockedSuccessModal}
        message="Blocked User"
        onClose={() => setShowBlockedSuccessModal(false)}
      />

      <SuccessMessageModal
        visible={showReportSuccessModal}
        message="successfully reported"
        onClose={() => setShowReportSuccessModal(false)}
      />
    </div>
  );
};

const ScoresReceivedScreen: React.FC = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await getRatingsForMe();
      console.log('Received Ratings:', response);
      const data = Array.isArray(response?.data) ? response.data : [];
      // Filter for approved or reported ratings (matching mobile app)
      const approvedRatings = data.filter(
        (rating: any) => rating?.status === 'approved' || rating?.status === 'reported'
      );
      // Sort in descending order (newest first)
      approvedRatings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRatings(approvedRatings);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load scores');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleRemove = (id: string) => {
    setRatings(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="scores-received-container">
      <div className="scores-received-content">
        {/* Header */}
        <div className="header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1 className="header-text">Scores Received</h1>
            <span className="header-count">
              {ratings.length.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : ratings.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">You haven't received any scores yet.</p>
          </div>
        ) : (
          <div className="scores-list">
            {ratings.map((rating) => (
              <ScoreCard
                key={rating._id}
                rating={rating}
                onUpdate={fetchRatings}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
      <Navigation initialTab="PROFILE" />
    </div>
  );
};

export default ScoresReceivedScreen;
