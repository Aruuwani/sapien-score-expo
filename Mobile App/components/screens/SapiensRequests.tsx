import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import AcceptedMessageModal from '../ui/AcceptedMessageModal';
import BlockDialog from '../ui/BlockDialog';
import Navigation from '../ui/Navigation';
import RejectDialog from '../ui/RejectDialog';
import ScoreSlider from '../ui/ScoreSlider';
import { updateRatingStatus } from '@/api/ratingApi';
import { Home } from '@/app';
import BlockedMessageModal from '../ui/BlockedMessageModal';
import RejectedMessageModal from '../ui/RejectedMessageModal';
import UnblockConfirmationModal from '../ui/UnblockConfirmationModal';
import { formatDate } from '../../utils/date';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScoreItemProps {
  comment: any;
  category: string;
  score: number;
}

interface DimensionProps {
  title: string;
  items: ScoreItemProps[];
  color: string;
  id: string
}

interface ScoreCardProps {
  name: string;
  date: string;
  dimensions: DimensionProps[];
  pendindScoreData: any
  updateRating: (ratingId: string, status: string) => void
  setUpdated: (updated: boolean) => void

}

interface SapiensRequestsProps {
  onBack: () => void;

  pendingScroretotal: string | number;
  pendindScoreData: any;
  loading: boolean;
  navigationScreen: (screen: Home) => void
  updateRating: (ratingId: string, status: string) => void
  setUpdated: (updated: boolean) => void
}

const ScoreCard: React.FC<ScoreCardProps> = ({ name, date, dimensions, pendindScoreData, updateRating, setUpdated }) => {
  console.log('dimensions', dimensions)
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedScoreId, setBlockedScoreId] = useState('')
  const [scoreId, setScroreId] = useState('')
  const [showBlockedAccceptModal, setShowBlockedAcceptModal] = useState(false)
  const [showRejectedAcceptModal, setShowRejectedAcceptModal] = useState(false)

  const textInputRef = useRef<TextInput>(null); // Ref to programmatically focus TextInput

  const combinedRatingData = Array.isArray(pendindScoreData)
    ? pendindScoreData?.flatMap((item: any) => Array.isArray(item?.rating_data) ? item.rating_data : [])
    : [];
  console.log('combinedRatingData', combinedRatingData)
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const toggleShowAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(!showAll);
  };

  const toggleComment = () => {
    setShowComment(!showComment);
  };

  // Focus the TextInput when clicking on the ScoreSlider area
  const handleSliderPress = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  //Accept dialog modal
  const handleAccept = async (ratingId: string) => {
    if (!ratingId) {
      console.warn('No ratingId provided for accept');
      return;
    }
    setScroreId(ratingId)
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async (ratingId: string) => {
    if (!ratingId) {
      console.warn('No ratingId provided for confirm accept');
      return;
    }
    await updateRating(ratingId, 'approved');

    setShowAcceptModal(false);
    setTimeout(() => {
      setShowAcceptModal(false);
      setUpdated(true);
    }, 3000);
  };
  const handleReject = (ratingId: string) => {
    setBlockedScoreId(ratingId)
    setShowRejectModal(true);
  };

  // Reject dialog modal 
  // const handleRejectConfirm = () => {
  //   setShowRejectModal(false);
  // };
  const handleBlockConfirm = async (ratingId: string) => {
    setShowBlockModal(false);
    if (!ratingId) {
      console.warn('No ratingId provided for block');
      return;
    }
    await updateRating(ratingId, 'blocked');
    setShowBlockedAcceptModal(true)
    // mark origin so Blocked screen knows where to return when unblocking
    // @ts-ignore provided via app/index
    if (typeof (global as any).setBlockedFrom === 'function') {
      (global as any).setBlockedFrom('requests');
    }

    setTimeout(() => {
      setShowBlockedAcceptModal(false);
      setBlockedScoreId('')
      setUpdated(true);
    }, 3000);

  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
  };
  //Block dialog Modal
  const Blockhandle = (ratingId: any) => {
    setBlockedScoreId(ratingId)
    setShowBlockModal(true);
  };
  const BlockhandleRejectConfirm = async (ratingId: any) => {
    setShowRejectModal(false);
    if (!ratingId) {
      console.warn('No ratingId provided for reject');
      return;
    }
    await updateRating(ratingId, 'rejected');
    setShowRejectedAcceptModal(true)

    setTimeout(() => {
      setShowRejectedAcceptModal(false);
      setBlockedScoreId('')
      setUpdated(true);
    }, 3000);

  };
  const BlockhandleRejectCancel = () => {
    setShowBlockModal(false);
  };

  useEffect(() => {
    if (!expanded) {
      setShowAll(false);
    }
  }, [expanded]);

  // Get unique dimensions by title
  const uniqueDimensions: any[] = [];
  const uniqueTitles = new Set<string>();

  if (Array.isArray(dimensions)) {
    dimensions?.forEach((dim: any) => {
      const title = dim?.title;
      if (title && !uniqueTitles.has(title)) {
        uniqueTitles.add(title);
        uniqueDimensions.push(dim);
      }
    });
  }

  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    console.log('fonts not loaded');
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.new}>new</Text>
          </View>

        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>scored you on</Text>
          <Text style={styles.date}>{date}</Text>
          {!expanded && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => handleAccept(Array.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?.id ?? '') : '')} >
                <Text style={styles.openButton}>Accept</Text>
                {/* <Ionicons name="chevron-down" size={18} /> */}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleExpanded}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                {/* <Text style={{ fontWeight: "500", marginRight: 20, fontFamily: "Poppins-Medium" }}>Open</Text> */}
                <Ionicons name="chevron-down" size={22} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {expanded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.expandedContent}>
              <View>
                {Array.isArray(dimensions) && dimensions?.slice(0, showAll ? dimensions?.length : 2)?.map((dim, idx) => (
                  <View key={idx} style={styles.dimensionRow}>
                    <View style={styles.leftDimension}>
                      <View style={styles.dimensionHeader}>
                        <Text style={[styles.dimensionTitle, { color: dim?.color }]}>{dim?.title}</Text>
                      </View>
                      {(Array.isArray(dim?.items) ? dim.items?.slice(0, 4) : [])?.map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                          <Text style={styles.itemName}>{item?.category}</Text>
                          <Text style={styles.itemScore}>{Number(item?.score || 0)?.toFixed(1)}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.rightDimension}>
                      <View style={styles.dimensionHeader}>
                        <View>
                          <Text style={styles.scoreText}>
                            accept to view full{'\n'}scores
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {Array.isArray(dimensions) && dimensions?.length > 2 && (
                <TouchableOpacity
                  onPress={toggleShowAll}
                  style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 10 }}
                >
                  <Text style={{ fontWeight: '600', marginRight: 4 }}>{showAll ? 'hide' : 'Show all'}</Text>
                  <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={18} />
                </TouchableOpacity>
              )}

              {/* <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={handleSliderPress} style={{ flex: 1 }}>
                  <ScoreSlider currentOneTitle='Emotional Dimensions' />
                </TouchableOpacity>

              </View> */}
              <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={handleSliderPress} style={{ flex: 1 }}>
                  {/* Pass the first comment from dimensions or the main comment */}
                  <ScoreSlider
                    currentOneTitle="Emotional Dimensions"
                    currentComment={
                      (Array.isArray(dimensions)
                        ? dimensions
                            ?.flatMap((dim: any) => Array.isArray(dim?.items) ? dim.items : [])
                            ?.find((item: any) => typeof item?.comment === 'string' && item.comment.trim() !== "")?.comment
                        : ""
                      ) || ""
                    }

                    Editing={false}
                    showComments={true}
                    data={{ rating_data: combinedRatingData }}

                  />
                </TouchableOpacity>

              </View>
              <View style={styles.cardFooter}>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.blockButton} onPress={() => Blockhandle(Array.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?.id ?? '') : '')}>
                    <Text style={styles.blockButtonText}>Block</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(Array.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?.id ?? '') : '')}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(Array.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?.id ?? '') : '')}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>

                </View>
                <TouchableOpacity
                  onPress={toggleExpanded}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  {/* <Text style={{ fontWeight: "500", marginRight: 20, fontFamily: "Poppins-Medium" }}>Open</Text> */}
                  <Ionicons name="chevron-up" size={26} />
                </TouchableOpacity>
              </View>
            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <UnblockConfirmationModal
              visible={showAcceptModal}
              title="Accept Score"
              message="Are you sure you want to Accept score request?"
              options={{
                left: {
                  text: "Cancel",
                  action: () => setShowAcceptModal(false),
                },
                right: {
                  text: "Accept",
                  action: () => {
                    handleConfirmAccept(scoreId);
                    setShowAcceptModal(false);
                  },
                },
              }}
              type="delete"
            />
      {/* <AcceptedMessageModal visible={showAcceptModal} onClose={() => setShowAcceptModal(false)} /> */}
      <BlockedMessageModal visible={showBlockedAccceptModal} onClose={() => setShowBlockedAcceptModal(false)} />
      <RejectedMessageModal visible={showRejectedAcceptModal} onClose={() => setShowRejectedAcceptModal(false)} />
      <RejectDialog
        visible={showRejectModal}
        message="Are you sure you want to reject?"
        submessage="The user can re score and share again"
        options={{
          left: {
            text: "Cancel",
            action: handleRejectCancel,
          },
          right: {
            text: "Confirm",
            action: () => BlockhandleRejectConfirm(blockedScoreId),
            bold: true,
          },
        }} title={''} type={'reject'}
      />
      <BlockDialog
        visible={showBlockModal}
        message="Are you sure you want to block?"
        options={{
          left: {
            text: "Cancel",
            action: BlockhandleRejectCancel,
          },
          right: {
            text: "Confirm",
            action: () => handleBlockConfirm(blockedScoreId),
            bold: true,
          },
        }} title={''} type={'reject'}
      />
    </View>
  );
};

const SapiensRequests: React.FC<SapiensRequestsProps> = ({ onBack, pendingScroretotal, pendindScoreData, loading, navigationScreen, updateRating, setUpdated }) => {
  // Avoid expensive or unsafe JSON stringify logs that can throw on circular refs
  console.log('pending count', Array.isArray(pendindScoreData) ? pendindScoreData?.length : 0);
  const [phoneToNameMap, setPhoneToNameMap] = useState<{ [key: string]: string }>({});
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onBack();
        return true;
      };

      // Add event listener (modern way)
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // Cleanup function - use remove() instead of removeEventListener
      return () => backHandler.remove();
    }, [])
  );
  // Fetch and map contacts once at component level (not inside list/map)
  const fetchContacts = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') return {};

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const map: { [key: string]: string } = {};
      (data || [])?.forEach(contact => {
        (contact.phoneNumbers || [])?.forEach(phone => {
          if (phone?.number) {
            const normalized = (phone.number || '')?.replace(/[^0-9]/g, '');
            if (normalized?.length > 5 && contact?.name) {
              map[normalized] = contact.name;
            }
          }
        });
      });

      return map;
    } catch (e) {
      console.warn('Contacts fetch failed', e);
      return {};
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadContacts = async () => {
      try {
        const contactsMap = await fetchContacts();
        if (isMounted) {
          const updatedContactsMap: { [key: string]: string } = {}
          Object.keys(contactsMap)?.forEach(key => {
            if (key.startsWith('91')) {
              updatedContactsMap[`+${key?.replace(/[^0-9]/g, '')}`] = contactsMap[key]
            }
            if (key?.length === 10) {
              updatedContactsMap[`+91${key?.replace(/[^0-9]/g, '')}`] = contactsMap[key]
            }
            else if (key.startsWith('+91')) {
              updatedContactsMap[key] = contactsMap[key]

            }
          })
          setPhoneToNameMap(updatedContactsMap);
        }
      } catch (error) {
        console.error('Failed to load contacts', error);
      }
    };

    loadContacts();

    return () => {
      isMounted = false;
    };
  }, [fetchContacts]);

  const safePending = Array.isArray(pendindScoreData) ? pendindScoreData : [];
  const scoreData = safePending?.map((item: any) => {

    // Extract all scores and calculate average (out of 10)
    const allScores = (Array.isArray(item?.rating_data) ? item?.rating_data : [])?.flatMap((category: any) =>
      (Array.isArray(category?.traits) ? category.traits : [])
        ?.map((trait: any) => trait?.score)
        ?.filter((score: any): score is number => typeof score === 'number' && !isNaN(score))
    );
    console.log('allScores', allScores)
    const averageScore = allScores?.length > 0
      ? allScores?.reduce((sum: any, score: any) => sum + score, 0) / allScores?.length
      : 0;

    const formattedDate = formatDate(item?.created_at);

    // Group scores by category for the dimensions section (guard arrays)
    const categories = (Array.isArray(item?.rating_data) ? item.rating_data : [])?.map((category: any) => {
      const traits = Array.isArray(category?.traits) ? category.traits : [];
      const denom = traits?.length;
      const sum = traits?.reduce((sum: number, trait: any) => sum + (Number(trait?.score) || 0), 0);
      const avg = denom > 0 ? sum / denom : 0;
      return {
        category: category?.topic || '',
        score: avg,
        comment: category?.comment || ''
      };
    });
    console.log('categories', categories)
    // Sort categories by score (highest first)
    const topCategories = [...categories]
      .sort((a, b) => b.score - a.score)
      ?.slice(0, 4);

    const phoneNumber = item?.sender_id?.phone_number;
    const contactName = typeof phoneNumber === 'string' && phoneNumber?.length > 0 ? (phoneToNameMap[phoneNumber] || '') : '';
    return {
      id: item?._id,
      name: item?.sender_id?.username || 'Anonymous',
      relation: 'Unknown', // You might need to map this from sender_relation
      score: parseFloat(averageScore?.toFixed(1)),
      date: formattedDate,
      comment: (Array.isArray(item?.rating_data) ? item.rating_data : [])?.map((category: any) => category?.comment || ''),

      dimensions: [
        {
          title: 'Top scored for you',
          color: '#000000',
          id: item?._id,
          items: topCategories?.map((cat) => ({
            category: cat.category,
            score: parseFloat(cat.score?.toFixed(1)),
            comment: cat.comment,
          }))
        }
      ]
    };
  });
  // const scoreData = [
  //   {
  //     id: '1',
  //     name: 'anonymous21',
  //     relation: 'colleague',
  //     score: 7.5,
  //     date: '21-03-2024',
  //     comment:
  //       "I think he can bhanu can be better at driving skills if he improves reverse parking. While he drives at night it can be a problem with his habit of over taking vehicles. But overall Good driver.",
  //     dimensions: [
  //       {
  //         title: 'Top scored you for',
  //         color: '#000000',
  //         items: [
  //           { category: 'Casual Topics', score: 8.2 },
  //           { category: 'Physical Dimension', score: 7.9 },
  //           { category: 'Emotional Dimension', score: 6.8 },
  //           { category: 'Growth Dimension', score: 6.1 },
  //         ],
  //       },

  //     ],
  //   },
  // ];



  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Requests</Text>
          <Text style={styles.headerCount}>{pendingScroretotal?.toString()?.padStart(2, "0")}</Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="#FF8541" />
        </View>
      ) : (
        <>
          {pendingScroretotal === 0 ? (
            <View style={styles.indicator}>
              <Text style={styles.emptyText}>
                You haven&apos;t received any score request yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={scoreData}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={({ item }) =>
                <ScoreCard {...item}
                  pendindScoreData={pendindScoreData}
                  updateRating={updateRating}
                  setUpdated={setUpdated} />}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}
      <View style={styles.navigationContainer}>
        <Navigation initialTab="PROFILE" setScreen={(screen: any) => navigationScreen(screen)} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  new: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    fontWeight: "500",
    color: "#FF4848",
    position: "relative",
    bottom: -3,
  },
  header: {
    flexDirection: 'row',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
    marginRight: 20,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  headerText: {
    fontSize: 25,
    fontWeight: '400',
    color: '#000',
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
  },
  headerCount: {
    fontSize: 30,
    fontWeight: '500',
    color: '#000000',
  },
  listContainer: {
    padding: 0,
    paddingBottom: 80,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,


  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 0,
    width: '100%',
    marginTop: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingHorizontal: 20,
  },
  name: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 27,
    letterSpacing: -0.4,
    textAlignVertical: 'center',
    color: '#000000',
  },
  relation: {
    color: '#000000',
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Light',
  },
  indicator: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1
  },
  scoreRow: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "300",
    fontFamily: "Poppins-Light",
    marginRight: 20,
  },
  scoreValue: {
    color: '#0050EB',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  dateBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
  },
  date: {
    fontSize: 12,
    paddingBottom: 10,
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#000000'
  },
  expandedContent: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20, // Ensure content isn't cut off at the bottom
  },
  dimensionRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftDimension: {
    flex: 1,
    marginRight: 6,
  },
  rightDimension: {
    flex: 1,
    marginLeft: 6,
    marginRight: -40,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
  },

  dimensionTitle: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
    color: '#000',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    marginLeft: 50,
    color: '#555',
  },
  dimensionScore: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,

  },
  itemName: {
    fontSize: 12,
    color: '#FF8541',
    // fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    flexShrink: 1,
    width: '90%',
  },
  itemScore: {
    fontSize: 12,
    color: '#FF8541',
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  commentBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
  commentToggle: {
    color: '#2196F3',
    textAlign: 'right',
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    gap: 10
  },
  updateBtn: {
    backgroundColor: '#FF8541',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginLeft: 10,
    width: 80,
    fontSize: 14,
    fontFamily: 'Poppins-Light',
    color: '#000',
  },
  openButton: {
    backgroundColor: '#BFFF98',
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 20,
    alignItems: 'center',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
    // fontFamily: 'Poppins-Medium',
  },

  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 30,
  },
  blockButton: {
    // flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 30,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#DDD',
    height: 33,
    display: 'flex',
  },
  blockButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Poppins-Medium',
    lineHeight: 18,
    height: 33
  },
  rejectButton: {
    // flex: 1,
    backgroundColor: '#FF4E4E',
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    lineHeight: 18,
    height: 33,

  },
  rejectButtonText: {
    color: '#FFF',
    fontSize: 14,
    // fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  acceptButton: {
    // flex: 1,
    display: 'flex',
    backgroundColor: '#BFFF98',
    paddingVertical: 2,
    paddingHorizontal: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 18,
    height: 33
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});

export default SapiensRequests; 