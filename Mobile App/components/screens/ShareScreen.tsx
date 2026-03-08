import { useFonts } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ShareScreenProps = {
    person: { id?: string; name?: string; email?: string };
    onDismiss: () => void;
    onSelectNextSapien: () => void;
};

const ShareScreen: React.FC<ShareScreenProps> = ({
    person,
    onDismiss,
    onSelectNextSapien,
}) => {
    // Load Poppins fonts
    console.log('111person', person)
    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-semiBold': require('../../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    });


    useEffect(() => {
        // Hide splash screen when fonts are loaded
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>SapienScore shared with</Text>
                {person.name ? (
                    <Text style={styles.personName}>{person.name}</Text>

                ): (
                        
                <Text style={styles.personEmail}>{person}</Text>
                    )}

                <Text style={styles.helpText}>help your loved ones improve</Text>
                <Text style={styles.infoText}>
                    Share and receive SapienScores,{'\n'}
                    ANONYMOUSLY
                </Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.selectButton} onPress={onSelectNextSapien}>
                        <Text style={styles.selectButtonText}>Select your next Sapien &gt;</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C0C7CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 60,
        marginTop: 60,
        // marginBottom: 60,
    },
    title: {
        fontSize: 25,
        color: '#000000',
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        letterSpacing: -0.4,
        marginTop: 150
    },
    personName: {
        fontSize: 35,
        color: '#FFFFFF',
        marginBottom: 60,
        fontFamily: 'Poppins-Regular',
        fontWeight: 400,
        letterSpacing: -0.4
    },
    personEmail: {
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 20,
        fontFamily: 'Poppins-Regular',
        fontWeight: 400,
        letterSpacing: -0.4,
        textAlign: 'center',
        alignSelf: 'center'
    },
    helpText: {
        fontSize: 20,
        color: '#333333',
        marginBottom: 10,
        marginTop: 170,
        fontFamily: 'Poppins-Bold',
        fontWeight: 600,
    },
    infoText: {
        fontSize: 15,
        textAlign: 'center',
        // marginBottom: 60,
        fontFamily: 'Poppins-Light',
        color: '#FFFFFF',
        lineHeight: 20,
        fontWeight: 300,
        letterSpacing: -0.4
    },
    buttonsContainer: {
        top: 20,
    },
    selectButton: {
        paddingVertical: 12,
    },
    selectButtonText: {
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: 'Poppins-Regular',
        alignItems: "flex-end",
        marginLeft: 30,
        fontWeight: "400"
    },
    dismissButton: {
        marginTop: 15,
    },
    dismissButtonText: {
        fontSize: 25,
        color: '#000000',
        fontFamily: 'Poppins-Light',
        alignSelf: "flex-end",
        // fontStyle: "normal"
    },
});

export default ShareScreen;