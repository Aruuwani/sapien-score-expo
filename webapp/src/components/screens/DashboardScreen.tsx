import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Menu, Settings, MessageSquare, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserProfile } from '@/api/userApi';
import { getRatingsForMe, getSapienwhoIScored } from '@/api/ratingApi';
import { markAllNotificationsAsRead, getNotifications } from '@/api/notificationApi';
import { toast } from 'react-toastify';
import Navigation from '../ui/Navigation';
import './DashboardScreen.css';

interface DashboardScreenProps {
  onStartScoring?: () => void;
  navigateToScreen?: (screen: string) => void;
  receivedScroretotal?: number;
  pendingScroretotal?: number;
  sapienIScoredLength?: number;
  blockedScoreLength?: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  notification?: string;
  hasArrow?: boolean;
  onPress?: () => void;
}

interface ScoreCategoryProps {
  title: string;
  score: string;
  scoredCount?: number;
  progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, notification, hasArrow = true, onPress }) => {
  return (
    <button className="stat-card" onClick={onPress}>
      <span className="stat-card-title">{title}</span>
      <div className="stat-card-right">
        <span className="stat-card-value">{value}</span>
        <div className="notification-container">
          {notification && <span className="notification-badge">{notification}</span>}
        </div>
        <div className="arrow-container">
          {hasArrow && <ChevronRight size={22} color="#000" />}
        </div>
      </div>
    </button>
  );
};

const ScoreCategory: React.FC<ScoreCategoryProps> = ({ title, score, scoredCount, progress = 0 }) => {
  return (
    <div className="score-category">
      <div className="score-category-left">
        <div className="score-category-header">
          <span className="score-category-title">{title}</span>
          {scoredCount !== undefined && (
            <span className="scored-count">{scoredCount} scored</span>
          )}
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="score-category-right">
        <span className="category-score">{score}</span>
      </div>
    </div>
  );
};

const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [showName, setShowName] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scoresReceived, setScoresReceived] = useState<any[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [rejectedLength, setRejectedLength] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [receivedScoreTotal, setReceivedScoreTotal] = useState(0);
  const [pendingScoreTotal, setPendingScoreTotal] = useState(0);
  const [sapienIScoredLength, setSapienIScoredLength] = useState(0);
  const [blockedScoreLength, setBlockedScoreLength] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await getRatingsForMe();
        const dataArr = Array.isArray(response?.data) ? response.data : [];
        // Include both 'approved' and 'reported' to match ScoresReceivedScreen
        const approvedRatings = dataArr.filter(
          (rating: { status: string }) => rating?.status === "approved" || rating?.status === "reported"
        );
        const pendingRatings = dataArr.filter(
          (rating: { status: string }) => rating?.status === "pending"
        );
        const rejectedRatings = dataArr.filter(
          (rating: { status: string }) => rating?.status === "rejected"
        );
        const blockedRatings = dataArr.filter(
          (rating: { status: string }) => rating?.status === "blocked"
        );

        setScoresReceived(approvedRatings);
        setReceivedScoreTotal(approvedRatings.length);
        setPendingScoreTotal(pendingRatings.length);
        setRejectedLength(rejectedRatings.length);
        setBlockedScoreLength(blockedRatings.length);
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setScoresReceived([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  useEffect(() => {
    const fetchSapiensIScored = async () => {
      try {
        const response = await getSapienwhoIScored();
        const dataArr = Array.isArray(response?.data) ? response.data : [];
        const filteredRatings = dataArr.filter(
          (rating: { status: string }) => !["rejected", "blocked"].includes(rating.status)
        );
        setSapienIScoredLength(filteredRatings.length);
      } catch (error) {
        console.error("Error fetching sapiens I scored:", error);
        setSapienIScoredLength(0);
      }
    };

    fetchSapiensIScored();
  }, []);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        const data = await getNotifications();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchUserNotifications();
  }, []);

  // Aggregate scores by topic
  type TraitAgg = { sum: number; count: number; raterSet: Set<string> };
  type TopicAgg = { traitMap: Map<string, TraitAgg>; topicSum: number; topicCount: number; comments: string[]; raterSet: Set<string> };
  const topicMap: Map<string, TopicAgg> = new Map();

  (scoresReceived || []).forEach((rating: any) => {
    const raterKey = rating?.sender_id?._id || rating?._id;
    (rating?.rating_data || []).forEach((category: any) => {
      const topic = category?.topic;
      if (!topic) return;
      if (!topicMap.has(topic)) {
        topicMap.set(topic, { traitMap: new Map(), topicSum: 0, topicCount: 0, comments: [], raterSet: new Set() });
      }
      const agg = topicMap.get(topic)!;
      agg.raterSet.add(raterKey);
      (category?.traits || []).forEach((trait: any) => {
        const score = trait?.score;
        if (score === null || score === undefined) return;
        agg.topicSum += score;
        agg.topicCount += 1;
        const tName = trait?.trait;
        if (!tName) return;
        const tAgg = agg.traitMap.get(tName) || { sum: 0, count: 0, raterSet: new Set<string>() };
        tAgg.sum += score;
        tAgg.count += 1;
        tAgg.raterSet.add(raterKey);
        agg.traitMap.set(tName, tAgg);
      });
      if (category?.comment) {
        agg.comments.push(category.comment);
      }
    });
  });

  const aggregatedTopics = Array.from(topicMap.entries()).map(([topic, agg]) => {
    const traits = Array.from(agg.traitMap.entries()).map(([trait, tAgg]) => ({
      trait,
      avgScore: tAgg.count ? tAgg.sum / tAgg.count : 0,
      count: tAgg.count,
      raterCount: tAgg.count, // Changed: show total score count instead of unique raters
    }));
    return {
      topic,
      avgScore: agg.topicCount ? agg.topicSum / agg.topicCount : 0,
      totalRaters: agg.raterSet.size,
      traits,
      comments: agg.comments,
    };
  });

  const filteredAggregatedTopics = aggregatedTopics
    .map(t => ({
      ...t,
      traits: (t.traits || []).filter((tr: any) => (tr.count || 0) > 0),
    }))
    .filter(t => (t.traits || []).length > 0);

  const topicsForOverall = filteredAggregatedTopics;
  const overallSapienScore = topicsForOverall.length
    ? (topicsForOverall.reduce((s, t) => s + t.avgScore, 0) / topicsForOverall.length)
    : 0;

  const normalizedScore = overallSapienScore.toFixed(1);

  const handleStartScoring = () => {
    navigate('/user-selection');
  };

  const handleNavigateToScreen = (screen: string) => {
    navigate(`/${screen}`);
  };

  const handleNotificationsPress = async () => {
    try {
      await markAllNotificationsAsRead();
      navigate('/notifications');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="password-container">
          {showName && userData ? (
            <span className="hidden-password">{userData?.username}</span>
          ) : (
            <span className="hidden-password">**********</span>
          )}
          <button className="eye-button" onClick={() => setShowName(!showName)}>
            {showName ? <Eye size={20} color="#666" /> : <EyeOff size={20} color="#666" />}
          </button>
        </div>
        <div className="private-profile-pill">
          <span className="private-profile-text">private profile</span>
        </div>
      </div>

      {/* Top Tools */}
      <div className="top-tools">
        <div className="left-tools">
          <button onClick={() => navigate('/profile')}>
            <Menu size={22} color="#000000" />
          </button>
        </div>
        <div className="right-tools">
          <button className="icon-button" onClick={() => navigate('/settings')}>
            <Settings size={22} color="#000000" />
          </button>
          <button className="icon-button" onClick={handleNotificationsPress}>
            <div className="badge-container">
              <MessageSquare size={22} color="#000" />
              {hasUnread && <div className="badge" />}
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Sapien Dashboard</h1>

        {/* Stats Section */}
        <div className="stats-section">
          <StatCard
            title="Scores Received"
            value={receivedScoreTotal.toString().padStart(2, "0")}
            onPress={() => handleNavigateToScreen('scores-received')}
          />
          <div className="divider" />
          <StatCard
            title="Sapiens you Scored"
            value={sapienIScoredLength.toString().padStart(2, "0")}
            onPress={() => handleNavigateToScreen('sapiens-scored')}
          />
          <div className="divider" />
          <StatCard
            title="Requests"
            value={pendingScoreTotal.toString().padStart(2, "0")}
            notification={pendingScoreTotal > 0 ? `${pendingScoreTotal.toString().padStart(2, '0')} new` : ''}
            onPress={() => handleNavigateToScreen('sapiens-requests')}
          />
          <div className="divider" />
          <StatCard
            title="Blocked"
            value={blockedScoreLength.toString().padStart(2, "0")}
            onPress={() => handleNavigateToScreen('sapiens-blocked')}
          />
          <div className="divider" />
          <StatCard
            title="Requests Rejected"
            value={rejectedLength.toString().padStart(2, "0")}
            hasArrow={false}
          />
        </div>

        <button className="start-scoring-button" onClick={handleStartScoring}>
          <span className="start-scoring-text">Start Scoring</span>
        </button>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {scoresReceived?.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">You haven't received any scores yet.</p>
              </div>
            ) : (
              <>
                {/* SapienScore Section */}
                <div className="score-section">
                  <div className="score-header">
                    <h2 className="score-header-title">Your SapienScore</h2>
                    <span className="total-score">{normalizedScore.padStart(2, "0")}</span>
                  </div>

                  <h3 className="scores-title">Your Scores</h3>
                  {(showAllTopics ? filteredAggregatedTopics : filteredAggregatedTopics.slice(0, 4)).map((category, index) => (
                    <div key={`${category.topic}-${index}`}>
                      <div className="casual-topics-container">
                        <span className="casual-topics-title">{category.topic}</span>
                        <span className="casual-topics-score">{category.avgScore.toFixed(1)}</span>
                      </div>

                      {category.traits.map((trait: any, traitIndex: number) => (
                        <ScoreCategory
                          key={`${trait.trait}-${traitIndex}`}
                          title={trait.trait}
                          score={trait.avgScore === 10 ? trait.avgScore.toFixed(0) : trait.avgScore.toFixed(1)}
                          scoredCount={trait.raterCount}
                          progress={trait.avgScore * 10}
                        />
                      ))}

                      {/* Comments */}
                      {category.comments.length > 0 && (
                        <div className="slider-container">
                          {category.comments.map((comment, idx) => (
                            <div key={idx} className="comment-section" style={{ minWidth: '240px', flexShrink: 0, marginRight: '10px', marginTop: 0 }}>
                              <p className="comment-category" style={{
                                color: '#000000',
                                fontSize: '11px',
                                fontWeight: '600',
                                marginBottom: '4px',
                                textTransform: 'capitalize'
                              }}>
                                {category.topic}
                              </p>
                              <p className="comment-text">
                                {comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Show All / Hide toggle */}
                  {filteredAggregatedTopics.length > 4 && (
                    <button
                      onClick={() => setShowAllTopics(prev => !prev)}
                      className="show-all-button"
                    >
                      <span>{showAllTopics ? 'Hide' : 'Show All'}</span>
                      {showAllTopics ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        <div className="bottom-spacing" />
      </div>

      {/* Bottom Navigation */}
      <Navigation initialTab="PROFILE" />
    </div>
  );
};

export default DashboardScreen;
