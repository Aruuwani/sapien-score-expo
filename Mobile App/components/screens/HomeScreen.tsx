import { useFonts } from 'expo-font';
import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
interface HomeScreenProps {
    onReceivedScore: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onReceivedScore }) => {

    const [fontsLoaded] = useFonts({
        'Poppins-Light': require('../../assets/fonts/Poppins/Poppins-Light.ttf'),
        'Poppins-Regular': require('../../assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins/Poppins-Bold.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins/Poppins-Medium.ttf'),
    });




    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#C0C7CC" /> */}

                <View style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/images/logosapian.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </View>
            <View style={styles.contentContainer}>

                <Text style={styles.tagline}>let your network progress</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.loginText}>
                        You can only login{'\n'}through invite
                    </Text>
                </View>

                <View style={styles.waitContainer}>
                    <Text style={styles.waitText}>
                        Kindly wait until you receive a{'\n'}score from your friends
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={onReceivedScore}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        I received a SapienScore
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C0C7CC', // Updated to match the image's light gray/blue background
    },
    contentContainer: {

        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // paddingTop: 80, // Increased to match the image's top spacing
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        // maxWidth: 430,
        width: '100%',
        paddingTop:80,
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
    tagline: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        color: '#FFFFFF', // White color matching image
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 130, // Increased space to match image
        verticalAlign: "middle",
        letterSpacing: -0.4,
        width: '100%',
    },
    infoContainer: {
        alignItems: 'flex-start',
        width: '100%',
    },
    loginText: {
        fontSize: 20,
        fontFamily: 'Poppins-Light',
        fontWeight: '300',
        color: '#000000', // Dark text color matching image
        textAlign: 'left',
        marginBottom: 50, // Increased spacing between texts
        lineHeight: 26,
        verticalAlign: "middle"
    },
    waitContainer: {
        alignItems: 'flex-end',
        width: '100%',
    },
    waitText: {
        fontFamily: 'Poppins-Light', // Ensure the font is linked properly in your project
        // fontWeight: '300',
        fontSize: 20,
        lineHeight: 22.6, // 113.99% of 20px is roughly 22.6px
        letterSpacing: -0.4, // -2% of 20px is roughly -0.4px
        textAlign: 'right',
        textAlignVertical: 'center',
    },
    button: {
        backgroundColor: '#FFFFFF', // White button matching image
        // paddingVertical: 16,
        paddingHorizontal: 50,
        borderRadius: 10, // Slightly more rectangular with rounded corners
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 50, // Position from bottom to match image
        maxWidth: 270,
        shadowColor: '#777777',
        shadowOffset: { width: -2, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
        marginBottom: 60,
        gap: 20,
        height: 75
    },
    buttonText: {
        fontSize: 20,
        fontFamily: 'Poppins-Regular',
        color: '#FF8541', // Orange text color matching image
        width: 152,
        letterSpacing: -0.4,
        textAlign: "center",
        lineHeight: 25
    },
});

export default HomeScreen;