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
import { resetPassword } from '@/api/authApi';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import TermsConditionsModal from '@/components/ui/TermsConditionsModal';
import { Feather } from '@expo/vector-icons';

interface ResetPasswordScreenProps {
  email: string;
  verificationCode: string;
  onProceed?: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  email,
  verificationCode,
  onProceed,
}) => {
  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');

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
    if (newPassword) setNewPasswordError(false);
  }, [newPassword]);

  useEffect(() => {
    if (confirmPassword) setConfirmPasswordError(false);
  }, [confirmPassword]);

  const handleUpdatePassword = async () => {
    let hasError = false;

    if (!newPassword || newPassword.length < 6) {
      setNewPasswordError(true);
      hasError = true;
    }

    if (!confirmPassword || newPassword !== confirmPassword) {
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
      // Note: Backend doesn't need verificationCode in reset-password endpoint
      // It was already verified in the previous step
      await resetPassword(email, newPassword);

      // Show success animation
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      // Could show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    if (onProceed) {
      onProceed();
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
          {/* Top White Section - Empty for spacing */}
          <View style={styles.topSection} />

          {/* Content Container with Gray Background */}
          <View style={[styles.contentContainer, keyboardVisible && styles.contentContainerKeyboard]}>
            {/* Email Address (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Addess</Text>
              <TextInput
                style={styles.input}
                value={email}
                editable={false}
                placeholderTextColor="#B0B0B0"
              />
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter new Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, newPasswordError && styles.inputError]}
                  placeholder="********"
                  placeholderTextColor="#B0B0B0"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm new password</Text>
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


            {/* Update Password Button */}
            <TouchableOpacity
              style={[styles.updateButton, loading && styles.updateButtonDisabled]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.updateButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        message="Password Changed"
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
    height: 180,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  contentContainerKeyboard: {
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 16,
    // letterSpacing: 0.3,
    fontWeight: '400',
    
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
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 1,
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
  updateButton: {
    backgroundColor: '#FF8541',
    borderRadius: 50,
    paddingVertical: 14,
    marginVertical: 10,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
  },
});

export default ResetPasswordScreen;

