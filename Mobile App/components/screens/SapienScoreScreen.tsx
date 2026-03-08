import { createRating } from '@/api/scoreSapien';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CommentSlider from '../ui/ScoreSlider';
import * as Notifications from 'expo-notifications';
import NotScoredModal from '../ui/NotScoredModal';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
type SapienScoreScreenProps = {
    person: { id?: string; name?: string; email?: string };
    scoringData: any;
    relation: string | null;
    auth: any
    onShare: (data: any) => void;
    onBack: () => void;
    updatedRatingId: string
};

const SapienScoreScreen: React.FC<SapienScoreScreenProps> = ({
    person,
    scoringData,
    relation,
    auth,
    onShare,
    onBack,
    updatedRatingId
}) => {
    console.log('scroingD55555ata', scoringData)
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // onBack()
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
    const calculateCategoryScores = (scoringData: any) => {
        const categories = scoringData?.rating_data?.map((topic: any) => {
            const validScores = topic.traits
                .map((trait: any) => trait.score)
                .filter((score: any): score is number => score !== null);

            const averageScore =
                validScores.length > 0
                    ? validScores.reduce((sum: number, s: any) => sum + s, 0) / validScores.length
                    : 0;

            const normalizedScore = +(averageScore / 10).toFixed(2); // scale to 0–1

            return {
                name: topic.topic,
                score: normalizedScore,
            };
        });

        return categories;
    };



    useEffect(() => {

        const dynamicCategories = calculateCategoryScores(scoringData);
        console.log('dynamicCategories', dynamicCategories)
    }, [scoringData])


    const parsedData = typeof scoringData === 'string' ? JSON.parse(scoringData) : scoringData;
    // Data that matches the image exactly
    const categories = [
        { name: 'Self-Awareness & Emotional Intelligence', score: 0.6 },
        { name: 'Communication & Empathy', score: 0.85 },
        { name: 'Leadership & Influence', score: 0.8 },
        { name: 'Problem-Solving & Critical Thinking', score: 0.7 },
        { name: 'Team Collaboration & Culture Fit', score: 0.65 },
        { name: 'Growth Mindset & Learning Agility', score: 0.75 },
        { name: 'Purpose, Integrity & Values', score: 0.9 },
    ];
    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    });

    // console.log('scoringData', scoringData)
    if (!fontsLoaded) {
        console.log('fonts not loaded');
        return null
    }

    const overallAverageOutOf10 =
        parsedData?.rating_data
            ?.map((category: any) => {
                const validScores = category.traits
                    .map((trait: any) => trait.score)
                    .filter((score: number | null) => score !== null);

                if (validScores.length === 0) return null;

                return validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length;
            })
            .filter((score: number | null) => score !== null)
            ?.reduce((sum: number, score: number, _: any, arr: number[]) => sum + score / arr.length, 0) ?? 0;

    const handleSubmit = async () => {
        if (overallAverageOutOf10 === 0) {
            Sharehandle()
            return
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('📤 SUBMITTING RATING');
        console.log('═══════════════════════════════════════════════════════');

        setLoading(true)

        try {
            console.log('📡 Calling createRating API...');
            console.log('Data:', {
                sender_relation: relation,
                emailOrPhone: person.id || person,
                existing_rating_id: updatedRatingId,
                rating_data: parsedData?.rating_data?.length + ' categories'
            });

            const response = await createRating({
                ...parsedData,
                sender_relation: relation,
                emailOrPhone: person.id || person,
                existing_rating_id: updatedRatingId
            });

            console.log('✅ Rating created successfully:', response);

            await AsyncStorage.removeItem('ratingId');

            if (response) {
                setLoading(false);
                console.log('✅ Rating shared successfully!');
                console.log('═══════════════════════════════════════════════════════\n');

                setTimeout(() => setCustomMessage(''), 2000);
                onShare(parsedData);
            } else {
                console.log('⚠️ No response from createRating');
                setLoading(false);
            }
        } catch (error: any) {
            console.error('❌❌❌ ERROR SUBMITTING RATING ❌❌❌');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            console.log('═══════════════════════════════════════════════════════\n');

            setLoading(false);

            // Check if this is a duplicate rating error
            const isDuplicateError = error.response?.data?.alreadyScored === true ||
                                    error.response?.data?.alreadyScored === 'true' ||
                                    error.response?.data?.error?.includes('already rated') ||
                                    error.response?.data?.message?.includes('already rated');

            if (isDuplicateError) {
                console.log('⚠️⚠️⚠️ DUPLICATE RATING ERROR CAUGHT IN SAPIENSCORESCREEN ⚠️⚠️⚠️');
                console.log('   This should have been caught earlier!');
                console.log('   Showing error and NOT navigating to share screen');
            }

            // Show error message to user
            const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit rating. Please try again.';
            setCustomMessage(errorMessage);

            // Keep error visible longer for duplicate errors
            const timeout = isDuplicateError ? 5000 : 3000;
            setTimeout(() => setCustomMessage(''), timeout);

            // Do NOT call onShare() if it's a duplicate error
            // This prevents navigation to the share screen
        }
    }
    const Sharehandle = () => {

        setShowModal(true);
        setTimeout(() => setShowModal(false), 2000);
    };
    console.log('overallAverageOutOf10 === 0', overallAverageOutOf10 === 0)
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Your SapienScore for</Text>
            </View>

            <View style={styles.personContainer}>
                {person.name ? (
                    <Text style={styles.personName}>{person.name}</Text>

                ) : (

                    <Text style={styles.personEmail}>{person}</Text>
                )}
                <Text style={styles.score}>{overallAverageOutOf10?.toFixed(1)}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {parsedData?.rating_data?.map((category: any, index: number) => {

                    const validScores = category.traits
                        .map((trait: any) => trait.score)
                        .filter((score: number | null) => score !== null);

                    const averageScore = validScores.length
                        ? validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length
                        : 0;

                    const normalizedScore = averageScore / 10; // Assuming max score is 10

                    return (


                        <View key={index} style={styles.categoryContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${normalizedScore * 100}%` }
                                ]}
                            />
                            <Text style={styles.categoryName}>{category.topic}</Text>
                        </View>
                    )
                }
                )}

                <Text style={styles.commentsTitle}>comments</Text>

                <CommentSlider currentOneTitle='Final' showComments={true} data={parsedData} />
                <View style={styles.shareInfoContainer}>
                    <Text style={styles.shareInfoBold}>
                        share confidently!{'\n'}
                        senders names are anonymous
                    </Text>
                </View>
            </ScrollView>
            {customMessage ? (
                <>
                    <View style={styles.messageOverlay} />
                    <View style={styles.messageContainer}>
                        <Text style={styles.customMessage}>{customMessage}</Text>
                    </View>
                </>
            ) : null}
            <View style={styles.footer}>
                <Text style={styles.editInfo}>
                    you can change the scores after 24 hours
                </Text>
                <TouchableOpacity
                    style={[
                        styles.shareButton,
                        loading && styles.shareButtonDisabled
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    activeOpacity={loading ? 1 : 0.7}
                >
                    <Text style={styles.shareButtonText}>
                        {loading ? 'Sharing...' : 'Share'}
                    </Text>
                </TouchableOpacity>
            </View>
            <NotScoredModal visible={showModal} onClose={() => setShowModal(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 15, 
        paddingBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
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
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -20 }],
        width: 300,
        zIndex: 1001,
    },
    customMessage: {
        fontSize: 15,
        color: '#555555',
        textAlign: 'left',
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20
    },
    backButton: {
        marginRight: 20,
    },
    title: {
        fontFamily: 'Poppins-Light',
        fontSize: 25,
        color: "#000000",
        fontWeight: "300",
        marginTop: 15,
        letterSpacing: -0.4
    },
    personContainer: {
        paddingHorizontal: 20,
        // paddingTop: 10,
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 32
    },
    personName: {
        fontFamily: 'Poppins-Light',
        fontSize: 35,
        color: '#000000',
        fontWeight: "300",
        width: "75%"
    },
    score: {
        fontFamily: 'Poppins-Medium',
        fontSize: 35,
        color: '#0050EB',
        alignSelf: 'center',
        fontWeight: "500"
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    categoryContainer: {
        marginBottom: 8,
        height: 32,
        position: 'relative',
        justifyContent: 'center',

    },
    progressBar: {
        position: 'relative',
        height: '80%',
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        left: 0,
        top: 0,
        zIndex: 1,
        marginLeft: 10,

        backgroundColor: '#97FBBF',
    },

    categoryName: {
        fontFamily: 'Poppins-Medium',
        position: 'absolute',
        fontSize: 12,
        paddingHorizontal: 10,
        color: "#555555",
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: "500",
        lineHeight: 16,
        left: 10

    },
    commentsTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
        marginTop: 20,
        // marginBottom: -7,
        marginLeft: 12,
        // fontWeight: "500",
    },
    commentBox: {
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 20,
        padding: 15,
        marginBottom: 25,
    },
    personEmail: {
        fontFamily: 'Poppins-Light',
        fontSize: 25,
        color: '#000000',

        maxWidth: "80%",
        width: "100%",
    },
    commentCategory: {
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
        fontSize: 10,
        marginBottom: 5,
    },
    commentText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        lineHeight: 20,
    },
    shareInfoContainer: {
        alignItems: 'center',
        // marginBottom: 10,
    },
    shareInfoBold: {
        fontFamily: 'Poppins-Regular',
        paddingTop: 22,
        paddingBottom: 30,
        fontSize: 20,
        lineHeight: 20 * 1.14,
        letterSpacing: -0.4,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: "#000000",
        fontWeight: "400"
    },
    footer: {
        // paddingVertical: 20,
        alignItems: 'center',
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 40
    },
    editInfo: {
        fontFamily: 'Poppins-Light',
        fontSize: 12,
        textAlign: 'center',
        color: '#000000',
        width: 190,
        fontWeight: "300",
        marginRight: -20
    },
    shareButton: {
        backgroundColor: '#FF8541',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 10,
        height: 48
    },
    shareButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    shareButtonText: {
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        fontSize: 25,
        textAlign: 'center',
        fontWeight: "400",
    },
});

export default SapienScoreScreen;