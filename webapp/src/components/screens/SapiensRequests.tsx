import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getRatingsForMe, updateRatingStatus } from '@/api/ratingApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import ConfirmationModal from '../ui/ConfirmationModal';
import SuccessMessageModal from '../ui/SuccessMessageModal';
import './SapiensRequests.css';

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
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAcceptedSuccessModal, setShowAcceptedSuccessModal] = useState(false);
  const [showRejectedSuccessModal, setShowRejectedSuccessModal] = useState(false);
  const [showBlockedSuccessModal, setShowBlockedSuccessModal] = useState(false);

  const sender = rating?.sender_id || {};
  const senderName = sender?.username || sender?.work_email || 'Anonymous';
  const relation = rating?.sender_relation_name || 'Unknown';
  const createdAt = formatDate(rating?.created_at);

  // Process rating data to get top scored categories
  const processRatingData = () => {
    if (!rating?.rating_data || !Array.isArray(rating.rating_data)) return [];

    // Collect all categories with their scores
    const allCategories: any[] = [];
    rating.rating_data.forEach((topic: any) => {
      if (Array.isArray(topic?.traits)) {
        topic.traits.forEach((trait: any) => {
          if (typeof trait?.score === 'number' && trait.score > 0) {
            allCategories.push({
              category: trait.trait,
              score: trait.score,
              comment: trait.comment || topic.comment || ''
            });
          }
        });
      }
    });

    // Sort by score descending and take top 4
    const topCategories = allCategories
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return [{
      title: 'Top scored for you',
      color: '#000000',
      id: rating._id,
      items: topCategories.map(cat => ({
        category: cat.category,
        score: parseFloat(cat.score.toFixed(1)),
        comment: cat.comment
      }))
    }];
  };

  const dimensions = processRatingData();
  const visibleDimensions = showAll ? dimensions : dimensions.slice(0, 2);

  const handleAcceptClick = () => {
    setShowAcceptModal(true);
  };

  const handleAcceptConfirm = async () => {
    setShowAcceptModal(false);
    setLoading(true);
    try {
      await updateRatingStatus(rating._id, 'approved');
      onRemove(rating._id);
      setShowAcceptedSuccessModal(true);
      setTimeout(() => {
        setShowAcceptedSuccessModal(false);
        onUpdate();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept score');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    setShowRejectModal(false);
    setLoading(true);
    try {
      await updateRatingStatus(rating._id, 'rejected');
      onRemove(rating._id);
      setShowRejectedSuccessModal(true);
      setTimeout(() => {
        setShowRejectedSuccessModal(false);
        onUpdate();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject score');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="request-card">
      <div className="request-card-header">
        <div className="request-card-info">
          <div className="name-row">
            <h3 className="request-card-name">{senderName}</h3>
            <span className="new-badge">new</span>
          </div>
          {/* <p className="request-card-relation">{relation}</p> */}
        </div>
        <div className="request-card-date-box">
          <p className="date-label">scored you on</p>
          <p className="date-text">{createdAt}</p>
          {!expanded && (
            <div className="header-buttons">
              <button className="accept-header-button" onClick={handleAcceptClick} disabled={loading}>
                Accept
              </button>
              <button className="open-button" onClick={() => setExpanded(true)}>
                <ChevronDown size={22} />
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="request-card-details">
          {/* Partial score preview - two column layout */}
          {visibleDimensions.map((dim: any, idx: number) => (
            <div key={idx} className="dimension-row">
              {/* Left column - shows top scored categories */}
              <div className="left-dimension request-content" >
                <div className="dimension-header ">
                  <span className="dimension-title" >
                    {dim.title}
                  </span>
                </div>
                {(Array.isArray(dim?.items) ? dim.items.slice(0, 4) : []).map((item: any, i: number) => (
                  <div key={i} className="item-row">
                    <span className="item-name">{item.category}</span>
                    <span className="item-score">{Number(item?.score || 0).toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Right column - shows "accept to view full scores" message */}
              <div className="right-dimension">
                <div className="dimension-header request-card-header">
                  <div>
                    <p className="accept-message">
                      accept to view full<br />scores
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show all toggle */}
          {dimensions.length > 2 && (
            <div className="show-all-container">
              <button className="show-all-button" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'hide' : 'Show all'}
                <ChevronDown size={18} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          )}

          {/* Comment section */}
          {rating?.rating_data?.find((dim: any) => dim?.comment) && (
            <div className="comment-section">
              <p className="comment-label">Comment:</p>
              <p className="comment-text">
                {rating.rating_data.find((dim: any) => dim?.comment)?.comment}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="card-footer">
            <div className="action-buttons-row">
              <button className="block-button" onClick={handleBlockClick} disabled={loading}>
                Block
              </button>
              <button className="reject-button" onClick={handleRejectClick} disabled={loading}>
                Reject
              </button>
              <button className="accept-button" onClick={handleAcceptClick} disabled={loading}>
                Accept
              </button>
            </div>
            <button className="close-button" onClick={() => setExpanded(false)}>
              <span>Close</span>
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal
        visible={showAcceptModal}
        message="Are you sure you want to accept?"
        onCancel={() => setShowAcceptModal(false)}
        onConfirm={handleAcceptConfirm}
        cancelText="Cancel"
        confirmText="Confirm"
      />

      <ConfirmationModal
        visible={showRejectModal}
        message="Are you sure you want to reject?"
        submessage="(this will be moved to rejected scores)"
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        cancelText="Cancel"
        confirmText="Confirm"
      />

      <ConfirmationModal
        visible={showBlockModal}
        message="Are you sure you want to block?"
        onCancel={() => setShowBlockModal(false)}
        onConfirm={handleBlockConfirm}
        cancelText="Cancel"
        confirmText="Confirm"
      />

      <SuccessMessageModal
        visible={showAcceptedSuccessModal}
        message="Accepted"
        onClose={() => setShowAcceptedSuccessModal(false)}
      />

      <SuccessMessageModal
        visible={showRejectedSuccessModal}
        message="Rejected scores"
        onClose={() => setShowRejectedSuccessModal(false)}
      />

      <SuccessMessageModal
        visible={showBlockedSuccessModal}
        message="Blocked User"
        onClose={() => setShowBlockedSuccessModal(false)}
      />
    </div>
  );
};

const SapiensRequests: React.FC = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRatings = async () => {
    setLoading(true);
    try {
      const response = await getRatingsForMe();
      console.log('Pending Requests:', response);
      const data = Array.isArray(response?.data) ? response.data : [];
      // Filter only pending ratings
      const pendingRatings = data.filter((r: any) => r.status === 'pending');
      setRatings(pendingRatings);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load requests');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRatings();
  }, []);

  const handleRemove = (id: string) => {
    setRatings(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="requests-container">
      <div className="requests-content">
        {/* Header */}
        <div className="header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1 className="header-text">Requests</h1>
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
            <p className="empty-text">No pending requests.</p>
          </div>
        ) : (
          <div className="requests-list">
            {ratings.map((rating) => (
              <ScoreCard
                key={rating._id}
                rating={rating}
                onUpdate={fetchPendingRatings}
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

export default SapiensRequests;
