import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View, ActivityIndicator } from 'react-native';
import RatingSlider from '../ui/RatingSlider';
import ScrollSlider from '../ui/ScoreSlider';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Person {
    id?: string;
    name?: string;
    email?: string;
}
type PersonProp = Person | string;
interface ScoringFlowScreenProps {
    person: PersonProp;
    relation: string | null;
    onComplete: (data: any) => void;
    onBack: () => void;
    isCompleted?: boolean;
    scoringData?: any;
    relationData: any;
    selectedRelationData: any

}
interface Step {
    id: string;
    title: string;
    traits: {
        name: string;
        description: string;
        key: string;
    }[];
}

interface TransformedData {
    steps: Step[];
    metadata: {
        relationId: string;
        relationName: string;
        createdAt: string;
        updatedAt: string;
    };
}
const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};
const ScoringFlowScreen: React.FC<ScoringFlowScreenProps> = ({
    person,
    relation,
    onComplete,
    onBack,
    isCompleted = false, 
    scoringData,
    relationData,
    selectedRelationData
}) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Italic': require('../../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    });
      
    const transformDynamicToSteps = (apiResponse: any): TransformedData => {
        console.log('🔄 transformDynamicToSteps called');
        console.log('   apiResponse:', apiResponse);
        console.log('   apiResponse type:', typeof apiResponse);
        console.log('   apiResponse is null?', apiResponse === null);
        console.log('   apiResponse is undefined?', apiResponse === undefined);

        if (!apiResponse) {
            console.log('⚠️ apiResponse is null/undefined - returning empty structure');
            return {
                steps: [],
                metadata: {
                    relationId: '',
                    relationName: '',
                    createdAt: '',
                    updatedAt: ''
                }
            };
        }

        const topics = Array.isArray(apiResponse?.topics) ? apiResponse.topics : [];
        console.log('   topics:', topics);
        console.log('   topics length:', topics.length);

        const transformed = {
            steps: topics.map((topic: any) => ({
                id: topic?._id,
                title: topic?.topic,
                traits: (Array.isArray(topic?.traits) ? topic.traits : []).map((trait: any) => ({
                    name: trait?.subTopic,
                    description: trait?.trait,
                    key: trait?._id
                })),

            })),
            metadata: {
                relationId: apiResponse?._id || '',
                relationName: apiResponse?.name || '',
                createdAt: apiResponse?.createdAt || '',
                updatedAt: apiResponse?.updatedAt || ''
            }
        };

        console.log('   Transformed steps:', transformed.steps.length);
        console.log('   Transformed metadata:', transformed.metadata);

        return transformed;
    };

    console.log('📊 ScoringFlowScreen - selectedRelationData:', selectedRelationData);
    const steps = transformDynamicToSteps(selectedRelationData);
    console.log('📊 ScoringFlowScreen - steps:', steps);
    console.log('📊 ScoringFlowScreen - steps.steps length:', steps?.steps?.length);

    // const steps = [
    //     {
    //         id: selectedRelationData?._id,
    //         title: 'Awareness & Emotional Intelligence',
    //         traits: [
    //             { name: 'Emotional Regulation', description: 'Controls emotions under pressure or conflict', key: 'emotionalRegulation' },
    //             { name: 'Self-Reflection', description: 'Learns from past experiences and takes accountability', key: 'selfReflection' },
    //             { name: 'Self-Belief', description: 'Displays confidence without arrogance', key: 'selfBelief' },
    //             { name: 'Stress Resilience', description: 'Manages stress effectively and recovers quickly', key: 'stressResilience' },
    //         ],
    //     },
    //     {
    //         id: 2,
    //         title: 'Communication & Empathy',
    //         traits: [
    //             { name: 'Active Listening', description: 'Listens to understand, not to respond', key: 'activeListening' },
    //             { name: 'Empathy', description: 'Understands and validates others emotions or perspectives', key: 'empathy' },
    //             { name: 'Clarity in Expression', description: 'Communicates ideas clearly and constructively', key: 'clarityInExpression' },
    //             { name: 'Non-verbal Cues', description: 'Uses tone, body language and eye contact effectively', key: 'nonVerbalCues' },
    //         ],
    //     },
    //     {
    //         id: 3,
    //         title: 'Leadership & Influence',
    //         traits: [
    //             { name: 'Inspirational Vision', description: 'Articulates purpose and vision clearly', key: 'inspirationalVision' },
    //             { name: 'Decision Making', description: 'Makes timely, balanced decisions', key: 'decisionMaking' },
    //             { name: 'Accountability', description: 'Owns results and encourages ownership in others', key: 'accountability' },
    //             { name: 'Mentorship', description: 'Coaches or uplifts others for growth', key: 'mentorship' },
    //         ],
    //     },
    //     {
    //         id: 4,
    //         title: 'Problem-Solving & Critical Thinking',
    //         traits: [
    //             { name: 'Analytical Mindset', description: 'Breaks down problems and identifies root causes', key: 'analyticalMindset' },
    //             { name: 'Creativity & Innovation', description: 'Offers fresh perspectives or unconventional solutions', key: 'creativityAndInnovation' },
    //             { name: 'Judgement', description: 'Balances intuition and data in decision making', key: 'judgement' },
    //             { name: 'Adaptability', description: 'Changes approach based on new data or circumstances', key: 'adaptability' },
    //         ],
    //     },
    //     {
    //         id: 5,
    //         title: 'Team Collaboration & Culture Fit',
    //         traits: [
    //             { name: 'Trustworthiness', description: 'Keeps commitments, confidential and transparent', key: 'trustworthiness' },
    //             { name: 'Inclusivity', description: 'Welcomes diverse viewpoints and backgrounds', key: 'inclusivity' },
    //             { name: 'Constructive Conflict', description: 'Handles disagreements productively', key: 'constructiveConflict' },
    //             { name: 'Reliability', description: 'Consistently dependable under deadlines or pressure', key: 'reliability' },
    //         ],
    //     },
    //     {
    //         id: 6,
    //         title: 'Growth Mindset & Learning Agility',
    //         traits: [
    //             { name: 'Feedback Receptivity', description: 'Welcomes and acts on feedback without ego', key: 'feedbackReceptivity' },
    //             { name: 'Curiosity', description: 'Actively seeks knowledge and asks powerful questions', key: 'curiosity' },
    //             { name: 'Self-Development', description: 'Engages in continuous learning', key: 'selfDevelopment' },
    //             { name: 'Experimentation', description: 'Willing to try, fail, and iterate', key: 'experimentation' },
    //         ],
    //     },
    //     {
    //         id: 7,
    //         title: 'Purpose, Integrity & Values',
    //         traits: [
    //             { name: 'Authenticity', description: 'True to self, transparent in actions and beliefs', key: 'authenticity' },
    //             { name: 'Integrity', description: 'Does the right thing even when no one is watching', key: 'integrity' },
    //             { name: 'Purpose Alignment', description: 'Work aligns with personal and organizational values', key: 'purposeAlignment' },
    //             { name: 'Service Orientation', description: 'Driven by impact over ego or title', key: 'serviceOrientation' },
    //         ],
    //     },
    // ];

    const [currentStep, setCurrentStep] = useState<number>(isCompleted ? steps?.steps?.length : 1);

    const [traitsData, setTraitsData] = useState<any>({});
    const [stepComments, setStepComments] = useState<{ [stepId: number]: string }>({});
    const [hiddenTraits, setHiddenTraits] = useState<{ [key: string]: boolean }>({});
    const [isFlowCompleted, setIsFlowCompleted] = useState<boolean>(isCompleted);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [currentComment, setCurrentComment] = useState<string>('');
    

    const inputRef = useRef<any>(null);


    // Initialize state with scoringData if provided
    useEffect(() => {
        console.log('📊 useEffect - Initialize scoring data');
        console.log('   scoringData:', scoringData);
        console.log('   steps:', steps);
        console.log('   steps.steps:', steps?.steps);
        console.log('   steps.steps length:', steps?.steps?.length);

        if (scoringData && scoringData?.rating_data && steps?.steps && steps.steps.length > 0) {
            const newTraitsData: any = {};
            const newStepComments: { [stepId: number]: string } = {};
            const newHiddenTraits: { [key: string]: boolean } = {};

            scoringData?.rating_data?.forEach((step: any, index: number) => {
                const stepId = index + 1;
                newStepComments[stepId] = step.comment || '';

                // Safety check: ensure step exists in steps array
                const currentStepData = steps?.steps[stepId - 1];
                if (!currentStepData || !Array.isArray(currentStepData.traits)) {
                    console.log(`⚠️ Step ${stepId} not found in steps array or has no traits`);
                    return;
                }

                step.traits.forEach((trait: any) => {
                    // Find matching trait with safety check
                    const matchingTrait = currentStepData.traits.find(t => t.name === trait.trait);

                    if (!matchingTrait) {
                        console.log(`⚠️ Trait "${trait.trait}" not found in step ${stepId}`);
                        return;
                    }

                    if (!matchingTrait.key) {
                        console.log(`⚠️ Trait "${trait.trait}" has no key`);
                        return;
                    }

                    if (trait.score !== null) {
                        newTraitsData[matchingTrait.key] = trait.score;
                    } else {
                        newHiddenTraits[matchingTrait.key] = true;
                    }
                });
            });

            setTraitsData(newTraitsData);
            setStepComments(newStepComments);
            setHiddenTraits(newHiddenTraits);
            console.log('✅ Scoring data initialized');

            setCurrentStep(isCompleted ? steps?.steps.length : 1);
            setIsFlowCompleted(isCompleted);
        } else {
            console.log('⚠️ Cannot initialize scoring data - missing required data');
            console.log('   Has scoringData?', !!scoringData);
            console.log('   Has rating_data?', !!scoringData?.rating_data);
            console.log('   Has steps?', !!steps?.steps);
            console.log('   Steps length:', steps?.steps?.length);
        }
    }, [scoringData, isCompleted]);

    useEffect(() => {
        if (modalVisible) {
            Keyboard.dismiss(); // Close any existing keyboard
            setTimeout(() => {
                inputRef.current?.focus(); // Focus on the text input field to show the keyboard
            }, 100); // Add a small delay to ensure the keyboard shows up correctly
        }
    }, [modalVisible]);

    // Track previous person to detect changes
    const prevPersonRef = React.useRef<Person | null>(null);
    const scrollViewRef = useRef<any>(null);
    useEffect(() => {
        if (prevPersonRef.current !== person) {
            // Person has changed - do something
            // console.log('Person changed from', prevPersonRef.current, 'to', person);
        }
    }, [person]);
    const mapScoringDataToApiFormat = async (traitsData: any) => {
        return {
            rating_data: steps?.steps.map((step: any, index: number) => ({
                topic: step.title,
                traits: step.traits.map((trait: any) => ({
                    trait: trait.name,
                    score: hiddenTraits[trait.key] ? null : (traitsData[trait.key] ?? null),
                })),
                comment: stepComments[index + 1] || "",
            })),
        };
    };

    const contactInfo = {
        phone: typeof person === 'object' ? person.id || '' : '',
        email: typeof person === 'object' ? person.email || '' : person || ''
    };
    // console.log('personpersonpersonpersonpersonperson', person)
    const goToNextStep = async () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        if (currentStep < steps?.steps.length) {

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentStep(currentStep + 1);
        } else {
            const scoringData = await mapScoringDataToApiFormat(traitsData);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsFlowCompleted(true);
            onComplete(scoringData);
        }
    };

    const goToPreviousStep = () => {
        if (isFlowCompleted) {
            setCurrentStep(steps?.steps.length);
            setIsFlowCompleted(false);
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            onBack();
        }
    };
 useFocusEffect(
           React.useCallback(() => {
             const onBackPress = () => {
            //    goToPreviousStep()
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
    const handleHideTrait = (key: string) => {
        setHiddenTraits((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        if (!hiddenTraits[key]) {
            setTraitsData((prev: any) => {
                const newData = { ...prev };
                delete newData[key];
                return newData;
            });
        }
    };

    // const getNameToDisplay = () => {
    //     if (typeof person === 'string') {
    //         return person.includes('@gmail.com')
    //             ? person.split('@gmail.com')[0]
    //             : person;
    //     }

    //     if (person && !person.name) {
    //         if (person.email) {
    //             return person.email.includes('@gmail.com')
    //                 ? person.email.split('@gmail.com')[0]
    //                 : person.email;
    //         }
    //         return '';
    //     }

    //     // Otherwise use the name
    //     return person?.name || '';
    // };
const getNameToDisplay = () => {
    let nameToDisplay = '';

    if (typeof person === 'string') {
        nameToDisplay = person.includes('@gmail.com')
            ? person.split('@gmail.com')[0]
            : person;
    } else if (person && !person.name) {
        if (person.email) {
            nameToDisplay = person.email.includes('@gmail.com')
                ? person.email.split('@gmail.com')[0]
                : person.email;
        }
    } else {
        nameToDisplay = person?.name || '';
    }

    return nameToDisplay.slice(0, 16); // Limit to 16 characters
};

    const renderTraitsWithSliders = (traits: any[]) => {

        return traits.map((trait, idx) => (
            <View key={trait.key} style={styles.traitSection}>
                <View style={styles.traitHeader}>
                    <Text style={styles.traitName}>{trait.name}</Text>
                    <TouchableOpacity onPress={() => handleHideTrait(trait.key)}>
                        {hiddenTraits[trait.key] ? (
                            <View style={styles.notRatedContainer}>
                                <Text style={styles.notRatedText}>not rated</Text>
                                <Feather name="chevron-down" size={16} color="#000" />
                            </View>
                        ) : (
                            <View style={styles.infoContainer}>
                                <Feather name="minus" size={30} style={styles.infoIcon} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.traitContent}>
                    {!hiddenTraits[trait.key] && (
                        <>
                            <Text style={styles.traitDescription}>{trait.description}</Text>
                            <RatingSlider
                                key={trait.key}
                                sliderKey={trait.key}
                                index={idx}
                                initialValue={traitsData[trait.key] || 0}
                                data={(key: string, value: number, index: number) => {
                                    setTraitsData((prev: any) => ({
                                        ...prev,
                                        [key]: value,
                                    }));
                                }}
                            />
                        </>
                    )}
                </View>
            </View>
        ));
    };


    const handleOpenModal = () => {
        setCurrentComment(stepComments[currentStep] || '');
        setModalVisible(true);
    };

    const handleSaveComment = () => {
        setStepComments((prev) => ({ ...prev, [currentStep]: currentComment }));
        setModalVisible(false);
    };

    console.log("stepsComment", stepComments)

    const currentStepData = steps?.steps && steps.steps.length > 0 ? steps.steps[currentStep - 1] : undefined;

    if (!fontsLoaded) {
        return null;
    }
    // Safeguard: if relation topics haven't loaded yet or are empty
    if (!currentStepData) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ marginBottom: 8 }}>Preparing scoring flow...</Text>
                        {/* Could also render a back button if desired */}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }




    return (
        <SafeAreaView style={styles.container} >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
            >
                {/* <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        {steps?.steps.map((step:any) => {
                            console.log("step2222",step)

                            console.log("currentStep >= step.id ",currentStep >= step.id )
                            
                            return(
                                
                            
                            <View
                                key={step.id}
                                style={[
                                    styles.progressDot,
                                    currentStep >= step.id ? styles.activeDot : {},
                                ]}
                            />
                            )
                        }
                        // ))}
                    )}
                    </View>
                </View> */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        {steps?.steps.map((step: any, index: number) => (
                            <View
                                key={step.id}
                                style={[
                                    styles.progressDot,
                                    currentStep >= (index + 1) ? styles.activeDot : {},
                                ]}
                            />
                        ))}
                    </View>
                </View>
                
                <View style={styles.maincontainer}>
                   

                    <View style={styles.headerSection}>
                         <TouchableOpacity style={styles.backButton} onPress={goToPreviousStep}>
                        <Feather name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>

                       <View style={styles.scoreContainer}>
                        
                        <Text style={styles.scoreText}>Score</Text>

                        {/* <Text style={styles.nameText}>
                        {person.name || (contactInfo.email.includes('@gmail.com')
                            ? contactInfo.email.split('@gmail.com')[0]
                            : contactInfo.email)}
                    </Text> */}
                    <View style={styles.headerContecntWrap}>
                        <Text style={styles.nameText}>
                            {getNameToDisplay()}
                        </Text>


                        <Text style={styles.contactText}>
                            {contactInfo.phone || contactInfo.email}
                        </Text>

                
                        </View>
                    </View>
                    </View>

                            <View style={styles.categoryHeader}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.categoryTitle}>{currentStepData.title}</Text>
                                {currentStepData.traits && (
                                    <Text style={styles.traitsCount}>{currentStepData.traits.length} traits</Text>
                                )}
                            </View>

                        </View>

                    <ScrollView
                    nestedScrollEnabled={true}
                        ref={scrollViewRef}
                        style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {renderTraitsWithSliders(currentStepData.traits)}
                        <View style={styles.spacer}

                        />
                        
                        
                    </ScrollView>

                    {/* <ScrollSlider
                    currentOneTitle={currentStepData.title}
                    CommentContent={(text: string) =>
                        setStepComments((prev) => ({ ...prev, [currentStep]: text }))
                    }
                /> */}

                    <ScrollSlider
                        currentOneTitle={currentStepData.title}
                        CommentContent={(text: string) =>
                            setStepComments((prev) => ({ ...prev, [currentStep]: text }))
                        }
                        onPress={handleOpenModal}
                        currentComment={stepComments[currentStep] || ''}

                    />
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={async () => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Vibration.vibrate(100);
                            await goToNextStep();
                        }}
                    >
                        <View style={styles.nextButtonContent}>
                            <Text style={styles.nextButtonText}>
                                {currentStep === steps?.steps.length ? 'Finish' : 'next'}
                            </Text>
                            <Feather name="arrow-right" size={20} color="#000" style={styles.nextButtonIcon} />
                        </View>
                    </TouchableOpacity>
                    </View>
                

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {/* <Text style={styles.modalTitle}>Comment for {currentStepData.title}</Text> */}
                                <TextInput
                                    ref={inputRef}
                                    style={styles.modalTextInput}
                                    multiline
                                    placeholder="If something worth sharing, write here"
                                    value={currentComment}
                                    onChangeText={setCurrentComment}
                                    autoFocus={modalVisible}
                                />
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.modalButtonCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.saveButton]}
                                        onPress={handleSaveComment}
                                    >
                                        <Text style={styles.modalButtonConfirmText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>


                    {/* <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
                    <View style={styles.nextButtonContent}>
                        <Text style={styles.nextButtonText}>
                            {currentStep === steps.length ? 'Finish' : 'next'}
                        </Text>
                        <Feather name="arrow-right" size={20} color="#000" style={styles.nextButtonIcon} />
                    </View>
                </TouchableOpacity> */}
                    {/* <TouchableOpacity
                        style={styles.nextButton}
                        onPress={async () => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Vibration.vibrate(100);
                            await goToNextStep();
                        }}
                    >
                        <View style={styles.nextButtonContent}>
                            <Text style={styles.nextButtonText}>
                                {currentStep === steps?.steps.length ? 'Finish' : 'next'}
                            </Text>
                            <Feather name="arrow-right" size={20} color="#000" style={styles.nextButtonIcon} />
                        </View>
                    </TouchableOpacity> */}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const screenWidth: number = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 18,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    titleContainer: {
        alignItems: 'flex-end',
    },
    backButton: {
        // marginTop: Platform.OS === 'ios' ? 50 : 20,
        marginBottom: 5,
        marginTop: 6,
    },
    headerSection: {
        marginTop: 10,
        // marginBottom: 20,
        flexDirection: 'row',
       alignItems:'flex-start',
       gap:10,
    //    width:'100%',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 5,
        // width: '100%',
        // maxWidth: 330,
        // backgroundColor: 'red',
        marginRight: 30,
    },
    headerContecntWrap : {
     display:'flex',
     flexDirection:'column',
     alignItems:'flex-end',
     justifyContent:'flex-end',
    //  backgroundColor:'red',
    flex:1,
    },
    scoreText: {
        fontSize: 15,
        color: '#000000',
        fontFamily: "Poppins-Light",
        marginTop: 6,
        // flex: 1,
    },
    nameText: {
        fontSize: 25,
        fontWeight: '500',
        color: '#000',
        marginBottom: 5,
        fontFamily: "Poppins-Medium",
        textAlign: "right",
        
    },
    contactText: {
        fontSize: 12,
        color: '#555555',
        marginBottom: 15,
        fontFamily: "Poppins-Light",
        marginTop: -10,
        letterSpacing: -0.4,
    },
    progressContainer: {
        // paddingHorizontal: 5,
        // marginTop: 6,
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 10,
        height: 6,
    },
    maincontainer:{
        // flex: 1,
        // marginHorizontal: -15

    },
    progressDot: {
        // maxWidth: '100%',
        height: 6,
        // width: "100%",
        borderRadius: 4,
        backgroundColor: '#D9D9D9',
        marginHorizontal: 4,
        flex: 1
    },
    activeDot: {
        backgroundColor: '#FF8541',
        // maxWidth: 55,
        // width: "100%",
        height: 6,
        borderRadius: 5,
               flex: 1
    },
    categoryHeader: {
        alignItems: 'flex-end',
        marginBottom: 40,
        marginTop: -10,
        width: "100%",
        textAlign: "right",
    },
    categoryTitle: {
        fontSize: 18,
        width: "100%",
        maxWidth: '100%',
        color: '#FF8541',
        fontFamily: "Poppins-SemiBold",
        textAlign: "right",
    },
    traitsCount: {
        fontSize: 12,
        color: '#A87051',
        fontFamily: "Poppins-Regular",
        marginTop: -5,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 11,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 1,
        marginTop: -25,
        boxShadow: "inset 0px -3px 4px 0 rgba(0, 0, 0, 0.25), inset 0px 4px 4px 0 rgba(0, 0, 0, 0.25); ",
        alignSelf: "center",
        width: screenWidth,
        paddingTop: 10,
        minHeight: 425,
        maxHeight: 425,
        height: 425

    },
    traitSection: {
        paddingVertical: 7,
        minHeight: 120,
    },
    traitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    traitName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000000',
        textTransform: "capitalize",
        fontFamily: "Poppins-Medium",
    },
    infoContainer: {
        width: 30,
    },
    infoIcon: {
        fontSize: 15,
        opacity: 0.5,
        color: '#000000',
        marginLeft: 10,
    },
    notRatedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notRatedText: {
        fontSize: 12,
        color: '#000000',
        fontFamily: "Poppins-Regular",
        marginRight: 5,
    },
    traitDescription: {
        fontSize: 12,
        color: '#000000',
        fontFamily: "Poppins-Italic",
        fontWeight: 300,
        letterSpacing: -0.4,
    },
    traitContent: {
        minHeight: 80,
    },
    spacer: {
        height: 60,
    },
    nextButton: {
        alignSelf: 'flex-end',
        marginBottom: 45,
        paddingRight: 10,
        marginLeft: 20,
        height: 40,
        marginTop: 20,
        // position: 'fixed',
        // bottom: 40,
        // right:0,
    },
    nextButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingVertical: 1,
        paddingHorizontal: 10,
        marginLeft: 15,
    },
    nextButtonText: {
        fontSize: 25,
        color: '#000000',
        fontWeight: '400',
        fontFamily: 'Poppins-Regular',
        marginRight: 8,
    },
    nextButtonIcon: {
        marginTop: -1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        width: screenWidth * 0.9,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#000000',
        marginBottom: 5,
    },
    modalTextInput: {
        width: '100%',
        height: 200,
        borderColor: '#F3F3F3',
        backgroundColor: '#F3F3F3',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        marginBottom: 20,
        fontWeight: '300',
        color: '#555555',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        // flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        // backgroundColor: '#D9D9D9',
    },

    modalButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
    },
    saveButton: {
        backgroundColor: '#FF8541',
        height: 50,
        alignItems: 'center',
        display: 'flex',
        marginTop: 0,
        borderRadius: 13,
        // paddingHpritical: 10,

    },
    modalButtonCancelText: {
        fontSize: 20,
        color: '#333333',
        fontFamily: 'Poppins-Medium',
    },
    modalButtonConfirmText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Medium',
        padding: 0,
        paddingHorizontal: 10
    }
});

export default ScoringFlowScreen;