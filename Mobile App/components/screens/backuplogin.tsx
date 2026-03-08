import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
// Import the function for initializing app
import { initializeApp } from 'firebase/app';
import { LogBox } from 'react-native';
import {
    getAuth,
    PhoneAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { Feather } from '@expo/vector-icons';

// Your Firebase configuration from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyD0JJbwZqWyweNNBSF--FvMXV-43RY8MOc",
    authDomain: "sapiens-91cfc.firebaseapp.com",
    projectId: "sapiens-91cfc",
    storageBucket: "sapiens-91cfc.firebasestorage.app",
    messagingSenderId: "222609790187",
    appId: "1:222609790187:android:c4ca8886f1ad7dfe141aae"
};

LogBox.ignoreLogs([
    'Warning: FirebaseRecaptcha: Support for defaultProps will be removed from function components'
]);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface LoginScreenProps {
    onProceed?: (data: { email?: string; phone?: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onProceed }) => {
    const recaptchaVerifier: any = useRef(null);
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': Poppins_400Regular,
        'Poppins-Medium': Poppins_500Medium,
        'Poppins-Bold': Poppins_700Bold
    });

    const [email, setEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [emailTimer, setEmailTimer] = useState(0);
    const [phoneTimer, setPhoneTimer] = useState(0);
    const [emailTimerActive, setEmailTimerActive] = useState(false);
    const [phoneTimerActive, setPhoneTimerActive] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            if (emailTimer > 0 && emailTimerActive) {
                setEmailTimer(prev => prev - 1);
            } else if (emailTimer === 0 && emailTimerActive) {
                setEmailTimerActive(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [emailTimer, emailTimerActive]);

    useEffect(() => {
        let interval = setInterval(() => {
            if (phoneTimer > 0 && phoneTimerActive) {
                setPhoneTimer(prev => prev - 1);
            } else if (phoneTimer === 0 && phoneTimerActive) {
                setPhoneTimerActive(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [phoneTimer, phoneTimerActive]);

    const sendEmailOtp = () => {
        if (email.trim() === '') {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        // Here you would call your API to send OTP via email
        Alert.alert('Success', 'OTP sent to your email');
        setEmailTimer(23);
        setEmailTimerActive(true);
    };

    const sendPhoneOtp = async () => {
        if (phone.trim() === '') {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }

        // Format phone number with country code if not present
        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`; // Add default country code as needed
        }

        try {
            setLoading(true);

            // Ensure the recaptchaVerifier is ready
            if (!recaptchaVerifier.current) {
                throw new Error('reCAPTCHA verifier is not initialized');
            }

            // Send verification code via SMS using Firebase
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(
                formattedPhone,
                recaptchaVerifier.current
            );

            setVerificationId(verificationId);
            setPhoneTimer(23);
            setPhoneTimerActive(true);
            Alert.alert('Success', 'OTP sent to your phone');
        } catch (error) {
            console.error('Error sending OTP:', error);
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resendEmailOtp = () => {
        if (!emailTimerActive) {
            sendEmailOtp();
        }
    };

    const resendPhoneOtp = () => {
        if (!phoneTimerActive) {
            sendPhoneOtp();
        }
    };

    const verifyPhoneOtp = async () => {
        if (!phoneOtp || phoneOtp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);

            // Create credential using verification ID and OTP
            const credential = PhoneAuthProvider.credential(
                verificationId,
                phoneOtp
            );

            // Sign in with credential
            await signInWithCredential(auth, credential);

            if (onProceed) {
                onProceed({ phone });
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            Alert.alert('Error', 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = (): void => {
        if (!email && !phone) {
            Alert.alert('Error', 'Please enter either email or phone number');
            return;
        }

        if (email && emailOtp) {
            // Check if OTP length is 6
            if (emailOtp.length === 6) {
                // Verify email OTP here
                if (onProceed) {
                    onProceed({ email });
                }
            } else {
                Alert.alert('Error', 'Please enter a valid 6-digit OTP for email');
            }
        } else if (phone && phoneOtp) {
            // Verify phone OTP with Firebase
            verifyPhoneOtp();
        } else {
            // Alert if OTP is missing for email or phone
            Alert.alert('Error', 'Please enter the OTP for email or phone');
        }
    };

    if (!fontsLoaded) {
        return null; // Or return a loading component
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Firebase reCAPTCHA verifier - Set to invisible */}
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig}
                attemptInvisibleVerification={true}
            />

            {/* <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" /> */}
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Share your feelings{'\n'}and find out theirs.</Text>
                <Text style={styles.subHeader}>anonymously</Text>
            </View>

            <View style={styles.inputSection}>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={[styles.input, styles.emailInput]}
                        placeholder="Enter work mail"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.sendOtpButton}
                        onPress={sendEmailOtp}
                        disabled={emailTimerActive || loading}
                    >
                        <Feather name='send' size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#888"
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TouchableOpacity onPress={resendEmailOtp} disabled={emailTimerActive || loading}>
                    <Text style={styles.resend}>
                        <Text style={styles.bold}>resend OTP</Text> {emailTimerActive ? `in ${emailTimer} seconds` : ''}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.or}>or</Text>

                <View style={styles.inputWithButton}>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter Phone number"
                        placeholderTextColor="#888"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                    <TouchableOpacity
                        style={styles.sendOtpButton}
                        onPress={sendPhoneOtp}
                        disabled={phoneTimerActive || loading}
                    >
                        <Feather name='send' size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor="#888"
                    value={phoneOtp}
                    onChangeText={setPhoneOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TouchableOpacity onPress={resendPhoneOtp} disabled={phoneTimerActive || loading}>
                    <Text style={styles.resend}>
                        <Text style={styles.bold}>resend OTP</Text> {phoneTimerActive ? `in ${phoneTimer} seconds` : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.proceedButton}
                onPress={handleProceed}
                disabled={loading}
            >
                <Text style={styles.proceedText}>Proceed</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 25,
        justifyContent: 'space-between',
    },
    headerContainer: {
        marginTop: 40,
    },
    header: {
        fontSize: 22,
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-Regular',
        lineHeight: 30,
    },
    subHeader: {
        fontSize: 22,
        textAlign: 'center',
        color: '#ff8653',
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
    },
    inputSection: {
        marginTop: 20,
    },
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 18,
        fontSize: 16,
        marginTop: 15,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    emailInput: {
        flex: 1,
        marginTop: 0,
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 18,
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        marginRight: 10,
    },
    sendOtpButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendOtpText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
    },
    resend: {
        fontSize: 13,
        color: '#333',
        textAlign: 'right',
        marginTop: 6,
        fontFamily: 'Poppins-Regular',
    },
    bold: {
        fontFamily: 'Poppins-Bold',
    },
    or: {
        textAlign: 'center',
        marginVertical: 15,
        color: '#555',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    proceedButton: {
        alignSelf: 'flex-end',
        marginBottom: 40,
    },
    proceedText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#000',
        fontFamily: 'Poppins-Medium',
    },
});

export default LoginScreen;