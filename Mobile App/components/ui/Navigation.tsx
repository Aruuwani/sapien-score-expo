import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'

interface Props {
    initialTab: 'PROFILE' | 'Echoroom' | 'Score';
    setScreen: (screen: string) => void;
}

const Navigation = (props: Props) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(props.initialTab);
    console.log('activeTab', activeTab)
    // const handleClickScore = (tab:string, route:string) => {
    //     setActiveTab(tab);
    //     props.setScreen(route);


    // }

    const handleClickScore = React.useCallback((tab: "PROFILE" | "Echoroom" | "Score",route: string) => {
        setActiveTab(tab);
        props.setScreen(route);
    }, [activeTab, props.setScreen]);
    return (
        <View style={styles.bottomNavigation}>
            <TouchableOpacity
                style={[styles.navItem, styles.bdright]}
                activeOpacity={0.7}
                onPress={() => handleClickScore('PROFILE', 'dashboard')}
            >
                <Text style={activeTab === 'PROFILE' ? styles.navItemActive : styles.navItemText}>
                    PROFILE
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, styles.bdright]}
                activeOpacity={0.7}
                onPress={() => handleClickScore('Echoroom', 'echoroom')}
            >
                <Text style={activeTab === 'Echoroom' ? styles.navItemActive : styles.navItemText}>
                    Echoroom
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleClickScore('Score', 'userSelection')}
            >
                <Text style={activeTab === 'Score' ? styles.navItemActive : styles.navItemText}>
                    Score
                </Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    bottomNavigation: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        // marginLeft: -20,
        width: '100%',
        // maxWidth: 600,
        paddingVertical: 8,
        paddingHorizontal: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E4E4E4',
        height: 65,
        marginBottom: 15,
    },
    bdright: {
        borderRightWidth: 1,
        borderRightColor: '#E4E4E4',
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    navItemText: {
        color: '#3A3A3A',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: "Poppins-Medium",
        letterSpacing: -0.2
    },
    navItemActive: {
        color: '#3A3A3A',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: "Poppins-Bold",
        letterSpacing: -0.2
    },
})
export default Navigation