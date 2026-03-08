import { getRatingsForMe, updateRatingStatus } from "@/api/ratingApi";
import { Home } from "@/app";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
} from "react-native";
import Navigation from "../ui/Navigation";
import ScoreSlider from "../ui/ScoreSlider";
import ReportDialogScreen from "../ui/ReportDialogScreen";
import ToastMessageModal from "../ui/toastModal";
import BlockDialog from "../ui/BlockDialog";
import BlockedMessageModal from "../ui/BlockedMessageModal";
import * as Contacts from 'expo-contacts';
import { formatDate } from '../../utils/date';
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScoreItemProps {
  category: string;
  score: number;
}

interface DimensionProps {
  comment: React.JSX.Element;
  traits: any;
  topic: ReactNode;
  title: string;
  score: number;
  items: ScoreItemProps[];
  color: string;
  _id: string
}

interface ScoreCardProps {
  name: string;
  relation: string;
  score: number;
  date: string;
  dimensions: DimensionProps[];
  comment?: string;
  averageScore?: string | number;
  ratingId: string;
  setUpdated: (value: boolean) => void;
  onRemove: (id: string) => void;
}

interface ScoresReceivedScreenProps {
  onBack: () => void;
  navigationScreen: (screen: Home) => void
  setUpdated: (value: boolean) => void
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  name,
  relation,
  score,
  date,
  dimensions,
  comment,
  averageScore,
  ratingId,
  setUpdated,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [visible, setModalVisible] = useState(false);
  const [reportedSuccess, setReportedSuccess] = useState(false);
  // const [ratingId, setRatingId] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedScoreId, setBlockedScoreId] = useState('')
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockedAccceptModal, setShowBlockedAcceptModal] = useState(false)
  const [showRejectedAcceptModal, setShowRejectedAcceptModal] = useState(false)
  const [sliderValue, setSliderValue] = useState(0); // State to sync slider and text input
  const textInputRef = useRef<TextInput>(null); // Ref to programmatically focus TextInput
  console.log('dimenwwwwwwwwwwwsions', dimensions)
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

  useEffect(() => {
    if (!expanded) {
      setShowAll(false);
    }
  }, [expanded]);

  useEffect(() => {
    if (reportedSuccess) {
      setTimeout(() => {
        setReportedSuccess(false);
        //   setMessage('');
      }, 3000);
    }
  }, [reportedSuccess])
  // Get unique dimensions by title
  const uniqueDimensions: any[] = [];
  const uniqueTitles = new Set<string>();

  if (Array?.isArray(dimensions)) {
    dimensions.forEach((dim: any) => {
      const title = dim?.title;
      if (title && !uniqueTitles.has(title)) {
        uniqueTitles.add(title);
        uniqueDimensions.push(dim);
      }
    });
  }

  const [fontsLoaded] = useFonts({
    "Poppins-Light": require("../../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-semiBold": require("../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    console.log("fonts not loaded");
  }
  console.log('ratingId', ratingId)
  const handleReport = async (ratingId: string) => {
    if (!ratingId) {
      console.warn('No ratingId provided for report');
      return;
    }
    // setRatingId(ratingId)
    setModalVisible(true)

    console.log('Reporting')
  }

  const Blockhandle = () => {
    setBlockedScoreId(ratingId)
    setShowBlockModal(true);
  };
  const BlockhandleRejectConfirm = async (ratingId: any) => {
    setShowRejectModal(false);
    if (!ratingId) {
      console.warn('No ratingId provided for reject');
      return;
    }
    await updateRatingStatus(ratingId, 'rejected');
    setShowRejectedAcceptModal(true)

    setTimeout(() => {
      setShowRejectedAcceptModal(false);
      setBlockedScoreId('')
      // setUpdated(true);
    }, 3000);

  };

  const handleBlockConfirm = async (ratingId: string) => {
    // Close the confirm dialog immediately
    setShowBlockModal(false);

    if (!ratingId) {
      console.warn('No ratingId provided for block');
      return;
    }

    // Perform the update, then show the success modal without refreshing the list yet
    await updateRatingStatus(ratingId, 'blocked');
    onRemove(ratingId);
    setShowBlockedAcceptModal(true);

    // mark origin so Blocked screen knows where to return when unblocking
    // @ts-ignore provided via app/index
    if (typeof (global as any).setBlockedFrom === 'function') {
      (global as any).setBlockedFrom('received');
    }

    // After the toast is shown for a moment, refresh the list to remove the blocked item
    setTimeout(() => {
      setShowBlockedAcceptModal(false);
      setBlockedScoreId('');
      setUpdated(true);
    }, 3000);
  };

  const BlockhandleRejectCancel = () => {
    setShowBlockModal(false);
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.new}>new</Text>
          </View>

          <Text style={styles.relation}>
            <Text style={styles.scoreRow}>
              scored you{" "}
              <Text style={styles.scoreValue}>{averageScore}</Text>
            </Text>
          </Text>
        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>last scored on</Text>
          <Text style={styles.date}>{date}</Text>
          {!expanded && (
            <TouchableOpacity
              onPress={toggleExpanded}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ fontWeight: "500", marginRight: 20, fontFamily: "Poppins-Medium" }}>Open</Text>
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
                {/* Left Side: Topics 1, 3, 5, 7 (odd-indexed, 0-based) */}
                <View style={styles.leftDimension}>
                  {Array?.isArray(dimensions) &&
                    dimensions
                      ?.filter((dim) => {
                        const traits = Array?.isArray(dim?.traits) ? dim.traits : [];
                        const validTraits = traits?.filter(
                          (trait: { score: number }) => typeof trait?.score === 'number' && trait.score > 0
                        );
                        return validTraits?.length >= 1;
                      })
                      ?.filter((_, index) => index % 2 === 0)
                      ?.map((dim, idx) => {
                        const traits = Array?.isArray(dim?.traits) ? dim.traits : [];
                        const validTraits = traits?.filter(
                          (trait: { score: number }) => typeof trait?.score === 'number' && trait.score > 0
                        );
                        console.log("dsfdsf", validTraits?.length);
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
                              <Text
                                style={[
                                  styles.dimensionTitle,
                                  { color: dim.color || "rgb(255, 133, 65)" },
                                ]}
                              >
                                {dim.topic}
                              </Text>
                              {(() => {
                                const avgScore =
                                  validTraits?.length > 0
                                    ? validTraits?.reduce(
                                      (acc: any, curr: { score: any }) =>
                                        acc + (Number(curr?.score) || 0),
                                      0
                                    ) / validTraits?.length
                                    : 0;
                                return avgScore && avgScore !== 0 ? (
                                  <Text
                                    style={[
                                      styles.dimensionScore,
                                      { color: dim.color || "rgb(255, 133, 65)" },
                                    ]}
                                  >
                                    {avgScore?.toFixed(1)}
                                  </Text>
                                ) : null;
                              })()}
                            </View>
                            {validTraits?.map((item: { trait: any; score: number }, i: any) => (
                              <View key={i} style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.trait}</Text>
                                <Text style={styles.itemScore}>
                                  {Number(item?.score)?.toFixed(1)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                </View>

                {/* Right Side: Topics 2, 4, 6 (odd-indexed, 0-based) */}
                <View style={styles.rightDimension}>
                  {Array?.isArray(dimensions) &&
                    dimensions
                      ?.filter((dim) => {
                        const traits = Array?.isArray(dim?.traits) ? dim.traits : [];
                        const validTraits = traits?.filter(
                          (trait: { score: number }) => typeof trait?.score === 'number' && trait.score > 0
                        );
                        return validTraits?.length >= 1;
                      })
                      ?.filter((_, index) => index % 2 === 1)
                      ?.map((dim, idx) => {
                        const traits = Array?.isArray(dim?.traits) ? dim.traits : [];
                        const validTraits = traits?.filter(
                          (trait: { score: number }) => typeof trait?.score === 'number' && trait.score > 0
                        );
                        console.log(`Right Topic: ${dim.topic}, Valid Traits:`, validTraits);
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
                              <Text
                                style={[
                                  styles.dimensionTitle,
                                  { color: dim.color || "rgb(255, 133, 65)" },
                                ]}
                              >
                                {dim.topic}
                              </Text>
                              {(() => {
                                const avgScore =
                                  validTraits?.length > 0
                                    ? validTraits?.reduce(
                                      (acc: any, curr: { score: any }) =>
                                        acc + (Number(curr?.score) || 0),
                                      0
                                    ) / validTraits?.length
                                    : 0;
                                return avgScore && avgScore !== 0 ? (
                                  <Text
                                    style={[
                                      styles.dimensionScore,
                                      { color: dim.color || "rgb(255, 133, 65)" },
                                    ]}
                                  >
                                    {avgScore?.toFixed(1)}
                                  </Text>
                                ) : null;
                              })()}
                            </View>
                            {validTraits?.map((item: { trait: any; score: number }, i: any) => (
                              <View key={i} style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.trait}</Text>
                                <Text style={styles.itemScore}>
                                  {Number(item?.score)?.toFixed(1)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                </View>
              </View>

              {Array?.isArray(dimensions) && dimensions?.filter((dim) => {
                const traits = Array?.isArray(dim?.traits) ? dim.traits : [];
                const validTraits = traits?.filter(
                  (trait: { score: number }) => typeof trait?.score === 'number' && trait.score > 0
                );
                return validTraits?.length >= 1;
              })?.length > 4 && (
                  <TouchableOpacity
                    onPress={toggleShowAll}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      alignSelf: "flex-start",
                      marginBottom: 10,
                      // marginTop: 20,
                    }}
                  >
                    {/* <Text style={{ fontWeight: "600", marginRight: 4 }}>
                      {showAll ? "Hide" : "Show all"}
                    </Text> */}
                    {/* <Ionicons
                      name={showAll ? "chevron-up" : "chevron-down"}
                      size={18}

                    /> */}
                  </TouchableOpacity>
                )}

              <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={handleSliderPress} style={{ flex: 1 }}>
                  {/* Pass the first comment from dimensions or the main comment */}
                  <ScoreSlider
                    currentOneTitle="Emotional Dimensions"
                    currentComment={
                      (Array?.isArray(dimensions) ? dimensions?.find((dim: any) => dim?.comment)?.comment : '') ||
                      comment ||
                      ''
                    }
                    Editing={false}
                    showComments={true}
                    data={{ rating_data: Array?.isArray(dimensions) ? dimensions : [] }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                {/* <TouchableOpacity style={styles.blockBtn}>
                  <Text style={styles.blockBtnText}>Block</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportBtn}>
                  <Text style={styles.reportBtnText}>Report</Text>
                </TouchableOpacity> */}
                <View style={styles.actionButtonsRow}>
                  <View style={styles.blockButton}>
                    <TouchableOpacity
                      onPress={Blockhandle}
                      style={styles.blockButtonText}
                    >
                      <Text


                      >
                        Block
                      </Text>
                      {/* <Ionicons name="chevron-up" size={18} /> */}
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() => handleReport(Array?.isArray(dimensions) && dimensions?.length > 0 ? (dimensions[0]?._id ?? ratingId) : ratingId)}
                      style={styles.closeButton}
                    >
                      <Text
                        style={{
                          fontWeight: "300",
                          // marginRight: 6,
                          fontSize: 15,
                          fontFamily: "Poppins-Light",
                        }}
                      >
                        Report
                      </Text>
                      {/* <Ionicons name="chevron-up" size={18} /> */}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={toggleExpanded}
                  style={styles.closeButton}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      marginRight: 4,
                      fontSize: 15,
                      fontFamily: "Poppins-Medium",
                    }}
                  >
                    Close
                  </Text>
                  <Ionicons name="chevron-up" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
                action: () => handleBlockConfirm(ratingId),
                bold: true,
              },
            }} title={''} type={'reject'}
          />
          <BlockedMessageModal visible={showBlockedAccceptModal} onClose={() => setShowBlockedAcceptModal(false)} />
          <ReportDialogScreen visible={visible} onClose={() => setModalVisible(false)} roomId={ratingId} reportScore={true} reportedSuccess={(val: boolean) => setReportedSuccess(val)} />

          <ToastMessageModal visible={reportedSuccess} onClose={() => setReportedSuccess(false)} message="successfully reported" />

        </KeyboardAvoidingView>

      )}
    </View>
  );
};

const ScoresReceivedScreen: React.FC<ScoresReceivedScreenProps> = ({
  onBack,
  navigationScreen,
  setUpdated
}) => {
  const [scoresReceived, setScoresReceived] = useState<any[]>([]);
  // console.log('scoresReceived', scoresReceived?.length)
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phoneToNameMap, setPhoneToNameMap] = useState<{ [key: string]: string }>({});
  console.log('phoneToNameMap', phoneToNameMap)
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


  const fetchContacts = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return {};

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    const map: { [key: string]: string } = {};
    data.forEach(contact => {
      contact.phoneNumbers?.forEach(phone => {
        if (phone.number) {
          const normalized = phone.number.replace(/[^0-9]/g, '');
          if (normalized?.length > 5 && contact.name) {
            map[normalized] = contact.name;
          }
        }
      });
    });

    return map;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadContacts = async () => {
      try {
        const contactsMap = await fetchContacts();
        if (isMounted) {
          const updatedContactsMap: { [key: string]: string } = {}
          Object.keys(contactsMap).forEach(key => {
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
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const response = await getRatingsForMe();
        console.log("Received Ratings:", response);
        const data = Array?.isArray(response?.data) ? response.data : [];
        const approvedRatings = data?.filter(
          (rating: { status: string }) => rating?.status === "approved" || rating?.status === "reported"
        );
        setScoresReceived(approvedRatings);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Error fetching who scored me:", error);
        setScoresReceived([]);
      }
    };

    fetchRatings();
  }, []);

  const handleGoBack = () => {
    console.log("Going back");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Scores Received</Text>
          {/* <Text style={styles.headerCount}>07</Text> */}
          <Text style={styles.headerCount}>
            {scoresReceived?.length?.toString()?.padStart(2, "0")}
          </Text>
        </View>
      </View>
      {loading ? (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color="#FF8541" />
        </View>
      ) : (
        <>
          {scoresReceived && scoresReceived?.length === 0 ? (
            <View style={styles.indicator}>
              <Text style={styles.emptyText}>
                You haven&apos;t received any scores yet.
              </Text>
            </View>
          ) : (
            <FlatList
              // data={scoreData}
              // keyExtractor={(item) => item.id}
              // renderItem={({ item }) => <ScoreCard {...item} />}
              // contentContainerStyle={styles.listContainer}
              data={[...scoresReceived].reverse()}
              keyExtractor={(item:any, index) => item._id || index.toString()}
              renderItem={({ item }:any) => {
                const ratingData = Array?.isArray(item?.rating_data) ? item.rating_data : [];
                const allScores = ratingData?.flatMap((category: any) =>
                  (Array?.isArray(category?.traits) ? category.traits : [])
                    ?.map((trait: any) => trait?.score)
                    ?.filter((score: any): score is number => typeof score === 'number' && !isNaN(score))
                );

                const averageScore = allScores?.length > 0
                  ? allScores?.reduce((sum: any, score: any) => sum + score, 0) / allScores?.length
                  : 0;

                const normalizedScore = averageScore?.toFixed(1);

                const phoneNumber = item?.sender_id?.phone_number
                const contactName = typeof phoneNumber === 'string' && phoneNumber?.length > 0 ? (phoneToNameMap[phoneNumber] || '') : '';
                return (
                  <ScoreCard
                    name={item?.sender_id?.username || item?.work_email || 'Anonymous'}
                    relation={item?.sender_relation}
                    score={ratingData?.length > 0 ? ratingData?.reduce(
                        (acc: any, curr: any) => acc + (curr?.score || 0),
                        0
                      ) / ratingData?.length : 0}
                    date={formatDate(item?.created_at)}
                    dimensions={ratingData}
                    comment={item?.comment}
                    averageScore={normalizedScore}
                    ratingId={item?._id}
                    setUpdated={setUpdated}
                    onRemove={(id: string) => setScoresReceived(prev => prev?.filter(r => r._id !== id))}
                  />
                )
              }
              }
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
    backgroundColor: "#F3F3F3",
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 25,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    display: "flex",

  },
  blockButton: {
    // flex: 1,
    display: 'flex',
    backgroundColor: '#E6E6E6',
    paddingVertical: 2,
    paddingHorizontal: 15,
    borderRadius: 15,

  },
  blockButtonText: {
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 18,
    height: 30,
    fontWeight: "500",
    // marginRight: 1,
    fontSize: 15,
    fontFamily: "Poppins-Medium",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "400",
    color: "#000",
    textAlign: "left",
    fontFamily: "Poppins-Regular",
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 35,
  },
  headerCount: {
    fontSize: 30,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 30,
    marginTop: -5,
  },
  listContainer: {
    padding: 0,
    paddingBottom: 80,
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#000000'
  },
  navigationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 0,
    width: "100%",
    marginTop: 30,
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    paddingHorizontal: 20,
  },
  name: {
    fontFamily: "Poppins-Light",
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 30,
    letterSpacing: -0.4,
    textAlignVertical: "center",
    color: "#000000",


  },
  new: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    fontWeight: "500",
    color: "#FF4848",
    position: "relative",
    bottom: -3,

  },
  relation: {
    color: "#000000",
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins-Light",
  },
  scoreRow: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "300",
    fontFamily: "Poppins-Light",
    marginRight: 20,
  },
  scoreValue: {
    color: "#0050EB",
    fontWeight: "500",
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
  dateBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  dateLabel: {
    fontSize: 10,
    color: "#000000",
    fontWeight: "300",
    fontFamily: "Poppins-Light",
  },
  date: {
    fontSize: 12,
    paddingBottom: 10,
    fontWeight: "300",
    fontFamily: "Poppins-Light",
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
    marginBottom: 28,
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
  dimensionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 4,
  },
  dimensionTitle: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    maxWidth: "75%",
    lineHeight: 16,
  },
  dimensionScore: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    lineHeight: 16,
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
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  commentBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    color: "#666",
  },
  commentToggle: {
    color: "#2196F3",
    textAlign: "right",
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  blockBtn: {
    backgroundColor: "#E6E6E6",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  reportBtn: {
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  reportBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "500",
  },
  blockBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "500",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginVertical: 30,
    marginBottom: 30,
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginLeft: 10,
    width: 80,
    fontSize: 14,
    fontFamily: "Poppins-Light",
    color: "#000",
  },
});

export default ScoresReceivedScreen;
