import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useApp } from '@/context/AppContext';

// Auth Screens
import NewLoginScreen from '@/components/screens/NewLoginScreen';
import NewSignupScreen from '@/components/screens/NewSignupScreen';
import ForgotPasswordScreen from '@/components/screens/ForgotPasswordScreen';
import VerifyResetEmailScreen from '@/components/screens/VerifyResetEmailScreen';
import ReceiveFeedback from '@/components/screens/ReceiveFeedback';
import ResetPasswordScreen from '@/components/screens/ResetPasswordScreen';
import RegistrationScreen from '@/components/screens/RegistrationScreen';

// Main App Screens
import DashboardScreen from '@/components/screens/DashboardScreen';
import UserSelectionScreen from '@/components/screens/UserSelectionScreen';
import RelationshipSelectionScreen from '@/components/screens/RelationshipSelectionScreen';
import ScoringFlowScreen from '@/components/screens/ScoringFlowScreen';
import SapienScoreScreen from '@/components/screens/SapienScoreScreen';
import ShareScreen from '@/components/screens/ShareScreen';
import ScoresReceivedScreen from '@/components/screens/ScoresReceivedScreen';
import SapiensScoredSentScreen from '@/components/screens/SapiensScoredSentScreen';
import SapiensRequests from '@/components/screens/SapiensRequests';
import SapiensBlocked from '@/components/screens/SapiensBlocked';
import EchoRoomsScreen from '@/components/screens/EchoRoomsScreen';
import ChatScreen from '@/components/screens/ChatScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import NotificationScreen from '@/components/screens/NotificationScreen';
import InstaPost from '@/components/screens/InstaPost';

// ShareScreen Wrapper Component
const ShareScreenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPerson, setScoringData } = useApp();

  const handleDismiss = () => {
    // Clear scoring data
    setScoringData(null);
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleSelectNextSapien = () => {
    // Clear scoring data
    setScoringData(null);
    // Navigate to user selection to score another person
    navigate('/user-selection');
  };

  return (
    <ShareScreen
      person={selectedPerson || {}}
      onDismiss={handleDismiss}
      onSelectNextSapien={handleSelectNextSapien}
    />
  );
};

// ChatScreen Wrapper Component to extract route params
const ChatScreenWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // Get room info from sessionStorage (set by EchoRoomsScreen when navigating)
  const roomName = sessionStorage.getItem('currentRoomName') || 'Chat Room';
  const isFav = sessionStorage.getItem('currentRoomIsFav') === 'true';
  const creatorId = sessionStorage.getItem('currentRoomCreatorId') || null;

  const handleBack = () => {
    // Clear session storage
    sessionStorage.removeItem('currentRoomName');
    sessionStorage.removeItem('currentRoomIsFav');
    sessionStorage.removeItem('currentRoomCreatorId');
    navigate('/echo-rooms');
  };

  return (
    <ChatScreen
      roomId={roomId || ''}
      roomName={roomName}
      isFav={isFav}
      creatorId={creatorId}
      onBack={handleBack}
    />
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/insta-post" element={<InstaPost />} />

      <Route path="/login" element={<NewLoginScreen />} />
      <Route path="/signup" element={<NewSignupScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/verify-reset" element={<VerifyResetEmailScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />

      {/* Registration (Semi-Protected - requires auth but not profile completion) */}
      <Route path="/registration" element={<ProtectedRoute><ReceiveFeedback /></ProtectedRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
      <Route path="/user-selection" element={<ProtectedRoute><UserSelectionScreen /></ProtectedRoute>} />
      <Route path="/relationship-selection" element={<ProtectedRoute><RelationshipSelectionScreen /></ProtectedRoute>} />
      <Route path="/scoring-flow" element={<ProtectedRoute><ScoringFlowScreen /></ProtectedRoute>} />
      <Route path="/sapien-score" element={<ProtectedRoute><SapienScoreScreen /></ProtectedRoute>} />
      <Route path="/share-screen" element={<ProtectedRoute><ShareScreenWrapper /></ProtectedRoute>} />
      <Route path="/scores-received" element={<ProtectedRoute><ScoresReceivedScreen /></ProtectedRoute>} />
      <Route path="/sapiens-scored" element={<ProtectedRoute><SapiensScoredSentScreen /></ProtectedRoute>} />
      <Route path="/sapiens-requests" element={<ProtectedRoute><SapiensRequests /></ProtectedRoute>} />
      <Route path="/sapiens-blocked" element={<ProtectedRoute><SapiensBlocked /></ProtectedRoute>} />
      <Route path="/echo-rooms" element={<ProtectedRoute><EchoRoomsScreen /></ProtectedRoute>} />
      <Route path="/chat/:roomId" element={<ProtectedRoute><ChatScreenWrapper /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationScreen /></ProtectedRoute>} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

