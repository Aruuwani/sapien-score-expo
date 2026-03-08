import { Home } from '@/app';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Contacts from 'expo-contacts';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList, // Added ScrollView import
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
  View
} from 'react-native';
import Navigation from '../ui/Navigation';
import ScoreSlider from '../ui/ScoreSlider';
import UpdateScoreMessageModal from '../ui/UpdateScoreMessageModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from '../../utils/date';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScoreItemProps {
  category: string;
  score: number;
}

interface DimensionProps {
  title: string;
  score: number;
  items: ScoreItemProps[];
  color: string;
}

interface ScoreCardProps {
  name: string;
  relation: string;
  score: number;
  date: string;
  dimensions: any;
  comment?: string;
  averageScore?: string | number;
  is24HoursPassed?: boolean;
  navigationScreen: (screen: Home) => void,
  receiver: any
  selectedPerson: any
  handleRelationSelect: any
  relationId: any
  ratingId: any
  setUpdatedraingId: any
  setScoringData: (data: any) => void
  setIsUpdateFlow: (val: boolean) => void
}
interface ScoresSentScreenProps {
  onBack: () => void;
  navigationScreen: (screen: Home) => void
  sapienIScoredLength: number
  sapiensIScored: any,
  laoding: boolean,
  selectedPerson: any
  handleRelationSelect: any
  setUpdatedraingId: any
  setScoringData: (data: any) => void
  setIsUpdateFlow: (val: boolean) => void
}

const ScoreCard: React.FC<ScoreCardProps> = ({ name, relation, score, date, dimensions, comment, averageScore, is24HoursPassed, navigationScreen,receiver,selectedPerson,handleRelationSelect,relationId,ratingId,setUpdatedraingId, setScoringData, setIsUpdateFlow}) => {
  console.log('name', name)
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // State to sync slider and text input
  const textInputRef = useRef<TextInput>(null); // Ref to programmatically focus TextInput
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [visibleDimensions, setVisibleDimensions] = useState(4);
  const [customMessage, setCustomMessage] = useState<any>('');



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
  const uniqueDimensions = [];
  const uniqueTitles = new Set();

  (Array.isArray(dimensions) ? dimensions : [])?.forEach((dim: any) => {
    if (!uniqueTitles.has(dim?.title)) {
      uniqueTitles.add(dim?.title);
      uniqueDimensions.push(dim);
    }
  });

  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleUpdateScore = async (receiver: any,relation: any,ratingId: any) => {
    console.log('ratingId', ratingId)

    // if (!is24HoursPassed) {
    //   setCustomMessage("You can only update scores after 24 hours have passed.");
    //   setTimeout(() => setCustomMessage(''), 4000); // Extended duration for better readability
    //   return;
    // }

    setLoading(true);
    try {
      if(!is24HoursPassed){


      // Simulate API call or update logic
      setShowUpdateModal(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
      setShowUpdateModal(false);
      }else{

        setUpdatedraingId(ratingId)
        // Preload previous scores into scoring flow
        setScoringData({ rating_data: dimensions })
        // mark that we're entering scoring via update
        setIsUpdateFlow(true)
        selectedPerson(receiver)
        handleRelationSelect(relation)
        //  navigationScreen("scoring")

      }
    } catch (error) {
      setCustomMessage("Failed to update score. Please try again.");
      setTimeout(() => setCustomMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };
  return (

    <View style={styles.card}>
      {/* {loading && <ActivityIndicator size="large" color="#FF8541" />} */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.relation}>
            {relation} <Text style={styles.scoreRow}>  you scored <Text style={styles.scoreValue}> {averageScore}</Text></Text>
          </Text>
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
                      (Array.isArray(dimensions) ? dimensions?.find((dim: any) => dim?.comment)?.comment : '') ||
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
                <TouchableOpacity
                  style={[
                    styles.updateBtn,
                    !is24HoursPassed ? styles.updateBtnDisabled : undefined
                  ]}
                  // disabled={!is24HoursPassed}
                  onPress={()=>handleUpdateScore(receiver,relationId,ratingId)}
                >
                  <Text style={styles.updateBtnText}>Update Score</Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={toggleExpanded} style={styles.closeButton}>
                  <Text style={{ fontFamily: 'Poppins-Medium', marginRight: 15, fontSize: 15 }}>Close</Text>
                  <Ionicons name="chevron-up" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <UpdateScoreMessageModal visible={showUpdateModal} onClose={() => setShowUpdateModal(false)} />
      {customMessage ? (
        <>
          <View style={styles.messageOverlay} />
          <View style={styles.messageContainer}>
            <Text style={styles.customMessage}>{customMessage}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
};


const ScoresSentScreen: React.FC<ScoresSentScreenProps> = ({
  onBack,
  navigationScreen,
  sapienIScoredLength,
  sapiensIScored,
  laoding,
  selectedPerson,
  handleRelationSelect,
  setUpdatedraingId,
  setScoringData,
  setIsUpdateFlow
}) => {
  const [phoneToNameMap, setPhoneToNameMap] = useState<{ [key: string]: string }>({});

  // Properly placed useFocusEffect at the top level
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onBack()
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  // Memoized contact fetching
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
              const normalized = (phone.number || '').replace(/[^0-9]/g, '');
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
                updatedContactsMap[`+${key.replace(/[^0-9]/g, '')}`] = contactsMap[key]
              }
              if (key?.length === 10) {
                updatedContactsMap[`+91${key.replace(/[^0-9]/g, '')}`] = contactsMap[key]
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
  // Memoize the renderItem function to prevent unnecessary re-renders
  const renderScoreCard = useCallback(({ item }: { item: any }) => {
    const phoneNumber = item?.receiver_id?.phone_number;
    const contactName = typeof phoneNumber === 'string' && phoneNumber?.length > 0 ? (phoneToNameMap[phoneNumber] || '') : '';

    const ratingData = Array.isArray(item?.rating_data) ? item.rating_data : [];
    const allScores = ratingData?.flatMap((category: any) =>
      (Array.isArray(category?.traits) ? category.traits : [])
        ?.map((trait: any) => trait?.score)
        ?.filter((score: any): score is number => typeof score === 'number' && !isNaN(score))
    );

    const averageScore = allScores?.length > 0
      ? allScores?.reduce((sum: any, score: any) => sum + score, 0) / allScores?.length
      : 0;

    const normalizedScore = averageScore?.toFixed(1);

    const has24HoursPassed = (createdAt: Date | string): boolean => {
      if (!createdAt) return false;
      const createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) return false;
      const now = new Date();
      const diffInMs = now.getTime() - createdDate.getTime();
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      return diffInMs >= twentyFourHoursInMs;
    };

    return (
      <ScoreCard
        name={contactName || item?.receiver_id?.work_email || ''}
        relation={item?.sender_relation_name}
        score={ratingData?.length > 0 ? ratingData?.reduce(
          (acc: any, curr: any) => acc + (curr?.score || 0),
          0
        ) / ratingData?.length : 0}
        date={formatDate(item?.created_at)}
        dimensions={ratingData}
        comment={item?.comment}
        averageScore={normalizedScore}
        is24HoursPassed={has24HoursPassed(item?.created_at)}
        navigationScreen={navigationScreen}
        receiver={item?.receiver_id?.work_email || item?.receiver_id?.phone_number}
        selectedPerson={selectedPerson}
        handleRelationSelect={handleRelationSelect}
        relationId={item?.sender_relation}
        ratingId={item?._id}
        setUpdatedraingId={setUpdatedraingId}
        setScoringData={setScoringData}
        setIsUpdateFlow={setIsUpdateFlow}
      />
    );
  }, [phoneToNameMap, navigationScreen, selectedPerson, handleRelationSelect, setUpdatedraingId]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Scores Sent</Text>
          <Text style={styles.headerCount}>
            {sapienIScoredLength?.toString()?.padStart(2, "0")}
          </Text>
        </View>
      </View>
      
      {laoding ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="#FF8541" />
        </View>
      ) : sapienIScoredLength === 0 ? (
        <View style={styles.indicator}>
          <Text style={styles.emptyText}>
            You haven't scored anyone yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={Array.isArray(sapiensIScored) ? sapiensIScored : []}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderScoreCard}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5} // Optimize initial render
          maxToRenderPerBatch={5} // Optimize batch rendering
          windowSize={5} // Reduce memory usage
        />
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
    // backgroundColor: 'red',
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
  messageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  messageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1001,
  },
  customMessage: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'left',
    fontFamily: 'Poppins-Light',
    // fontWeight: '300',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,


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
    lineHeight: 25,
    letterSpacing: -0.4,
    textAlignVertical: 'center',
    color: '#000000',
  },
  relation: {
    color: '#000000',
    marginBottom: 4,
    fontSize: 12,
    // fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  scoreRow: {
    fontSize: 15,
    color: '#000000',
    fontWeight: "300",
    fontFamily: 'Poppins-Light',
    marginRight: 20
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
  expandedContent: {
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 20,
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
  dimensionContainer: {
    marginBottom: 25,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
  },
  // Add these trait-specific styles
  // oneTrait: {
  //   minHeight: 65,
  // },
  // twoTraits: {
  //   minHeight: 85,
  // },
  // threeTraits: {
  //   minHeight: 105,
  // },
  // fourTraits: {
  //   minHeight: 125,
  // },
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
    paddingHorizontal: 16, // Add horizontal padding for consistency
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
  updateBtnDisabled: {
    backgroundColor: '#ccc', // disabled color
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
});

export default ScoresSentScreen;
