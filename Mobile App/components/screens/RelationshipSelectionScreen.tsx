import { checkIfScored, getScoredRelationsForReceiver } from '@/api/ratingApi';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IsAlreadyScoredModal from '../ui/IsAlreadyScoredModal';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
type RelationType = 'Family' | 'Friend' | 'Partner' | 'Acquaintance' | 'Neighbor' | 'Mutual friend' | 'Work buddy' | 'Other';

interface RelationshipSelectionScreenProps {
    selectedPerson: {
        id?: string;
        name?: string;
        email?: string;
    };
    onRelationSelect?: (relation: RelationType) => void;
    onBack?: () => void ;
    relationData: any
    receiver_id: string
    scoredRelationIds: string[]
    duplicateErrorFromParent?: string
    showDuplicateErrorFromParent?: boolean
    onClearDuplicateError?: () => void
}

const RelationshipSelectionScreen: React.FC<RelationshipSelectionScreenProps> = ({
    selectedPerson,
    onRelationSelect,
    onBack,
    relationData,
    receiver_id,
    scoredRelationIds,
    duplicateErrorFromParent,
    showDuplicateErrorFromParent,
    onClearDuplicateError
}) => {
    const [selectedRelation, setSelectedRelation] = useState<RelationType | null>(null);
    const [loading, setLoading] = useState(false)
    const [customMessage, setCustomMessage] = useState(false)
    const [blockedRelationName, setBlockedRelationName] = useState<string>('')
    const [isInitDone, setIsInitDone] = useState(false);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [checkingRelationId, setCheckingRelationId] = useState<string | null>(null);

    // Local cache in case prefetch didn't populate scoredRelationIds
    const [scoredIdsLocal, setScoredIdsLocal] = useState<string[]>(scoredRelationIds || []);

    // Handle error from parent component (index.tsx)
    useEffect(() => {
        if (showDuplicateErrorFromParent && duplicateErrorFromParent) {
            console.log('📥 Received duplicate error from parent:', duplicateErrorFromParent);
            setBlockedRelationName(duplicateErrorFromParent);
            setCustomMessage(true);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setCustomMessage(false);
                setBlockedRelationName('');
                onClearDuplicateError?.();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showDuplicateErrorFromParent, duplicateErrorFromParent, onClearDuplicateError]);

    // Ensure we have scored relations even if prefetch failed
    useEffect(() => {
        console.log('📥 useEffect: scoredRelationIds changed');
        console.log('   scoredRelationIds:', scoredRelationIds);
        console.log('   scoredRelationIds type:', typeof scoredRelationIds);
        console.log('   scoredRelationIds is array?', Array.isArray(scoredRelationIds));
        console.log('   scoredRelationIds length:', scoredRelationIds?.length);

        setScoredIdsLocal(scoredRelationIds || []);

        // Mark ready if:
        // 1. We have scored relations (length > 0), OR
        // 2. We have an empty array (length === 0), OR
        // 3. No receiver_id (new user)
        // Basically, mark ready if scoredRelationIds is defined (even if empty)
        if (scoredRelationIds !== undefined && scoredRelationIds !== null) {
            console.log('✅ Marking isInitDone = true (scoredRelationIds is defined)');
            setIsInitDone(true);
        } else if (!receiver_id) {
            console.log('✅ Marking isInitDone = true (no receiver_id)');
            setIsInitDone(true);
        } else {
            console.log('⏳ Waiting for scoredRelationIds to be fetched...');
        }
    }, [scoredRelationIds, receiver_id]);

    useEffect(() => {
        const fetchIfMissing = async () => {
            try {
                if (receiver_id && receiver_id.trim() !== '' && (!scoredIdsLocal || scoredIdsLocal.length === 0)) {
                    console.log('📡 Fetching scored relations locally (fallback)...');
                    const res = await getScoredRelationsForReceiver(receiver_id);
                    console.log('✅ Fallback scored relations:', res);
                    if (res?.scoredRelationIds?.length) {
                        setScoredIdsLocal(res.scoredRelationIds);
                    }
                }
            } catch (e) {
                console.log('⚠️ Fallback fetch scored relations failed:', e);
            } finally {
                setIsInitDone(true);
            }
        };
        fetchIfMissing();
    }, [receiver_id, scoredIdsLocal]);


    // Log when component receives props
    useEffect(() => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('📱 RelationshipSelectionScreen RENDERED');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Props received:');
        console.log('   selectedPerson:', selectedPerson);
        console.log('   receiver_id:', receiver_id);
        console.log('   scoredRelationIds:', scoredRelationIds);
        console.log('   scoredRelationIds type:', typeof scoredRelationIds);
        console.log('   scoredRelationIds is array?', Array.isArray(scoredRelationIds));
        console.log('   scoredRelationIds length:', scoredRelationIds?.length);
        console.log('   scoredRelationIds content:', JSON.stringify(scoredRelationIds, null, 2));
        console.log('   relationData:', relationData);
        if (Array.isArray(relationData)) {
            console.log('   relationData IDs:', relationData.map((r: any) => ({ id: r._id, name: r.name })));
        }
        console.log('═══════════════════════════════════════════════════════\n');
    }, [scoredRelationIds, receiver_id, selectedPerson, relationData]);

useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onBack?.()
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

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    });

    const handleRelationSelect = async (relation: RelationType, relationName?: string) => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔍 DUPLICATE CHECK - Relation Selected');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Relation ID:', relation);
        console.log('Relation ID type:', typeof relation);
        console.log('Relation Name:', relationName);
        console.log('Receiver ID:', receiver_id);
        console.log('Receiver ID type:', typeof receiver_id);
        console.log('Receiver ID empty?', !receiver_id);
        console.log('Receiver ID length:', receiver_id?.length);
        console.log('Selected Person:', JSON.stringify(selectedPerson, null, 2));
        console.log('Scored Relation IDs (prop):', scoredRelationIds);
        console.log('Scored Relation IDs (prop) type:', typeof scoredRelationIds);
        console.log('Scored Relation IDs (prop) is array?', Array.isArray(scoredRelationIds));
        console.log('Scored Relation IDs (prop) content:', JSON.stringify(scoredRelationIds, null, 2));
        console.log('Scored Relation IDs (local):', scoredIdsLocal);
        console.log('Scored Relation IDs (local) type:', typeof scoredIdsLocal);
        console.log('Scored Relation IDs (local) is array?', Array.isArray(scoredIdsLocal));
        console.log('Scored Relation IDs (local) content:', JSON.stringify(scoredIdsLocal, null, 2));

        // 🛡️ SAFETY GUARD: Prevent any processing if currently checking another relation
        if (isCheckingDuplicate) {
            console.log('🚫 SAFETY GUARD: Already checking another relation - BLOCKING');
            console.log('   Currently checking relation ID:', checkingRelationId);
            console.log('   Requested relation ID:', relation);
            console.log('   ❌ BLOCKED - User must wait for current check to complete');
            console.log('═══════════════════════════════════════════════════════\n');
            return;
        }

        // FIRST: Check if this relation is in the already-scored list (prop or local)
        // This checks if the LOGGED-IN USER has already scored the SELECTED USER with this RELATION
        console.log('🔍 STEP 1: Checking if relation is in pre-fetched scored list...');
        console.log('   This verifies: sender (logged-in user) + receiver (selected user) + relation');
        console.log('   scoredRelationIds (prop):', scoredRelationIds);
        console.log('   scoredIdsLocal (local):', scoredIdsLocal);
        const relationStr = String(relation);
        const propSet = new Set((scoredRelationIds || []).map(String));
        const localSet = new Set((scoredIdsLocal || []).map(String));
        const isScoredByProp = propSet.has(relationStr);
        const isScoredByLocal = localSet.has(relationStr);
        console.log('   includes (prop):', isScoredByProp);
        console.log('   includes (local):', isScoredByLocal);
        const isAlreadyScored = !!(isScoredByProp || isScoredByLocal);

        if (isAlreadyScored) {
            console.log('⚠️⚠️⚠️ DUPLICATE DETECTED (from pre-check)! ⚠️⚠️⚠️');
            console.log('   You have already scored this person with this relation!');
            console.log('   Sender: Logged-in user');
            console.log('   Receiver:', selectedPerson?.name || selectedPerson?.email || selectedPerson?.id);
            console.log('   Relation:', relationName);
            console.log('   🚫 BLOCKING user - showing modal');
            console.log('   ❌ NOT calling onRelationSelect() - user stays on this screen');
            console.log('═══════════════════════════════════════════════════════\n');
            setBlockedRelationName(relationName || 'this relation');
            setCustomMessage(true);
            setTimeout(() => {
                setCustomMessage(false);
                setBlockedRelationName('');
            }, 5000);
            return; // BLOCK user from proceeding
        }

        console.log('✅ Relation NOT in scored list - continuing to API check...');

        // In first-time create flow, receiver_id may be empty; skip API check and proceed
        if (!receiver_id || receiver_id.trim() === '') {
            console.log('⚠️ No receiver_id - skipping API duplicate check (new/unregistered user)');
            console.log('   This user will be created when rating is submitted');
            console.log('   Backend will prevent duplicates if user registers later');
            console.log('═══════════════════════════════════════════════════════\n');
            setSelectedRelation(relation);
            onRelationSelect?.(relation);
            return;
        }

        console.log('✅ Receiver ID exists - performing API double-check...');
        console.log('🔍 STEP 2: Calling API to verify in database...');
        console.log('   This will check: sender_id + receiver_id + relation_id in DB');

        const sender_relation = relation;
        setLoading(true);
        setIsCheckingDuplicate(true);
        setCheckingRelationId(String(relation));

        try {
            console.log('📡 Calling checkIfScored API...');
            console.log('   Parameters:');
            console.log('     - receiver_id:', receiver_id);
            console.log('     - sender_relation:', sender_relation);
            console.log('   Note: sender_id is automatically from auth token');
            const response = await checkIfScored(receiver_id, sender_relation);
            console.log('✅ API Response:', JSON.stringify(response, null, 2));
            console.log('   response.alreadyScored type:', typeof response.alreadyScored);
            console.log('   response.alreadyScored value:', response.alreadyScored);
            console.log('   Is duplicate?', response.alreadyScored === true);

            // Check if already scored - be explicit about the check
            // This checks the database for: sender_id (logged-in user) + receiver_id (selected user) + relation_id
            if (response.alreadyScored === true || response.alreadyScored === 'true') {
                console.log('⚠️⚠️⚠️ DUPLICATE DETECTED BY API! ⚠️⚠️⚠️');
                console.log('   Database found existing rating:');
                console.log('     - Rating ID:', response.ratingId);
                console.log('     - Status:', response.status);
                console.log('     - Relation Name:', response.relationName);
                console.log('     - Created At:', response.createdAt);
                console.log('   This means:');
                console.log('     - YOU (logged-in user) have already scored');
                console.log('     - THIS PERSON:', selectedPerson?.name || selectedPerson?.email || selectedPerson?.id);
                console.log('     - WITH THIS RELATION:', response.relationName);
                console.log('   🚫 BLOCKING user - showing modal');
                console.log('   ❌ NOT calling onRelationSelect() - user stays on this screen');
                console.log('═══════════════════════════════════════════════════════\n');

                setLoading(false);
                setIsCheckingDuplicate(false);
                setCheckingRelationId(null);

                setBlockedRelationName(response.relationName || 'this relation');
                setCustomMessage(true);
                setTimeout(() => {
                    setCustomMessage(false);
                    setBlockedRelationName('');
                }, 5000);

                // Update local cache to prevent future clicks
                const relationStr = String(relation);
                if (!scoredIdsLocal.map(String).includes(relationStr)) {
                    setScoredIdsLocal([...scoredIdsLocal, relationStr]);
                }

                // DO NOT call onRelationSelect - this blocks the user from proceeding
                return; // IMPORTANT: Return here to prevent any further execution
            } else {
                console.log('✅✅✅ NOT a duplicate - ALL CHECKS PASSED! ✅✅✅');
                console.log('   Database confirmed:');
                console.log('     - No existing rating found for this combination');
                console.log('     - Sender (you) + Receiver (selected person) + Relation = UNIQUE');
                console.log('   ✅ SAFE TO PROCEED - Navigating to scoring screen');
                console.log('   Calling onRelationSelect()...');
                console.log('═══════════════════════════════════════════════════════\n');

                setLoading(false);
                setIsCheckingDuplicate(false);
                setCheckingRelationId(null);

                setSelectedRelation(relation);
                if (onRelationSelect) {
                    onRelationSelect(relation);
                } else {
                    console.error('❌ onRelationSelect callback is missing!');
                }
            }
        } catch (error: any) {
            console.error('❌❌❌ ERROR in checkIfScored API ❌❌❌');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            console.log('');
            console.log('⚠️ ERROR OCCURRED - ALLOWING USER TO PROCEED (fail-open)');
            console.log('   ✅ Calling onRelationSelect() - backend will catch duplicates');
            console.log('   Reason: API error should not block legitimate ratings');
            console.log('   Note: Backend has database constraints to prevent duplicates');
            console.log('═══════════════════════════════════════════════════════\n');

            setLoading(false);
            setIsCheckingDuplicate(false);
            setCheckingRelationId(null);

            // On error, allow user to proceed - backend will still catch duplicates
            setSelectedRelation(relation);
            if (onRelationSelect) {
                onRelationSelect(relation);
            }
        }
    }


    if (!fontsLoaded) {
        return null
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" /> */}

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                    Select your relation{'\n'}with
                </Text>
            </View>

            <View style={styles.personNameContainer}>
                <Text style={styles.personNameText}>
                    {(() => {
                        const name = selectedPerson?.name;
                        if (name) return String(name).toUpperCase();
                        const email = selectedPerson?.email;
                        if (email) return String(email).split('@')[0].toUpperCase();
                        const id = selectedPerson?.id;
                        return (id ? String(id) : '').toUpperCase();
                    })()}
                </Text>
            </View>


            <View style={styles.relationsContainer}>
                {loading || !Array.isArray(relationData) || relationData.length === 0 ? (
                    <ActivityIndicator size="large" color="#FF8541" />
                ) : (
                    <>
                        {relationData.map((item: any, index: number) => {
                            const positions = [
                                { top: '6%', left: '8%' } as const,
                                { top: '-2%', left: '60%' } as const,
                                { top: '18%', left: '60%' } as const,
                                { top: '30%', left: '8%' } as const,
                                { top: '42%', left: '60%' } as const,
                                { top: '60%', left: '8%' } as const,
                                { top: '70%', left: '60%' } as const,
                                { top: '84%', left: '8%' } as const,
                            ];

                            const position = positions[index % positions.length] as any;

                            return (
                                <View key={item._id} style={[styles.pillPosition, position]}>

                                    <TouchableOpacity
                                        style={[
                                            styles.relationPill,
                                            (() => {
                                                // Convert to strings for comparison to handle type mismatches
                                                const itemIdStr = String(item._id);
                                                const scoredIdsLocalStr = scoredIdsLocal.map(String);
                                                const scoredRelationIdsStr = scoredRelationIds.map(String);
                                                const isScored = scoredIdsLocalStr.includes(itemIdStr) || scoredRelationIdsStr.includes(itemIdStr);
                                                return (isScored || !isInitDone) && styles.relationPillDisabled;
                                            })()
                                        ]}
                                        disabled={(() => {
                                            // Convert to strings for comparison to handle type mismatches
                                            const itemIdStr = String(item._id);
                                            const scoredIdsLocalStr = scoredIdsLocal.map(String);
                                            const scoredRelationIdsStr = scoredRelationIds.map(String);
                                            const isScored = scoredIdsLocalStr.includes(itemIdStr) || scoredRelationIdsStr.includes(itemIdStr);
                                            const isCurrentlyChecking = isCheckingDuplicate && checkingRelationId === itemIdStr;
                                            return isScored || !isInitDone || isCurrentlyChecking;
                                        })()}
                                        onPress={() => {
                                            console.log('🔘 Relation button pressed:', item.name);

                                            // IMMEDIATE CHECK: Block already-scored relations
                                            const itemIdStr = String(item._id);
                                            const scoredIdsLocalStr = scoredIdsLocal.map(String);
                                            const scoredRelationIdsStr = scoredRelationIds.map(String);
                                            const isAlreadyScored = scoredIdsLocalStr.includes(itemIdStr) || scoredRelationIdsStr.includes(itemIdStr);

                                            if (isAlreadyScored) {
                                                console.log('🚫 BLOCKED: This relation is already scored!');
                                                console.log('   Relation:', item.name);
                                                console.log('   Showing modal to user...');

                                                setBlockedRelationName(item.name || 'this relation');
                                                setCustomMessage(true);
                                                setTimeout(() => {
                                                    setCustomMessage(false);
                                                    setBlockedRelationName('');
                                                }, 3000);
                                                return; // STOP HERE - DO NOT PROCEED
                                            }

                                            if (!isInitDone) {
                                                console.log('🚫 BLOCKED: Still initializing...');
                                                return; // STOP HERE - DO NOT PROCEED
                                            }

                                            console.log('✅ Relation is available - proceeding to duplicate check...');
                                            handleRelationSelect(item._id, item.name);
                                        }}
                                    >
                                        {isCheckingDuplicate && checkingRelationId === item._id ? (
                                            <ActivityIndicator size="small" color="#000" />
                                        ) : (
                                            <Text style={[
                                                styles.relationText,
                                                (() => {
                                                    const itemIdStr = String(item._id);
                                                    const scoredIdsLocalStr = scoredIdsLocal.map(String);
                                                    const scoredRelationIdsStr = scoredRelationIds.map(String);
                                                    const isScored = scoredIdsLocalStr.includes(itemIdStr) || scoredRelationIdsStr.includes(itemIdStr);
                                                    return (isScored || !isInitDone) && styles.relationTextDisabled;
                                                })()
                                            ]}>
                                                {item.name}
                                                {(() => {
                                                    const itemIdStr = String(item._id);
                                                    const scoredIdsLocalStr = scoredIdsLocal.map(String);
                                                    const scoredRelationIdsStr = scoredRelationIds.map(String);
                                                    const isScored = scoredIdsLocalStr.includes(itemIdStr) || scoredRelationIdsStr.includes(itemIdStr);
                                                    return isScored && ' ✓';
                                                })()}
                                                {!isInitDone && ' (loading…)'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </>
                )}
            </View>
            {/* {customMessage ? (
                <>
                    <View style={styles.messageOverlay} />
                    <View style={styles.messageContainer}>
                        <Text style={styles.customMessage}>{customMessage}</Text>
                    </View>
                </>
            ) : null} */}
            <IsAlreadyScoredModal
                visible={customMessage}
                onClose={() => {
                    setCustomMessage(false);
                    setBlockedRelationName('');
                }}
                relationName={blockedRelationName}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 24,
    },
    backButton: {
        marginTop: 20,
        marginLeft: -5,
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    headerContainer: {
        marginTop: 60,
        marginBottom: 32,
    },
    headerText: {
        fontFamily: 'Poppins-Light',
        fontSize: 35,
        textAlign: 'center',
        lineHeight: 40,
        color: '#000',
        fontWeight: '300',
    },
    personNameContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 2,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 60,
        alignItems: 'center',
        height: 50,
    },
    personNameText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 25,
        color: '#FF8541',
        fontWeight: "400",
        letterSpacing: -0.4,
        lineHeight: 44,
    },
    relationsContainer: {
        flex: 1,
        position: 'relative',
    },
    pillPosition: {
        position: 'absolute',
    },
    relationPill: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    relationPillDisabled: {
        backgroundColor: '#E0E0E0',
        opacity: 0.6,
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
    relationText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
        color: '#555555',
        letterSpacing: -0.4,
        lineHeight: 20,
    },
    relationTextDisabled: {
        color: '#999999',
    },
});

export default RelationshipSelectionScreen;
