import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getRelationsById } from '@/api/relationApi';
import { toast } from 'react-toastify';
import './ScoringFlowScreen.css';

interface Trait {
  name: string;
  description: string;
  key: string;
}

interface Step {
  id: string;
  title: string;
  traits: Trait[];
}

interface Steps {
  steps: Step[];
  metadata: {
    relationId: string;
    relationName: string;
    createdAt: string;
    updatedAt: string;
  };
}

const ScoringFlowScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPerson, selectedRelation, receiverID, scoringData, setScoringData } = useApp();
  const scrollViewRef = useRef<HTMLDivElement>(null);

  const [steps, setSteps] = useState<Steps | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [traitsData, setTraitsData] = useState<any>({});
  const [hiddenTraits, setHiddenTraits] = useState<any>({});
  const [stepComments, setStepComments] = useState<any>({});
  const [currentComment, setCurrentComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const contactInfo = {
    email: selectedPerson?.email || '',
    phone: selectedPerson?.phone_number || ''
  };

  useEffect(() => {
    const fetchRelationTopics = async () => {
      if (!selectedRelation) {
        console.error('No selected relation');
        navigate('/relationship-selection');
        return;
      }

      try {
        console.log('📡 Fetching relation topics for:', selectedRelation);
        const apiResponse = await getRelationsById(selectedRelation);
        console.log('✅ API Response:', apiResponse);

        const topics = Array.isArray(apiResponse?.topics) ? apiResponse.topics : [];
        console.log('   topics:', topics);

        const transformed: Steps = {
          steps: topics.map((topic: any) => ({
            id: topic?._id,
            title: topic?.topic,
            traits: (Array.isArray(topic?.traits) ? topic.traits : []).map((trait: any) => ({
              name: trait?.subTopic,
              description: trait?.trait,
              key: trait?._id
            })),
          })),
          metadata: {
            relationId: apiResponse?._id || '',
            relationName: apiResponse?.name || '',
            createdAt: apiResponse?.createdAt || '',
            updatedAt: apiResponse?.updatedAt || ''
          }
        };

        console.log('   Transformed steps:', transformed.steps.length);
        setSteps(transformed);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching relation topics:', error);
        toast.error('Failed to load scoring topics');
        setLoading(false);
      }
    };

    fetchRelationTopics();
  }, [selectedRelation, navigate]);

  // Initialize scoring data when updating an existing score
  useEffect(() => {
    console.log('📊 useEffect - Initialize scoring data');
    console.log('   scoringData:', scoringData);
    console.log('   steps:', steps);

    if (scoringData && scoringData?.rating_data && steps?.steps && steps.steps.length > 0) {
      const newTraitsData: any = {};
      const newStepComments: { [stepId: number]: string } = {};
      const newHiddenTraits: { [key: string]: boolean } = {};

      scoringData?.rating_data?.forEach((ratingStep: any, index: number) => {
        const stepId = index + 1;
        newStepComments[stepId] = ratingStep.comment || '';

        // Safety check: ensure step exists in steps array
        const currentStepData = steps?.steps[stepId - 1];
        if (!currentStepData || !Array.isArray(currentStepData.traits)) {
          console.log(`⚠️ Step ${stepId} not found in steps array or has no traits`);
          return;
        }

        // Map traits from rating_data to traitsData
        ratingStep.traits?.forEach((ratingTrait: any) => {
          // Find matching trait in current step by name
          const matchingTrait = currentStepData.traits.find(
            (t: Trait) => t.name === ratingTrait.trait || t.description === ratingTrait.trait
          );

          if (matchingTrait) {
            if (ratingTrait.score === null || ratingTrait.score === undefined) {
              // Trait was hidden
              newHiddenTraits[matchingTrait.key] = true;
            } else {
              // Trait has a score
              newTraitsData[matchingTrait.key] = ratingTrait.score;
            }
          }
        });
      });

      console.log('✅ Initialized scoring data:');
      console.log('   traitsData:', newTraitsData);
      console.log('   stepComments:', newStepComments);
      console.log('   hiddenTraits:', newHiddenTraits);

      setTraitsData(newTraitsData);
      setStepComments(newStepComments);
      setHiddenTraits(newHiddenTraits);
    } else {
      console.log('⚠️ Cannot initialize scoring data - missing required data');
      console.log('   Has scoringData?', !!scoringData);
      console.log('   Has rating_data?', !!scoringData?.rating_data);
      console.log('   Has steps?', !!steps?.steps);
      console.log('   Steps length:', steps?.steps?.length);
    }
  }, [scoringData, steps]);

  // Update current comment when step changes
  useEffect(() => {
    setCurrentComment(stepComments[currentStep] || '');
  }, [currentStep, stepComments]);

  const goToNextStep = async () => {
    if (!steps) return;

    if (currentStep < steps.steps.length) {
      setCurrentStep(currentStep + 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTop = 0;
      }
    } else {
      await handleFinish();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTop = 0;
      }
    } else {
      navigate('/dashboard');
    }
  };

  // Handle browser back button - redirect to dashboard if on step 1
  useEffect(() => {
    const handlePopState = () => {
      if (currentStep === 1) {
        navigate('/dashboard', { replace: true });
      } else {
        setCurrentStep(prev => prev - 1);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTop = 0;
        }
        // Push state again to keep intercepting back button
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Push a dummy state to detect back button press
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, currentStep]);

  const handleFinish = async () => {
    if (!steps) return;

    // Prepare rating data
    const ratingData = steps.steps.map((step, index) => {
      const stepTraits = step.traits.map((trait) => ({
        trait: trait.name,
        score: hiddenTraits[trait.key] ? null : (traitsData[trait.key] || null),
      }));

      return {
        topic: step.title,
        traits: stepTraits,
        comment: stepComments[index + 1] || '',
      };
    });

    console.log('📊 Finishing scoring flow, navigating to review screen');
    console.log('   Rating data prepared:', {
      receiver_id: receiverID,
      relation: selectedRelation,
      categories: ratingData.length
    });

    // Store the rating data in context
    setScoringData({ rating_data: ratingData });

    // Navigate to SapienScoreScreen for review
    navigate('/sapien-score');
  };

  const handleHideTrait = (key: string) => {
    setHiddenTraits((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (!hiddenTraits[key]) {
      setTraitsData((prev: any) => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
    }
  };

  const getNameToDisplay = () => {
    if (!selectedPerson) return '';

    let nameToDisplay = '';

    if (selectedPerson.name) {
      nameToDisplay = selectedPerson.name;
    } else if (selectedPerson.email) {
      nameToDisplay = selectedPerson.email.includes('@gmail.com')
        ? selectedPerson.email.split('@gmail.com')[0]
        : selectedPerson.email;
    } else if (selectedPerson.phone_number) {
      nameToDisplay = selectedPerson.phone_number;
    }

    return nameToDisplay.slice(0, 16); // Limit to 16 characters
  };

  const handleOpenModal = () => {
    setCurrentComment(stepComments[currentStep] || '');
    setModalVisible(true);
  };

  const handleSaveComment = () => {
    setStepComments((prev: any) => ({ ...prev, [currentStep]: currentComment }));
    setModalVisible(false);
  };

  const currentStepData = steps?.steps && steps.steps.length > 0 ? steps.steps[currentStep - 1] : undefined;

  if (loading || !currentStepData) {
    return (
      <div className="scoring-flow-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Preparing scoring flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scoring-flow-container">
      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar-flow">
          {steps?.steps.map((step: any, index: number) => (
            <div
              key={step.id}
              className={`progress-dot ${currentStep >= (index + 1) ? 'active-dot' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="main-container">
        {/* Header Section */}
        <div className="header-section">
          <button className="back-button" onClick={goToPreviousStep}>
            <ArrowLeft size={24} color="black" />
          </button>

          <div className="score-container">
            <p className="score-text">Score</p>

            <div className="header-content-wrap">
              <p className="name-text">{getNameToDisplay()}</p>
              <p className="contact-text">
                {contactInfo.phone || contactInfo.email}
              </p>
            </div>
          </div>
        </div>

        {/* Category Header */}
        <div className="category-header">
          <div className="title-container">
            <p className="category-title">{currentStepData.title}</p>
            {currentStepData.traits && (
              <p className="traits-count">{currentStepData.traits.length} traits</p>
            )}
          </div>
        </div>

        {/* Traits ScrollView */}
        <div className="scroll-view" ref={scrollViewRef}>
          {currentStepData.traits.map((trait: Trait, idx: number) => (
            <div key={trait.key} className="trait-section">
              <div className="trait-header">
                <p className="trait-name">{trait.name}</p>
                <button className="hide-trait-button" onClick={() => handleHideTrait(trait.key)}>
                  {hiddenTraits[trait.key] ? (
                    <div className="not-rated-container">
                      <span className="not-rated-text">not rated</span>
                      <ChevronDown size={16} color="#000" />
                    </div>
                  ) : (
                    <div className="info-container">
                      <Minus size={30} className="info-icon" />
                    </div>
                  )}
                </button>
              </div>
              <div className="trait-content">
                {!hiddenTraits[trait.key] && (
                  <>
                    <p className="trait-description">{trait.description}</p>
                    <RatingSlider
                      sliderKey={trait.key}
                      index={idx}
                      initialValue={traitsData[trait.key] || 0}
                      onValueChange={(key: string, value: number) => {
                        setTraitsData((prev: any) => ({
                          ...prev,
                          [key]: value,
                        }));
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
          <div className="spacer" />
        </div>

        {/* Comment Section */}
        <div className="comment-slider-container">
          <button className="comment-card" onClick={handleOpenModal}>
            <p className="comment-title">{currentStepData.title}</p>
            <p className="comment-content">
              {stepComments[currentStep] || 'If something worth sharing, write here'}
            </p>
          </button>
        </div>

        {/* Next Button */}
        <button
          className="next-button"
          onClick={goToNextStep}
          disabled={submitting}
        >
          <div className="next-button-content">
            <span className="next-button-text">
              {currentStep === steps?.steps.length ? 'Finish' : 'next'}
            </span>
            <ArrowRight size={20} color="#000" className="next-button-icon" />
          </div>
        </button>
      </div>

      {/* Comment Modal */}
      {modalVisible && (
        <>
          <div className="modal-overlay" onClick={() => setModalVisible(false)} />
          <div className="modal-container">
            <div className="modal-content">
              <textarea
                className="modal-text-input"
                placeholder="If something worth sharing, write here"
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                autoFocus
              />
              <div className="modal-button-container">
                <button
                  className="modal-button cancel-button"
                  onClick={() => setModalVisible(false)}
                >
                  <span className="modal-button-cancel-text">Cancel</span>
                </button>
                <button
                  className="modal-button save-button"
                  onClick={handleSaveComment}
                >
                  <span className="modal-button-confirm-text">Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// RatingSlider Component
interface RatingSliderProps {
  sliderKey: string;
  index: number;
  initialValue: number;
  onValueChange: (key: string, value: number, index: number) => void;
}

const RatingSlider: React.FC<RatingSliderProps> = ({ sliderKey, index, initialValue, onValueChange }) => {
  const [value, setValue] = useState<number>(initialValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const minValue = 0;
  const maxValue = 10;
  const ticks = Array.from({ length: maxValue - minValue + 1 }, (_, i) => i);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    onValueChange(sliderKey, newValue, index);
  };

  const calculateValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const rawValue = minValue + (maxValue - minValue) * percentage;
    const steppedValue = Math.round(rawValue);
    return Math.max(minValue, Math.min(maxValue, steppedValue));
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newValue = calculateValueFromPosition(e.clientX);
    handleValueChange(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const newValue = calculateValueFromPosition(e.clientX);
    handleValueChange(newValue);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newValue = calculateValueFromPosition(e.clientX);
    handleValueChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const newValue = calculateValueFromPosition(touch.clientX);
    handleValueChange(newValue);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newValue = calculateValueFromPosition(touch.clientX);
    handleValueChange(newValue);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  const getTickStyle = (position: number) => {
    if (position === 0 || position === 10) {
      return { width: '2px', height: '25px', backgroundColor: '#000000' };
    } else {
      return { width: '1px', height: '15px', backgroundColor: '#888888' };
    }
  };

  const activeWidthPercentage = `${(value / maxValue) * 100}%`;
  const thumbLeftPosition = `${(value / maxValue) * 100}%`;

  return (
    <div className="slider-outer-container">
      <div
        ref={sliderRef}
        className="slider-container"
        onClick={handleSliderClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        <span className="slider-label start-label">{minValue}</span>
        <span className="slider-label end-label">{maxValue}</span>

        <div className="track-background" />
        <div
          className="active-track"
          style={{ width: activeWidthPercentage }}
        />
        <div className="tick-container">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="tick"
              style={getTickStyle(tick)}
            />
          ))}
        </div>
        <div
          className="thumb"
          style={{ left: thumbLeftPosition }}
        />
      </div>
    </div>
  );
};

export default ScoringFlowScreen;
