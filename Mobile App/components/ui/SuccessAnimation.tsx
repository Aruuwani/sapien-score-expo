import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SuccessAnimationProps {
  visible: boolean;
  message: string;
  onComplete?: () => void;
  duration?: number; // Duration to show the animation in ms
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  message,
  onComplete,
  duration = 2000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      fadeAnim.setValue(0);

      // Sequence of animations
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale up circle
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // Draw checkmark
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After animation completes, wait for duration then call onComplete
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, duration);
      });
    }
  }, [visible, duration, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Animated Circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Checkmark */}
          <Animated.View
            style={{
              opacity: checkmarkAnim,
              transform: [
                {
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            }}
          >
            <Feather name="check" size={60} color="#FFF" />
          </Animated.View>
        </Animated.View>

        {/* Message */}
        <Animated.Text
          style={[
            styles.message,
            {
              opacity: checkmarkAnim,
            },
          ]}
        >
          {message}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default SuccessAnimation;

