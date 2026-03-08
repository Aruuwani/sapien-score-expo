
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Image,
    BackHandler,
    Easing,
    ActivityIndicator,
    Modal,
    Keyboard,
    useWindowDimensions

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useFocusEffect } from '@react-navigation/native';

import { deleteChatrooms, deleteFavChatrooms, getFavChatrooms, makeFavChatrooms, UpdateChatroomsName } from '@/api/chatRoomApi';
import { GetMessages, ReactMessages, SendMessage } from '@/api/messageApi';

import { getUserProfile } from '@/api/userApi';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import ReportDialogScreen from '../ui/ReportDialogScreen';
import ToastMessageModal from '../ui/toastModal';
import UnblockConfirmationModal from '../ui/UnblockConfirmationModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { formatTime } from '../../utils/date';

interface Message {
    id: string;
    username: string;
    message: string;
    timestamp: string;
    isOwnMessage: boolean;
    likes: number;
    laughs: number;
    plusOnes: number;
    replies?: Message[]; // Update to be Message array instead of string array
    isReply?: boolean;
    parentMessageId?: string;
    reactions?: any[];
}
interface ChatScreenProps {
    roomName: string;
    roomId: string;
    onBack: () => void;
    isFav: boolean;
    creatorId: string | null
}

export default function ChatScreen({ roomName, roomId, onBack, isFav, creatorId }: ChatScreenProps) {
    const headerRef = useRef<View>(null);
    const flatListRef = useRef<FlatList>(null);
    const [didInitialScroll, setDidInitialScroll] = useState(false);

    const shouldAutoScroll = useRef(true);


    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Italic': require('../../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    });

    if (!fontsLoaded) {
        console.log('fonts not loaded');
        return null;
    }

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const dimensions = useWindowDimensions();
    const [headerHeight, setHeaderHeight] = useState(0);


    const [messages, setMessages] = useState<Message[]>([]);
    // console.log('messages', messages)
    const [inputMessage, setInputMessage] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [replyingMessage, setReplyingMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [visible, setModalVisible] = useState(false);
    const [reportedSuccess, setReportedSuccess] = useState(false);
    const [favRoom, setFavRoom] = useState(isFav);
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    console.log('loading', loading)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const drawerWidth = SCREEN_WIDTH;
    const isScrolling = useRef(false)


    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                onBack();
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            return () => backHandler.remove();
        }, [])
    );

    useEffect(() => {
        if (messages.length > 0 && !didInitialScroll) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
                setDidInitialScroll(true);
            }, 100);
        }
    }, [messages?.length, didInitialScroll]);

    const scaleAnim = useRef(new Animated.Value(-drawerWidth)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const animateMenu = (isOpening: boolean) => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: isOpening ? 1 : 0,
                duration: 0,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: isOpening ? 0.5 : 0,
                duration: 0,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => {
            if (!isOpening) {
                setIsMenuOpen(false);
            }
        });
    };

    // Update your openDrawer and toggleMenu functions:
    const openDrawer = () => {
        if (isMenuOpen) {
            animateMenu(false);
        } else {
            setIsMenuOpen(true);
            animateMenu(true);
        }
    };

    const toggleMenu = () => {
        if (isMenuOpen) {
            animateMenu(false);
        } else {
            setIsMenuOpen(true);
            animateMenu(true);
        }
    }


    const handleMenuItemPress = async (action: string) => {
        setModalVisible(true)

        console.log(`${action} pressed`);

    };
    const inputRef = useRef<TextInput>(null);
    const handleReply = async (messageId: string, replyMessage: string) => {
        inputRef.current?.focus();
        setReplyingTo(messageId);
        setReplyingMessage(replyMessage)
        await getMessages()
    };
    const DeleteChatroom = async () => {
        setIsMenuOpen(false)
        await deleteChatrooms(roomId).then((res) => {
            console.log('res', res)

            toggleMenu();
            onBack();
            // setModalVisible(true)
            // setModalVisible(true)
        })

    }

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const handleReact = async (messageId: string, emoji: string) => {
        try {
            await ReactMessages(messageId, emoji).then(async (res) => {
                await getMessages()
            })
        } catch (error) {
            console.error('Error reacting to message:', error);
        }
    }




    const renderReply = useCallback(
        ({ item, parentMessage, isLast }: { item: Message; parentMessage: Message; isLast: boolean }) => {
            const isParentOwn = parentMessage.isOwnMessage;
            console.log('useritem', item)
            return (
                <View style={[styles.replyWrapper, isParentOwn ? styles.ownReplyWrapper : styles.otherReplyWrapper]}>
                    {/* Connecting Line */}
                    <View
                        style={[
                            isParentOwn ? styles.ownconnectingLine : styles.connectingLine,
                            isParentOwn ? styles.ownConnectingLine : styles.otherConnectingLine,
                            isLast && styles.lastConnectingLine,
                        ]}
                    />

                    {/* Reply Message */}
                    <View style={[styles.replyContainer, isParentOwn ? styles.ownReplyContainer : styles.otherReplyContainer]}>
                        <View style={[styles.replyBubble, isParentOwn ? styles.ownReplyBubble : styles.otherReplyBubble]}>
                            <View style={styles.replyHeader}>
                                <View style={styles.usernameTag}>
                                    <Text style={[styles.replyUsername, styles.commonFontStyle]}>{item.username}</Text>
                                </View>
                                <Text style={[styles.replyTimestamp, styles.commonFontforDate]}>{item.timestamp?.toLocaleUpperCase()}</Text>
                            </View>
                            <View style={styles.replyContent}>
                                <Text style={[styles.replyText, styles.commonMessageFontStyle]}>{item.message}</Text>
                                <TouchableOpacity style={styles.replyIcon} onPress={() => handleReply(item.id, item.message)} activeOpacity={0.7} >
                                    {/* <Ionicons name="arrow-undo" size={14} color="#333" /> */}
                                </TouchableOpacity>
                            </View>

                            {/* Reply Reactions */}
                            <View style={styles.replyReactions}>
                                <View style={styles.reaction} >
                                    {item.reactions?.findIndex(r => r.userId === currentUserId && r.emoji === 'heart') !== -1 ? (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'heart')} activeOpacity={0.7}>
                                            <FontAwesome name="heart" size={20} color="#ff6b35" />
                                        </TouchableOpacity>
                                    ) : (

                                        <TouchableOpacity onPress={() => handleReact(item.id, 'heart')} activeOpacity={0.7}>
                                            {/* <Entypo name="heart" size={20} color={isParentOwn ? 'white' : 'black'} /> */}
                                            <FontAwesome name="heart-o" size={20} color={isParentOwn ? 'white' : 'black'} />

                                        </TouchableOpacity>
                                    )}
                                    <Text style={styles.otherreplyReactionText}>{item.likes}</Text>
                                </View>
                                <View style={styles.reaction} >
                                    {item.reactions?.findIndex(r => r.userId === currentUserId && r.emoji === 'smile') !== -1 ? (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'smile')} activeOpacity={0.7}>

                                            <Image source={require('../../assets/images/likedLaugh.png')} style={{ width: 20, height: 20 }} />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'smile')} activeOpacity={0.7}>

                                            <Image source={require('../../assets/images/emojiiismile.png')} style={{ width: 20, height: 20 }} />
                                        </TouchableOpacity>

                                    )}
                                    <Text style={styles.otherreplyReactionText}>{item.laughs}</Text>
                                </View>
                                <View style={styles.reaction}>
                                    {/* <Text style={styles.plusOneText}>+1</Text> */}
                                    <TouchableOpacity onPress={() => handleReact(item.id, 'plusOne')} activeOpacity={0.7}>

                                        <Image source={require('../../assets/images/plus1.png')} style={{ width: 20, height: 20 }} />
                                    </TouchableOpacity>
                                    <Text style={styles.otherreplyReactionText}>{item.plusOnes}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            );
        },
        [handleReact, handleReply] // Add all dependencies here
    );


    const renderMessage = useCallback(
        ({ item }: { item: Message }) => {

            return (
                // <DraggableMessage isOwnMessage={item.isOwnMessage} onSwipeToReply={() => handleReply(item.id)}>
                <View style={styles.messageGroup}>
                    {/* Main Message */}
                    <View
                        style={[
                            styles.messageContainer,
                            item.isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
                        ]}
                    >
                        <View
                            style={[
                                styles.messageBubble,
                                item.isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                            ]}
                        >
                            <View style={styles.messageContent}>
                                <View style={styles.messageHeader}>
                                    <View style={styles.ownusernameTag}>
                                        <Text style={[item.isOwnMessage ? styles.ownusername : styles.username, styles.commonFontStyle]}>
                                            {item.username}
                                        </Text>
                                    </View>
                                    <Text style={[item.isOwnMessage ? styles.owntimestamp : styles.timestamp, styles.commonFontforDate]}>
                                        {item.timestamp.toLocaleUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.messageTextContainer}>
                                    {item.isOwnMessage && (
                                        <TouchableOpacity style={styles.messageReplyIcon} onPress={() => handleReply(item.id, item.message)} activeOpacity={0.7}>
                                            <Image
                                                source={require('../../assets/images/leftArrow.png')}
                                                width={20}
                                                height={20}
                                                style={{ width: 15, height: 15 }}
                                            />
                                        </TouchableOpacity>
                                    )}

                                    <Text
                                        style={[
                                            styles.messageText,
                                            styles.commonMessageFontStyle,
                                            item.isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                                        ]}
                                    >
                                        {item.message}
                                    </Text>

                                    {!item.isOwnMessage && (
                                        <TouchableOpacity style={styles.messageReplyIconOther} onPress={() => handleReply(item.id, item.message)} activeOpacity={0.7}>
                                            <Image
                                                source={require('../../assets/images/leftArrow.png')}
                                                width={20}
                                                height={20}
                                                style={{ width: 15, height: 15 }}
                                            />

                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.reactionsContainer}>
                                <View style={styles.reaction}>

                                    {item.reactions?.findIndex(r => r.userId === currentUserId && r.emoji === 'heart') !== -1 ? (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'heart')} activeOpacity={0.7}>
                                            <FontAwesome name="heart" size={20} color="#ff6b35" />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'heart')} activeOpacity={0.7}>
                                            <FontAwesome name="heart-o" size={20} color={item.isOwnMessage ? 'white' : 'black'} />
                                        </TouchableOpacity>
                                    )}
                                    <Text
                                        style={[
                                            styles.reactionText,
                                            item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                        ]}
                                    >
                                        {item.likes}
                                    </Text>
                                </View>

                                <View style={styles.reaction}>
                                    {item.reactions?.findIndex(r => r.userId === currentUserId && r.emoji === 'smile') !== -1 ? (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'smile')} activeOpacity={0.7}>
                                            <Text
                                                style={[
                                                    styles.emojiReaction,
                                                    item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                                ]}
                                            >
                                                <Image
                                                    source={require('../../assets/images/likedLaugh.png')}
                                                    width={24}
                                                    height={24}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={() => handleReact(item.id, 'smile')} activeOpacity={0.7}>
                                            <Text
                                                style={[
                                                    styles.emojiReaction,
                                                    item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                                ]}
                                            >
                                                <Image
                                                    source={require('../../assets/images/emojiiismile.png')}
                                                    width={24}
                                                    height={24}
                                                    style={{ width: 20, height: 20 }}
                                                />
                                            </Text>
                                        </TouchableOpacity>

                                    )}
                                    < Text
                                        style={[
                                            styles.reactionText,
                                            item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                        ]}
                                    >
                                        {item.laughs}
                                    </Text>
                                </View>

                                <View style={styles.reaction}>
                                    {/* <Text
                                        style={[
                                            styles.plusOneText,
                                            // item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                        ]}
                                    >
                                        +1
                                    </Text> */}

                                    <TouchableOpacity onPress={() => handleReact(item.id, 'plusOne')} activeOpacity={0.7}>

                                        <Image source={require('../../assets/images/plus1.png')} style={{ width: 20, height: 20 }} />
                                    </TouchableOpacity>
                                    <Text
                                        style={[
                                            styles.reactionText,
                                            item.isOwnMessage ? styles.ownReactionText : styles.otherReactionText,
                                        ]}
                                    >
                                        {item.plusOnes}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Render Replies */}
                    {
                        item.replies &&
                        item.replies.map((reply, index) => (
                            <View key={reply.id}>
                                {renderReply({
                                    item: reply,
                                    parentMessage: item,
                                    isLast: index === item.replies!.length - 1,
                                })}
                            </View>
                        ))
                    }
                </View >
                // </DraggableMessage>
            );
        },
        [handleReact, handleReply, renderReply] // Add all dependencies here
    );

    const handleSend = async () => {
        if (inputMessage.trim()) {
            // Optimistically update UI
            const newMessage: Message = {
                id: Date.now().toString(), // Temporary ID
                username: 'You', // Or get from user context
                message: inputMessage,
                timestamp: formatTime(new Date()),
                isOwnMessage: true,
                likes: 0,
                laughs: 0,
                plusOnes: 0,

            };

            // Add to messages immediately
            setMessages(prev => [...prev, newMessage]);
            setInputMessage('');
            if (replyingTo) setReplyingTo(null);

            // Send to backend
            try {
                if (replyingTo) {
                    // Send as a reply
                    await SendMessage(roomId, inputMessage, true, replyingTo).then(async (response) => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                        await getMessages()
                    })
                } else {
                    // Send as a regular message
                    await SendMessage(roomId, inputMessage).then(async (response) => {
                        await getMessages()
                    })
                }
            } catch (error) {
                console.error('Error sending message:', error);
                // Optionally roll back the optimistic update
                setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
            }
        }
    };


    const handleHeartPress = async () => {
        await makeFavChatrooms(roomId).then((response) => {
            setFavRoom(true)
        })
    }

    const getMessages = useCallback(async () => {
        if (roomId) {
            // setLoading(true)
            const response = await getUserProfile();
            const currentUserId = response?.user?._id || '';
            setCurrentUserId(currentUserId)
            // const currentUserId = await AsyncStorage.getItem('userId

            await creatorId == currentUserId ? setIsCreator(true) : setIsCreator(false)

            await GetMessages(roomId).then((response) => {
                setLoading(true)
                const transformed = transformApiMessages(response, currentUserId || '')
                setMessages(transformed);
                setLoading(false)

            })

        }
        setLoading(false)

    }, [roomId, creatorId]);

    useEffect(() => {

        getMessages()

    }, [messages, getMessages]);

    const formatTimestamp = (isoString: string): string => {
        return formatTime(isoString);
    };
    console.log('messages', messages)
    const transformApiMessages = (apiMessages: any[], currentUserId: string): Message[] => {
        // First create a map of all messages for easy lookup
        const messageMap = new Map<string, Message>();

        apiMessages.forEach(msg => {
            messageMap.set(msg._id, {
                id: msg._id,
                username: msg.senderName,
                message: msg.content,
                timestamp: formatTimestamp(msg.timestamp),
                isOwnMessage: msg.senderId === currentUserId,
                reactions: msg.reactions,
                likes: msg.reactions?.filter((r: any) => r.emoji === 'heart').length || 0,
                laughs: msg.reactions?.filter((r: any) => r.emoji === 'smile').length || 0,
                plusOnes: msg.reactions?.filter((r: any) => r.emoji === 'plusOne').length || 0,
                replies: msg.replies ? msg.replies.map((reply: any) => reply._id) : [],
            });
        });

        // Now build the hierarchy
        const result: Message[] = [];

        apiMessages.forEach(msg => {
            if (msg.parentMessageId) {
                // This is a reply, add it to its parent's replies array
                const parent = messageMap.get(msg.parentMessageId);
                if (parent) {
                    parent.replies!.push(messageMap.get(msg._id)!);
                }
            } else {
                // This is a top-level message
                result.push(messageMap.get(msg._id)!);
            }
        });
        console.log('result', result)
        return result;
    };

    useEffect(() => {
        if (reportedSuccess) {
            setTimeout(() => {
                setReportedSuccess(false);
                //   setMessage('');
            }, 3000);
        }
    }, [reportedSuccess])

    const handleRenameRoom = async () => {
        setRenameModalVisible(true)
        toggleMenu()
    }
    const handleUpdateRoomName = async () => {
        await UpdateChatroomsName(roomId, newRoomName).then(() => {
            setIsMenuOpen(false)
            setRenameModalVisible(false)
        })
        // setRoomName(newName)
    }

    const handleDeleteFav = async () => {
        await deleteFavChatrooms(roomId).then((res) => {
            console.log('res', res)


        })
        setFavRoom(false)

    }


    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            flatListRef.current?.scrollToEnd({ animated: true });
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };

    }, [dimensions.height, dimensions.width, keyboardHeight]);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            flatListRef.current?.scrollToEnd({ animated: true });
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => { });
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);
    return (


        <SafeAreaView style={styles.container}>

            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View ref={headerRef} style={styles.header} >
                <View style={styles.headerTop}>
                    <Text style={styles.headerSubtext}>
                        all the messages disappear after 24 hours of viewing
                    </Text>
                </View>
                <View style={styles.headerMain}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{newRoomName || roomName}</Text>
                    <View style={styles.headerRight}>

                        {favRoom ? (
                            <TouchableOpacity style={styles.heartButton} onPress={handleDeleteFav}>
                                <FontAwesome name="heart" size={24} color="#ff6b35" />
                            </TouchableOpacity>

                            // <Image source={require('../../assets/images/orangeHeart.png')} />
                        ) : (
                            <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress}>
                                {/* <Image source={require('../../assets/images/heart.png')} /> */}
                                <FontAwesome name="heart-o" size={24} color="black" />

                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>

                            <Image source={require('../../assets/images/align-left.png')} />
                        </TouchableOpacity>
                    </View>
                </View>


                {isMenuOpen && (
                    <>
                        <Animated.View
                            style={[
                                styles.overlay,
                                {
                                    opacity: overlayOpacity,
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={StyleSheet.absoluteFill}
                                activeOpacity={1}
                                onPress={() => animateMenu(false)}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.menuContainer,
                                {
                                    transform: [{ scale: scaleAnim }],
                                }
                            ]}
                        >
                            <View style={styles.drawerContent}>
                                <TouchableOpacity
                                    style={styles.compactMenuItem}
                                    onPress={() => handleMenuItemPress('report room')}
                                >
                                    <Image source={require('../../assets/images/flag1.png')} style={{ width: 20, height: 20 }} />
                                    <Text style={styles.compactMenuText}>report room</Text>
                                </TouchableOpacity>

                                {isCreator && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.compactMenuItem}
                                            onPress={() => handleRenameRoom()}
                                        >
                                            <Image source={require('../../assets/images/edit.png')} style={{ width: 20, height: 20 }} />
                                            <Text style={styles.compactMenuText}>rename room</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.compactMenuItem}
                                            onPress={() => setShowLogoutModal(true)}
                                        >
                                            <Image source={require('../../assets/images/trash.png')} style={{ width: 20, height: 20 }} />
                                            <Text style={styles.compactMenuText}>delete room</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </Animated.View>
                    </>
                )}

            </View>

            <KeyboardAvoidingView
                style={styles.keyboardcontainer}
                behavior="padding" // Changed to padding for dynamic pushing on both platforms
                keyboardVerticalOffset={headerHeight + (Platform.OS === 'ios' ? 20 : 0)} // Offset by header + safe area
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onContentSizeChange={() => {
                        // if (!isScrolling.current) {
                        flatListRef.current?.scrollToEnd({ animated: true });
                        // }
                    }}
                    onLayout={() => {
                        // if (!isScrolling.current) {
                        flatListRef.current?.scrollToEnd({ animated: true });
                        // }
                        // flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    ListEmptyComponent={

                        <View style={styles.emptyContainer}>
                            {
                                loading && (
                                    <View style={styles.indicator}>
                                        <ActivityIndicator size="large" color="#FF8541" />
                                    </View>
                                )

                            }
                            <Text style={styles.emptyText}>{messages.length === 0 ? 'No messages yet' : 'Loading messages...'}</Text>
                        </View>
                    }
                    onScroll={(e) => {
                        // Detect if user is near bottom; if not, disable auto-scroll
                        const y = e.nativeEvent.contentOffset.y;
                        const height = e.nativeEvent.layoutMeasurement.height;
                        const contentHeight = e.nativeEvent.contentSize.height;
                        shouldAutoScroll.current = y + height >= contentHeight - 50; // Threshold for "at bottom"
                    }}
                    onScrollBeginDrag={() => {
                        isScrolling.current = true;
                    }}
                    onScrollEndDrag={() => {
                        isScrolling.current = false;
                    }}
                    onMomentumScrollBegin={() => {
                        isScrolling.current = true;
                    }}
                    onMomentumScrollEnd={() => {
                        isScrolling.current = false;
                    }}
                />
                {/* Reply indicator */}
                {replyingTo ? (
                    <>



                        <View style={styles.modalContainer}>
                            <TouchableOpacity activeOpacity={1}>
                                {/* Info Message */}
                                <View style={styles.infoMessageContainer}>
                                    <View style={styles.replyIndicator}>
                                        <Text style={styles.replyIndicatorText}>
                                            {replyingMessage}
                                        </Text>
                                        <TouchableOpacity onPress={cancelReply}>
                                            <Ionicons name="close" size={15} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.bubbleMain}>
                                        <View style={styles.bubbleLarge} />

                                        <View style={styles.bubbleSmall} />
                                    </View>
                                </View>
                                {/* Input Container */}
                                <View style={styles.replyinputContainer}>
                                    <View style={styles.inputRow}>
                                        <View style={styles.avatarPlaceholder} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="type your reply"
                                            placeholderTextColor="#999"
                                            value={inputMessage}
                                            onFocus={() => {
                                                setTimeout(() => {
                                                    flatListRef.current?.scrollToEnd({ animated: true });
                                                }, 100);
                                            }}
                                            onChangeText={setInputMessage}
                                            autoFocus={true}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={styles.createModalButton}
                                        onPress={handleSend}
                                    //    onPress={handleCreateRoom}
                                    >
                                        <Text style={styles.createModalButtonText}>reply</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (

                    <View style={styles.inputContainer}>
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                style={styles.textInput}
                                placeholder="type your message here"
                                placeholderTextColor="#555555"
                                value={inputMessage}
                                onChangeText={setInputMessage}
                                // onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)}
                                multiline
                            />
                            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>

                                <Feather name="send" size={24} color="#ff6b35" />


                            </TouchableOpacity>

                        </View>
                    </View>
                )
                }

                {/* Input Area */}




                {/* Menu Overlay */}
                {
                    isMenuOpen && (
                        <TouchableWithoutFeedback onPress={toggleMenu}>
                            <View style={styles.menuOverlay} />
                        </TouchableWithoutFeedback>
                    )
                }
                <Modal
                    visible={renameModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setRenameModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        style={styles.modalOverlay}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <TouchableOpacity
                            style={styles.modalBackground}
                            activeOpacity={1}
                            onPress={() => setModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <TouchableOpacity activeOpacity={1}>
                                    {/* Info Message */}
                                    {/* <View style={styles.infoMessage}>
                                  <Text style={styles.infoText}>
                                    You can create up to 3 echorooms
                                  </Text>
                                </View> */}

                                    {/* Input Container */}
                                    <View style={styles.inputContainer}>
                                        <TouchableOpacity onPress={() => setRenameModalVisible(false)} >
                                            <Ionicons name="close" size={15} color="#999" style={{ alignSelf: 'flex-end' }} />
                                        </TouchableOpacity>

                                        <View style={styles.inputRow}>
                                            <View style={styles.avatarPlaceholder} />
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Name your Echo room"
                                                placeholderTextColor="#555555"
                                                value={newRoomName}

                                                onFocus={() => {
                                                    setTimeout(() => {
                                                        flatListRef.current?.scrollToEnd({ animated: true });
                                                    }, 100);
                                                }}
                                                onChangeText={setNewRoomName}
                                                autoFocus={true}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.createModalButton}
                                            onPress={() => handleUpdateRoomName()}
                                        >
                                            <Text style={styles.createModalButtonText}>rename</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </Modal>
                <UnblockConfirmationModal
                    visible={showLogoutModal}
                    title="Delete Room"
                    message="Are you sure you want to Delete Room?"
                    options={{
                        left: {
                            text: "Cancel",
                            action: () => setShowLogoutModal(false),
                        },
                        right: {
                            text: "Delete",
                            action: () => {
                                DeleteChatroom();
                                setShowLogoutModal(false);
                            },
                        },
                    }}
                    type="delete"
                />
                <ReportDialogScreen visible={visible} onClose={() => setModalVisible(false)} roomId={roomId} reportedSuccess={(val: boolean) => setReportedSuccess(val)} />
                <ToastMessageModal visible={reportedSuccess} onClose={() => setReportedSuccess(false)} message="successfully reported" />
            </KeyboardAvoidingView>
        </SafeAreaView >



    );
}

const styles = StyleSheet.create({
    menuContainer: {
        position: 'absolute',
        top: 60, // Adjust based on your header height
        right: 2, // Position near the menu button
        // backgroundColor: 'white',
        // borderRadius: 12,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 10 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        maxWidth: 150,
        width: '100%',
        // padding: 8,
        // elevation: 5,
        zIndex: 1000,
        // transformOrigin: 'top right', // This makes it scale from top-right corner
    },
    // overlay: {
    //     // position: 'absolute',
    //     top: 0,
    //     left: 0,
    //     right: 0,
    //     bottom: 0,
    //     backgroundColor: 'rgba(0, 0, 0, 0.3)',
    //     zIndex: 1,
    // },
    bubbleMain: {
        paddingTop: 3
    },
    modalText: {
        fontSize: 20,
        marginBottom: 20,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        color: '#555555',
        top: 40,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        display: 'flex',
    },
    modalButtonCancel: {
        padding: 10,
        borderRadius: 10,
        gap: 10,
        marginRight: 10,
        alignItems: 'center',


    },
    modalButtonConfirm: {
        backgroundColor: '#FF8541',
        paddingHorizontal: 10,
        paddingVertical: 8,
        lineHeight: 22,
        borderRadius: 10,
        marginLeft: 10,
        alignItems: 'center',
    },
    modalConfirmButtonText: {
        color: '#FFFFFF',
        // fontWeight: 'bold',
        fontFamily: 'Poppins-Medium',
        fontSize: 20
    },
    modalcancelButtonText: {
        color: '#333333',
        // fontWeight: 'bold',
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        lineHeight: 20,
    },

    bubbleLarge: {
        // position: 'absolute',
        bottom: '10%',
        left: '3%',
        width: 12,
        height: 12,
        backgroundColor: 'white',
        borderRadius: "50%",
        transform: [{ rotate: '104.11deg' }],
    },
    bubbleSmall: {
        // position: 'absolute',
        bottom: '5%',
        left: '1  %',
        width: 9,
        height: 9,
        backgroundColor: 'white',
        opacity: 1,
        borderRadius: "50%",
        transform: [{ rotate: '104.11deg' }],
    },
    overlay: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        opacity: 0,


    },
    keyboardcontainer: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: '#565656'

    },
    container: {
        flex: 1,
        backgroundColor: '#565656',
    },
    contentContainer: {
        backgroundColor: "red",
        flex: 1,
        position: 'relative', // This is key for proper z-indexing
    },

    header: {
        backgroundColor: '#ffffff',
        // paddingBottom: 8,
        position: 'relative',
    },
    draggableMessage: {
        // This makes the message feel more "lifted" when dragged
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    drawerContent: {
        width: '100%',
        height: 'auto',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginTop: 70,
        zIndex: 9999,
        paddingVertical: 10,
        position: 'relative',
        top: -70
        // maxWidth: 180,
    },
    indicator: {
        alignContent: "center",
        justifyContent: "center",
        flex: 1,

    },

    drawer: {
        position: 'absolute',
        top: 70,
        left: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 9999,
        //      width: '70%', // Adjust width as needed
        // height: '100%',
        shadowColor: '#000',
        shadowRadius: 4,
        elevation: 5,
    },
    headerTop: {
        paddingHorizontal: 45,
        paddingTop: 10,
        paddingBottom: 0,
        position: 'relative',
        bottom: '-7%',
    },

    headerSubtext: {
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        fontSize: 10,
        color: '#000',
    },
    headerMain: {
        flexDirection: 'row',
        // paddingHorizontal: 0,
        // paddingBottom: -10,
        // paddingTop: 4,
        alignItems: 'center',

    },
    headerTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
        fontWeight: '400',
        color: '#000',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heartButton: {
        padding: 8,
        marginRight: 8,
    },
    menuButton: {
        padding: 8,
    },
    messagesList: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
    },
    messageGroup: {
        marginBottom: 20,
    },
    messageContainer: {
        marginBottom: 8,
    },
    ownMessageContainer: {
        alignItems: 'flex-end',
        // maxWidth: '85%',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',

        marginBottom: 4,
        paddingHorizontal: 7,
        // backgroundColor: 'red',
        justifyContent: 'space-between',
    },
    usernameTag: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 15,
        marginRight: 8,
        // marginLeft: 8,

        alignItems: 'center',
        paddingTop: 5,
        paddingLeft: 5,

    },
    ownusernameTag: {
        //  backgroundColor: '#fff',
        // paddingHorizontal: 5,
        // paddingVertical: 1,
        paddingTop: 5,
        paddingLeft: 5,
        borderRadius: 12,
        marginRight: 8,
    },

    usernameTagWithMargin: {
        // backgroundColor:'transparent',
        // color:'#fff !important',
    },
    username: {
        fontSize: 8,
        color: '#000000',
        fontWeight: '300',
    },
    ownusername: {
        // fontSize: 8,

        color: '#FFFFFF',
        // fontWeight: '300',
    },
    commonMessageFontStyle: {
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        fontSize: 13,
        color: "#000000"
    },
    commonFontStyle: {
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        fontSize: 10,
    },
    commonFontforDate: {
        fontFamily: 'Poppins-ExtraLight',
        fontWeight: '300',
        fontSize: 8,
    },
    //     usernewname:{
    // color:'#fff',
    //     },
    timestamp: {
        // fontSize: 8,
        color: '#000000',
    },
    owntimestamp: {
        // fontSize: 8,
        color: '#FFFFFF',
    },
    messageBubble: {
        borderRadius: 20,
        paddingVertical: 16,
        paddingTop: 6,
        // paddingHorizontal: 7,
        // minWidth: '80%',
        width: "70%",
        opacity: 0.98,
        fontSize: 8,
    },
    ownMessageBubble: {
        backgroundColor: '#000',
    },
    otherMessageBubble: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    messageContent: {
        marginBottom: 12,
        backgroundColor: 'transparent',
        // paddingHorizontal: 5,
    },
    messageTextContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 12,
        // paddingTop:0,
        flexDirection: 'row',
        alignItems: 'center',
        // width: '100%', // Increased width
    },
    messageReplyIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    messageReplyIconOther: {
        marginLeft: 8,
        marginTop: 2,
    },
    messageText: {
        // fontSize: 12,
        lineHeight: 20,
        flex: 1,
        // fontWeight: '300',


    },
    ownMessageText: {
        color: '#333',
    },
    otherMessageText: {
        color: '#333',
    },
    reactionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        //  marginLeft: 120,

        width: "100%",
        marginLeft: -10,

    },
    reaction: {
        // flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    reactionText: {
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
        fontSize: 6,
        width: "100%",
        alignItems: "center",
        left: 7,

        // color: '#FFFFFF',
    },
    ownReactionText: {
        color: '#FFFFFF',
    },
    otherReactionText: {
        color: '#333',
    },
    emojiReaction: {
        fontSize: 15,
    },
    plusOneText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#02F2F2',
    },

    // Reply-specific styles matching Figma exactly
    replyWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
    },
    ownReplyWrapper: {
        alignSelf: 'flex-end',
        // marginRight: 20,
    },
    otherReplyWrapper: {
        alignSelf: 'flex-start',
        // marginLeft: 20,
    },
    connectingLine: {
        width: 2,
        backgroundColor: '#9B9B9B',
        marginRight: 0,
        marginTop: 8,
        position: 'relative',
        top: -25,
        left: 20,
    },

    ownconnectingLine: {
        width: 2,
        backgroundColor: '#9B9B9B',
        marginRight: 0,
        marginTop: 8,
        position: 'relative',
        top: -25,
        left: 240,
    },
    ownConnectingLine: {
        height: 60,
        marginLeft: 12,
        marginRight: 0,
    },
    otherConnectingLine: {
        height: 60,
    },
    lastConnectingLine: {
        height: 30,
    },
    replyContainer: {
        flex: 1,
        maxWidth: '70%',
    },
    ownReplyContainer: {
        alignItems: 'flex-end',
    },
    otherReplyContainer: {
        alignItems: 'flex-start',
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
        paddingHorizontal: 4,
        justifyContent: 'space-between',
        // backgroundColor:'red'




    },
    replyUsername: {
        fontSize: 8,
        color: '#000',
        fontWeight: '300',
        flex: 1,
    },
    replyTimestamp: {
        fontSize: 8,
        color: '#000000',
        fontWeight: '300',

    },
    replyBubble: {
        borderRadius: 16,
        paddingTop: 6,

        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    ownReplyBubble: {
        backgroundColor: '#9B9B9B',
    },
    otherReplyBubble: {
        backgroundColor: '#9B9B9B',
    },
    replyContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 12,

    },
    replyText: {
        lineHeight: 18,
        flex: 1,
    },
    replyIcon: {
        marginLeft: 8,
        marginTop: 1,
        fontWeight: '300',
    },
    replyReactions: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        width: "100%",
        marginRight: 8,
    },
    replyReactionText: {
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
        fontSize: 6,
        width: "100%",
        alignItems: "center",
        left: 7,
        color: '#000000',
    },
    otherreplyReactionText: {
        fontFamily: 'Poppins-Medium',
        fontWeight: '500',
        fontSize: 6,
        width: "100%",
        alignItems: "center",
        left: 7,
        color: '#FFFFFF',
    },
    infoMessageContainer: {
        padding: 4,
        // paddingTop: 12,
        paddingBottom: 2,

    },
    replyIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderRadius: 50,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        // marginBottom: , // Add margin at the bottom to separate from the replying

    },
    replyIndicatorText: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        letterSpacing: -0.2,
        color: '#777777',
        // fontStyle: 'italic',
    },
    inputContainer: {
        backgroundColor: '#fff',
        paddingLeft: 20,
        paddingRight: 9,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    replyinputContainer: {
        backgroundColor: '#fff',
        paddingLeft: 20,
        paddingRight: 9,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',

    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    textInput: {
        flex: 1,
        // paddingVertical: 10,
        fontSize: 12,
        maxHeight: 100,
        // backgroundColor: 'red',
        borderWidth: 0,
        minHeight: 50,
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
    },
    sendButton: {
        marginLeft: 12,
        paddingHorizontal: 10,
    },
    floatingButton1: {
        position: 'absolute',
        left: 20,
        bottom: 100,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    floatingButton2: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuOverlay: {
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
        // zIndex: 1000,
    },
    backButton: {
        marginRight: 12,
        paddingLeft: 8,
        // paddingRight:,
    },
    compactMenu: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 8,
    },
    compactMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 6,
        fontFamily: 'Poppins-Regular',
        gap: 10
    },
    compactMenuIcon: {
        marginRight: 12,
    },
    compactMenuText: {
        fontSize: 12,
        color: '#000000',
        fontWeight: '300',
        fontFamily: 'Poppins-Light',
        letterSpacing: 0.2

    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalDeleteOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    modalContainer: {
        width: '100%',
        maxWidth: 420,

    },
    infoMessage: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },


    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#d0d0d0',
        marginRight: 12,
    },

    createModalButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignSelf: 'flex-end',
    },
    createModalButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
});
