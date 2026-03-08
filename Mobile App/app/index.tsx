import { getRatingsForMe, getSapienwhoIScored, updateRatingStatus, getScoredRelationsForReceiver } from '@/api/ratingApi';
import { getAllRelations, getRelationsById } from '@/api/relationApi';
import DashboardScreen from '@/components/screens/DashboardScreen';
import HomeScreen from '@/components/screens/HomeScreen';
import LoginScreen from '@/components/screens/LoginScreen';
import RegistrationScreen from '@/components/screens/RegistrationScreen';
import RelationshipSelectionScreen from '@/components/screens/RelationshipSelectionScreen';
import SapiensBlocked from '@/components/screens/SapiensBlocked';
import SapienScoreScreen from '@/components/screens/SapienScoreScreen';
import SapiensRequests from '@/components/screens/SapiensRequests';
import SapiensScoredSentScreen from '@/components/screens/SapiensScoredSentScreen';
import ScoresReceivedScreen from '@/components/screens/ScoresReceivedScreen';
import ScoringFlowScreen from '@/components/screens/ScoringFlowScreen';
import ShareScreen from '@/components/screens/ShareScreen';
import UserSelectionScreen from '@/components/screens/UserSelectionScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { getUserByEmailPhone, getUserProfile, updateUserProfile } from '../api/userApi';
import * as Notifications from 'expo-notifications';
import { savePushToken } from '@/api/notificationApi';
import registerNNPushToken from 'native-notify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EchoRoomsScreen from '@/components/screens/EchoRoomScreen';
import useWebSocket from 'react-use-websocket';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import axios from 'axios';
// New Auth Screens
import NewLoginScreen from '@/components/screens/NewLoginScreen';
import NewSignupScreen from '@/components/screens/NewSignupScreen';
import ForgotPasswordScreen from '@/components/screens/ForgotPasswordScreen';
import VerifyResetEmailScreen from '@/components/screens/VerifyResetEmailScreen';
import ResetPasswordScreen from '@/components/screens/ResetPasswordScreen';

export type Home = 'home' | 'login' | 'registration' | 'userSelection' | 'relationSelection' | 'scoring' | 'dashboard' | 'sapienScore' | 'shareScreen'
  | 'scoresReceived' | 'sapiensScored' | 'sapiensrequests' | 'sapiensblocked' | 'echoroom' | 'sapiensScoredSent' | 'notification' | 'scoringFlow'
  | 'newLogin' | 'signup' | 'forgotPassword' | 'verifyReset' | 'resetPassword';

interface Person {
  id: string;
  name: string;
  email: string;
}


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

const Index: React.FC = () => {

  const insets = useSafeAreaInsets();

  const [currentScreen, setCurrentScreen] = useState<Home>();
  const [selectedPerson, setSelectedPerson] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [authData, setAuthData] = useState<{ email?: string; phone?: string } | null>(null);
  const [userData, setUserData] = useState<{ name: string; username?: string } | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);
  const [scoringData, setScoringData] = useState<any>(null);
  const [selectedRelationData, setSelectedRelationData] = useState<any>(null);
  const [relations, setRelations] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isScoringCompleted, setIsScoringCompleted] = useState<boolean>(false);
  const [Updated, setUpdated] = useState<boolean>(false);
  const [receivedScroretotal, setReceivedScoretotal] = useState(0)
  const [pendingScroretotal, setPendingScoretotal] = useState(0)
  const [pendingRequests, setPendingRequests] = useState<any>()
  const [sapiensIScored, setSapienIScored] = useState<any>()
  const [sapienIScoredLength, setSapienIScoredLength] = useState(0)
  const [updatedRatingId, setUpdatedraingId] = useState('')
  const [receivedBlockedtotal, setReceivedBlockedtotal] = useState<any>()
  const [sapienBlockedLength, setBlockedLength] = useState(0)
  const [receiverID, setReceiverId] = useState<string>('')
  const [scoredRelationIds, setScoredRelationIds] = useState<string[]>([])
  const [isUpdateFlow, setIsUpdateFlow] = useState(false)
  const [blockedFrom, setBlockedFrom] = useState<'received' | 'requests' | null>(null)
  // Password reset flow state
  const [resetEmail, setResetEmail] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  // Duplicate rating error state
  const [duplicateRatingError, setDuplicateRatingError] = useState<string>('')
  const [showDuplicateError, setShowDuplicateError] = useState<boolean>(false)

  // registerNNPushToken(30990, 'uqAjwWY6DYpkhdySNj9sjw'); BHANU
  registerNNPushToken(31062, '7RdWCdEyTymqvoJ5DblY5V');

  useEffect(() => {
    const getPendingNotifications = async () => {
      try {
        const response = await getUserProfile();
        const pending = response?.user?.pendingNotifications;
        if (Array.isArray(pending) && pending?.length > 0 && pending[0]?.title && pending[0]?.body) {
          await sendNotification(pending[0].title, pending[0].body);
        }
      } catch (e) {
        console.log('Error reading pending notifications', e);
      }
    };
    getPendingNotifications();
  }, [authData]);


  // register pushtoken
  useEffect(() => {
    const res = async () => {
      try {
        // Only proceed if authenticated
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (!storedToken) return;

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const response = await getUserProfile().catch(() => null);

        if (!response?.user?.push_tokens) {
          const token = await Notifications.getDevicePushTokenAsync();
          const data = {
            token: token.data,
            platform: Platform.OS === 'ios' ? 'ios' : 'android',
            lastUsed: new Date()
          };
          await updateUserProfile({ push_tokens: data }).catch(() => {});
        }
        const subscription = Notifications.addNotificationResponseReceivedListener(resp => {
          const redirectPath = resp.notification.request.content.data?.redirectTo;
          if (redirectPath) {
            // Optionally handle deep links here if needed
          }
        });
        return () => subscription.remove();
      } catch (e) {
        console.log('Push token setup error', e);
      }
    };
    res();
  }, [authData]);
  // Check for token in AsyncStorage on component mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');

        if (!token) {
          setCurrentScreen('home');
          return;
        }

        // Only make API call if token exists
        const userProfile = await getUserProfile();

        if (userProfile && userProfile?.user?.username) {
          setCurrentScreen('dashboard');
        } else {
          // Token exists but no username - registration needed
          setCurrentScreen('registration');
        }
      } catch (error) {
        console.log('Error checking auth state:', error);
        // Fallback to login screen on error
        setCurrentScreen('login');
      }
    };

    checkAuthState();
  }, []);


  // const registerForPushNotifications = async () => {
  //   const { status } = await Notifications.requestPermissionsAsync();
  //   if (status !== 'granted') return;
  //   const token = await Notifications.getDevicePushTokenAsync();
  //   console.log('Push token:', token.data);
  // };

  const sendNotification = async (title: string, body: string) => {
    try {
      if (typeof title !== 'string' || typeof body !== 'string' || title.trim() === '' || body.trim() === '') {
        console.warn('Skipping notification: invalid title/body');
        return;
      }
      const response = await fetch('https://app.nativenotify.com/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: 31062,
          // appToken: "uqAjwWY6DYpkhdySNj9sjw",BHANu
          appToken: "7RdWCdEyTymqvoJ5DblY5V",
          title: title,
          body: body,
          dateSent: new Date().toISOString(),
        }),
      });


      if (!response.ok) {
        throw new Error(`Error sending notification: ${response.status}`);
      }
      await updateUserProfile({ pendingNotifications: [] }).catch(() => {});
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  };
  const fetchRelationData = async () => {
    try {
      const response = await getAllRelations();
      setRelations(response);

      // You can update state or perform other actions with the fetched data here
    } catch (error) {
      console.log('Error fetching relation data:', error);
    }
  };

  useEffect(() => {
    fetchRelationData();
  }, []);

  useEffect(() => {
    const fetchRatingsForMe = async () => {
      try {
        setLoading(true);
        const response = await getRatingsForMe();
        const dataArr = Array.isArray(response?.data) ? response.data : [];

        const approvedRatings = dataArr?.filter(
          (rating: { status: string }) => rating.status === 'approved' || rating.status === 'reported'
        );
        setReceivedScoretotal(approvedRatings?.length);

        const pendingRatings = dataArr?.filter(
          (rating: { status: string }) => rating.status === 'pending'
        );
        setPendingRequests([...pendingRatings]?.reverse());
        setPendingScoretotal(pendingRatings?.length);
        setUpdated(false);
      } catch (e) {
        console.log('Error fetching ratings for me', e);
        setPendingRequests([]);
        setPendingScoretotal(0);
        setReceivedScoretotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchRatingsForMe();
  }, [receivedScroretotal, pendingScroretotal, Updated])

  const SapiensIScored = async () => {
    try {
      const response = await getSapienwhoIScored();
      const dataArr = Array.isArray(response?.data) ? response?.data : [];
      const filteredRatings = dataArr?.filter(
        (rating: { status: string }) => !["rejected", "blocked"]?.includes(rating.status)
      );
      setSapienIScoredLength(filteredRatings?.length);
      setSapienIScored([...filteredRatings].reverse());
      setUpdated(false);
    } catch (e) {
      console.log('Error fetching sapiens I scored', e);
      setSapienIScoredLength(0);
      setSapienIScored([]);
    }
  }

  useEffect(() => {
    const fetchRatingsWhomIScored = async () => {

      await SapiensIScored()
    }
    fetchRatingsWhomIScored()
  }, [sapienIScoredLength, receivedScroretotal, Updated])

  const SapiensIBlocked = async () => {
    try {
      setLoading(true);
      const response = await getRatingsForMe();
      const dataArr = Array.isArray(response?.data) ? response.data : [];
      const blockedRatings = dataArr?.filter(
        (rating: { status: string }) => rating.status === 'blocked'
      );
      setUpdated(false);
      setBlockedLength(blockedRatings?.length);
      setReceivedBlockedtotal(blockedRatings);
    } catch (e) {
      console.log('Error fetching blocked ratings', e);
      setBlockedLength(0);
      setReceivedBlockedtotal([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const fetchRatingsWhomiBlocked = async () => {

      await SapiensIBlocked()
    }
    fetchRatingsWhomiBlocked()
  }, [sapienBlockedLength, Updated])




  const navigateToScreen = (screen: Home) => {
    console.log('screen', screen)
    setCurrentScreen(screen);
  };

  // const handleLogin = (data: { email?: string; phone?: string }) => {
  //   console.log('data111111', data)
  //   setAuthData(data);
  //   navigateToScreen('registration');
  // };

  const handleLogin = async (data: { email?: string; phone?: string }) => {
    setAuthData(data);

    try {
      // Fetch user profile and wait for the response
      const response = await getUserProfile();
      const userName = response?.user?.name || '';
      const userUsername = response?.user?.username || '';

      // Check if both name and username exist
      if (userName && userUsername) {
        navigateToScreen('userSelection');
      } else {
        navigateToScreen('registration');
      }
    } catch (error) {
      console.log('Failed to fetch user data during login:', error);
      // If there's an error fetching user data, go to registration
      navigateToScreen('registration');
    }
  };

  const handleRegistration = async (data: { name: string; username?: string }) => {
    setLoading(true);
    setUserData(data);

    await updateUserProfile(data).then(() => {
      setLoading(false);
      navigateToScreen('userSelection');
    });
  };

  // New auth flow handlers
  const handleSignup = async (data: { phone: string; email: string; password: string }) => {
    setAuthData({ phone: data.phone, email: data.email });

    try {
      // Fetch user profile and wait for the response
      const response = await getUserProfile();
      const userName = response?.user?.name || '';
      const userUsername = response?.user?.username || '';

      // Check if both name and username exist
      if (userName && userUsername) {
        navigateToScreen('userSelection');
      } else {
        navigateToScreen('registration');
      }
    } catch (error) {
      console.log('Failed to fetch user data during signup:', error);
      // If there's an error fetching user data, go to registration
      navigateToScreen('registration');
    }
  };

  const handleForgotPassword = (email: string) => {
    setResetEmail(email);
    navigateToScreen('verifyReset');
  };

  const handleVerifyResetCode = (code: string) => {
    setVerificationCode(code);
    navigateToScreen('resetPassword');
  };

  const handleResetPasswordSuccess = () => {
    // Clear reset data and navigate back to login
    setResetEmail('');
    setVerificationCode('');
    navigateToScreen('login');
  };


  const handlePersonSelect = async (person?: Person) => {
    if (person) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('👤 PERSON SELECTED');
      console.log('═══════════════════════════════════════════════════════');

      // Always prepare selection & try to resolve receiverId (if user exists)
      setSelectedPerson(person);
      setScoringData(null);
      setIsScoringCompleted(false);

      // Track scored relations locally to avoid state timing issues
      let localScoredRelationIds: string[] = [];
      let localReceiverId: string = '';

      let queryParams = {};
      if (typeof person === 'string') {
        queryParams = { work_email: person };
        console.log('📧 Looking up by email:', person);
      } else {
        queryParams = { phone_number: person.id };
        console.log('📱 Looking up by phone:', person.id);
      }
      console.log('Query params:', queryParams);

      try {
        try {
          console.log('📡 Calling getUserByEmailPhone...');
          const getPerson = await getUserByEmailPhone(queryParams);
          console.log('📥 getUserByEmailPhone response:', getPerson);

          if (getPerson?._id) {
            console.log('✅ User found in database, ID:', getPerson._id);
            localReceiverId = getPerson._id;
            setReceiverId(getPerson._id);

            // Check if logged user has already scored this person
            console.log('📡 Checking if user has already scored this person...');
            try {
              const scoredRelations = await getScoredRelationsForReceiver(getPerson._id);
              console.log('✅ Scored relations response:', scoredRelations);
              console.log('   Response structure:', JSON.stringify(scoredRelations, null, 2));

              if (scoredRelations.scoredRelationIds && scoredRelations.scoredRelationIds.length > 0) {
                console.log(`⚠️ User has already scored this person on ${scoredRelations.count} relation(s):`);
                scoredRelations.scoredRelations.forEach((rel: any) => {
                  console.log(`   - ${rel.relationName} (ID: ${rel.relationId})`);
                });
                localScoredRelationIds = scoredRelations.scoredRelationIds;
                console.log('📝 Setting scoredRelationIds state to:', localScoredRelationIds);
                console.log('📝 Scored relation IDs array:', JSON.stringify(localScoredRelationIds, null, 2));
                setScoredRelationIds(localScoredRelationIds);
                console.log('✅ State update called');
              } else {
                console.log('✅ User has not scored this person yet');
                localScoredRelationIds = [];
                console.log('📝 Setting scoredRelationIds state to: []');
                setScoredRelationIds([]);
              }
            } catch (scoredError) {
              console.error('❌ Error checking scored relations:', scoredError);
              // Continue anyway - user can still proceed
              localScoredRelationIds = [];
              setScoredRelationIds([]);
            }
          } else {
            console.log('ℹ️ User not found in response');
            localScoredRelationIds = [];
            localReceiverId = '';
            setScoredRelationIds([]);
            setReceiverId('');
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.log('ℹ️ User not found in database (new user) - 404 error');
            localScoredRelationIds = [];
            localReceiverId = '';
            console.log('📝 Setting scoredRelationIds to []');
            setScoredRelationIds([]);
            setReceiverId(''); // Clear receiver ID
          } else {
            console.log('❌ Error fetching person:', error);
            localScoredRelationIds = [];
            localReceiverId = '';
            console.log('📝 Setting scoredRelationIds to []');
            setScoredRelationIds([]);
            setReceiverId(''); // Clear receiver ID
          }
          // Proceed without receiverId when lookup fails
        }
      } catch (error) {
        console.log('❌ Outer error fetching person:', error);
        localScoredRelationIds = [];
        localReceiverId = '';
        console.log('📝 Setting scoredRelationIds to []');
        setScoredRelationIds([]);
        setReceiverId(''); // Clear receiver ID
        // Proceed regardless
      }

      console.log('📊 FINAL STATE BEFORE NAVIGATION:');
      console.log('   localReceiverId:', localReceiverId);
      console.log('   localScoredRelationIds:', localScoredRelationIds);
      console.log('   localScoredRelationIds array:', JSON.stringify(localScoredRelationIds, null, 2));
      console.log('   receiverID (state - may be stale):', receiverID);
      console.log('   scoredRelationIds (state - may be stale):', scoredRelationIds);
      console.log('═══════════════════════════════════════════════════════\n');

      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      navigateToScreen('relationSelection');
    }
  };

  const handleRelationSelect = async (relation: string) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔗 handleRelationSelect called (from RelationshipSelectionScreen)');
    console.log('   relation ID:', relation);
    console.log('   ℹ️ NOTE: Duplicate check already performed in RelationshipSelectionScreen');
    console.log('   ℹ️ This function only fetches relation data and navigates');
    console.log('═══════════════════════════════════════════════════════');

    setSelectedRelation(relation);
    // Clear any previous error
    setDuplicateRatingError('');
    setShowDuplicateError(false);

    try {
      console.log('📡 Calling getRelationsById...');
      const response = await getRelationsById(relation);
      console.log('✅ getRelationsById response:', response);
      console.log('   response type:', typeof response);
      console.log('   response is null?', response === null);
      console.log('   response is undefined?', response === undefined);
      console.log('   response._id:', response?._id);
      console.log('   response.name:', response?.name);
      console.log('   response.topics:', response?.topics);
      console.log('   response.topics length:', response?.topics?.length);

      if (!response) {
        console.log('❌ getRelationsById returned null/undefined');
        console.log('   Cannot proceed to scoring screen without relation data');
        return;
      }

      setSelectedRelationData(response);
      console.log('✅ selectedRelationData set');

      // NOTE: Duplicate check is now handled ONLY in RelationshipSelectionScreen
      // This prevents redundant API calls and ensures consistent blocking behavior
      // The RelationshipSelectionScreen performs TWO checks:
      // 1. Pre-fetched scoredRelationIds array check (fast, client-side)
      // 2. API call to checkIfScored (authoritative, server-side)
      // If both pass, only then does it call this function
      // Backend still has a final safeguard in createRating endpoint

      setIsScoringCompleted(false);
      console.log('📍 Navigating to scoring screen...');
      console.log('═══════════════════════════════════════════════════════\n');
      navigateToScreen('scoring');
    } catch (error) {
      console.error('❌ Error in handleRelationSelect:', error);
      console.error('   Error message:', error instanceof Error ? error.message : String(error));
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  // const handleScoringComplete = (data: any) => {
  //   setScoringData(data); // Store as object, not string
  //   setIsScoringCompleted(true);
  //   navigateToScreen('sapienScore');
  // };
  const handleScoringComplete = async (data: any) => {
    setScoringData(data);
    setIsScoringCompleted(true);

    // Only proceed if scoring someone else (not yourself)
    if (selectedPerson &&
      selectedPerson !== authData?.email &&
      selectedPerson !== authData?.phone) {

      try {
        // This would call your backend API to:
        // 1. Save the score
        // 2. Send notification to recipient
        // const response = await api.submitScore({
        //   recipient: selectedPerson, // email/phone of person being scored
        //   scores: data,
        //   relation: selectedRelation
        // });
        // const title = "Sapien Score Request"
        // const body = "You have a new Sapien Score Request"
        // sendNotification(title, body)
        // Backend should handle sending the push notification

      } catch (error) {
        console.log('Error submitting score:', error);
      }
    }

    navigateToScreen('sapienScore');
  };
  const handleShare = async (_data?: any) => {
    navigateToScreen('shareScreen');
  };

  const handleDismissShare = () => {
    navigateToScreen('dashboard');
  };

  const handleSkip = () => {
    navigateToScreen('dashboard');
  };

  const handleStartScoring = () => {
    setSelectedPerson(null);
    setSelectedRelation(null);
    setScoringData(null);
    setIsScoringCompleted(false);
    navigateToScreen('userSelection');
  };

  const handleBackFromSapienScore = () => {
    // Navigate back to scoring without resetting completion state
    navigateToScreen('scoring');
  };

  const handleBackFromScoring = () => {
    if (isUpdateFlow) {
      setIsUpdateFlow(false);
      navigateToScreen('sapiensScored');
    } else {
      navigateToScreen('relationSelection');
    }
  };

  // Expose setters globally for legacy screens to mark where block was initiated
  ;(global as any).setBlockedFrom = (val: 'received' | 'requests' | null) => {
    setBlockedFrom(val)
    ;(global as any).blockedFrom = val
  }

  const HandleupdateRating = async (ratingId: string, status: string) => {
    try {
      if (!ratingId || !status) {
        console.warn('Skip updateRating: missing ratingId/status');
        return;
      }
      await updateRatingStatus(ratingId, status);
      // after any update, refresh lists
      setUpdated(true);
    } catch (e) {
      console.log('Error updating rating status', e);
    }
  }
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={currentScreen === 'home' ? "#C0C7CC" : currentScreen === 'sapienScore' ? "#FFFFFF" : currentScreen === 'shareScreen' ? "#C0C7CC" : "#F3F3F3"} />
      {/* {loading && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#FF8541" />
      </View>
    )} */}

      {(currentScreen === 'login' || currentScreen === 'home') && (
        <NewLoginScreen
          onProceed={(data) => handleLogin(data)}
          onForgotPassword={() => navigateToScreen('forgotPassword')}
          onSignup={() => navigateToScreen('signup')}
        />
      )}

      {currentScreen === 'signup' && (
        <NewSignupScreen
          onProceed={(data) => handleSignup(data)}
          onBack={() => navigateToScreen('login')}
          onSignin={() => navigateToScreen('login')}
        />
      )}

      {currentScreen === 'forgotPassword' && (
        <ForgotPasswordScreen
          onProceed={(email) => handleForgotPassword(email)}
          onBack={() => navigateToScreen('login')}
        />
      )}

      {currentScreen === 'verifyReset' && (
        <VerifyResetEmailScreen
          email={resetEmail}
          onProceed={(code) => handleVerifyResetCode(code)}
          onResend={() => {
            // Resend is handled within the component
          }}
        />
      )}

      {currentScreen === 'resetPassword' && (
        <ResetPasswordScreen
          email={resetEmail}
          verificationCode={verificationCode}
          onProceed={() => handleResetPasswordSuccess()}
        />
      )}

      {currentScreen === 'registration' && (
        <RegistrationScreen
          onProceed={handleRegistration}
          onBack={() => navigateToScreen('login')}
          loading={loading}
          setloading={(value: boolean) => setLoading(value)}
        />
      )}

      {currentScreen === 'userSelection' && (
        <UserSelectionScreen
          onSelectPerson={(res: any) => handlePersonSelect(res)}
          onBack={() => navigateToScreen('dashboard')}
          onSkip={handleSkip}
        />
      )}

      {currentScreen === 'relationSelection' && selectedPerson && (() => {
        console.log('🎬 RENDERING RelationshipSelectionScreen');
        console.log('   Passing scoredRelationIds:', scoredRelationIds);
        console.log('   scoredRelationIds length:', scoredRelationIds.length);
        return (
          <RelationshipSelectionScreen
            selectedPerson={selectedPerson}
            onRelationSelect={handleRelationSelect}
            onBack={() => {
              // Clear error when going back
              setDuplicateRatingError('');
              setShowDuplicateError(false);
              navigateToScreen('userSelection');
            }}
            relationData={relations || []}
            receiver_id={receiverID || ''}
            scoredRelationIds={scoredRelationIds}
            duplicateErrorFromParent={duplicateRatingError}
            showDuplicateErrorFromParent={showDuplicateError}
            onClearDuplicateError={() => {
              setDuplicateRatingError('');
              setShowDuplicateError(false);
            }}
          />
        );
      })()}

      {currentScreen === 'scoring' && selectedPerson && (
        <ScoringFlowScreen
          person={selectedPerson}
          relation={selectedRelation}
          onComplete={handleScoringComplete}
          onBack={handleBackFromScoring}
          isCompleted={isScoringCompleted}
          scoringData={scoringData} // Pass scoringData to initialize state
          relationData={relations || []}
          selectedRelationData={selectedRelationData || {}}
        />
      )}

      {currentScreen === 'sapienScore' && selectedPerson && scoringData && (
        <SapienScoreScreen
          person={selectedPerson}
          scoringData={JSON.stringify(scoringData, null, 2)} // Keep string for display
          relation={selectedRelation}
          auth={authData}
          onShare={(data: any) => handleShare(data)}
          onBack={handleBackFromSapienScore}
          updatedRatingId={updatedRatingId}
        />
      )}

      {currentScreen === 'shareScreen' && selectedPerson && (
        <ShareScreen
          person={selectedPerson}
          onDismiss={handleDismissShare}
          onSelectNextSapien={() => navigateToScreen('userSelection')}
        />
      )}

      {currentScreen === 'dashboard' && (
        <DashboardScreen
          onStartScoring={() => handleStartScoring()}
          navigateToScreen={(scr) => navigateToScreen(scr)}
          receivedScroretotal={receivedScroretotal}
          pendingScroretotal={pendingScroretotal}
          navigationScreen={(screen: any) => navigateToScreen(screen)}

          sapienIScoredLength={sapienIScoredLength}
          blockedScoreLength={sapienBlockedLength}
          setUpdated={(updated: boolean) => setUpdated(updated)}


        />
      )}
      {currentScreen === 'scoresReceived' && (
        <ScoresReceivedScreen
          onBack={() => navigateToScreen('dashboard')}
          navigationScreen={(screen: any) => navigateToScreen(screen)}
          setUpdated={(value: boolean) => setUpdated(value)}
        />

      )}

      {currentScreen === 'sapiensScored' && (
        <SapiensScoredSentScreen
          onBack={() => navigateToScreen('dashboard')}
          navigationScreen={navigateToScreen}
          sapienIScoredLength={sapienIScoredLength}
          sapiensIScored={sapiensIScored || []}
          laoding={loading}
          selectedPerson={setSelectedPerson}
          handleRelationSelect={handleRelationSelect}
          setUpdatedraingId={setUpdatedraingId}
          setScoringData={(data: any) => setScoringData(data)}
          setIsUpdateFlow={(val: boolean) => setIsUpdateFlow(val)}
        // setScreen={(screen: string) => setCurrentScreen(screen)}
        />
      )}
      {currentScreen === 'sapiensrequests' && (
        <SapiensRequests
          onBack={() => navigateToScreen('dashboard')}
          pendingScroretotal={pendingScroretotal}
          pendindScoreData={pendingRequests || []}
          loading={loading}
          navigationScreen={(screen: any) => navigateToScreen(screen)}
          updateRating={async (ratingId: string, status: string) => await HandleupdateRating(ratingId, status)}
          setUpdated={(value: boolean) => setUpdated(value)}
        />
      )}
      {currentScreen === 'sapiensblocked' && (
        <SapiensBlocked
          onBack={() => navigateToScreen('dashboard')}
          navigationScreen={(screen: any) => navigateToScreen(screen)}
          sapienBlockedLength={sapienBlockedLength}
          ReceivedBlockedtotal={receivedBlockedtotal || []}
          laoding={loading}
          updateRating={async (ratingId: string, status: string) => await HandleupdateRating(ratingId, status)}
          setUpdated={(value: boolean) => setUpdated(value)}
        />
      )}

      {currentScreen === 'echoroom' && (
        <EchoRoomsScreen
          onBack={() => navigateToScreen('dashboard')}
          navigationScreen={(screen: any) => navigateToScreen(screen)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 20,

    // backgroundColor: 'red',


  },

});

export default Index;