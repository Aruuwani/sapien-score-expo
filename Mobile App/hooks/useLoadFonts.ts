import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export function useLoadFonts() {
    const [loaded, setLoaded] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function load() {
            await Font.loadAsync({
                'Poppins-Light': require('../assets/fonts/Poppins/Poppins-Light.ttf'),
                'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
                'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
                'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
                'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
                'Poppins-semiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
                'Poppins-ExtraLight': require('../assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
                // Map Italic alias used in some screens to ExtraLightItalic asset used in project
                'Poppins-Italic': require('../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
            });
            setLoaded(true);
        }
        load();
    }, []);

    // jab fonts loaded ho jaye, tab 1.5 second baad ready ko true karo to force re-render
    useEffect(() => {
        if (loaded) {
            const timer = setTimeout(() => {
                setReady(true);
            }, 1500); // 1500 ms = 1.5 seconds

            return () => clearTimeout(timer); // cleanup
        }
    }, [loaded]);

    return ready;
}
