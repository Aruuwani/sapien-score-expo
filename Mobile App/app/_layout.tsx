
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect, useState } from 'react';
// import 'react-native-reanimated';
// import * as Notifications from 'expo-notifications';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { AuthProvider } from '../hooks/AuthContext';
// import { View, Text, StyleSheet, Button,TouchableOpacity, Animated, Easing  } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import NetInfo from '@react-native-community/netinfo';
// // Prevent the splash screen from auto-hiding before asset loading is complete.

// SplashScreen.preventAutoHideAsync();
// Notifications.setNotificationChannelAsync('default', {
//   name: 'App Notifications',
//   importance: Notifications.AndroidImportance.HIGH,
//   sound: 'default',
//   vibrationPattern: [0, 250, 250, 250],
// });


// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//     const [isConnected, setIsConnected] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//     const pulseAnim = new Animated.Value(1);
//   const fadeAnim = new Animated.Value(0);
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   const checkConnection = () => {
//   setIsLoading(true);
//   NetInfo.fetch().then(state => {
//     setIsConnected(state.isConnected ?? true); // default to true if state.isConnected is null
//     setIsLoading(false);
//   });
// };

// useEffect(() => {
//   const unsubscribe = NetInfo.addEventListener(state => {
//     setIsConnected(state.isConnected ?? true); // default to true if state.isConnected is null
//   });

//   checkConnection();

//     return () => unsubscribe();
//   }, []);
// useEffect(() => {
//     if (!isConnected) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.2,
//             duration: 1000,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 1000,
//             easing: Easing.inOut(Easing.ease),
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();

//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [isConnected]);
  
//   if (!isConnected) {
//    return (
//       <Animated.View 
//         style={[
//           styles.offlineContainer,
//           { opacity: fadeAnim }
//         ]}
//       >
//         <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
//           <Ionicons name="wifi-off" size={80} color="#fff" />
//         </Animated.View>
        
//         <Text style={styles.offlineText}>No Internet Connection</Text>
//         <Text style={styles.offlineSubtext}>Please check your network settings</Text>
        
//         <TouchableOpacity 
//           style={styles.retryButton}
//           onPress={checkConnection}
//           disabled={isLoading}
//         >
//           {isLoading ? (
//             <Ionicons name="refresh" size={24} color="#fff" style={styles.spinning} />
//           ) : (
//             <Text style={styles.retryButtonText}>Try Again</Text>
//           )}
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   }

//   return (
    
//       <AuthProvider>
//     <Stack
//       screenOptions={{
//         headerShown: false
//       }}
//     >
//       <Stack.Screen name="index" />
//       <Stack.Screen name="user" />
//       <Stack.Screen name="userSelectionScreen" />
//       <Stack.Screen name="+not-found" />
//         </Stack>
//         </AuthProvider>
    
//   );
// }
// const styles = StyleSheet.create({
//   offlineContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ff6b6b',
//     padding: 20,
//   },
//   offlineText: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 5,
//   },
//   offlineSubtext: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 16,
//     marginBottom: 30,
//     textAlign: 'center',
//     maxWidth: '80%',
//   },
//   retryButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.5)',
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   spinning: {
//     animation: 'spin 1s linear infinite',
//   },
// });

// // Add this to your global styles or App.js
// const spinAnimation = {
//   from: {
//     rotate: '0deg',
//   },
//   to: {
//     rotate: '360deg',
//   },
// };

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../hooks/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationChannelAsync('default', {
  name: 'App Notifications',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'default',
  vibrationPattern: [0, 250, 250, 250],
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-semiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
    'Poppins-Italic': require('../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
  });

  // Handle splash screen
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Check network connection
  const checkConnection = () => {
    setIsLoading(true);
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? true);
      setIsLoading(false);
    });
  };

  // Network connection listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    checkConnection();

    return () => unsubscribe();
  }, []);

  // Animation effects
  useEffect(() => {
    if (!isConnected) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Fade animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset animations when connected
      pulseAnim.setValue(1);
      fadeAnim.setValue(0);
    }
  }, [isConnected]);

  // Spin animation for refresh icon
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoading]);

  if (!fontsLoaded) {
    return null;
  }

  if (!isConnected) {
    const spin = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.offlineContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons name="wifi-outline" size={80} color="#fff" />
        </Animated.View>
        
        <Text style={styles.offlineText}>No Internet Connection</Text>
        <Text style={styles.offlineSubtext}>Please check your network settings</Text>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={checkConnection}
          disabled={isLoading}
        >
          {isLoading ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </Animated.View>
          ) : (
            <Text style={styles.retryButtonText}>Try Again</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="user" />
        <Stack.Screen name="userSelectionScreen" />
        <Stack.Screen name="echoroom" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    padding: 20,
  },
  offlineText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    fontFamily: 'SpaceMono',
  },
  offlineSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: '80%',
    fontFamily: 'SpaceMono',
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
});