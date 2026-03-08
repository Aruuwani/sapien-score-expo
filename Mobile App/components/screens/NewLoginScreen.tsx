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
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithPassword } from '@/api/authApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NewLoginScreenProps {
  onProceed?: (data: { phone?: string; password?: string }) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

const NewLoginScreen: React.FC<NewLoginScreenProps> = ({
  onProceed,
  onForgotPassword,
  onSignup,
}) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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
    if (password) setPasswordError(false);
  }, [password]);

  const validatePhone = (phone: string): boolean => {
    return phone.length === 10;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    setIsPendingUser(false);
    let hasError = false;

    if (!phone || !validatePhone(phone)) {
      setPhoneError(true);
      hasError = true;
    }

    if (!password) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      setErrorMessage('Please enter correct password');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      console.log('🔐 Attempting login with phone:', formattedPhone);

      // Use phone as identifier (can be phone or email)
      const response = await loginWithPassword(formattedPhone, password);
      console.log('✅ Login response:', response);

      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);

        if (keepSignedIn) {
          await AsyncStorage.setItem('keep_signed_in', 'true');
        }

        if (onProceed) {
          onProceed({ phone: formattedPhone, password });
        }
      } else {
        console.log('⚠️ No token in response');
        setErrorMessage('Login failed. Please try again.');
        setPasswordError(true);
      }
    } catch (error: any) {
      console.log('❌ Login error caught:', error);
      console.log('   Error type:', typeof error);
      console.log('   Error keys:', Object.keys(error || {}));
      console.log('   error.error:', error.error);
      console.log('   error.message:', error.message);
      console.log('   error.response:', error.response);
      console.log('   error.code:', error.code);

      // Extract error message from various possible structures
      let errorMsg = 'Please enter correct password';

      if (error.error) {
        errorMsg = error.error;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      console.log('   Final error message:', errorMsg);

      // Check if this is a pending user error
      if (errorMsg.includes('Account not activated') || errorMsg.includes('Please sign up')) {
        setIsPendingUser(true);
        setErrorMessage('Your account is not activated yet. Someone has rated you! Please sign up to activate your account and view your ratings.');
      } else {
        setErrorMessage(errorMsg);
      }

      setPasswordError(true);
    } finally {
      setLoading(false);
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
          {/* Logo Header */}
          {!keyboardVisible && (
            // <View style={styles.logoContainer}>
            //   <Text style={styles.logoText}>
            //     <Text style={styles.logoSapien}>Sapien</Text>
            //     <Text style={styles.logoScore}>Score</Text>
            //   </Text>
            // </View>
            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/images/logosapian.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Content Container */}
          <View style={[styles.contentContainer, keyboardVisible && styles.contentContainerKeyboard]}>
            {/* Info Text */}
            <View>
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  You can only login{'\n'}through invite
                </Text>
              </View>

              <View style={styles.subInfoContainer}>
                <Text style={styles.subInfoText}>
                  Kindly wait until you receive a{'\n'}score from your friends
                </Text>
              </View>
            </View>
            {/* Phone Number Input */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone number</Text>
                <View style={[styles.phoneInputContainer, phoneError && styles.inputError]}>
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9993324823"
                    placeholderTextColor="#B0B0B0"
                    value={phone}
                    onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.passwordLabelContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={styles.forgotPassword}>Forgot Password</Text>
                  </TouchableOpacity>
                </View>
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
                {/* Error Message */}
                {errorMessage && (
                  <View style={styles.errorMessageContainer}>
                    <View style={styles.errorContainer}>
                      <Feather
                        name={isPendingUser ? "info" : "alert-triangle"}
                        size={16}
                        color={isPendingUser ? "#FF8541" : "#FF0000"}
                      />
                      <Text style={[styles.errorText, isPendingUser && styles.pendingUserText]}>
                        {errorMessage}
                      </Text>
                    </View>
                    {/* {isPendingUser && (
                      <TouchableOpacity
                        style={styles.signupPromptButton}
                        onPress={onSignup}
                      >
                        <Text style={styles.signupPromptButtonText}>Sign Up Now</Text>
                      </TouchableOpacity>
                    )} */}
                  </View>
                )}
              </View>



              {/* Keep me signed in */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setKeepSignedIn(!keepSignedIn)}
              >
                <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                  {keepSignedIn && <Feather name="check" size={16} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Sign up link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an Account? </Text>
                <TouchableOpacity onPress={onSignup}>
                  <Text style={styles.signupLink}>Sign up here</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    backgroundColor: '#000',
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
  },
  logoSapien: {
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
  },
  logoScore: {
    color: '#FF8541',
    fontFamily: 'Poppins-Regular',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  contentContainerKeyboard: {
    paddingTop: 10,
  },
  infoContainer: {
    // marginBottom: 15,
    alignItems: 'flex-start',
    width: '100%',
  },
  infoText: {
    // fontSize: 24,
    // color: '#000',
    // fontFamily: 'Poppins-Light',
    // lineHeight: 32,
    fontSize: 20,
    fontFamily: 'Poppins-ExtraLight',
    fontWeight: '300',
    color: '#000000', // Dark text color matching image
    textAlign: 'left',
    marginBottom: 50, // Increased spacing between texts
    lineHeight: 26,
    verticalAlign: "middle"
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    // maxWidth: 430,
    width: '100%',
    paddingTop: 30,
    alignSelf: 'center',

  },
  logoImage: {
    maxWidth: '100%',
    width: '100%',
    // height:
    // height: 'fit-content',  // Adjust based on your actual logo size
    // minHeight: 100,
    // marginBottom: 5,
    // objectFit: 'contain',
  },
  subInfoContainer: {
    // marginBottom: 10,
    alignItems: 'flex-end',
    width: '100%',
  },
  subInfoText: {
    // fontSize: 16,
    // color: '#000',
    // fontFamily: 'Poppins-Light',
    // lineHeight: 24,
    fontFamily: 'Poppins-Light', // Ensure the font is linked properly in your project
    fontWeight: '300',
    fontSize: 20,
    lineHeight: 22.6, // 113.99% of 20px is roughly 22.6px
    letterSpacing: -0.4, // -2% of 20px is roughly -0.4px
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  inputContainer: {
    marginBottom: 25,
  },
  formContainer: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    marginBottom: 5,
    lineHeight: 16

  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Light',
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phonePrefix: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Light',
    color: '#000',
    padding: 0,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  passwordLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 5,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#FF8541',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    lineHeight: 18,
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
  errorMessageContainer: {
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#EA2A2A',
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    flex: 1,
  },
  pendingUserText: {
    color: '#FF8541',
  },
  signupPromptButton: {
    backgroundColor: '#FF8541',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  signupPromptButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:14,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFF',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#59CDBE',
    borderColor: '#59CDBE',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#191D23',
    fontFamily: 'Poppins-Light',
    letterSpacing: 0.2,
  },
  loginButton: {
    backgroundColor: '#FF8541',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FEFEFE',
    fontFamily: 'Poppins-Medium',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    letterSpacing:0,
    fontWeight: "300",
    color: '#131212',
    fontFamily: 'Poppins-Light',
  },
  signupLink: {
    fontSize: 14,
    color: '#FF8541',
    fontFamily: 'Poppins-Regular',
  },
});

export default NewLoginScreen;

