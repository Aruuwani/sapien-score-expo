import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 65
const CARD_MARGIN = 5;
const PEEK_WIDTH = 40;

interface Comment {
    title: string;
    content: string;
}

interface CommentSliderProps {
    currentOneTitle: string;
    CommentContent?: (text: string) => void;
    Editing?: boolean;
    showComments?: boolean;
    data?: { rating_data: any[] } | undefined;
    onPress?: () => void;
    currentComment?: any;
}

const CommentSlider: React.FC<CommentSliderProps> = ({ currentOneTitle, CommentContent,Editing, showComments, data, onPress, currentComment, }) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    });

    if (!fontsLoaded) {
        console.log('fonts not loaded');
    }
console.log('currentComments', currentComment)
console.log('data', data)
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newCommentContent, setNewCommentContent] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Store comments in a state
    const [comments, setComments] = useState<Comment[]>([]);

    // Filter comments by current title, prioritizing currentComment
    const filteredComments = currentComment
        ? [{ title: currentOneTitle, content: currentComment }]
        : comments.filter(comment => comment.title === currentOneTitle);

    // Check if we need to show input directly (no comments for current title)
    useEffect(() => {
        if (filteredComments.length === 0) {
            setIsEditing(true);
        } else {
            setIsEditing(false);
            // Reset to the first comment for this title
            goToSlide(0);
        }
    }, [currentOneTitle, currentComment]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (isEditing) return; // Don't update active index while editing

        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const itemWidth = CARD_WIDTH + CARD_MARGIN;
        const currentIndex = Math.round(contentOffsetX / itemWidth);
        if (currentIndex !== activeIndex) {
            setActiveIndex(currentIndex);
        }
    };

    const goToSlide = (index: number): void => {
        if (isEditing || filteredComments.length === 0) return; // Don't navigate when editing or no comments

        const itemWidth = CARD_WIDTH + CARD_MARGIN;
        scrollViewRef.current?.scrollTo({
            x: index * itemWidth,
            animated: true,
        });
        setActiveIndex(index);
    };

    const handleCommentPress = () => {
        if (onPress) {
            onPress();
        } else {
            setModalVisible(true);
        }
    };

    // Handle input changes with auto-save
    const handleInputChange = (text: string) => {
        setNewCommentContent(text);

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Pass the comment content to the parent
        if (CommentContent) {
            CommentContent(text);
        }

        // Set a new timeout to save after typing stops
        // saveTimeoutRef.current = setTimeout(() => {
        //     saveComment(text);
        // }, 1000); // Wait 1 second after typing stops before saving
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const saveComment = (content: string) => {
        // Don't save if content is empty or only whitespace
        if (content.trim() === '') {
            finishEditing();
            return;
        }

        // Add a new comment with the current title
        const newComment = {
            title: currentOneTitle,
            content: content
        };

        setComments([...comments, newComment]);
        finishEditing();

        // Scroll to the new comment after it's added
        setTimeout(() => {
            const newIndex = filteredComments.length;
            goToSlide(newIndex);
        }, 100);
    };

    const handleSaveComment = () => {
        if (newCommentContent.trim() === '') {
            setModalVisible(false);
            return;
        }

        saveComment(newCommentContent);
        setModalVisible(false);
    };

    const finishEditing = () => {
        setIsEditing(false);
        setNewCommentContent('');
        setModalVisible(false);
    };

    // Detect when user finishes editing (e.g., presses return/done on keyboard)
    const handleBlur = () => {
        if (newCommentContent.trim() !== '') {
            saveComment(newCommentContent);
        } else {
            finishEditing();
        }
    };

    // Render just the input field when editing or when no comments exist
    if ((!showComments && isEditing) || (!showComments && filteredComments.length === 0)) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.commentInputContainer}>
                        <TouchableOpacity onPress={handleCommentPress}>
                            <TextInput
                                style={styles.textInput}
                                value={newCommentContent}
                                multiline
                                maxLength={200}
                                placeholderTextColor="#000000"
                                placeholder="If something worth sharing, write it here"
                                editable={false} // Disable direct editing, use modal instead
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* <Text style={styles.modalTitle}>Comment for {currentOneTitle}</Text> */}
                            <TextInput
                                style={styles.modalTextInput}
                                multiline
                                placeholder="start writing your comments here"
                                value={newCommentContent}
                                onChangeText={handleInputChange}
                                autoFocus
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
            </SafeAreaView>
        );
    }

    // Render the comment slider when not editing and comments exist
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled={false}
                snapToInterval={CARD_WIDTH + CARD_MARGIN}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={{ width: (screenWidth - CARD_WIDTH - PEEK_WIDTH) / 2 }} />
                {!showComments ? (
                    <>
                        {filteredComments.map((comment, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.cardContainer}
                                activeOpacity={0.9}
                                onPress={handleCommentPress}
                            >
                                <View style={styles.commentSection}>
                                    <Text style={styles.title}>{comment.title}</Text>
                                    <Text style={styles.content}>{comment.content}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <>
                        {data?.rating_data?.some((category: any) => category.comment) ? (
                            data.rating_data.map((category: any, index: number) => {
                                if (!category.comment) return null;
console.log('category', category)
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.cardContainer}
                                        activeOpacity={0.9}
                                        // disabled={!Editing}
                                        onPress={() => {
                                            if (Editing) {
                                                handleCommentPress();
                                            }
                                        }}
                                    >
                                        <View style={styles.commentSection}>
                                            <Text style={styles.title}>{category.topic}</Text>
                                            <Text style={styles.content}>{category.comment}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                                No comments exist.
                            </Text>
                        )}
                    </>
                )}
                <View style={{ width: (screenWidth - CARD_WIDTH - PEEK_WIDTH) / 2 }} />
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Comment for {currentOneTitle}</Text>
                        <TextInput
                            style={styles.modalTextInput}
                            multiline
                            placeholder="If something worth sharing, write here"
                            value={newCommentContent}
                            onChangeText={handleInputChange}
                            autoFocus
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
                                <Text style={styles.modalButtonConfirmText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 110,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    cardContainer: {
        width: CARD_WIDTH,
        marginLeft: CARD_MARGIN,
        // marginRight: CARD_MARGIN,
        // width: '100%',
    },
    commentSection: {
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#000000',
        height: 95,
        width: '100%'
    },
    title: {
        fontSize: 10,
        marginBottom: -5,
        color: '#000',
        fontFamily: 'Poppins-Medium',
    },
    content: {
        fontSize: 12,
        color: '#000000',
        lineHeight: 20,
        fontWeight: '300',
        fontFamily: 'Poppins-Light',
    },
    commentInputContainer: {
        paddingHorizontal: 3,
        paddingTop: 10,
        // width: 330,
        // height: 200,
        // backgroundColor:'red'
        // marginBottom: 100,

    },
    textInput: {
        fontSize: 10,
        color: '#000000',
        lineHeight: 20,
        padding: 0,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
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
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#555555',
        marginBottom: 15,
        fontWeight: '300',
    },
    modalTextInput: {
        width: '100%',
        height: 200,
        borderColor: '#F3F3F3',
        backgroundColor:'#F3F3F3',
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
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        // backgroundColor: '#D9D9D9',
    },
    saveButton: {
        backgroundColor: '#FF8541',
        height: 50,
        alignItems: 'center',
        display: 'flex',
        marginTop: 0,
        borderRadius: 13,
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
        padding:0,
    }
});

export default CommentSlider;