import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signupWithPassword } from '@/api/authApi';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';
import { Feather, Ionicons } from '@expo/vector-icons';

interface NewSignupScreenProps {
  onProceed?: (data: { phone: string; email: string; password: string }) => void;
  onBack?: () => void;
  onSignin?: () => void;
}

const NewSignupScreen: React.FC<NewSignupScreenProps> = ({
  onProceed,
  onBack,
  onSignin,
}) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');
  const [phoneErrorMessage, setPhoneErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (phone) setPhoneError(false);
  }, [phone]);

  useEffect(() => {
    if (email) setEmailError(false);
  }, [email]);

  useEffect(() => {
    if (password) setPasswordError(false);
  }, [password]);

  useEffect(() => {
    if (confirmPassword) setConfirmPasswordError(false);
  }, [confirmPassword]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return phone.length === 10;
  };

  const handleSignup = async () => {
    let hasError = false;

    // Reset error messages
    setPhoneError(false);
    setPhoneErrorMessage('');
    setEmailError(false);
    setEmailErrorMessage('');
    setPasswordError(false);
    setConfirmPasswordError(false);

    // Validate phone
    if (!phone) {
      setPhoneError(true);
      setPhoneErrorMessage('Phone number is required');
      hasError = true;
    } else if (phone.length !== 10) {
      setPhoneError(true);
      setPhoneErrorMessage('Phone number must be 10 digits');
      hasError = true;
    } else if (!validatePhone(phone)) {
      setPhoneError(true);
      setPhoneErrorMessage('Please enter a valid phone number');
      hasError = true;
    }

    // Validate email
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address');
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      hasError = true;
    }

    if (!confirmPassword || password !== confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    }

    if (!acceptTerms) {
      hasError = true;
      // Show error message
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const response = await signupWithPassword(formattedPhone, email, password, acceptTerms);

      if (response.token) {
        // Registration successful - show success animation
        // Don't save token here, user will login on next screen
        setShowSuccess(true);
      }
    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle API errors
      const errorMessage = error.error || error.message || 'Something went wrong';

      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('phone')) {
        setPhoneError(true);
        setPhoneErrorMessage(errorMessage);
      } else if (errorMessage.toLowerCase().includes('email')) {
        setEmailError(true);
        setEmailErrorMessage(errorMessage);
      } else if (errorMessage.toLowerCase().includes('password')) {
        setPasswordError(true);
      } else {
        // Generic error - show on both fields
        setPhoneError(true);
        setPhoneErrorMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    // After successful registration, navigate to login screen
    if (onSignin) {
      onSignin();
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top White Section with Back Button */}
          <View style={styles.topSection}>
            {!keyboardVisible && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content Container with Gray Background */}
          <View style={[styles.contentContainer, keyboardVisible && styles.contentContainerKeyboard]}>
            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone number</Text>
              <View style={[styles.phoneInputContainer, phoneError && styles.inputError]}>
                <Text style={styles.phonePrefix}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9993324823"
                  placeholderTextColor="#B0B0B0"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
                    if (phoneError) {
                      setPhoneError(false);
                      setPhoneErrorMessage('');
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {phoneError && phoneErrorMessage ? (
                <Text style={styles.errorMessage}>{phoneErrorMessage}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Rhebhek@gmail.com"
                placeholderTextColor="#B0B0B0"
                cursorColor="#FF8541"
                selectionColor="#FF854140"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) {
                    setEmailError(false);
                    setEmailErrorMessage('');
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError && emailErrorMessage ? (
                <Text style={styles.errorMessage}>{emailErrorMessage}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                  placeholder="********"
                  placeholderTextColor="#B0B0B0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                   <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, confirmPasswordError && styles.inputError]}
                  placeholder="********"
                  placeholderTextColor="#B0B0B0"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => setAcceptTerms(!acceptTerms)}
                style={styles.checkboxTouchable}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Entypo name="check" size={12} color="#FF8541" />}
                </View>
              </TouchableOpacity>
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxLabel}>
                  By Creating an Account, i accept Sapien Score{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => {
                      setTermsModalType('terms');
                      setShowTermsModal(true);
                    }}
                  >
                    terms of Use
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={styles.linkText}
                    onPress={() => {
                      setTermsModalType('privacy');
                      setShowTermsModal(true);
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.signupButtonText}>Signup</Text>
              )}
            </TouchableOpacity>

            {/* Sign in link */}
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Have an Account? </Text>
              <TouchableOpacity onPress={onSignin}>
                <Text style={styles.signinLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        message="Registered"
        onComplete={handleSuccessComplete}
        duration={1500}
      />

      {/* Terms & Conditions Modal */}
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
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  contentContainerKeyboard: {
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.3, 
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phonePrefix: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#B0B0B0',
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    padding: 0,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF0000',
    fontFamily: 'Poppins-Regular',
    marginTop: 5,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 15,
  },
  checkboxTouchable: {
    padding: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF8541',
  },
  checkboxTextContainer: {
    flex: 1,
    marginTop: 2,
  },
  checkboxLabel: {
    fontSize: 11,
    color: '#7A7A7A',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  linkText: {
    color: '#FF8541',
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#FF8541',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontWeight: "500",
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 15,
  },
  signinText: {
    fontSize: 13,
    color: '#191D23',
    letterSpacing: 0.3,
    fontFamily: 'Poppins-Regular',
  },
  signinLink: {
    fontSize: 13,
    color: '#FF8541',
       letterSpacing: 0.3,
    fontFamily: 'Poppins-Regular',
  },
});

export default NewSignupScreen;

