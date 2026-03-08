import { sendEmailOTP, SendPhoneOTP, verifyEmailOTP, verifyPhoneOTP } from '@/api/authApi';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';



interface LoginScreenProps {
    onProceed: (data: { email?: string; phone?: string }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onProceed }) => {

    const scrollViewRef = useRef<ScrollView>(null);

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
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
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Validation states
    const [emailError, setEmailError] = useState(false);
    const [emailOtpError, setEmailOtpError] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [phoneOtpError, setPhoneOtpError] = useState(false);

    // Loading states
    const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
    const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    // Custom message state
    const [customMessage, setCustomMessage] = useState('');
    const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageTriggerIdRef = useRef<string | null>(null);

    // Generate unique trigger ID
    const generateTriggerId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;


    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                // await AsyncStorage.clear()
            }
        }
        getToken()
    }, [AsyncStorage.getItem('auth_token')]);
    // Show custom message
    const showCustomMessage = (message: string, triggerId: string) => {
        if (messageTriggerIdRef.current === triggerId) {
            return;
        }


        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
            messageTimeoutRef.current = null;
        }

        messageTriggerIdRef.current = triggerId;
        setCustomMessage(message);

        messageTimeoutRef.current = setTimeout(() => {
            setCustomMessage('');
            messageTriggerIdRef.current = null;
            messageTimeoutRef.current = null;
        }, 3000);
    };

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (messageTimeoutRef.current) {
                clearTimeout(messageTimeoutRef.current);
            }
        };
    }, []);

    // Reset errors on input change
    useEffect(() => {
        if (email) setEmailError(false);
    }, [email]);

    useEffect(() => {
        if (emailOtp) setEmailOtpError(false);
    }, [emailOtp]);

    useEffect(() => {
        if (phone) setPhoneError(false);
    }, [phone]);

    useEffect(() => {
        if (phoneOtp) setPhoneOtpError(false);
    }, [phoneOtp]);






    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Email timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (emailTimerActive && emailTimer > 0) {
            interval = setInterval(() => {
                setEmailTimer(prev => {
                    const newValue = prev - 1;
                    if (newValue <= 0) {
                        clearInterval(interval!);
                        setEmailTimerActive(false);
                        return 0;
                    }
                    return newValue;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [emailTimerActive, emailTimer]);

    // Phone timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (phoneTimerActive && phoneTimer > 0) {
            interval = setInterval(() => {
                setPhoneTimer(prev => {
                    const newValue = prev - 1;
                    if (newValue <= 0) {
                        clearInterval(interval!);
                        setPhoneTimerActive(false);
                        return 0;
                    }
                    return newValue;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [phoneTimerActive, phoneTimer]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        return phone.length >= 10;
    };


    const handleSendEmailOtp = async () => {
        if (email.trim() === '') {
            setEmailError(true);
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(true);
            showCustomMessage('Please enter a valid email address', generateTriggerId());
            return;
        }

        const triggerId = generateTriggerId();
        try {
            setSendingEmailOtp(true);
            const res = await sendEmailOTP(email);
            showCustomMessage('OTP sent successfully', triggerId);

            setEmailTimer(23);
            setEmailTimerActive(true);
        } catch (error: any) {
            showCustomMessage(error.error || error.message || 'Failed to send OTP', triggerId);
        } finally {
            setSendingEmailOtp(false);
        }
    };

    const sendPhoneOtp = async () => {
        if (phone.trim() === '') {
            setPhoneError(true);
            return;
        }

        if (!validatePhone(phone)) {
            setPhoneError(true);
            showCustomMessage('Please enter a valid phone number', generateTriggerId());
            return;
        }

        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`;
        }

        const triggerId = generateTriggerId();
        try {
            setSendingPhoneOtp(true);
            await SendPhoneOTP(formattedPhone).then((res: any) => {
                setVerificationId(verificationId);
                showCustomMessage('OTP sent successfully', triggerId);

                setPhoneTimer(23);
                setPhoneTimerActive(true);

            });
        } catch (error: any) {
            showCustomMessage(error.error || error.message || 'Failed to send OTP', triggerId);
            console.log('error', error)

        } finally {
            setSendingPhoneOtp(false);
        }
    };

    const resendEmailOtp = () => {
        if (!emailTimerActive && !sendingEmailOtp) {
            handleSendEmailOtp();
        }
    };

    const resendPhoneOtp = () => {
        if (!phoneTimerActive && !sendingPhoneOtp) {
            sendPhoneOtp();
        }
    };

    const verifyPhoneOtp = async () => {
        if (!phoneOtp || phoneOtp.length !== 6) {
            setPhoneOtpError(true);
            return;
        }

        const triggerId = generateTriggerId();
        try {
            setVerifyingOtp(true);
            let formattedPhone = phone;
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = `+91${formattedPhone}`;
            }
            const response = await verifyPhoneOTP(formattedPhone, phoneOtp);
            console.log('response', response)
          
            if (response.token) {
                 await AsyncStorage.setItem('auth_token', response.token);
                if (onProceed) {
                     onProceed({ email: email, phone: formattedPhone });
                }
            }

        } catch (error: any) {
            let errorMessage = 'Failed to verify OTP. Please try again.';
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'The verification code is invalid. Please check and try again.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'The verification code has expired. Please request a new code.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            showCustomMessage(errorMessage, triggerId);
        } finally {
            setVerifyingOtp(false);
        }
    };

    const verifyEmailOtp = async () => {
        if (!emailOtp || emailOtp.length !== 6) {
            setEmailOtpError(true);
            return;
        }

        const triggerId = generateTriggerId();
        try {
            setVerifyingOtp(true);
            const response = await verifyEmailOTP(email, emailOtp);
            console.log('responseravan', response.token);
          
            if (response?.token) {
              await AsyncStorage.setItem('auth_token', response.token);
          
              // ✅ Immediately read it back to verify
              const storedToken = await AsyncStorage.getItem('auth_token');
              console.log('Stored token from AsyncStorage:', storedToken);
          
              if (onProceed) {
                onProceed({ email: email, phone: "" });
           }
            }
          } catch (error: any) {
            showCustomMessage(
              error.error || error.message || 'Failed to verify email OTP. Please try again.',
              triggerId
            );
          } finally {
            setVerifyingOtp(false);
          }
          
    };


    // const verifyEmailOtp = async () => {


    //     try {
    //         setVerifyingOtp(true);

    //         // Simulate API call to verify email OTP
    //         // Replace this with your actual API call
    //         await new Promise((resolve) => setTimeout(resolve, 1000));
    //         // setModalVisible(true);

    //         // If successful
    //         if (onProceed) {
    //             onProceed({ email });
    //         }
    //     } catch (error: any) {

    //     } finally {
    //         setVerifyingOtp(false);
    //     }
    // };

    const handleProceed = async () => {
        let hasError = false;
        const triggerId = generateTriggerId();

        if (!email && !phone) {
            setEmailError(true);
            setPhoneError(true);
            hasError = true;
        }

        if (email && !emailOtp) {
            setEmailOtpError(true);
            hasError = true;
        }

        if (phone && !phoneOtp) {
            setPhoneOtpError(true);
            hasError = true;
        }

        if (hasError) {
            showCustomMessage('Please fill in either Email or Phone Number', triggerId);
            return;
        }

        if (email && emailOtp) {
            if (emailOtp.length === 6) {
                await verifyEmailOtp();
            } else {
                setEmailOtpError(true);
                showCustomMessage('Please enter a valid 6-digit OTP', triggerId);
            }
        } else if (phone && phoneOtp) {
            if (phoneOtp.length === 6) {
                await verifyPhoneOtp();
            } else {
                setPhoneOtpError(true);
                showCustomMessage('Please enter a valid 6-digit OTP', triggerId);
            }

        }
    };

    const isAnyLoading = sendingEmailOtp || sendingPhoneOtp || verifyingOtp;

    const handleFocus = (inputPosition: number) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: inputPosition, animated: true });
        }, 100);
    };


    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
            >
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={[
                        styles.scrollContainer,
                        keyboardVisible && styles.scrollContainerWithKeyboard
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                    keyboardDismissMode="interactive"
                >
                    <View style={[
                        styles.headerContainer,
                        keyboardVisible && styles.headerContainerWithKeyboard
                    ]}>
                        <Text style={styles.header}>Share your thoughts {'\n'}and find out theirs.</Text>
                        <Text style={styles.subHeader}>anonymously</Text>
                    </View>
                    <View style={styles.inputSection}>
                        <View style={styles.inputWithIconContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.inputWithIcon,
                                    emailError && styles.inputError
                                ]}
                                placeholder="Enter work mail"
                                placeholderTextColor="#555555"
                                value={email}
                                onChangeText={isAnyLoading ? () => { } : setEmail} // Prevent changes during loading
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => handleFocus(0)}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    (!email || !validateEmail(email) || emailTimerActive || sendingEmailOtp || isAnyLoading) && styles.disabledButton
                                ]}
                                onPress={resendEmailOtp}
                                disabled={!email || !validateEmail(email) || emailTimerActive || sendingEmailOtp || isAnyLoading}
                            >
                                {sendingEmailOtp ? (
                                    <ActivityIndicator size="small" color="#ff8653" />
                                ) : (
                                    <Feather name='send' size={24} color="#000" />
                                )}
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    (emailTimerActive || sendingEmailOtp) && styles.disabledButton
                                ]}
                                onPress={resendEmailOtp}
                                disabled={ !email || emailTimerActive || sendingEmailOtp || isAnyLoading}
                            >
                                {sendingEmailOtp ? (
                                    <ActivityIndicator size="small" color="#ff8653" />
                                ) : (
                                    <Feather name='send' size={24} color="red" />
                                )}
                            </TouchableOpacity> */}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                emailOtpError && styles.inputError
                            ]}
                            placeholder="Enter OTP"
                            placeholderTextColor="#555555"
                            value={emailOtp}
                            onChangeText={isAnyLoading ? () => { } : setEmailOtp} // Prevent changes during loading
                            keyboardType="number-pad"
                            maxLength={6}
                            onFocus={() => handleFocus(80)}
                        />
                        <TouchableOpacity
                            onPress={resendEmailOtp}
                            disabled={emailTimerActive || sendingEmailOtp || isAnyLoading}
                        >
                            <Text style={[
                                styles.resend,
                                (emailTimerActive || sendingEmailOtp) && styles.disabledText
                            ]}>
                                <Text style={styles.bold}>resend OTP</Text> {emailTimerActive ? `in ${emailTimer} seconds` : ''}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.or}>or</Text>
                        <View style={styles.inputWithIconContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.inputWithIcon,
                                    phoneError && styles.inputError
                                ]}
                                placeholder="Enter Phone number"
                                placeholderTextColor="#555555"
                                value={phone}
                                onChangeText={isAnyLoading ? () => { } : setPhone} // Prevent changes during loading
                                keyboardType="phone-pad"
                                onFocus={() => handleFocus(180)}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    (!phone || !validatePhone(phone) || phoneTimerActive || sendingPhoneOtp || isAnyLoading) && styles.disabledButton
                                ]}
                                onPress={sendPhoneOtp}
                                disabled={phoneTimerActive || sendingPhoneOtp || isAnyLoading}
                            >
                                {sendingPhoneOtp ? (
                                    <ActivityIndicator size="small" color="#ff8653" />
                                ) : (
                                    <Feather name='send' size={24} color="#000" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                phoneOtpError && styles.inputError
                            ]}
                            placeholder="Enter OTP"
                            placeholderTextColor="#555555"
                            value={phoneOtp}
                            onChangeText={isAnyLoading ? () => { } : setPhoneOtp} // Prevent changes during loading
                            keyboardType="number-pad"
                            maxLength={6}
                            onFocus={() => handleFocus(260)}
                        />
                        <TouchableOpacity
                            onPress={resendPhoneOtp}
                            disabled={phoneTimerActive || sendingPhoneOtp || isAnyLoading}
                        >
                            <Text style={[
                                styles.resend,
                                (phoneTimerActive || sendingPhoneOtp) && styles.disabledText
                            ]}>
                                <Text style={styles.bold}>resend OTP</Text> {phoneTimerActive ? `in ${phoneTimer} seconds` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.proceedButtonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.proceedButton,
                                verifyingOtp && styles.proceedButtonDisabled
                            ]}
                            onPress={handleProceed}
                            disabled={isAnyLoading}
                        >
                            {verifyingOtp ? (
                                <View style={styles.proceedButtonLoader}>
                                    <ActivityIndicator size="small" color="#ff8653" />
                                    <Text style={styles.proceedText}>Verifying...</Text>
                                </View>
                            ) : (
                                <Text style={styles.proceedText}>Proceed</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {isAnyLoading && (
                <View style={styles.overlayContainer}>
                    <View style={styles.overlay} />
                </View>
            )}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '',
        width: '100%',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingBottom: 20,
    },
    scrollContainerWithKeyboard: {
        paddingBottom: 60,
    },
    headerContainer: {
        marginTop: 40,
        marginBottom: 100,
        paddingHorizontal: 10,
    },
    headerContainerWithKeyboard: {
        marginTop: 20,
        marginBottom: 20,
    },
    header: {
        fontSize: 30,
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-Light',
        lineHeight: 37,
        // fontWeight: '300',
        marginTop: 20,
        verticalAlign: "middle",
        maxWidth: 334,
        alignSelf: 'center',

    },
    subHeader: {
        fontSize: 25,
        textAlign: 'center',
        color: '#FF8541',
        fontFamily: 'Poppins-Medium',
        // fontWeight: '500',
        verticalAlign: "middle",
        marginTop: -7
    },
    inputSection: {
        marginBottom: 20,
    },


    disabledButton: {
        opacity: .3,
    },

    inputWithIconContainer: {
        position: 'relative',
        marginTop: 15,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 0,
        paddingHorizontal: 18,
        fontSize: 22,
        marginTop: 15,
        textAlign: 'center',
        fontFamily: 'Poppins-Light',
        // fontWeight: "300",
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputError: {
        borderColor: '#FF0000',
        borderWidth: 2,
    },
    inputWithIcon: {
        paddingRight: 60,
        marginTop: 0,
    },
    iconButton: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -20 }],
        padding: 8,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        zIndex: 2,
        opacity: 1,

        // backgroundColor: '#ff8653',

    },

    // disabledButton: {
    // },
    disabledText: {
        color: '#999',
    },
    resend: {
        fontSize: 12,
        color: '#000000',
        textAlign: 'right',
        marginTop: 6,
        fontFamily: 'Poppins-Medium',
        // fontWeight: "600",

    },
    bold: {
        fontFamily: "Poppins-Bold",
    },
    or: {
        textAlign: 'center',
        marginVertical: 15,
        color: '#555',
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        fontWeight: "200",
        verticalAlign: "middle"
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
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
        maxWidth: 280,
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
    proceedButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 40,
        marginBottom: 40,
    },
    proceedButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proceedButtonDisabled: {
        opacity: 0.7,
    },
    proceedButtonLoader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    proceedText: {
        fontSize: 25,
        // fontWeight: '400',
        color: '#000',
        fontFamily: 'Poppins-Regular',
        marginLeft: 20,
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
});

export default LoginScreen;