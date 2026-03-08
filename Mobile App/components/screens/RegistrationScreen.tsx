import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getUserNames, getUserProfile } from '../../api/userApi';
interface RegistrationScreenProps {
    onProceed: (userData: { name: string; username?: string }) => void;
    onBack: () => void;
    loading: boolean;
 
    setloading: (loading: boolean) => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onProceed, onBack, loading, setloading }) => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [customMessage, setCustomMessage] = useState<any>('');
const [availableUsernames, setAvailableUsernames] = useState([]);
console.log('availableUsernames', availableUsernames)
    const [userData, setUserData] = useState({
        name: '',
        username: '',
    });

    // Sample usernames as shown in the image
    const usernames = availableUsernames

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
    });
    useEffect(() => {
  const fetchUsernames = async () => {
    const usernames = await getUserNames();
    setAvailableUsernames(usernames);
  };

  fetchUsernames();
}, []);
    const handleProceed = () => {
        const nameIsEmpty = !name?.trim();
        setNameError(nameIsEmpty);
    
        if (nameIsEmpty) {
            setCustomMessage('Please fill Your name');
    
            // Hide the message after 2 seconds
            setTimeout(() => {
                setCustomMessage('');
            }, 2000);
    
            return;
        }
    
        onProceed(username ? { name, username } : { name });
    };
    

    const handleUsernameSelect = (selectedUsername: string) => {
        setUsername(selectedUsername);
        setUsernameError(false);
        setShowUsernameModal(false);
    };

    const renderUsernameList = () => {
        const leftColumn = [];
        const rightColumn = [];
        
        for (let i = 0; i < usernames.length; i++) {
            const currentUsername = usernames[i];
            const usernameElement = (
                <TouchableOpacity
                    key={`${currentUsername}-${i}`}
                    style={styles.usernameButton}
                    onPress={() => handleUsernameSelect(currentUsername)}
                >
                    <Text style={styles.usernameText}>{currentUsername}</Text>
                </TouchableOpacity>
            );

            if (i % 2 === 0) {
                leftColumn.push(usernameElement);
            } else {
                rightColumn.push(usernameElement);
            }
        }

        return (
            <View style={styles.columnsContainer}>
                <View style={styles.column}>
                    {leftColumn}
                </View>
                <View style={styles.column}>
                    {rightColumn}
                </View>
            </View>
        );
    };


    useEffect(() => {
        const useData = async () => {
            const response = await getUserProfile()
            setUserData(response?.user)
            setName(response?.user.name)
            setUsername(response?.user.username)
setloading(false)
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useData()
    }, [])

    if (!fontsLoaded) {
        console.log('no fonts loaded')
        return null;
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>
                                Receive feedback from friends and colleagues
                            </Text>
                            <Text style={styles.anonymouslyText}>anonymously</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        nameError && styles.inputError
                                    ]}
                                    placeholder="Enter your name"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (text.trim()) setNameError(false);
                                    }}
                                    placeholderTextColor="#555555"
                                />
                                <Text style={styles.inputHint}>psst... All the sender names will be hidden</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <TouchableOpacity
                                    onPress={() => setShowUsernameModal(true)}
                                    activeOpacity={0.7}

                                >
                                    <View
                                        style={[
                                            styles.input,

                                        ]}
                                        pointerEvents="none"
                                    >
                                        <Text style={username ? styles.inputText : styles.inputPlaceholder} >
                                            {username || userData?.username || "Choose Username"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.inputHint}>you can choose to show this later</Text>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.proceedButton}
                                onPress={handleProceed}
                            >
                                <Text style={styles.proceedButtonText}>{loading ? 'Proceeding...' : 'Proceed'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Username Selection Modal - Fixed height with scrollable content, matching the image */}
            <Modal
                visible={showUsernameModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowUsernameModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <ScrollView
                            style={styles.usernameScrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {renderUsernameList()}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowUsernameModal(false)}
                        >
                            <Text style={styles.selectButtonText}>Select</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F3F3',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    contentContainer: {
        minHeight: height - 100,
        justifyContent: 'space-between',
    },
    headerContainer: {
        marginTop: 60,
        alignItems: 'center',
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
        left: '55%',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
        maxWidth: 300,
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
    headerText: {
        fontSize: 30,
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        lineHeight: 37,
        color: '#000000',
        fontWeight: "300",

    },
    anonymouslyText: {
        fontSize: 25,
        textAlign: 'center',
        color: '#FF8541',
        fontFamily: 'Poppins-Medium',
        marginTop: 0,
        fontWeight: '500',
        verticalAlign: "middle",
    },
    formContainer: {
        marginTop: 150,
        marginBottom: 50,
        padding: 30,

    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 18,
        fontSize: 25,
        marginTop: 15,
        textAlign: 'center',
        fontFamily: 'Poppins-Light',
        // fontWeight: "300",
        width: '100%',
        borderWidth: 1,
        borderColor: 'transparent',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        lineHeight: 25,
        textDecorationLine: "none"
    },
    inputError: {
        borderColor: '#FF0000',
        borderWidth: 2,
    },
    inputText: {
        fontSize: 25,
        fontFamily: 'Poppins-Light',
        color: '#000',
        textAlign: 'center',
    },
    inputPlaceholder: {
        fontSize: 25,
        fontFamily: 'Poppins-Light',
        color: '#555555',
        textAlign: 'center',
        fontWeight: "300",
        height: "auto"
    },
    inputHint: {
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        color: '#000000',
        marginLeft: 10,
        textAlign: "center",
        marginTop: 7,
        fontWeight: "300",
        letterSpacing: -0.4
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        marginBottom: 30,
    },
    proceedButton: {
        paddingVertical: 8,
        paddingHorizontal: 30,
    },
    proceedButtonText: {
        fontSize: 25,
        fontWeight: '400',
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },

    // Updated modal styles with fixed height and scrollable content
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 320,
        height: 500, // Fixed height that matches the image
        backgroundColor: '#D9D9D9',
        borderRadius: 20,
        paddingTop: 60,
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
    usernameScrollView: {
        flex: 1,
        gap: 20,
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        rowGap: 20,
    },
    column: {
        flex: 1,
        marginHorizontal: 5,
    },
    usernameButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginBottom: 10,
        alignItems: 'center',

    },
    usernameText: {
        fontSize: 15,
        color: '#555555',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        fontWeight: "400",

    },
    selectButton: {
        alignSelf: 'flex-end',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 5,
    },
    selectButtonText: {
        fontSize: 25,
        color: '#000000',
        fontFamily: 'Poppins-Medium',
        fontWeight: "400",
        top: 20,
        paddingBottom: 8
    },
});

export default RegistrationScreen;