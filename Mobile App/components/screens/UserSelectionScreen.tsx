// import { getUserProfile } from '@/api/userApi';
// import { Feather } from '@expo/vector-icons';
// import * as Contacts from 'expo-contacts';
// import { useFonts } from 'expo-font';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { BackHandler } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// interface Person {
//     id: string;
//     name: string;
//     email: string;
// }
// interface User {
//     work_email?: string;
//     email?: string;
//     phone_number?: string;
//   }

// interface UserSelectionScreenProps {
//     onSelectPerson?: (person?: Person | undefined) => void;
//     onBack?: () => void;
//     onSkip?: () => void;
// }

// const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({
//     onSelectPerson,
//     onBack,
//     onSkip
// }) => {
//     const [email, setEmail] = useState<string>('');
//     const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
//     const [emailError, setEmailError] = useState(false);
//     const [customMessage, setCustomMessage] = useState('');
//     const [phone, setPhone] = useState('');
//     const [isValidEmail, setIsValidEmail] = useState(false);
//     console.log('isValidEmail', isValidEmail)
//     const [phoneError, setPhoneError] = useState(false);
//     const [people, setPeople] = useState<Person[]>([]);
//     const [user, setUser] = useState<User>({})
//     const [loading, setIsLoading] = useState(false);
//     // Load Poppins font
//     const [fontsLoaded] = useFonts({
//         'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
//         'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
//         'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
//         'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
//     });
//     const validateEmail = (email: string): boolean => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     const validatePhone = (phone: string): boolean => {
//         console.log("phone", phone)
//         return phone.length >= 10;
//     };

//     const formatPhoneWithCountryCode = (phone: string): string => {
//   const digitsOnly = phone.replace(/\D/g, ''); // Remove all non-digits

//   // If it starts with 91 and has 12 digits, assume it's already fine
//   if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
//     return `+${digitsOnly}`;
//   }

//   // If it's a 10-digit number, add +91
//   if (digitsOnly.length === 10) {
//     return `+91${digitsOnly}`;
//   }

//   // Invalid format — return as is or handle accordingly
//   return phone;
// };

// useFocusEffect(
//     React.useCallback(() => {
//       const onBackPress = () => {
//         onBack()
//         return true;
//       };

//       // Add event listener (modern way)
//       const backHandler = BackHandler.addEventListener(
//         'hardwareBackPress',
//         onBackPress
//       );

//       // Cleanup function - use remove() instead of removeEventListener
//       return () => backHandler.remove();
//     }, [])
//   );
//     useEffect(() => {
//         (async () => {
//             const { status } = await Contacts.requestPermissionsAsync();
//             if (status === 'granted') {
//                 const { data } = await Contacts.getContactsAsync({
//                     fields: [Contacts.Fields.PhoneNumbers],
//                 });

//                 if (data.length > 0) {
//                     const formattedPeople: Person[] = data
//                         .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
//                         .map(contact => ({
//                             id: formatPhoneWithCountryCode(contact.phoneNumbers![0].number || ''),
//                             name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
//                         }))
//                         .filter(person => person.id !== undefined) as Person[];

//                     setPeople(formattedPeople);
//                 }
//             }
//         })();
//     }, []);

//     useEffect(() => {

//     }, [selectedPerson])
//     // Sample data - in a real app, this would come from an API or props

//     useEffect(() => {
//         if (email) setEmailError(false);
//     }, [email]);


//     useEffect(() => {
//         if (phone) setPhoneError(false);
//     }, [phone]);

//     useEffect(() => {
//         const fetchUserProfile = async () => {
//             const response = await getUserProfile();
//             setUser(response?.user)

//         };
//         fetchUserProfile();
//     }, []);

//     const validatePerson = (person: string | { id: string, name: string }) => {
//         // Reset errors first
//         setEmailError(false);
//         setPhoneError(false);
//         setCustomMessage('');

//         // Case 1: Email validation (when person is a string)
//         if (typeof person === 'string') {
//             if (person.trim() === '') {
//                 setEmailError(true);
//                 setCustomMessage('Email cannot be empty');
//                 return false;
//             }

//             if (!validateEmail(person)) {
//                 setEmailError(true);
//                 setCustomMessage('Enter a valid email address');
//                 return false;
//             }
//             return true;
//         }

//         // Case 2: Phone validation (when person is an object)
//         if (typeof person === 'object' && person.id) {
//             if (person.id.trim() === '') {
//                 setPhoneError(true);
//                 setCustomMessage('Phone number cannot be empty');
//                 return false;
//             }

//             if (!validatePhone(person.id)) {
//                 setPhoneError(true);
//                 setCustomMessage('Invalid phone number');
//                 return false;
//             }
//             return true;
//         }

//         // Case 3: Invalid format
//         setCustomMessage('Invalid input format');
//         return false;
//     };
//     const handleNext = (person?: any): void => {
// console.log('person', person)
//         setIsLoading(true)
//         // Replace this with actual user info from your app's state/context
//         // const loggedInUserEmail = "test@gmail.com"
//         const loggedInUserEmail = user?.work_email || user?.email;
//         const loggedInUserPhone = formatPhoneWithCountryCode(user?.phone_number || '')
//         // const loggedInUserPhone = "+918299676421"
// console.log('loggedInUserPhone', loggedInUserPhone)

//         if (person) {
//             // Check if the selected person is the same as the logged-in user
//             const isSameEmail = person && loggedInUserEmail && person === loggedInUserEmail;
//             const isSamePhone = person.id && loggedInUserPhone && person.id === loggedInUserPhone;

//             if ((isSameEmail && isSamePhone) || (isSameEmail || isSamePhone)) {
//                 setCustomMessage("You cannot score for the same email or phone you registered with");
//                 setIsLoading(false)
//                 setTimeout(() => setCustomMessage(""), 3000);
//                 return;
//             }

//             if (!validatePerson(person)) {
//                 setTimeout(() => setCustomMessage(""), 2000);
//                 return;
//             }

//             console.log("selecteddddd", person);
//             setSelectedPerson(person);
//             onSelectPerson?.(person);
//         } else if (email.trim()) {
//             // Also validate against manually entered email
//             const trimmedEmail = email.trim();
//             if (trimmedEmail === loggedInUserEmail) {
//                 setIsLoading(false)
//                 setCustomMessage("You cannot score for the same email or phone you registered with");
//                 setTimeout(() => setCustomMessage(""), 3000);
//                 return;
//             }

//             const newPerson: Person = {
//                 id: '',
//                 name: '',
//                 email: trimmedEmail,
//             };
//             setIsLoading(false)
//             onSelectPerson?.(newPerson);
//         }
//     };




//     const handleSkip = (): void => {
//         if (onSkip) {
//             onSkip();
//         }
//     };

//     // console.log('scoringData', scoringData)
//     if (!fontsLoaded) {
//         console.log('fonts not loaded');
//         return null
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === "ios" ? "padding" : "height"}
//                 style={styles.keyboardAvoidingView}
//                 keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
//             >
//                 {/* <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" /> */}

//                 <TouchableOpacity style={styles.backButton} onPress={onBack}>
//                     <Feather name="arrow-left" size={24} color="black" />
//                 </TouchableOpacity>

//                 <View style={styles.headerContainer}>
//                     <Text style={styles.headerText}>
//                         Whom do you want{'\n'}to score?
//                     </Text>
//                     <Text style={styles.subHeaderText}>
//                         your name will not be revealed while{'\n'}sharing the score
//                     </Text>
//                 </View>

//                 <View style={styles.inputContainer}>
//                     {/* <TextInput
//                         style={styles.input}
//                         placeholder="Enter Corporate Email"
//                         placeholderTextColor="#555555"
//                         value={email}
//                         onChangeText={setEmail}
//                         keyboardType="email-address"
//                         autoCapitalize="none"
//                     /> */}
//                     <TextInput
//                         style={[styles.input, !isValidEmail && email.length > 0 && styles.invalidInput]}
//                         placeholder="Enter Corporate Email"
//                         placeholderTextColor="#555555"
//                         value={email}
//                         onChangeText={(text) => {
//                             setEmail(text);
//                             const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
//                             setIsValidEmail(emailRegex.test(text));
                       
//                         }}
//                         keyboardType="email-address"
//                         autoCapitalize="none"
//                     />
//                     <Text style={styles.orText}>or</Text>
//                     {loading ? (
//                         <ActivityIndicator size="large" color="#FF8541" />
//                     ) : (
//                     <>
//                         {
//                             people.length > 0 ? (
//                                 <ScrollView
//                                     style={styles.peopleList}
//                                     showsVerticalScrollIndicator={false}
//                                     contentContainerStyle={styles.peopleListContent}
//                                 >
//                                     {people.map((person) => (
//                                         <TouchableOpacity
//                                             key={`${person.id}-${person.name}`}
//                                             style={styles.personButton}
                              
//                                             onPress={() => handleNext(person)}
//                                         >
//                                             <Text style={styles.personText}>{person.name}</Text>
//                                         </TouchableOpacity>
//                                     ))}
//                                 </ScrollView>
//                             ) : (
//                                 <Text style={styles.loadingText}>Loading contacts...</Text>
//                             )
//                                 }
//                             </>
//                     )}
//                 </View>
               
//                     <TouchableOpacity style={styles.skipButton} onPress={() => email ? handleNext(email) : handleSkip()} >
//                         <Text style={styles.skipText}>{email ? 'next' : 'skip'}</Text>
//                     </TouchableOpacity>
              
//             </KeyboardAvoidingView>
//             {customMessage ? (
//                 <>
//                     <View style={styles.messageOverlay} />
//                     <View style={styles.messageContainer}>
//                         <Text style={styles.customMessage}>{customMessage}</Text>
//                     </View>
//                 </>
//             ) : null}
//         </SafeAreaView>
//     );
// };
import { getUserProfile } from '@/api/userApi';
import { Feather } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useFonts } from 'expo-font';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Person {
  id: string;
  name: string;
  email: string;
}

interface User {
  work_email?: string;
  email?: string;
  phone_number?: string;
}

interface UserSelectionScreenProps {
  onSelectPerson?: (person?: Person | undefined) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({
  onSelectPerson,
  onBack,
  onSkip
}) => {
  const [email, setEmail] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [user, setUser] = useState<User>({});
  const [loading, setIsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  });

  // Memoized functions
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    return phone.length >= 10;
  }, []);

  const formatPhoneWithCountryCode = useCallback((phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      return `+${digitsOnly}`;
    }
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    return phone;
  }, []);

  // Fetch contacts with proper cleanup
  const fetchContacts = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setContactsLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const formattedPeople: Person[] = data
        .filter(contact => contact.phoneNumbers?.length)
        .map(contact => ({
          id: formatPhoneWithCountryCode(contact.phoneNumbers![0].number || ''),
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email: ''
        }))
        .filter(person => person.id);

      setPeople(formattedPeople);
    } catch (error) {
      console.error('Contacts fetch error:', error);
    } finally {
      setContactsLoading(false);
    }
  }, [formatPhoneWithCountryCode]);

  // Focus effect with cleanup
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        onBack?.();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [onBack])
  );

  // Initial data loading
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [profile] = await Promise.all([
          getUserProfile(),
          fetchContacts()
        ]);
        
        if (isMounted) {
          setUser(profile?.user || {});
        }
      } catch (error) {
        console.error('Initial load error:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchContacts]);

  const validatePerson = useCallback((person: string | Person) => {
    setEmailError(false);
    setPhoneError(false);
    setCustomMessage('');

    if (typeof person === 'string') {
      if (!person.trim()) {
        setEmailError(true);
        setCustomMessage('Email cannot be empty');
        return false;
      }

      if (!validateEmail(person)) {
        setEmailError(true);
        setCustomMessage('Enter a valid email address');
        return false;
      }
      return true;
    }

    if (person.id) {
      if (!person.id.trim()) {
        setPhoneError(true);
        setCustomMessage('Phone number cannot be empty');
        return false;
      }

      if (!validatePhone(person.id)) {
        setPhoneError(true);
        setCustomMessage('Invalid phone number');
        return false;
      }
      return true;
    }

    setCustomMessage('Invalid input format');
    return false;
  }, [validateEmail, validatePhone]);

  const handleNext = useCallback(async (person?: any) => {
    setIsLoading(true);
    try {
      const loggedInUserEmail = user?.work_email || user?.email;
      const loggedInUserPhone = formatPhoneWithCountryCode(user?.phone_number || '');

      if (person) {
        const isSameEmail = person && loggedInUserEmail && person === loggedInUserEmail;
        const isSamePhone = person.id && loggedInUserPhone && person.id === loggedInUserPhone;

        if (isSameEmail || isSamePhone) {
          setCustomMessage("You cannot score for the same email or phone you registered with");
          setTimeout(() => setCustomMessage(''), 3000);
          return;
        }

        if (!validatePerson(person)) return;

        setSelectedPerson(person);
        onSelectPerson?.(person);
      } else if (email.trim()) {
        const trimmedEmail = email.trim();
        if (trimmedEmail === loggedInUserEmail) {
          setCustomMessage("You cannot score for the same email or phone you registered with");
          setTimeout(() => setCustomMessage(''), 3000)
          return;
        }

        onSelectPerson?.({ id: '', name: '', email: trimmedEmail });
      }
    } catch (error) {
      console.error('Handle next error:', error);
      setCustomMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [email, user, validatePerson, onSelectPerson, formatPhoneWithCountryCode]);

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            Whom do you want{'\n'}to score?
          </Text>
          <Text style={styles.subHeaderText}>
            your name will not be revealed while{'\n'}sharing the score
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, !isValidEmail && email.length > 0 && styles.invalidInput]}
            placeholder="Enter Corporate Email"
            placeholderTextColor="#555555"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setIsValidEmail(validateEmail(text));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.orText}>or</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#FF8541" />
          ) : contactsLoading ? (
            <Text style={styles.loadingText}>Loading contacts...</Text>
          ) : (
            <ScrollView
              style={styles.peopleList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.peopleListContent}
            >
              {people.map((person) => (
                <TouchableOpacity
                  key={`${person.id}-${person.name}`}
                  style={styles.personButton}
                  onPress={() => handleNext(person)}
                >
                  <Text style={styles.personText}>{person.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => email ? handleNext(email) : handleSkip()}
        >
          <Text style={styles.skipText}>{email ? 'next' : 'skip'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
    },
    invalidInput: {
        borderColor: 'red',
        borderWidth: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 24,
    },
    backButton: {
        marginTop: 20,
        marginLeft: -5,
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    headerContainer: {
        marginTop: 20,
        marginBottom: 32,
    },
    headerText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 35,
        textAlign: 'center',
        lineHeight: 36,
        color: '#000000',
        letterSpacing: -0.4,
        fontWeight: 300,
        verticalAlign: "middle",
        marginBottom: 15,
    },
    subHeaderText: {
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        lineHeight: 18,
        letterSpacing: -0.4,


    },
    inputContainer: {
        flex: 1,

    },
    input: {
        fontFamily: 'Poppins-Light',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 20,
        borderRadius: 10,
        marginBottom: 12,
        textAlign: 'center',
        padding: 10,
        letterSpacing: -0.4,
        width: '100%',
        maxWidth: 320,
        alignSelf: 'center',
    },
    loadingText: {
        fontFamily: 'Poppins-Light',
        // backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        // borderRadius: 10,
        marginBottom: 20,
        marginTop: 35,
        textAlign: 'center',
        paddingTop: 40,
        letterSpacing: -0.4,
        width: 290,
        alignSelf: 'center',
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
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
    orText: {
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        marginBottom: 16,
        marginTop: 12,
    },
    peopleList: {
        flex: 1,
    },
    peopleListContent: {
        paddingBottom: 20,
    },
    personButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        gap: 10,
        borderRadius: 16,
        marginBottom: 18,
        width: "auto",
        display: "flex",
        alignItems: 'center',      // centers items vertically (if row)
        justifyContent: 'center',  // centers items horizontally (if row)
        flexDirection: 'row',
        alignSelf: 'center',
        height: 43,// items are placed in a row
        minWidth: 145
    },
    personText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
        color: '#555555',
        lineHeight: 24,
    },
    skipButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
        padding: 8,
        top: 10
    },
    skipText: {
        fontFamily: 'Poppins-Light',
        fontSize: 15,
        color: '#000000',
    },
});

export default UserSelectionScreen;