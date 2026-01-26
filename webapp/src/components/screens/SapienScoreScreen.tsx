import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { createRating, updateRating } from '@/api/scoreSapien';
import { toast } from 'react-toastify';
import './SapienScoreScreen.css';

const SapienScoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPerson, selectedRelation, scoringData, updatedRatingId, setUpdatedRatingId } = useApp();
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const parsedData = typeof scoringData === 'string' ? JSON.parse(scoringData) : scoringData;

  useEffect(() => {
    // If no scoring data, redirect back
    if (!parsedData || !parsedData.rating_data) {
      console.log('No scoring data found, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [parsedData, navigate]);

  const calculateOverallScore = () => {
    if (!parsedData?.rating_data) return 0;

    let totalScore = 0;
    let totalCount = 0;

    parsedData.rating_data.forEach((category: any) => {
      category.traits.forEach((trait: any) => {
        if (trait.score !== null && trait.score !== undefined) {
          totalScore += trait.score;
          totalCount++;
        }
      });
    });

    if (totalCount === 0) return 0;
    return totalScore / totalCount;
  };

  const overallScore = calculateOverallScore();

  const handleShare = async () => {
    if (overallScore === 0) {
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 SUBMITTING RATING');
    console.log('   Is Update Flow:', !!updatedRatingId);
    console.log('   Updated Rating ID:', updatedRatingId);
    console.log('═══════════════════════════════════════════════════════');

    setLoading(true);

    try {
      const emailOrPhone = selectedPerson?.id || selectedPerson?.email || selectedPerson?.phone_number;
      const payload = {
        ...parsedData,
        sender_relation: selectedRelation,
        emailOrPhone: emailOrPhone,
        existing_rating_id: updatedRatingId
      };

      console.log('📡 Calling API...');
      console.log('Method:', updatedRatingId ? 'updateRating' : 'createRating');
      console.log('Payload:', payload);

      let response;
      if (updatedRatingId) {
        // Update existing rating - pass Rating ID, not Receiver ID
        response = await updateRating(updatedRatingId, payload);
      } else {
        // Create new rating
        response = await createRating(payload);
      }

      console.log('✅ Rating created successfully:', response);

      if (response) {
        setLoading(false);
        console.log('✅ Rating', updatedRatingId ? 'updated' : 'shared', 'successfully!');
        console.log('═══════════════════════════════════════════════════════\n');

        // Clear the updatedRatingId after successful submission
        setUpdatedRatingId(null);

        // toast.success(updatedRatingId ? 'Score updated successfully!' : 'Score shared successfully!');

        // Navigate to ShareScreen
        setTimeout(() => {
          navigate('/share-screen');
        }, 500);
      } else {
        console.log('⚠️ No response from createRating');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('❌❌❌ ERROR SUBMITTING RATING ❌❌❌');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.log('═══════════════════════════════════════════════════════\n');

      setLoading(false);

      // Check if this is a duplicate rating error
      const isDuplicateError = error.response?.data?.alreadyScored === true ||
        error.response?.data?.alreadyScored === 'true' ||
        error.response?.data?.error?.includes('already rated') ||
        error.response?.data?.message?.includes('already rated');

      if (isDuplicateError) {
        console.log('⚠️⚠️⚠️ DUPLICATE RATING ERROR ⚠️⚠️⚠️');
        console.log('   Showing error and NOT navigating to share screen');
      }

      // Show error message to user
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit rating. Please try again.';
      setCustomMessage(errorMessage);
      toast.error(errorMessage);

      // Keep error visible longer for duplicate errors
      const timeout = isDuplicateError ? 5000 : 3000;
      setTimeout(() => setCustomMessage(''), timeout);

      // Do NOT navigate to share screen if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!parsedData || !parsedData.rating_data) {
    return null;
  }




  return (
    <div className="sapien-score-container">
      {/* Header */}
      <div className="sapien-score-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={24} color="black" />
        </button>
        <h1 className="header-title">Your SapienScore for</h1>
      </div>

      {/* Person and Score */}
      <div className="person-container">
        {selectedPerson?.name ? (
          <p className="person-name">{selectedPerson.name}</p>
        ) : (
          <p className="person-email">{selectedPerson?.email || selectedPerson?.phone_number || 'Unknown'}</p>
        )}
        <p className="overall-score">{overallScore.toFixed(1)}</p>
      </div>

      {/* Content */}
      <div className="sapien-score-content">
        {/* Category Progress Bars */}
        {parsedData.rating_data.map((category: any, index: number) => {
          const validScores = category.traits
            .map((trait: any) => trait.score)
            .filter((score: number | null) => score !== null);

          const averageScore = validScores.length
            ? validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length
            : 0;

          const normalizedScore = averageScore / 10; // Assuming max score is 10

          return (
            <div key={index} className="category-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${normalizedScore * 100}%`
                }}
              />
              <p className="category-name">{category.topic}</p>
            </div>
          );
        })}

        {/* Comments Title */}
        <p className="comments-title">comments</p>

        {/* Comments Display */}
        <div className="comments-section">
          {parsedData.rating_data
            .filter((category: any) => category.comment && category.comment.trim() !== '')
            .map((category: any, index: number) => (
              <div key={index} className="comment-card">
                <p className="comment-category">{category.topic}</p>
                <p className="comment-text">{category.comment}</p>
              </div>
            ))}
          {parsedData.rating_data.filter((cat: any) => cat.comment && cat.comment.trim() !== '').length === 0 && (
            <p className="no-comments-text">No comments added</p>
          )}
        </div>

        {/* Share Info */}

      </div>

      {/* Custom Message */}
      {customMessage && (
        <>
          <div className="message-overlay" />
          <div className="message-container">
            <p className="custom-message">{customMessage}</p>
          </div>
        </>
      )}

      {/* Not Scored Modal */}
      {showModal && (
        <>
          <div className="message-overlay" />
          <div className="message-container">
            <p className="custom-message">Please score at least one trait before sharing</p>
          </div>
        </>
      )}

      <div className="share-info-container">
        <p className="share-info-bold">
          share confidently!<br />
          senders names are anonymous
        </p>
      </div>
      {/* Footer */}
      <div className="sapien-score-footer">


        <p className="edit-info">
          you can change the scores after 24 hours
        </p>
        <button
          className={`share-button ${loading ? 'share-button-disabled' : ''}`}
          onClick={handleShare}
          disabled={loading}
        >
          <span className="share-button-text">
            {loading ? 'Sharing...' : 'Share'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SapienScoreScreen;
