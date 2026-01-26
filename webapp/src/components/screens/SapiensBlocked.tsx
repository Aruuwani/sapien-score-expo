import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getRatingsForMe, updateRatingStatus } from '@/api/ratingApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import ConfirmationModal from '../ui/ConfirmationModal';
import ReportDialog from '../ui/ReportDialog';
import SuccessMessageModal from '../ui/SuccessMessageModal';
import './SapiensBlocked.css';

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
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportSuccessModal, setShowReportSuccessModal] = useState(false);

  const sender = rating?.sender_id || {};
  const senderName = sender?.username || sender?.work_email || 'Anonymous';
  const relation = rating?.sender_relation_name || 'Unknown';
  const createdAt = formatDate(rating?.created_at);

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

  // Show all logic
  const leftToShow = showAll ? leftDimensions.length : Math.min(leftDimensions.length, 2);
  const rightToShow = showAll ? rightDimensions.length : Math.min(rightDimensions.length, 2);

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

  const handleUnblockClick = () => {
    setShowUnblockModal(true);
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

  const handleUnblockConfirm = async () => {
    setShowUnblockModal(false);
    setLoading(true);
    try {
      // Determine target status based on where it was blocked from
      // If blocked from requests, restore to 'pending'
      // If blocked from received, restore to 'approved'
      const targetStatus = rating?.blocked_from === 'requests' ? 'pending' : 'approved';
      await updateRatingStatus(rating._id, targetStatus);
      toast.success('User unblocked successfully');
      onRemove(rating._id);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blocked-card">
      <div className="blocked-card-header">
        <div className="blocked-card-info">
          <h3 className="blocked-card-name">{senderName}</h3>
          <p className="blocked-card-relation">
            scored you <span style={{ color: '#0050EB', fontSize: '15px', fontFamily: 'Poppins-Regular', fontWeight: '500' }}>{averageScore}</span>
          </p>
        </div>
        <div className="blocked-card-date-box">
          <p className="date-label">last scored on</p>
          <p className="date-text">{createdAt}</p>
          {!expanded && (
            <button className="open-button" onClick={() => setExpanded(true)}>
              <span style={{ fontWeight: '600', marginRight: '4px' }}>Open</span>
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="blocked-card-details">
          {/* Two-column dimension layout */}
          <div className="dimension-row">
            {/* Left column - odd indexed dimensions */}
            <div className="left-dimension">
              {leftDimensions.slice(0, leftToShow).map((dim: any, idx: number) => {
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
              {rightDimensions.slice(0, rightToShow).map((dim: any, idx: number) => {
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

          {/* Show all toggle */}
          {filteredDimensions.length > 4 && (
            <div className="show-all-container">
              <button className="show-all-button" onClick={() => setShowAll(!showAll)}>
                <span style={{ fontWeight: '600', marginRight: '4px' }}>
                  {showAll ? 'Show less' : 'Show all'}
                </span>
                <ChevronDown size={18} />
              </button>
            </div>
          )}

          {/* Comment section */}
          {/* Comment section */}
          <div className="slider-container">
            {rating?.rating_data?.filter((dim: any) => dim?.comment && dim.comment.trim() !== '').map((dim: any, idx: number) => (
              <div key={idx} className="comment-section">
                <p className="comment-label" style={{
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
              <p style={{ padding: '10px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>No comments</p>
            )}
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            <div className="action-buttons-row">
              <div>
                <button className="report-button" onClick={handleReportClick} disabled={loading}>
                  Report
                </button>
              </div>
              <div>
                <button className="block-button" onClick={handleUnblockClick} disabled={loading}>
                  Un-Block
                </button>
              </div>
            </div>
            <button className="close-button" onClick={() => setExpanded(false)}>
              <span>Close</span>
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      <ConfirmationModal
        visible={showUnblockModal}
        message="Are you sure you want to un-block?"
        onCancel={() => setShowUnblockModal(false)}
        onConfirm={handleUnblockConfirm}
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
        visible={showReportSuccessModal}
        message="successfully reported"
        onClose={() => setShowReportSuccessModal(false)}
      />
    </div>
  );
};

const SapiensBlocked: React.FC = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedRatings = async () => {
    setLoading(true);
    try {
      const response = await getRatingsForMe();
      console.log('Blocked Users:', response);
      const data = Array.isArray(response?.data) ? response.data : [];
      // Filter only blocked ratings
      const blockedRatings = data.filter((r: any) => r.status === 'blocked');
      setRatings(blockedRatings);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load blocked users');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedRatings();
  }, []);

  const handleRemove = (id: string) => {
    setRatings(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="blocked-container">
      <div className="blocked-content">
        {/* Header */}
        <div className="header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1 className="header-text">Blocked</h1>
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
            <p className="empty-text">No blocked users.</p>
          </div>
        ) : (
          <div className="blocked-list">
            {ratings.map((rating) => (
              <ScoreCard
                key={rating._id}
                rating={rating}
                onUpdate={fetchBlockedRatings}
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

export default SapiensBlocked;
