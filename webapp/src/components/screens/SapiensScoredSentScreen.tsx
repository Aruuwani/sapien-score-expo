import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getSapienwhoIScored } from '@/api/ratingApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import UpdateScoreMessageModal from '../ui/UpdateScoreMessageModal';
import { useAppContext } from '@/context/AppContext';
import './SapiensScoredSentScreen.css';

interface ScoreCardProps {
  rating: any;
  contactsMap: Map<string, string>; // phone number -> contact name
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const has24HoursPassed = (createdAt: Date | string): boolean => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) return false;
  const now = new Date();
  const diffInMs = now.getTime() - createdDate.getTime();
  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
  return diffInMs >= twentyFourHoursInMs;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ rating, contactsMap }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const { setSelectedPerson, setSelectedRelation, setScoringData, setReceiverID, setUpdatedRatingId } = useAppContext();

  const receiver = rating?.receiver_id || {};

  // Helper function to trim email (get part before @)
  const trimEmail = (email: string | undefined): string | null => {
    if (!email || typeof email !== 'string') return null;
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      return email.substring(0, atIndex);
    }
    return email; // Return as-is if no @ found
  };

  // Helper function to normalize phone number for comparison
  const normalizePhone = (phone: string | undefined): string => {
    if (!phone) return '';
    // Remove all non-digit characters and get last 10 digits
    return phone.replace(/\D/g, '').slice(-10);
  };

  // Determine receiver display name:
  // 1. If phone matches a saved contact in localStorage → show contact name
  // 2. If no match → show trimmed email (part before @)
  // 3. Never show username
  // 4. Fall back to phone_number or 'Unknown Person'
  const getReceiverDisplayName = (): string => {
    const receiverPhone = receiver?.phone_number;

    console.log('[ScoreCard] Receiver phone:', receiverPhone);
    console.log('[ScoreCard] ContactsMap size:', contactsMap.size);
    console.log('[ScoreCard] ContactsMap entries:', Array.from(contactsMap.entries()));

    // First priority: Lookup contact name from localStorage by normalized phone
    if (receiverPhone && contactsMap.size > 0) {
      const normalizedReceiverPhone = normalizePhone(receiverPhone);
      console.log('[ScoreCard] Normalized receiver phone:', normalizedReceiverPhone);

      // Direct lookup first (keys are already 10-digit normalized)
      if (contactsMap.has(normalizedReceiverPhone)) {
        const name = contactsMap.get(normalizedReceiverPhone)!;
        console.log('[ScoreCard] Found match by direct lookup:', name);
        return name;
      }

      // Try iterating as fallback
      for (const [phone, name] of contactsMap.entries()) {
        if (normalizedReceiverPhone === phone) {
          console.log('[ScoreCard] Found match by iteration:', name);
          return name;
        }
      }
      console.log('[ScoreCard] No match found in contactsMap');
    }

    // Second priority: Trimmed email (work_email first, then personal email)
    const trimmedWorkEmail = trimEmail(receiver?.work_email);
    if (trimmedWorkEmail) {
      return trimmedWorkEmail;
    }

    const trimmedEmail = trimEmail(receiver?.email);
    if (trimmedEmail) {
      return trimmedEmail;
    }

    // Third priority: Phone number (if no contact name found)
    if (receiverPhone) {
      return receiverPhone;
    }

    return 'Unknown Person';
  };

  const receiverName = getReceiverDisplayName();

  // Handle relation mapping with multiple potential paths
  const relation = rating?.sender_relation_name ||
    rating?.sender_relation?.name ||
    rating?.relation_name ||
    rating?.relation ||
    'Unknown Relation';
  const createdAt = formatDate(rating?.created_at);
  const is24HoursPassed = has24HoursPassed(rating?.created_at);

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

  // Show all toggle - show first 4 by default
  const visibleDimensions = showAll ? filteredDimensions : filteredDimensions.slice(0, 4);

  // Split into left and right columns
  const leftDimensions = visibleDimensions.filter((_: any, index: number) => index % 2 === 0);
  const rightDimensions = visibleDimensions.filter((_: any, index: number) => index % 2 === 1);

  const handleUpdateScore = () => {
    if (!is24HoursPassed) {
      setShowUpdateModal(true);
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 UPDATE SCORE FLOW INITIATED');
    console.log('   Rating ID:', rating?._id);
    console.log('═══════════════════════════════════════════════════════');

    // Pre-fill scoring data for update flow
    const receiver = rating?.receiver_id || {};
    const receiverData = {
      id: receiver._id || receiver.id,
      name: receiver.username,
      email: receiver.email,
      phone_number: receiver.phone_number,
      work_email: receiver.work_email,
    };

    // Set context data for scoring flow
    setSelectedPerson(receiverData);
    // Use sender_relation (ID) instead of sender_relation_name
    setSelectedRelation(rating?.sender_relation || null);
    setReceiverID(receiver._id || receiver.id || null);

    // ✅ SET THE RATING ID FOR UPDATE FLOW
    setUpdatedRatingId(rating?._id || null);

    // Pre-fill the rating data
    setScoringData({ rating_data: rating?.rating_data || [] });

    console.log('✅ Context updated with:');
    console.log('   - updatedRatingId:', rating?._id);
    console.log('   - receiverID:', receiver._id || receiver.id);
    console.log('   - selectedRelation:', rating?.sender_relation);
    console.log('   - scoringData categories:', rating?.rating_data?.length);
    console.log('═══════════════════════════════════════════════════════\n');

    // Navigate to scoring flow
    navigate('/scoring-flow');
  };

  return (
    <div className="score-card">
      <div className="score-card-header">
        <div className="score-card-info">
          <span className="score-card-name">{receiverName}</span>
          <div className='divTag'>
            <p className="score-card-relation">
              {relation}
            </p>
            <p className="score-row" style={{ fontSize: '15px', fontWeight: '275', fontFamily: 'Poppins', marginRight: '20px' }}>
              you scored <span className="score-value">{averageScore}</span>
            </p>
          </div>

        </div>
        <div className="score-card-date-box">
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

          {/* Show all toggle */}
          {filteredDimensions.length > 4 && (
            <div className="show-all-container">
              <button className="show-all-button" onClick={() => setShowAll(!showAll)}>
                <span style={{ fontWeight: '600', marginRight: '4px' }}>
                  {showAll ? 'Show less' : 'Show all'}
                </span>
                {showAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          )}

          {/* Comment section - using ScoreSlider component placeholder */}
          {/* Comment section */}
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
              <p className="no-comments-text" style={{ paddingLeft: '12px' }}>No comments added</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="card-footer sentscord">
            <button
              className={`update-button ${!is24HoursPassed ? 'disabled' : ''}`}
              onClick={handleUpdateScore}
              disabled={!is24HoursPassed}
            >
              Update Score
            </button>
            <button className="close-button" onClick={() => setExpanded(false)}>
              <span style={{ fontWeight: '500', marginRight: '15px', fontSize: '15px', fontFamily: 'Poppins' }}>
                Close
              </span>
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Update Score Modal */}
      <UpdateScoreMessageModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
      />
    </div>
  );
};

const SapiensScoredSentScreen: React.FC = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactsMap, setContactsMap] = useState<Map<string, string>>(new Map());

  // Load saved contacts from localStorage
  const loadContactsFromLocalStorage = () => {
    try {
      const storedContacts = localStorage.getItem('sapien_contacts');
      console.log('[Contacts] Raw localStorage sapien_contacts:', storedContacts);

      if (storedContacts) {
        const contacts = JSON.parse(storedContacts);
        console.log('[Contacts] Parsed contacts object:', contacts);
        const newContactsMap = new Map<string, string>();

        // Convert object to Map
        Object.entries(contacts).forEach(([phone, name]) => {
          if (phone && name) {
            newContactsMap.set(phone, name as string);
            console.log('[Contacts] Added to map:', phone, '->', name);
          }
        });

        console.log('[Contacts] Final contactsMap size:', newContactsMap.size);
        setContactsMap(newContactsMap);
      } else {
        console.log('[Contacts] No saved contacts in localStorage');
      }
    } catch (error) {
      console.error('[Contacts] Failed to load from localStorage:', error);
    }
  };

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const response = await getSapienwhoIScored();
      console.log('Sapiens I Scored:', response);
      const data = Array.isArray(response?.data) ? response.data : [];
      // Sort by created_at descending (newest first)
      const sortedData = data.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRatings(sortedData);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load scores');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactsFromLocalStorage();
    fetchRatings();
  }, []);

  return (
    <div className="sapiens-scored-container">
      <div className="sapiens-scored-content">
        {/* Header */}
        <div className="header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={24} />
          </button>
          <div className="header-content">
            <h1 className="header-text">Scores Sent</h1>
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
            <p className="empty-text">You haven't scored anyone yet.</p>
          </div>
        ) : (
          <div className="scores-list">
            {ratings.map((rating) => (
              <ScoreCard key={rating._id} rating={rating} contactsMap={contactsMap} />
            ))}
          </div>
        )}
      </div>
      <Navigation initialTab="PROFILE" />
    </div>
  );
};

export default SapiensScoredSentScreen;
