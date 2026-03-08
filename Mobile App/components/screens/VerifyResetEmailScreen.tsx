import React, { useState, useEffect, useRef } from 'react';
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
import { verifyPasswordResetCode, sendPasswordResetEmail } from '@/api/authApi';
import SuccessAnimation from '@/components/ui/SuccessAnimation';

interface VerifyResetEmailScreenProps {
  email: string;
  onProceed?: (code: string) => void;
  onResend?: () => void;
}

const VerifyResetEmailScreen: React.FC<VerifyResetEmailScreenProps> = ({
  email,
  onProceed,
  onResend,
}) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Clear error when user starts typing
    if (error) {
      setError(false);
      setErrorMessage('');
    }

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(true);
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    // Clear any previous errors
    setError(false);
    setErrorMessage('');

    setLoading(true);
    try {
      // await verifyPasswordResetCode(email, fullCode);

      // Show success animation
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Verify code error:', error);

      // Show API error message
      const apiError = error.error || error.message || 'Invalid OTP. Please try again.';
      setError(true);
      setErrorMessage(apiError);

      // Clear the code inputs
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    if (onProceed) {
      const fullCode = code.join('');
      onProceed(fullCode);
    }
  };

  const handleResend = async () => {
    setCode(['', '', '', '', '', '']);
    try {
      await sendPasswordResetEmail(email);
      if (onResend) {
        onResend();
      }
    } catch (error: any) {
      console.error('Resend error:', error);
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
              {/* <Text style={styles.title}>Please verify your</Text>
              <Text style={styles.title}>email address</Text> */}
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                {/* We've sent an email to {email}, please enter the code below. */}
              </Text>
            </View>
          </View>

          {/* Content Container with Gray Background */}
          <View style={[styles.contentContainer, keyboardVisible && styles.contentContainerKeyboard]}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Please verify your</Text>
              <Text style={styles.title}>email address</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                We've sent an email to {`\n`}{email}, please enter the code{`\n`}below.
              </Text>
            </View>
            {/* Code Input */}
            <View style={styles.codeContainer}>
              <Text style={styles.label}>Enter Code</Text>
              <View style={styles.codeInputsContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.codeInput, error && styles.codeInputError]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    placeholder="–"
                    placeholderTextColor="#D0D0D0"
                  />
                ))}
              </View>
              {error && errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Reset</Text>
              )}
            </TouchableOpacity>

            {/* Resend link */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't see your email? </Text>
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        message="VERIFIED"
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#191D23',
    fontFamily: 'Poppins-Medium',
    lineHeight: 37,
    letterSpacing: 0.3,
  },
  descriptionContainer: {
    marginBottom: 0,
    marginTop:0
  },
  description: {
    fontSize: 14,
    color: '#6C6F72',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    letterSpacing:0.3
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 30,
  },
  contentContainerKeyboard: {
    paddingTop: 40,
  },
  codeContainer: {
    marginBottom: 40,
    marginTop: 70,
  },
  label: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
    marginBottom: 5,
    lineHeight: 20,
    letterSpacing: 0.3,

  },
  codeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 7,
    // paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#CBD2E0',
  },
  codeInputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
  },
  errorMessage: {
    fontSize: 12,
    color: '#FF0000',
    fontFamily: 'Poppins-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#FF8541',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: 16,
    color: '#FEFEFE',
    fontFamily: 'Poppins-Medium',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6C6F72',
    fontFamily: 'Poppins-Light',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  resendLink: {
    fontSize: 14,
    color: '#FF8541',
    fontFamily: 'Poppins-Medium',
    textDecorationLine: 'underline',
  },
});

export default VerifyResetEmailScreen;

