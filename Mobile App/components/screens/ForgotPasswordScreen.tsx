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
import { useFonts } from 'expo-font';
import { sendPasswordResetEmail } from '@/api/authApi';
import SuccessAnimation from '@/components/ui/SuccessAnimation';

interface ForgotPasswordScreenProps {
  onProceed?: (email: string) => void;
  onBack?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onProceed,
  onBack,
}) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
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
    if (email) setEmailError(false);
  }, [email]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email);

      // Show success animation
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setEmailError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    if (onProceed) {
      onProceed(email);
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
          {/* Top White Section */}
          <View style={styles.topSection}>
            {/* Title */}
            <View style={styles.titleContainer}>
              {/* <Text style={styles.title}>Forgot Password</Text> */}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {/* Enter the email address registered with your account. We'll send you a link to reset your password. */}
              </Text>
            </View>
          </View>

          {/* Content Container with Gray Background */}
          <View style={[styles.contentContainer, keyboardVisible && styles.contentContainerKeyboard]}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Forgot Password</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                Enter the email address registered with your account. We'll send you a link to reset your password.
              </Text>
            </View>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Rhebhek@gmail.com"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remembered password? </Text>
              <TouchableOpacity onPress={onBack}>
                <Text style={styles.loginLink}>Login to your account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        message="OTP sent to your email"
        onComplete={handleSuccessComplete}
        duration={1500}
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: '#191D23',
    fontFamily: 'Poppins-Medium',
    lineHeight: 32,
    letterSpacing: 0.1,
  },
  descriptionContainer: {
    marginBottom: 0,
  },
  description: {
    fontSize: 14,
    color: '#77707F',
    fontFamily: 'Poppins-Light',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  contentContainerKeyboard: {
    paddingTop: 30,
    
  },
  inputContainer: {
    marginBottom: 30,
    marginTop: 100,

  },
  label: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#FF8541',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FEFEFE',
    fontFamily: 'Poppins-Medium',
    fontWeight: "500",
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  loginContainer: {
   
    // flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 15,
  },
  loginText: {
    fontSize: 13,
    color: '#77707F',
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
    // letterSpacing: 0.3,
  },
  loginLink: {
    fontSize: 13,
    color: '#FF8541',
    fontFamily: 'Poppins-Medium',
    lineHeight: 16,
    // letterSpacing: 0.3,  
    fontWeight: "500",

  },
});

export default ForgotPasswordScreen;

