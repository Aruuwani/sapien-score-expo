import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getUserProfile, updateUserProfile, UploadFile } from '../../api/userApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileScreenProps {
    onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
    const [imageURL, setImageURL] = useState<string>('');
    const [isActiveSocialEnabled, setIsActiveSocialEnabled] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDisplayUsernameEnabled, setIsDisplayUsernameEnabled] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false); // New state for image upload

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    });

    if (!fontsLoaded) {
        console.log('fonts not loaded');
    }
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
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: '',
        workEmail: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        profession: '',
        website: '',
        profileURL: imageURL,
        display_username: isDisplayUsernameEnabled,
        activate_social_profile: isActiveSocialEnabled,
        auto_approve: '',
        notify_score_updates: '',
        account_status: '',
    });

    useEffect(() => {
        const fetchUserProfileData = async () => {
            try {
                const response = await getUserProfile();
                const userData = response.user;
                setProfileData({
                    name: userData.name,
                    phone: userData.phone_number,
                    email: userData.email,
                    workEmail: userData.work_email,
                    facebook: userData.social_links?.facebook,
                    instagram: userData.social_links?.instagram,
                    linkedin: userData.social_links?.linkedin,
                    profession: userData.profession,
                    website: userData.website,
                    profileURL: userData.photo_url,
                    display_username: userData.display_username,
                    activate_social_profile: userData.activate_social_profile,
                    auto_approve: userData.auto_approve,
                    notify_score_updates: userData.notify_score_updates,
                    account_status: userData.account_status,
                });
                setImageURL(userData.photo_url);
                setIsActiveSocialEnabled(userData.activate_social_profile);
                setIsDisplayUsernameEnabled(userData.display_username);
            } catch (error) {
                await AsyncStorage.removeItem('auth_token');
                console.error('Failed to fetch user profile data:', error);
            }
        };
        fetchUserProfileData();
    }, []);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setIsUploadingImage(true); // Start loader
            try {
                const selectedImage = result.assets[0];
                const url = await UploadFile(selectedImage);
                if (url) {
                    setImageURL(url);
                    console.log('url', url);
                }
            } catch (error) {
                console.error('Failed to upload image:', error);
                alert('Failed to upload image. Please try again.');
            } finally {
                setIsUploadingImage(false); // Stop loader
            }
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const responsee = await getUserProfile();
            const userData = responsee.user;
            const updatedData = {
                name: profileData.name,
                phone_number: userData.phone_number ? undefined : (profileData.phone === null || profileData.phone === '') ? undefined : profileData.phone,
                email: profileData.email,
                work_email: userData.work_email ? undefined : (profileData.workEmail === null || profileData.workEmail === '') ? undefined : profileData.workEmail,
                social_links: {
                    facebook: profileData.facebook,
                    instagram: profileData.instagram,
                    linkedin: profileData.linkedin,
                },
                profession: profileData.profession,
                website: profileData.website,
                photo_url: imageURL || profileData.profileURL,
                display_username: isDisplayUsernameEnabled,
                activate_social_profile: isActiveSocialEnabled,
                account_status: profileData.account_status,
                auto_approve: profileData.auto_approve,
                notify_score_updates: profileData.notify_score_updates
            };
            const response = await updateUserProfile(updatedData);
            setCustomMessage('Profile updated successfully');
            setTimeout(() => setCustomMessage(''), 2000);
            console.log('Profile updated successfully', response);
        } catch (error) {
            setCustomMessage(error.response?.data?.error || error.message);
            setTimeout(() => setCustomMessage(''), 2000);
            if (error.response?.data?.error === 'Phone number already registered') {
                setProfileData({
                    ...profileData,
                    phone: '',
                });
            } else {
                setProfileData({
                    ...profileData,
                    workEmail: '',
                });
                console.log('error', error.response?.data?.error || error.message);
            }
            console.error('Failed to update profile', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" /> */}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView style={styles.contentContainer}>
                {/* Profile Picture */}
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileImage}>
                        {isUploadingImage ? (
                            <ActivityIndicator size="large" color="#FF8541" style={StyleSheet.absoluteFillObject} />
                        ) : imageURL ? (
                            <Image
                                source={{ uri: imageURL }}
                                style={StyleSheet.absoluteFillObject}
                                resizeMode="cover"
                            />
                        ) : (
                            <Feather name="user" size={100} color="#fff" />
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.editImageButton, isUploadingImage && { opacity: 0.5 }]}
                        onPress={pickImage}
                        disabled={isUploadingImage} // Disable button during upload
                    >
                        <Feather name="edit" size={16} color="#000" style={{ marginBottom: -5 }} />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.profileInfoSection}>
                    <ProfileInfoItem
                        label="Name"
                        field="name"
                        value={profileData.name || 'N/A'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, name: val }))}
                    />
                    <ProfileInfoItem
                        label="Phone"
                        field="phone"
                        value={profileData.phone || 'N/A'}

                        editable={profileData.phone ? false : true}

                        onChange={(val) => {
                            const formattedVal = val.startsWith('+91') ? val : `+91${val}`;
                            setProfileData((prev) => ({ ...prev, phone: formattedVal }));
                        }}
                    />
                    <ProfileInfoItem
                        label="Email"
                        field="email"
                        value={profileData.email || 'N/A'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, email: val }))}
                    />
                    <ProfileInfoItem
                        label="Work Email"
                        field="work_email"
                        value={profileData.workEmail || 'N/A'}
                        editable={profileData.workEmail ? false : true}
                        onChange={(val) => setProfileData((prev) => ({ ...prev, workEmail: val }))}
                    />
                    <ProfileInfoItem
                        label="Facebook"
                        field="facebook"
                        isLink
                        value={profileData.facebook || 'https://www.facebook.com/'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, facebook: val }))}
                    />
                    <ProfileInfoItem
                        label="Instagram"
                        field="instagram"
                        isLink
                        value={profileData.instagram || 'https://www.instagram.com/'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, instagram: val }))}
                    />
                    <ProfileInfoItem
                        label="LinkedIn"
                        field="linkedin"
                        isLink
                        value={profileData.linkedin || 'https://www.linkedin.com/'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, linkedin: val }))}
                    />
                    <ProfileInfoItem
                        label="Profession"
                        field="profession"
                        value={profileData.profession || 'N/A'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, profession: val }))}
                    />
                    <ProfileInfoItem
                        label="Website"
                        field="website"
                        isLink
                        value={profileData.website || 'https://www.example.com/'}
                        editable
                        onChange={(val) => setProfileData((prev) => ({ ...prev, website: val }))}
                    />
                </View>

                {/* Active Social Profile Section */}
                <View style={styles.toggleSection}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleLabel}>Active Social Profile</Text>
                            <View style={styles.container}>
                                <Text style={styles.toggleDescription}>• display your top scored topics</Text>
                                <Text style={styles.toggleDescription}>• collaborate with larger groups</Text>
                                <Text style={styles.toggleDescription}>• promote your personal brand</Text>
                            </View>
                        </View>


                        <Switch
                            trackColor={{ false: '#ddd', true: '#ddd' }}
                            thumbColor={isActiveSocialEnabled === true ? '#FF8541' : '#000'}
                            onValueChange={setIsActiveSocialEnabled}
                            value={isActiveSocialEnabled}
                            style={styles.toggleswitch}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleLabel}>Display Username</Text>
                            <Text style={styles.toggleDescription}>
                                show only your username to your sapien {'\n'} group and echo room messages
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#ddd', true: '#ddd' }}
                            thumbColor={isDisplayUsernameEnabled === true ? '#FF8541' : '#000'}
                            onValueChange={setIsDisplayUsernameEnabled}
                            value={isDisplayUsernameEnabled}
                        />
                    </View>

                    <View style={styles.bottomSpacing}>
                        <TouchableOpacity onPress={handleUpdateProfile} disabled={isUpdating}>
                            <Text style={[styles.editbtn, isUpdating && { opacity: 0.5 }]}>
                                {isUpdating ? 'Updating...' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
        </SafeAreaView>
    );
};

// ProfileInfoItem component remains unchanged
interface ProfileInfoItemProps {
    label: string;
    field: string;
    value: string;
    isLink?: boolean;
    editable?: boolean;
    onChange?: (value: string) => void;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({
    label,
    value,
    field,
    isLink = false,
    editable = false,
    onChange,
}) => {
    const scrollViewRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);

    useEffect(() => {
        setText(value || '');
    }, [value]);

    const handleEditPress = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });

        if (editable) {
            setIsEditing(true);
        }
    };


    const handleBlur = () => {
        setIsEditing(false);
        if (onChange) {
            onChange(text);
        }
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.container}
        >

            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <View style={styles.infoContent}>
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={text}
                            onChangeText={setText}
                            onBlur={handleBlur}
                            autoFocus
                        />
                    ) : (
                        <Text style={[styles.infoValue, isLink && { color: 'blue' }]}>{text}</Text>
                    )}
                    {editable && (
                        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                            <Feather name="edit" size={16} color="#333" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

// Updated styles (no changes needed, but included for completeness)
const styles = StyleSheet.create({
    editbtn: {
        backgroundColor: '#FF8541',
        fontFamily: 'Poppins-Regular',
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 7,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        fontWeight: '500',
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
        borderRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Poppins-Regular',
    },
    input: {
        fontSize: 16,
        paddingVertical: 4,
        minWidth: 200,
        paddingRight: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingTop: 20,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: '400',
        marginLeft: 12,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    contentContainer: {
        flex: 1,
        marginBottom: 70,
    },
    profileImageContainer: {
        alignItems: 'flex-start',
        marginTop: 20,
        marginBottom: 24,
        position: 'relative',
        paddingLeft: 20,
    },
    profileImage: {
        width: 180,
        height: 180,
        borderRadius: 180,
        overflow: 'hidden',
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF8541',
    },
    editImageButton: {
        position: 'absolute',
        right: '43%',
        bottom: 4,
        width: 15,
        height: 15,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfoSection: {
        paddingVertical: 0,
        paddingHorizontal: 20,
        paddingBottom: 53,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        color: '#333333',
        flex: 1,
        lineHeight: 13.68,
        letterSpacing: -0.24,
        fontWeight: '300',
    },
    infoContent: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    infoValue: {
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 15.6,
        letterSpacing: 0.1,
        textAlign: 'right',
        color: 'black',
        height: 'auto',
    },
    editButton: {
        padding: 4,
        paddingLeft: 11,
    },
    toggleSection: {
        paddingTop: 40,
        paddingLeft: 20,
        paddingRight: 30,
        backgroundColor: '#fff',
        paddingBottom: 127,
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    toggleLabel: {
        fontFamily: 'Poppins-Regular',
        fontWeight: '400',
        fontSize: 15,
        lineHeight: 17.1,
        letterSpacing: -0.3,
        color: '#333333',
        marginBottom: 5,
    },
    toggleDescription: {
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        fontSize: 10,
        lineHeight: 11.4,
        letterSpacing: -0.2,
        color: '#333333',
        paddingTop: 4,
        paddingBottom: 1,
    },
    bulletListContainer: {
        marginTop: 4,
    },
    bulletItem: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    switchStyle: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    absoluteFillObject: {
        padding: 40,
    },
    saveButtonContainer: {
        padding: 15,
        backgroundColor: '#F3F3F3',
    },
    toggleswitch: {
        width: 40,
        height: 15,
    },
    bottomSpacing: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
});

export default ProfileScreen;