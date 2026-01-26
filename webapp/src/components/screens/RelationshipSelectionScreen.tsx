import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-toastify';
import { getAllRelations } from '@/api/relationApi';
import { getSapienwhoIScored } from '@/api/ratingApi';
import './RelationshipSelectionScreen.css';

type RelationType = 'Family' | 'Friend' | 'Partner' | 'Acquaintance' | 'Neighbor' | 'Mutual friend' | 'Work buddy' | 'Other';

const RelationshipSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPerson, setSelectedRelation, receiverID, setScoredRelationIds } = useApp();
  const [relationData, setRelationData] = useState<any[]>([]);
  const [customMessage, setCustomMessage] = useState(false);
  const [blockedRelationName, setBlockedRelationName] = useState<string>('');
  const [isInitDone, setIsInitDone] = useState(false);
  const [scoredIdsLocal, setScoredIdsLocal] = useState<string[]>([]);

  useEffect(() => {
    const fetchRelationData = async () => {
      try {
        const response = await getAllRelations();
        setRelationData(response || []);
      } catch (error) {
        console.error('Error fetching relation data:', error);
        toast.error('Failed to load relationships');
      }
    };
    fetchRelationData();
  }, []);

  // Fetch scored relations by using "Scores Sent" API and filtering by email/phone
  useEffect(() => {
    const fetchScoredRelations = async () => {
      // Get the email or phone we're scoring
      const emailOrPhone = selectedPerson?.email || selectedPerson?.phone_number || receiverID;

      if (!emailOrPhone || emailOrPhone.trim() === '') {
        setIsInitDone(true);
        return;
      }

      try {
        console.log('📡 Fetching all scores sent to find relations for:', emailOrPhone);
        const response = await getSapienwhoIScored();
        const allScoresSent = Array.isArray(response?.data) ? response.data : [];

        console.log('📊 Total scores sent:', allScoresSent.length);

        // Filter scores that match the current email/phone
        const matchingScores = allScoresSent.filter((rating: any) => {
          const receiver = rating?.receiver_id || {};
          // Check if any of the receiver's identifiers match
          return (
            receiver.email === emailOrPhone ||
            receiver.work_email === emailOrPhone ||
            receiver.phone_number === emailOrPhone
          );
        });

        console.log('✅ Matching scores for this email/phone:', matchingScores.length);

        // Extract relation IDs from matching scores
        const scoredRelationIds = matchingScores
          .map((rating: any) => rating.sender_relation)
          .filter((id: any) => id != null);

        console.log('🔗 Already scored relation IDs:', scoredRelationIds);

        if (scoredRelationIds.length > 0) {
          setScoredIdsLocal(scoredRelationIds);
          setScoredRelationIds(scoredRelationIds);
        }
      } catch (e) {
        console.log('⚠️ Fetch scores sent failed:', e);
      } finally {
        setIsInitDone(true);
      }
    };
    fetchScoredRelations();
  }, [selectedPerson, receiverID, setScoredRelationIds]);

  const handleRelationSelect = async (relationId: string, relationName?: string) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 DUPLICATE CHECK - Relation Selected');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Relation ID:', relationId);
    console.log('Relation Name:', relationName);
    console.log('Scored Relation IDs (local):', scoredIdsLocal);

    // Check if this relation is in the already-scored list
    const relationStr = String(relationId);
    const localSet = new Set(scoredIdsLocal.map(String));
    const isAlreadyScored = localSet.has(relationStr);

    if (isAlreadyScored) {
      console.log('⚠️⚠️⚠️ DUPLICATE DETECTED! ⚠️⚠️⚠️');
      setBlockedRelationName(relationName || 'this relation');
      setCustomMessage(true);
      setTimeout(() => {
        setCustomMessage(false);
        setBlockedRelationName('');
      }, 5000);
      return; // BLOCK user from proceeding
    }

    console.log('✅ Relation NOT in scored list - proceeding to scoring flow');
    setSelectedRelation(relationId);
    navigate('/scoring-flow');
  };

  return (
    <div className="relationship-selection-container">
      <button className="back-button" onClick={() => navigate('/user-selection')}>
        <ArrowLeft size={24} color="black" />
      </button>

      <div className="header-container">
        <h1 className="header-text">
          Select your relation with
        </h1>
      </div>

      <div className="person-name-container">
        <p className="person-name-text">
          {(() => {
            const name = selectedPerson?.name;
            if (name) return String(name).toUpperCase();
            const email = selectedPerson?.email;
            if (email) return String(email).split('@')[0].toUpperCase();
            const id = selectedPerson?.id;
            return (id ? String(id) : 'UNKNOWN').toUpperCase();
          })()}
        </p>
      </div>

      <div className="relations-container">
        {!isInitDone || !Array.isArray(relationData) || relationData.length === 0 ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            {relationData.map((item: any, index: number) => {
              const positions = [
                { top: '6%', left: '8%' },
                { top: '-2%', left: '60%' },
                { top: '18%', left: '60%' },
                { top: '30%', left: '8%' },
                { top: '42%', left: '60%' },
                { top: '60%', left: '8%' },
                { top: '70%', left: '60%' },
                { top: '84%', left: '8%' },
              ];

              const position = positions[index % positions.length];

              const itemIdStr = String(item._id);
              const scoredIdsLocalStr = scoredIdsLocal.map(String);
              const isScored = scoredIdsLocalStr.includes(itemIdStr);
              const isDisabled = isScored || !isInitDone;

              return (
                <div key={item._id} className="pill-position" style={position}>
                  <button
                    className={`relation-pill ${isDisabled ? 'relation-pill-disabled' : ''}`}
                    disabled={isDisabled}
                    onClick={() => {
                      console.log('🔘 Relation button pressed:', item.name);

                      if (isScored) {
                        console.log('🚫 BLOCKED: This relation is already scored!');
                        setBlockedRelationName(item.name || 'this relation');
                        setCustomMessage(true);
                        setTimeout(() => {
                          setCustomMessage(false);
                          setBlockedRelationName('');
                        }, 3000);
                        return;
                      }

                      if (!isInitDone) {
                        console.log('🚫 BLOCKED: Still initializing...');
                        return;
                      }

                      console.log('✅ Relation is available - proceeding to duplicate check...');
                      handleRelationSelect(item._id, item.name);
                    }}
                  >
                    <span className={`relation-text ${isDisabled ? 'relation-text-disabled' : ''}`}>
                      {item.name}
                      {isScored && ' ✓'}
                      {!isInitDone && ' (loading…)'}
                    </span>
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {customMessage && (
        <>
          <div className="message-overlay" />
          <div className="message-container">
            <div className="custom-message">
              You have already scored this person as "{blockedRelationName}". You can only score once per relation type.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelationshipSelectionScreen;
