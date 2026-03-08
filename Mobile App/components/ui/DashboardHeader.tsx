import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react'
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { Feather, Ionicons } from '@expo/vector-icons';

type Props = {}

const DashboardHeader = (props: Props) => {


    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [showName, setShowName] = useState(false);

    const handleMenuPress = () => {
        setCurrentScreen('profile');
    };

    const handleSettingsPress = () => {
        setCurrentScreen('settings');
    };

    const handleNotificationsPress = () => {
        setCurrentScreen('notifications');
    };

    const handleBackToMain = () => {
        setCurrentScreen('dashboard');

    };



    if (currentScreen === 'profile') {
        return <ProfileScreen onBack={handleBackToMain} />;
    }

    if (currentScreen === 'settings') {
        return <SettingsScreen onBack={handleBackToMain} />;
    }

    if (currentScreen === 'notifications') {
        return <NotificationScreen onBack={handleBackToMain} />;
    }

    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
                    <Feather name="menu" size={22} color="#000" />
                </TouchableOpacity>

                <View style={styles.passwordContainer}>
                    {showName ? (
                        <Text style={styles.hiddenPassword}>John Doe</Text>
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
                <View style={styles.rightTools}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
                        <Ionicons name="settings-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
                        <View style={styles.badgeContainer}>
                            <Feather name="message-square" size={22} color="#000" />
                            <View style={styles.badge} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 5,
        paddingHorizontal: 16,
    },
    menuButton: {
        padding: 2,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
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
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    privateProfileText: {
        fontSize: 11,
        color: '#333',
    },
    topTools: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        marginTop: 4,
    },
    rightTools: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 6,
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
})

export default DashboardHeader