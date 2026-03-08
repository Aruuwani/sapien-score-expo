import { getUserProfile, updateUserProfile } from '@/api/userApi';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import UnblockConfirmationModal from '../ui/UnblockConfirmationModal';
import TermsConditionsModal from '../ui/TermsConditionsModal';

interface SettingsScreenProps {
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [autoApprove, setAutoApprove] = useState(false);
    console.log('autoApprove', autoApprove);
    const [notifyScoreUpdates, setNotifyScoreUpdates] = useState(false);
    console.log('notifyScoreUpdates', notifyScoreUpdates);
    const [accountStatus, setAccountStatus] = useState(false);
    const [UserData, setUserData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');
    console.log('UserData', UserData);

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

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await getUserProfile();
            const userData = response.user;
            setAccountStatus(userData.account_status === 'true' ? true : false);
            setAutoApprove(userData.auto_approve === 'true' ? true : false);
            setNotifyScoreUpdates(userData.notify_score_updates === 'true' ? true : false);
            setUserData(userData);
        };
        fetchUserProfile();
    }, []);

    const handleToggle = useCallback(async (field: any, value: any) => {
        try {
            const updatedData = {
                ...UserData,
                [field]: value,
            };
            const response = await updateUserProfile(updatedData);
            setUserData(updatedData);
        } catch (error) {
            console.error("Update failed:", error);
        }
    }, [UserData]);

    const handleDeleteAccount = () => {
        setAccountStatus(accountStatus ? false : true);
        handleToggle("account_status", accountStatus ? false : true);
        setShowDeleteModal(false);
        router.replace('/');
        console.log("Account deletion confirmed");
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('auth_token');
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Auto approve new requests</Text>
                    <Switch
                        value={autoApprove}
                        onValueChange={(newValue) => {
                            setAutoApprove(newValue);
                            handleToggle("auto_approve", newValue);
                        }}
                        trackColor={{ false: "#D9D9D9", true: "#D9D9D9" }}
                        thumbColor={autoApprove ? '#FF8541' : '#000'}
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Notify me on score updates</Text>
                    <Switch
                        value={notifyScoreUpdates}
                        onValueChange={(newValue) => {
                            setNotifyScoreUpdates(newValue);
                            handleToggle("notify_score_updates", newValue);
                        }}
                        trackColor={{ false: "#D9D9D9", true: "#D9D9D9" }}
                        thumbColor={notifyScoreUpdates ? '#FF8541' : '#000'}
                    />
                </View>

                <View style={styles.leftTools}>
                    <TouchableOpacity style={styles.logout} onPress={() => setShowLogoutModal(true)}>
                        <Text style={styles.logoutText}>Logout</Text>
                       <MaterialIcons name="logout" size={30} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footercontent}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
                        <Text style={styles.deleteText}>delete account</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.privacyButton}
                        onPress={() => {
                            setTermsModalType('privacy');
                            setShowTermsModal(true);
                        }}
                    >
                        <Text style={styles.linkText}>privacy policy</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.linksContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            setTermsModalType('terms');
                            setShowTermsModal(true);
                        }}
                    >
                        <Text style={styles.linkText}>terms & conditions</Text>
                    </TouchableOpacity>
                    <Text style={styles.copyrightText}>Sapien world pvt ltd all rights reserved 2025</Text>
                </View>
            </View>
            <View style={styles.graySpace} />

            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Are you sure?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={styles.modalButtonCancel}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalcancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonConfirm}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <UnblockConfirmationModal
                visible={showLogoutModal}
                title="Log Out"
                message="Are you sure you want to log out?"
                options={{
                    left: {
                        text: "Cancel",
                        action: () => setShowLogoutModal(false),
                    },
                    right: {
                        text: "Log Out",
                        action: () => {
                            handleLogout();
                            setShowLogoutModal(false);
                        },
                    },
                }}
                type="logout"
            />

            <TermsConditionsModal
                visible={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                type={termsModalType}
            />
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    switchContainer: {
        width: 100, // or whatever width you prefer
        backgroundColor: 'red',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        // borderBottomWidth: 1,
        // borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 25,
        fontFamily: 'Poppins-Regular',
        // fontWeight: 'bold',
        marginLeft: 12,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: 12,
        // marginVertical: -6,
    },
    settingText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    footer: {
        paddingHorizontal: 16,
        marginBottom: 2,
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 0,
    },
    logout: {
        flexDirection: 'row', alignItems: 'center', gap: 10,

    },
    logoutText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12
    },
    footercontent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'flex-end',
    },
    leftTools: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginTop: 15,
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingTop: 3,
        paddingHorizontal: 4,
    },
    privacyButton: {
        paddingTop: 6,
    },
    deleteText: {
        fontSize: 12,
        color: '#000',
        fontWeight: 'medium',
        fontFamily: 'Poppins-Medium',
    },
    linksContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: 8,
        display: 'flex',
        gap: 6,
    },
    linkText: {
        fontSize: 10,
        color: '#000',
        marginLeft: 16,
        fontFamily: 'Poppins-Medium',
    },
    copyrightText: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginVertical: 0,
    },
    graySpace: {
        height: 150,
        backgroundColor: '#f5f5f5',
        marginHorizontal: -16,
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        width: 320,
        height: 216,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between'
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
});

export default SettingsScreen;