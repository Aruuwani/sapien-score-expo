






import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFonts } from 'expo-font';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ScrollView, // Added ScrollView import
  KeyboardAvoidingView,
  ActivityIndicator, // Added KeyboardAvoidingView for better keypad handling
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navigation from '../ui/Navigation';
import ScoreSlider from '../ui/ScoreSlider';
import { Home } from '@/app';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import UpdateScoreMessageModal from '../ui/UpdateScoreMessageModal';
import UnblockModal from '../ui/UnblockModal';
import UnblockConfirmationModal from '../ui/UnblockConfirmationModal';
import * as Contacts from 'expo-contacts';
import { formatDate } from '../../utils/date';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScoreItemProps {
  category: string;
  score: number;
}

interface DimensionProps {
  id: string;
  title?: string;
  topic?: string;
  score: number;
  items?: ScoreItemProps[];
  traits: any[];
  color: string;
  comment?: string;
}

interface ScoreCardProps {
  id: string
  name: string;
  relation: string;
  score: number;
  date: string;
  dimensions: DimensionProps[];
  comment?: string;
  averageScore?: string | number;
  ReceivedBlockedtotal?: any
  updateRating: (ratingId: string, status: string) => void
  setUpdated: (updated: boolean) => void
  navigationScreen: (screen: Home) => void
}
interface ScoresSentScreenProps {
  onBack: () => void;
  navigationScreen: (screen: Home) => void
  sapienBlockedLength: number
  ReceivedBlockedtotal: any,
  laoding: boolean,
  updateRating: (ratingId: string, status: string) => void
  setUpdated: (updated: boolean) => void
}

const ScoreCard: React.FC<ScoreCardProps> = ({ name, date, dimensions, comment, averageScore, ReceivedBlockedtotal, navigationScreen, updateRating, setUpdated }) => {
  console.log('dimensionffffffffs', dimensions)

  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // State to sync slider and text input
  const textInputRef = useRef<TextInput>(null); // Ref to programmatically focus TextInput
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [visibleDimensions, setVisibleDimensions] = useState(4);
  const [showUnBlockModal, setShowBlockModal] = useState(false);
  const [UNblockedScoreId, setUNBlockedScoreId] = useState('')
  const [showUNBlockedAccceptModal, setShowUNBlockedAcceptModal] = useState(false)
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const toggleShowAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(!showAll);

  };
  console.log('dimensions', dimensions)
  const filteredDimensions = Array.isArray(dimensions)
    ? dimensions?.filter((dim: any) => {
      const traits = Array.isArray(dim?.traits) ? dim.traits : [];
      const validTraits = traits?.filter((trait: any) => typeof trait?.score === 'number' && trait.score > 0);
      return validTraits?.length >= 1;
    })
    : [];

  // Split into left and right columns
  const leftDimensions = filteredDimensions?.filter((_, index) => index % 2 === 0);
  const rightDimensions = filteredDimensions?.filter((_, index) => index % 2 === 1);

  // Determine how many to show in each column when not expanded
  const leftToShow = showAll ? leftDimensions?.length : Math.min(leftDimensions?.length, 2);
  const rightToShow = showAll ? rightDimensions?.length : Math.min(rightDimensions?.length, 2);
  const toggleComment = () => {
    setShowComment(!showComment);
  };

  // Focus the TextInput when clicking on the ScoreSlider area
  const handleSliderPress = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
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
      const title = dim?.title || dim?.topic;
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



  const UNBlockhandle = (ratingId: any) => {
    setUNBlockedScoreId(ratingId)
    setShowUNBlockedAcceptModal(true)
  };
  const handleUNBlockConfirm = async (ratingId: string) => {
    setShowUNBlockedAcceptModal(false);
    if (!ratingId) {
      console.warn('No ratingId provided for unblock');
      return;
    }
    // Decide target status and screen based on where the block originated
    // @ts-ignore provided via app/index
    const origin = (global as any).blockedFrom as 'received' | 'requests' | null;
    const targetStatus = origin === 'requests' ? 'pending' : 'approved';
    const targetScreen = origin === 'requests' ? 'sapiensrequests' : 'scoresReceived';

    await updateRating(ratingId, targetStatus);
    setUNBlockedScoreId('');
    setUpdated(true);
    navigationScreen(targetScreen as any);
    // clear origin
    // @ts-ignore
    if (typeof (global as any).setBlockedFrom === 'function') (global as any).setBlockedFrom(null);
  };

  const UNBlockhandleRejectCancel = () => {
    setShowUNBlockedAcceptModal(false);
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.scoreRow}>scored you <Text style={styles.scoreValue}>{averageScore}</Text></Text>

        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>last scored on</Text>
          <Text style={styles.date}>{date}</Text>
          {!expanded && (
            <TouchableOpacity onPress={toggleExpanded} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: '600', marginRight: 4 }}>Open</Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {expanded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.expandedContent}>
              <View style={styles.dimensionRow}>
                <View style={styles.leftDimension}>
                  {leftDimensions?.slice(0, leftToShow)?.map((dim: any, idx: number) => {
                    const traits = Array.isArray(dim?.traits) ? dim.traits : [];
                    const validTraits = traits?.filter((trait: any) => typeof trait?.score === 'number' && trait.score > 0);
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.dimensionContainer,
                          validTraits?.length === 1 && styles.oneTrait,
                          validTraits?.length === 2 && styles.twoTraits,
                          validTraits?.length === 3 && styles.threeTraits,
                          validTraits?.length === 4 && styles.fourTraits,
                        ]}
                      >
                        <View style={styles.dimensionHeader}>
                          <Text style={[styles.dimensionTitle, { color: dim.color || "rgb(255, 133, 65)" }]}>
                            {dim.topic}
                          </Text>
                          {(() => {
                            const avgScore = validTraits?.length > 0
                              ? validTraits?.reduce((acc: any, curr: any) => acc + (Number(curr?.score) || 0), 0) / validTraits?.length
                              : 0;
                            return avgScore && avgScore !== 0 ? (
                              <Text style={[styles.dimensionScore, { color: dim.color || "rgb(255, 133, 65)" }]}>
                                {avgScore?.toFixed(1)}
                              </Text>
                            ) : null;
                          })()}
                        </View>
                        {validTraits?.map((item: any, i: number) => (
                          <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.trait}</Text>
                            <Text style={styles.itemScore}>{Number(item?.score)?.toFixed(1)}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.rightDimension}>
                  {rightDimensions?.slice(0, rightToShow)?.map((dim: any, idx: number) => {
                    const traits = Array.isArray(dim?.traits) ? dim.traits : [];
                    const validTraits = traits?.filter((trait: any) => typeof trait?.score === 'number' && trait.score > 0);
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.dimensionContainer,
                          validTraits?.length === 1 && styles.oneTrait,
                          validTraits?.length === 2 && styles.twoTraits,
                          validTraits?.length === 3 && styles.threeTraits,
                          validTraits?.length === 4 && styles.fourTraits,
                        ]}
                      >
                        <View style={styles.dimensionHeader}>
                          <Text style={[styles.dimensionTitle, { color: dim.color || "rgb(255, 133, 65)" }]}>
                            {dim.topic}
                          </Text>
                          {(() => {
                            const avgScore = validTraits?.length > 0
                              ? validTraits?.reduce((acc: any, curr: any) => acc + (Number(curr?.score) || 0), 0) / validTraits?.length
                              : 0;
                            return avgScore && avgScore !== 0 ? (
                              <Text style={[styles.dimensionScore, { color: dim.color || "rgb(255, 133, 65)" }]}>
                                {avgScore?.toFixed(1)}
                              </Text>
                            ) : null;
                          })()}
                        </View>
                        {validTraits?.map((item: any, i: number) => (
                          <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.trait}</Text>
                            <Text style={styles.itemScore}>{Number(item?.score)?.toFixed(1)}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>

              {filteredDimensions?.length > 4 && (
                <TouchableOpacity
                  onPress={toggleShowAll}
                  style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 10 }}
                >
                  <Text style={{ fontWeight: '600', marginRight: 4 }}>{showAll ? 'Show less' : 'Show all'}</Text>
                  <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={18} />
                </TouchableOpacity>
              )}

              {/* <TouchableOpacity
                  style={[
                    styles.updateBtn,
                    !is24HoursPassed  // apply disabled style conditionally
                  ]}
                  // disabled={!is24HoursPassed}
                  onPress={()=>handleUpdateScore(receiver,relationId,ratingId)}
                >
                  <Text style={styles.updateBtnText}>Update Score</Text>
                </TouchableOpacity> */}
              <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={handleSliderPress} style={{ flex: 1 }}>

                  <ScoreSlider
                    currentOneTitle="Emotional Dimensions"
                    currentComment={
                      (Array.isArray(dimensions) ? dimensions.find((dim: any) => dim?.comment)?.comment : '') ||
                      comment ||
                      ''
                    }
                    Editing={false}
                    showComments={true}
                    data={{ rating_data: Array.isArray(dimensions) ? dimensions : [] }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>


                {/* Un-Block Button */}
                <TouchableOpacity style={styles.unblockBtn} onPress={() => UNBlockhandle(Array.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?.id ?? '') : '')}>
                  <Text style={styles.unblockBtnText}>Un-Block</Text>
                </TouchableOpacity>

                {/* Close Button with Icon */}
                <TouchableOpacity onPress={toggleExpanded} style={styles.closeButton}>
                  <Text style={styles.closeBtnText}>Close</Text>
                  <Ionicons name="chevron-up" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <UnblockModal visible={showUpdateModal} onClose={() => setShowUpdateModal(false)} />
      <UnblockConfirmationModal
        visible={showUNBlockedAccceptModal}
        message="Are you sure you want to un-block?"
        options={{
          left: {
            text: "Cancel",
            action: () => UNBlockhandleRejectCancel(),
          },
          right: {
            text: "Confirm",
            action: () => handleUNBlockConfirm(UNblockedScoreId),
            bold: true,
          },
        }} title={''} type={'delete'}
      />
    </View>
  );
};

const SapiensBlocked: React.FC<ScoresSentScreenProps> = ({ onBack, navigationScreen, sapienBlockedLength, ReceivedBlockedtotal, laoding, updateRating, setUpdated }) => {
  const [phoneToNameMap, setPhoneToNameMap] = useState<{ [key: string]: string }>({});



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
  const safeBlocked = Array.isArray(ReceivedBlockedtotal) ? ReceivedBlockedtotal : [];
  const scoreData = safeBlocked?.map((item: any) => {
    const ratingData = Array.isArray(item?.rating_data) ? item.rating_data : [];
    // Calculate average score
    const allScores = ratingData.flatMap((category: any) =>
      (Array.isArray(category?.traits) ? category.traits : [])
        ?.map((trait: any) => trait?.score)
        ?.filter((score: any): score is number => typeof score === 'number' && !isNaN(score))
    );

    const averageScore = allScores?.length > 0
      ? allScores?.reduce((sum: any, score: any) => sum + score, 0) / allScores?.length
      : 0;

    const formattedDate = formatDate(item?.created_at);

    // Transform dimensions to match what ScoreCard expects
    const dimensions = ratingData
      ?.filter((category: any) =>
        (Array.isArray(category?.traits) ? category.traits : []).some((trait: any) => typeof trait?.score === 'number')
      )
      ?.map((category: any) => ({
        id: item?._id,
        title: category?.topic,
        topic: category?.topic,
        color: "#FF8541",
        score: (Array.isArray(category?.traits) ? category.traits : [])?.reduce((sum: number, trait: any) =>
          sum + (Number(trait?.score) || 0), 0) / Math.max((Array.isArray(category?.traits) ? category.traits?.length : 0), 1),
        traits: (Array.isArray(category?.traits) ? category.traits : [])?.filter((trait: any) => typeof trait?.score === 'number') ,
        comment: category?.comment
      }));

    const phoneNumber = item?.sender_id?.phone_number;
    const contactName = typeof phoneNumber === 'string' && phoneNumber?.length > 0 ? (phoneToNameMap[phoneNumber] || '') : '';

    return {
      id: item?._id,
      name: item?.sender_id?.username || 'Anonymous',
      relation: 'Unknown',
      score: parseFloat(averageScore?.toFixed(1)),
      date: formattedDate,
      comment: (ratingData.find((cat: any) => cat?.comment) || {})?.comment || '',
      dimensions,
      averageScore: parseFloat(averageScore?.toFixed(1))
    };
  });
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
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Blocked</Text>
          <Text style={styles.headerCount}>
            {sapienBlockedLength?.toString()?.padStart(2, "0")}
          </Text>
        </View>
      </View>
      {laoding ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="#FF8541" />
        </View>
      ) : (
        <>
          {sapienBlockedLength === 0 ? (
            <View style={styles.indicator}>
              <Text style={styles.emptyText}>
                You haven't any blocked score.
              </Text>
            </View>
          ) : (
            <FlatList
              data={scoreData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ScoreCard
                  {...item}
                  ReceivedBlockedtotal={ReceivedBlockedtotal}
                  updateRating={updateRating}
                  setUpdated={setUpdated}
                  navigationScreen={navigationScreen}
                />
              )}
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
    paddingBottom: 70

  },
  header: {
    flexDirection: "row",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    display: "flex",
  },
  indicator: {
    alignContent: "center",
    justifyContent: "center",
    flex: 1
  },
  backButton: {
    padding: 5,
    marginRight: 20,
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
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#000000'
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
  dimensionContainer: {
    // marginBottom: 12,
    // padding: 10,
    // backgroundColor: "#FFFFFF",
    // borderRadius: 8,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    // borderRadius: 0
    marginBottom: 12,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
  },
  fourTraits: {
    maxHeight: 140,
    minHeight: 140,

  },
  oneTrait: {
    minHeight: 90,
  },
  twoTraits: {
    minHeight: 80,
  },
  threeTraits: {
    maxHeight: 80,
    minHeight: 140,
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
    fontFamily: 'Poppins-Light',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 22.8,
    letterSpacing: -0.4,
    textAlignVertical: 'center',
    color: '#000000',
  },
  relation: {
    color: '#000000',
    marginBottom: 4,
    fontSize: 12,
    // fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  scoreRow: {
    fontSize: 15,
    color: '#000000',

    fontFamily: 'Poppins-Light',
    marginRight: 20
  },
  scoreValue: {
    color: '#0050EB',
    fontWeight: '500',
    fontSize: 12,
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
    fontFamily: 'Poppins-Regular',
  },
  date: {
    fontSize: 12,
    paddingBottom: 10,
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
  },
  expandedContent: {
    paddingHorizontal: 12
  },
  scrollContent: {
    paddingBottom: 20, // Ensure content isn't cut off at the bottom
  },
  dimensionRow: {
    flexDirection: 'row',
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
  },

  dimensionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 2,
  },
  dimensionTitle: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    flex: 1,
    flexShrink: 1,
  },
  dimensionScore: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
    minWidth: 24,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
    flex: 1,
    flexShrink: 1,
    textAlign: 'left',
    paddingRight: 8,
  },
  itemScore: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
    minWidth: 24,
    textAlign: 'right',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    // marginBottom: 10,
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
  // cardFooter: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginTop: 10,
  //   marginBottom: 16,
  // },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    // Add horizontal padding for consistency
  },
  // updateBtn: {
  //   backgroundColor: '#FF8541',
  //   padding: 10,
  //   borderRadius: 25,
  //   alignItems: 'center',
  //   flex: 1,
  //   marginRight: 12,
  // },
  updateBtn: {
    backgroundColor: '#FF8541',
    paddingVertical: 10,
    paddingHorizontal: 20, // Consistent horizontal padding
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 70,
    minWidth: '30%', // Give it a consistent minimum width
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
    marginTop: 30,

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
  reportBtn: {
    padding: 5,
  },
  reportBtnText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '300',
    fontFamily: 'Poppins-Light',
  },
  unblockBtn: {
    backgroundColor: '#BFFF98',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginLeft: 30,
  },
  unblockBtnText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },

  closeBtnText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginRight: 4,
    fontFamily: 'Poppins-Medium',
  },
});

export default SapiensBlocked;
