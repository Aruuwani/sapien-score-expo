import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getNotifications } from '../../api/notificationApi';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface NotificationItem {
    _id: string;
    user_id: string;
    created_by: {
      _id: string;
      email: string | null;
      name: string;
    };
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationScreenProps {
    onBack: () => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Italic': require('../../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
    });

    const messageItems: NotificationItem[] = [
        {
            id: '5',
            type: 'message',
            sender: 'Bhanu Prakash',
            content: 'What do you think about my performance in the last 6 months?',
            isNew: true,
            date: '23-04-2024',
        },
        {
            id: '6',
            type: 'message',
            sender: 'Shubham',
            content: 'What do you think about my performance in the last 6 months?',
            isNew: true,
            date: '23-04-2024',
        },
        {
            id: '7',
            type: 'message',
            sender: 'Jithendar',
            content: 'What do you think about my performance in the last 6 months?',
            isNew: true,
            date: '23-04-2024',
        },
        {
            id: '8',
            type: 'message',
            sender: 'Sameer Saini',
            content: 'What do you think I need to learn to be a better guitar player?',
            date: '23-04-2024',
            hasResponse: true,
            response: 'I think he can bhanu can be better at playing guitar if he practices more on strumming and tuning. Watch and learn from performers',
        },
    ];

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
    const items = activeTab === 'notifications' ? notifications : messageItems;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
            const data: NotificationItem[] = await getNotifications();
            const sorted = data.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
                setNotifications(sorted);
                setLoading(false)
          } catch (error) {
                console.error('Error fetching notifications:', error);
                setLoading(false)
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
    }, []);

    if (!fontsLoaded) {
        return null; // or a loading spinner
    }

    const renderNotificationItem = (item: NotificationItem) => {
        if (activeTab === 'notifications') {
            return (
                <View key={item._id} style={styles.notificationItem}>
                    <Text style={styles.notificationText}>
                        {/* <Text style={styles.boldText}>{item.created_by?.name || 'System'} </Text> */}
                        {item.message}
                    </Text>
                </View>
            );
        } else {
            return (
                <View key={item.id} style={styles.messageItem}>
                    <View style={styles.messageHeader}>
                        <View>
                            <Text style={styles.messageSender}>{item.sender} asks</Text>
                        </View>
                        <Text style={styles.messageDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.messageContent}>{item.content}</Text>

                    {!item.hasResponse ? (
                        <TouchableOpacity style={styles.respondButton}>
                            <Text style={styles.respondButtonText}>respond</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.responseContainer}>
                            <Text style={styles.responseLabel}>your response</Text>
                            <Text style={styles.responseText}>{item.response}</Text>
                        </View>
                    )}
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages & Alerts</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
                    onPress={() => setActiveTab('notifications')}
                >
                    <View style={styles.tabContentWrapper}>
                        <Text style={styles.tabText}>Notifications</Text>
                        {activeTab === 'messages' && <View style={styles.redDot} />}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
                    // onPress={() => setActiveTab('messages')}
                >
                    <View style={styles.tabContentWrapper}>
                        {/* <Text style={styles.tabText}>Messages</Text> */}
                        {/* {activeTab === 'notifications' && <View style={styles.redDot} />} */}
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={loading ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : null} style={styles.content}>
            {loading ? (
                <ActivityIndicator size="large" color="#FF8541" />
            ) : items.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 16 }}>No new Notification</Text>
                </View>
            ) : (
                items.map(item => renderNotificationItem(item))
            )}
            </ScrollView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-semiBold',
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: "#F3F3F3",
        paddingTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: "white",
    },
    tabContentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 15,
        color: "#000000",
        fontFamily: "Poppins-Medium",
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF0000',
        marginLeft: 6,
    },
    content: {
        flex: 1,
    },
    notificationItem: {
        padding: 10,
        marginTop: 12,
        marginLeft: 15,
        marginRight: 15,
        backgroundColor: '#F3F3F3',
        borderRadius: 10,
    },
    notificationText: {
        fontSize: 12,
        lineHeight: 20,
        fontFamily: "Poppins-Medium",
    },
    boldText: {
        // fontFamily: 'Poppins-semiBold',
    },
    messageItem: {
        padding: 16,
        marginHorizontal: 15,
        marginVertical: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageSender: {
        fontSize: 14,
        fontFamily: 'Poppins-semiBold',
        color: '#000000',
    },
    messageDate: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    messageContent: {
        fontSize: 14,
        marginBottom: 12,
        fontFamily: 'Poppins-Regular',
        color: '#333333',
        lineHeight: 20,
    },
    respondButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#FFC48C',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    respondButtonText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
    },
    responseContainer: {
        marginTop: 10,
    },
    responseLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        fontFamily: 'Poppins-Regular',
    },
    responseText: {
        fontSize: 14,
        color: '#000',
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },
});

export default NotificationScreen;