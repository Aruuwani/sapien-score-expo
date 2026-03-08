// eslint-disable-next-line import/no-unresolved
import { getUserProfile } from '@/api/userApi';
// eslint-disable-next-line import/no-unresolved
import { Home } from '@/app';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Button, Dimensions, Easing, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Navigation from '../ui/Navigation';
import NotificationScreen from './NotificationScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import ScoreSlider from '../ui/ScoreSlider';
// eslint-disable-next-line import/no-unresolved
import { getRatingsForMe } from '@/api/ratingApi';
import { useFonts } from 'expo-font';
import { markAllNotificationsAsRead } from '../../api/notificationApi';

import AskQuestionScreen from './AskaQuestion';
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

interface DashboardProps {
    onStartScoring: () => void;
    navigateToScreen: (screen: Home) => void;
    receivedScroretotal: number
    pendingScroretotal: number
    navigationScreen: (screen: Home) => void
    sapienIScoredLength: number
    blockedScoreLength: number
    setUpdated: (updated: boolean) => void
}

interface UserData {
    name: string;
    username: string
}




const StatCard: React.FC<StatCardProps> = ({ title, value, notification, hasArrow = true, onPress }) => {
    return (
        // <View style={styles.statCard}>

        //     <Text style={styles.statCardTitle}>{title}</Text>
        //     <View style={styles.statCardRight}>
        //         <Text style={styles.statCardValue}>{value}</Text>
        //         {notification && <Text style={styles.notification}>{notification}</Text>}
        //         {hasArrow && <Feather name="chevron-right" size={20} color="#000" />}
        //     </View>

        // </View>
        <TouchableOpacity
            style={styles.statCard}
            onPress={onPress}
            activeOpacity={0.7} >
            <Text style={styles.statCardTitle}>{title}</Text>
            <View style={styles.statCardRight}>
                <Text style={styles.statCardValue}>{value}</Text>
                {notification &&
                    <Text style={styles.notification}>
                        {notification}
                        {/* 02 new */}
                    </Text>
                }
                {hasArrow ? (
                    <Feather name="chevron-right" size={22} color="#000" />

                ) : (
                    <Feather name="chevron-right" size={22} color="#000" style={{ opacity: 0 }} />
                )

                }
            </View>

        </TouchableOpacity>
    );
};

const ScoreCategory: React.FC<ScoreCategoryProps> = ({ title, score, scoredCount, progress = 0 }) => {
    const textInputRef = useRef<TextInput>(null);
    const handleSliderPress = () => {
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    };
    return (
        <View style={styles.scoreCategory}>
            <View style={styles.scoreCategoryHeader}>
                <Text style={styles.scoreCategoryTitle}>{title}</Text>
                {scoredCount !== undefined && (
                    <Text style={styles.scoredCount}>{scoredCount} scored</Text>
                )}
            </View>
            {progress !== undefined && (
                <><View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View><Text style={styles.categoryScore}>{score}</Text></>
            )}

        </View>
    );
};

const Dashboard: React.FC<DashboardProps> = ({
    onStartScoring, navigateToScreen, receivedScroretotal, pendingScroretotal, navigationScreen, sapienIScoredLength, blockedScoreLength, setUpdated,
}) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Italic': require('../../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    });
    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [messages, setMessages] = useState<({ from: string; content: string }[])[]>([]);
    const [userData, setUserdata] = useState<UserData | null>(null);
    const [showName, setShowName] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const drawerWidth = SCREEN_WIDTH; // 100% of screen width
    const [rejectedLength, setRejectedLength] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([]);


    const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Combined animation for both slide and overlay
    const animateDrawer = (toValue: number) => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: toValue === 0 ? 0 : 0.5,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => {
            if (toValue === -drawerWidth) {
                setIsDrawerOpen(false);
            }
        });
    };


    const [loading, setLoading] = useState(false);
    const [scoresReceived, setScoresReceived] = useState<any[]>([]);


    const [showAllTopics, setShowAllTopics] = useState(false);


    useEffect(() => {
        const fetchRatings = async () => {
            try {
                setLoading(true);
                const response = await getRatingsForMe();
                const dataArr = Array.isArray(response?.data) ? response.data : [];
                const approvedRatings = dataArr.filter(
                    (rating: { status: string }) => rating?.status === "approved"
                );

                setScoresReceived(approvedRatings);
            } catch (error) {
                console.error("Error fetching who scored me:", error);
                setScoresReceived([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, []);

    // console.log('scoresReceived', JSON.stringify(scoresReceived, null, 2))
    // Aggregate by topic across all received scores
    type TraitAgg = { sum: number; count: number };
    type TopicAgg = { traitMap: Map<string, TraitAgg>; topicSum: number; topicCount: number; comments: string[]; raterSet: Set<string> };
    const topicMap: Map<string, TopicAgg> = new Map();

    (scoresReceived || []).forEach((rating: any) => {
        const raterKey = rating?.sender_id?._id || rating?._id; // prefer sender id to count unique raters
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
                const tAgg = agg.traitMap.get(tName) || { sum: 0, count: 0 };
                tAgg.sum += score;
                tAgg.count += 1;
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
        }));
        return {
            topic,
            avgScore: agg.topicCount ? agg.topicSum / agg.topicCount : 0,
            totalRaters: agg.raterSet.size,
            traits,
            comments: agg.comments,
        };
    });

    // Filter out topics with no scored traits and traits with zero count
    const filteredAggregatedTopics = aggregatedTopics
        .map(t => ({
            ...t,
            traits: (t.traits || []).filter((tr: any) => (tr.count || 0) > 0),
        }))
        .filter(t => (t.traits || []).length > 0);


    // Overall SapienScore: average of the displayed topic averages (1–10 scale)
    const topicsForOverall = filteredAggregatedTopics;
    const overallSapienScore = topicsForOverall.length
        ? (topicsForOverall.reduce((s, t) => s + t.avgScore, 0) / topicsForOverall.length)
        : 0;

    const normalizedScore = overallSapienScore.toFixed(1);

    // Then render the components dynamically


    const openDrawer = () => {
        setIsDrawerOpen(true);
        animateDrawer(0);
    };

    const closeDrawer = () => {
        animateDrawer(-drawerWidth);
    };

    const toggleDrawer = () => {
        if (isDrawerOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
        setIsDrawerOpen(!isDrawerOpen);
    };

    useEffect(() => {
        const useData = async () => {
            const response = await getUserProfile()

            setUserdata(response.user)
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useData()
        setUpdated(true)
    }, [])


    // useEffect(() => {
    //     const fetchData = async () => {
    //       try {
    //         const data = await getNotifications();
    //         const sorted = data.sort(
    //           (a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    //         );
    //         setNotifications(sorted);
    //       } catch (error) {
    //         console.error('Error fetching notifications:', error);
    //       } finally {
    //       }
    //     };

    //     fetchData();
    // }, []);

    const SapiensRejected = async () => {

        const response = await getRatingsForMe();
        const approvedRatings = response.data.filter(
            (rating: { status: string }) => rating.status === "rejected"
        );
        setRejectedLength(approvedRatings.length)

    }


    useEffect(() => {
        const fetchRatingsWhomiRejected = async () => {

            await SapiensRejected()
        }
        fetchRatingsWhomiRejected()
    }, [rejectedLength])

    const handleMenuPress = () => {
        setIsDrawerOpen(true);
        setCurrentScreen('profile');
    };

    const handleSettingsPress = () => {
        setCurrentScreen('settings');
    };

    const handleNotificationsPress = async () => {
        try {
            setCurrentScreen('notifications');
            // Call API to mark all as read
            await markAllNotificationsAsRead();

            // Update local state to mark all read
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );

            // You can also open notification screen or whatever you want here
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleBackToMain = () => {
        setCurrentScreen('dashboard');

    };


    const hasUnread = notifications.some(n => !n.is_read);






    // if (currentScreen === 'profile') {
    //     return <ProfileScreen onBack={handleBackToMain} />;
    // }

    if (currentScreen === 'settings') {
        return <SettingsScreen onBack={handleBackToMain} />;
    }

    if (currentScreen === 'notifications') {
        return <NotificationScreen onBack={handleBackToMain} />;
    }


    if (!fontsLoaded) {
        console.log('fonts not loaded');
        return null;
    }
    return (
        <><SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" /> */}
            {/* {messages.map((msg, i) => (
<Text key={i}>{msg.from}: {msg.content}</Text>
))} */}
            {/* <TouchableOpacity style={styles.startScoringButton} onPress={() => sendMessage('Hello!')}> <Text style={styles.startScoringText}>Send</Text></TouchableOpacity> */}
            {/* Header */}
            <View style={styles.header}>


                <View style={styles.passwordContainer}>
                    {showName && userData ? (
                        <Text style={styles.hiddenPassword}>{userData?.username}</Text>
                    ) : (
                        <Text style={styles.hiddenPassword}>**********</Text>
                    )}

                    <TouchableOpacity onPress={() => setShowName(!showName)} style={styles.eyeButton}>
                        {showName ? (
                            <Feather name="eye" size={20} color="#666" />
                        ) : (
                            <Feather name="eye-off" size={20} color="#666" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.privateProfilePill}>
                    <Text style={styles.privateProfileText}>private profile</Text>
                </View>
            </View>

            {/* Top Tools */}
            <View style={styles.topTools}>
                <View style={styles.leftTools}>
                    <TouchableOpacity

                        onPress={openDrawer}>
                        {/* <Image src='/assets/images' style={{width: 20, height: 20, backgroundColor: 'red', objectFit: 'contain'}}/> */}
                        {/* <Feather name="menu" size={22} color="#000000" /> */}
                        <Image source={require('../../assets/images/align-left.png')} />

                    </TouchableOpacity>
                </View>

                <View style={styles.rightTools}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
                        <Ionicons name="settings-outline" size={22} color="#000000" />
                        {/* <Image source={require('../../assets/images/settings.png')} /> */}

                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
                        <View style={styles.badgeContainer}>
                            <Feather name="message-square" size={22} color="#000" />
                            {hasUnread && <View style={styles.badge} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* {isDrawerOpen && (
            <>
            <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={closeDrawer}
                    />

                    <Animated.View style={[styles.drawer, {
                        transform: [{ translateX: slideAnim }],
                        width: drawerWidth,
                        height: SCREEN_HEIGHT,
                    }]}>
                        <ProfileScreen onBack={closeDrawer} />
                    </Animated.View>
                </View>
            </>
        )} */}
            {/* Overlay with animated opacity */}

            {isDrawerOpen && (
                <View>
                    <Animated.View
                        style={[
                            styles.overlay,
                            { opacity: overlayOpacity }
                        ]}
                    >
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={closeDrawer} />
                    </Animated.View>

                </View>
            )}
            <Animated.View
                style={[
                    styles.drawer,
                    {
                        transform: [{ translateX: slideAnim }],
                        width: drawerWidth,
                        height: SCREEN_HEIGHT,
                    }
                ]}
            >
                <View style={styles.drawerContent}>
                    <ProfileScreen onBack={closeDrawer} />
                </View>
            </Animated.View>




            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* Dashboard Title */}
                <Text style={styles.dashboardTitle}>Sapien Dashboard</Text>

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <StatCard title="Scores Received" value={receivedScroretotal?.toString()?.padStart(2, "0")} onPress={() => navigateToScreen('scoresReceived')} />
                    <View style={styles.divider} />
                    <StatCard title="Sapiens you Scored" value={sapienIScoredLength?.toString()?.padStart(2, "0")} onPress={() => navigateToScreen('sapiensScored')} />
                    <View style={styles.divider} />
                    <StatCard title="Requests" value={pendingScroretotal?.toString()?.padStart(2, "0")} notification={`${pendingScroretotal > 1 ? "2 new" : ''}`} onPress={() => navigateToScreen('sapiensrequests')} />
                    <View style={styles.divider} />
                    <StatCard title="Blocked" value={blockedScoreLength?.toString()?.padStart(2, "0")} onPress={() => navigateToScreen('sapiensblocked')} />
                    <View style={styles.divider} />
                    <StatCard title="Requests Rejected" value={rejectedLength?.toString()?.padStart(2, "0")} hasArrow={false} />

                </View>
                <TouchableOpacity style={styles.startScoringButton} onPress={onStartScoring}>
                    <Text style={styles.startScoringText}>Start Scoring</Text>
                </TouchableOpacity>
                {loading ? (
                    <View style={styles.indicator}>
                        <ActivityIndicator size="large" color="#FF8541" />
                    </View>
                ) : (
                    <>
                        {scoresReceived?.length === 0 ? (
                            <View style={styles.indicator}>
                                <Text style={styles.emptyText}>
                                    You haven't received any scores yet.
                                </Text>
                            </View>
                        ) : (

                            <>
                                {/* Start Scoring Button */}


                                {/* SapienScore Section */}

                                <View style={styles.scoreSection}>
                                    <View style={styles.scoreHeader}>
                                        <Text style={styles.scoreHeaderTitle}>Your SapienScore</Text>
                                        <Text style={styles.totalScore}>{normalizedScore?.toString()?.padStart(2, "0")}</Text>


                                    </View>

                                    <Text style={styles.scoresTitle}>Your Scores</Text>
                                    {(showAllTopics ? filteredAggregatedTopics : filteredAggregatedTopics.slice(0, 4)).map((category, index) => {
                                        return (
                                            <View key={`${category.topic}-${index}`}>
                                                <View style={styles.casualTopicsContainer}>
                                                    <Text style={styles.casualTopicsTitle}>{category.topic}</Text>
                                                    <Text style={styles.casualTopicsScore}>{category.avgScore.toFixed(1)}</Text>
                                                </View>
                                                {/* {category.totalRaters > 0 && (
                                                    <Text style={styles.topicRatersText}>{category.totalRaters} scored</Text>
                                                )} */}

                                                {category.traits.map((trait: any, traitIndex: number) => (
                                                    <ScoreCategory
                                                        key={`${trait.trait}-${traitIndex}`}
                                                        title={trait.trait}
                                                        score={trait.avgScore === 10 ? trait.avgScore.toFixed(0) : trait.avgScore.toFixed(1)}
                                                        scoredCount={category.totalRaters}
                                                        progress={trait.avgScore * 10}
                                                    />
                                                ))}

                                                {/* Comments in ScoreSlider for this topic */}
                                                <View style={styles.sliderContainer}>
                                                    <TouchableOpacity style={{ flex: 1 }}>
                                                        <ScoreSlider
                                                            currentOneTitle={category.topic}
                                                            Editing={false}
                                                            showComments={true}
                                                            data={{ rating_data: category.comments.map((cmt: string) => ({ topic: category.topic, comment: cmt })) }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            // {/* Show All / Hide toggle */}
                                            // {filteredAggregatedTopics.length > 4 && (
                                            //     <TouchableOpacity
                                            //         onPress={() => setShowAllTopics(prev => !prev)}
                                            //         style={{ marginTop: 8, alignSelf: 'flex-start' }}
                                            //     >
                                            //         <Text style={{ color: '#0050EB', fontFamily: 'Poppins-Medium' }}>
                                            //             {showAllTopics ? 'Hide' : 'Show All'}
                                            //         </Text>
                                            //     </TouchableOpacity>
                                            // )}

                                        );
                                    })}

                                    {/* Show All / Hide toggle */}
                                    {filteredAggregatedTopics.length > 4 && (

                                        <TouchableOpacity
                                            onPress={() => setShowAllTopics(prev => !prev)}
                                            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 10 }}
                                        >
                                            <Text style={{ fontWeight: '300',fontFamily: 'Poppins-Light',fontSize: 15, marginRight: 4 }}> {showAllTopics ? 'Hide' : 'Show All'}</Text>
                                            <Ionicons name={showAllTopics ? 'chevron-up' : 'chevron-down'} size={18} />
                                        </TouchableOpacity>


                                        // <TouchableOpacity
                                        //     onPress={() => setShowAllTopics(prev => !prev)}
                                        //     style={{ marginTop: 12 }}
                                        // >
                                        //     <Text style={{ color: '#0050EB', fontFamily: 'Poppins-Medium', fontSize: 14 }}>
                                        //         {showAllTopics ? 'Hide' : 'Show All'}
                                        //     </Text>
                                        // </TouchableOpacity>
                                    )}

                                    {/* <View style={styles.casualTopicsContainer}>
        <Text style={styles.casualTopicsTitle}>Casual Topics</Text>
        <Text style={styles.casualTopicsScore}>8.2</Text>
    </View> */}

                                    {/* <ScoreCategory
        title="Reads Books"
        score="6.8"
        scoredCount={12}
        progress={60}
    />
    <ScoreCategory
        title="Plays Video Game"
        score="7.8"
        scoredCount={19}
        progress={70}
    />
    <ScoreCategory
        title="Car Driving Skills"
        score="8.5"
        scoredCount={20}
        progress={85}
    /> */}

                                </View>
                            </>
                        )}

                        {/* <AskQuestionScreen /> */}
                    </>
                )}
                {/* <ScoreSlider currentOneTitle="Casual topics" />


    <View style={styles.casualTopicsContainer}>
        <Text style={styles.casualTopicsTitle}>Physical Dimensions</Text>
        <Text style={styles.casualTopicsScore}>7.6</Text>
    </View>

    <ScoreCategory
        title="Physical appearance & attributes"
        score="6.8"
        scoredCount={12}
        progress={40}
    />
    <ScoreCategory
        title="Physical Fitness"
        score="7.8"
        scoredCount={19}
        progress={60}
    />
    <ScoreCategory
        title="Car Driving Skills"
        score="8.5"
        scoredCount={20}
        progress={85}
    />

    <ScoreSlider currentOneTitle='Physical Dimensions' />
    <View style={styles.casualTopicsContainer}>
        <Text style={styles.casualTopicsTitle}>Emotional Dimensions</Text>
        <Text style={styles.casualTopicsScore}>6.9</Text>
    </View>

    <ScoreCategory
        title="Emotional appearance & attributes"
        score="6.8"
        scoredCount={36}
        progress={40}
    />
    <ScoreCategory
        title="Emotional Fitness"
        score="9.2"
        scoredCount={30}
        progress={60}
    />
    <ScoreCategory
        title="Car Driving Skills"
        score="8.0"
        scoredCount={26}
        progress={85}
    />

    <ScoreSlider currentOneTitle='Emotional Dimensions' /> */}

                <View style={styles.bottomSpacing} />

            </ScrollView>

            {/* Fixed Bottom Navigation */}
        </SafeAreaView><View >
                <Navigation initialTab="PROFILE" setScreen={(screen: any) => navigationScreen(screen)} />
            </View></>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 20,

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 23,
        // paddingBottom: 5,
        // paddingHorizontal: 16,
    },
    menuButton: {
        padding: 2,

    },
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-start',
        zIndex: 100, // ensure it's on top

    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 99,

    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 25,
        marginBottom: 15,

    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 100,
        shadowColor: '#000',
        shadowRadius: 4,
        // elevation: 5,

    },

    drawerContent: {
        width: '100%', // or fixed width like 300
        height: '100%',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginTop: 94,
        paddingTop: 0,
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginLeft: 10,
    },
    eyeButton: {
        marginLeft: 4,
    },
    hiddenPassword: {
        fontSize: 14,
        marginRight: 4,
        color: '#333',
    },
    privateProfilePill: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        // width: 100,
        // height: 27,
        // paddingHorizontal: 15,
        // paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    privateProfileText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        lineHeight: 13.68,
        letterSpacing: -0.24,

    },
    topTools: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingHorizontal: 16,
        paddingTop: 11,
    },
    leftTools: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightTools: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconButton: {
        // padding: 6,
        marginLeft: 12,
    },
    badgeContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
    },
    contentContainer: {
        flex: 1,
        // paddingHorizontal: 20,
    },
    dashboardTitle: {
        fontSize: 25,
        fontFamily: 'Poppins-Regular',
        // fontWeight: 'bold',
        lineHeight: 28.5,
        letterSpacing: -0.5,
        color: '#000000',
        paddingTop: 40,
        marginBottom: 16,

    },
    emptyText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        color: '#000000'
    },
    statsSection: {
        // backgroundColor: 'red',

    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    statCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 5,
    },
    statCardTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
        lineHeight: 17.1,
        letterSpacing: -0.3,
        color: '#000000',
        includeFontPadding: false,

    },
    statCardRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 40,
        position: 'relative',
    },
    indicator: {
        alignContent: "center",
        justifyContent: "center",
        flex: 1
    },
    statCardValue: {
        fontSize: 20,
        fontWeight: '500',
        marginRight: 6,
        fontFamily: 'Poppins-Medium',
        color: '#000',
    },
    notification: {
        color: '#FF0000',
        fontSize: 10,
        marginRight: 6,
        position: 'absolute',
        top: 5,
        left: 30,
    },
    startScoringButton: {
        backgroundColor: '#FF8A50',
        borderRadius: 10,
        paddingVertical: 5,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        marginVertical: 15,
        height: 48,
    },
    startScoringText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    scoreSection: {
        marginBottom: 16,
    },
    scoreHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 20,
        gap: 30,
    },
    scoreHeaderTitle: {
        fontSize: 25,
        fontWeight: '400',
        fontFamily: 'Poppins-Regular',
        color: '#333',

    },
    totalScore: {
        fontSize: 25,
        fontWeight: '600',
        color: '#0050EB',
        fontFamily: 'Poppins-SemiBold',
    },
    scoresTitle: {
        fontSize: 25,
        fontWeight: '300',
        fontFamily: 'Poppins-Light',
        color: '#333',
        marginBottom: 10,
    },
    casualTopicsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    casualTopicsTitle: {
        fontSize: 18,
        color: '#FF8541',
        fontFamily: 'Poppins-Medium',
        letterSpacing: -0.2,
        fontWeight: '500',
        width: '90%',
    },
    casualTopicsScore: {
        fontSize: 18,
        color: '#FF8541',
        fontFamily: 'Poppins-SemiBold',
        fontWeight: '600',
        letterSpacing: -0.2,

    },
    scoreCategory: {
        marginVertical: 10,
    },
    scoreCategoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        // backgroundColor: 'red',
        width: '90%',
    },
    scoreCategoryTitle: {
        fontSize: 12,
        color: '#000000',
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        letterSpacing: -0.2,


    },
    scoredCount: {
        fontSize: 8,
        color: '#000000',
        letterSpacing: -0.2,
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        position: 'absolute',
        right: 0,
    },
    topicRatersText: {
        fontSize: 10,
        color: '#000',
        fontFamily: 'Poppins-Light',
        marginBottom: 4,
        marginLeft: 2,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#D9D9D9',
        borderRadius: 2,
        marginVertical: 6,
        width: '90%',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#9C7E7E',
        // borderRadius: 2,
    },
    categoryScore: {
        fontSize: 15,
        fontWeight: '500',
        position: 'absolute',
        right: 0,
        bottom: 0,
        fontFamily: 'Poppins-Medium',
        letterSpacing: -0.2,
        color: '#000000',
    },
    bottomSpacing: {
        height: 60,
    },
});

export default Dashboard;