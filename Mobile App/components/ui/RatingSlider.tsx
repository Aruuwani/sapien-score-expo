import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    GestureResponderEvent,
    PanResponder,
    PanResponderInstance,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface RatingSliderProps {
    data: (key: string, value: number, index: number) => void;
    sliderKey: string;
    index: number;
    initialValue: number;
}

const RatingSlider: React.FC<RatingSliderProps> = ({ sliderKey, index, data, initialValue }) => {
    const animatedValue = useRef(new Animated.Value(initialValue)).current;
    const [value, setValue] = useState<number>(initialValue);
    const sliderRef = useRef<View>(null);
    const [sliderWidth, setSliderWidth] = useState<number>(0);
    const [sliderPosition, setSliderPosition] = useState<{ x: number, width: number }>({ x: 0, width: 0 });

    const minValue = 0;
    const maxValue = 10;
    const step = 1;

    const ticks = Array.from({ length: maxValue - minValue + 1 }, (_, i) => i);

    useEffect(() => {
        setValue(initialValue);
        animatedValue.setValue(initialValue);
    }, [initialValue, animatedValue]);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value,
            duration: 100,
            useNativeDriver: false,
        }).start();
    }, [value, animatedValue]);

    const activeWidthPercentage = animatedValue.interpolate({
        inputRange: [minValue, maxValue],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    const thumbLeftPosition = animatedValue.interpolate({
        inputRange: [minValue, maxValue],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    const handleValueChange = (newPosition: number) => {
        if (sliderWidth <= 0) return;

        const percentage = Math.max(0, Math.min(1, newPosition / sliderWidth));
        const rawValue = minValue + (maxValue - minValue) * percentage;
        const steppedValue = Math.round((rawValue - minValue) / step) * step + minValue;
        const clampedValue = Math.max(minValue, Math.min(maxValue, steppedValue));

        setValue(clampedValue);
        data(sliderKey, clampedValue, index);
    };

    const panResponder: PanResponderInstance = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
            if (sliderPosition.width > 0) {
                const touchX = gestureState.x0 - sliderPosition.x;
                handleValueChange(touchX);
            }
        },
        onPanResponderMove: (_, gestureState) => {
            if (sliderPosition.width <= 0) return;

            const touchX = gestureState.moveX - sliderPosition.x;
            handleValueChange(touchX);
        },
        onPanResponderRelease: () => { },
    });

    const handleTrackPress = (event: GestureResponderEvent) => {
        if (sliderPosition.width <= 0) return;

        const touchX = event.nativeEvent.pageX - sliderPosition.x;
        handleValueChange(touchX);
    };

    const onLayout = () => {
        if (sliderRef.current) {
            sliderRef.current.measure((x, y, width, height, pageX) => {
                setSliderWidth(width);
                setSliderPosition({ x: pageX, width });
            });
        }
    };

    const getTickStyle = (position: number) => {
        if (position === 0 || position === 10) {
            return { width: 1, height: 25, backgroundColor: '#000000' };
        } else if (position === 5) {
            return { width: 1, height: 30, backgroundColor: '#555555' };
        } else if (position % 5 === 0) {
            return { width: 1, height: 22, backgroundColor: '#999999' };
        } else {
            return { width: 1, height: 20, backgroundColor: '#999999' };
        }
    };

    return (
        <>
            <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderValueText}>{minValue}</Text>
                <Text style={styles.sliderValueText}>{maxValue}</Text>
            </View>
            <View style={styles.sliderOuterContainer}>
                <TouchableWithoutFeedback onPress={handleTrackPress}>
                    <View ref={sliderRef} style={styles.sliderContainer} onLayout={onLayout}>
                        <View style={styles.trackBackground} />
                        <Animated.View
                            style={[
                                styles.activeTrack,
                                { width: activeWidthPercentage },
                            ]}
                        />
                        <View style={styles.tickContainer}>
                            {ticks.map((tick) => (
                                <View
                                    key={tick}
                                    style={[
                                        styles.tick,
                                        getTickStyle(tick),
                                    ]}
                                />
                            ))}
                        </View>
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[
                                styles.thumb,
                                { left: thumbLeftPosition },
                            ]}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    sliderOuterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 40,
        marginVertical: 4,
    },
    sliderLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: -15,
    },
    sliderContainer: {
        flex: 1,
        height: 40,
        marginHorizontal: 5,
        position: 'relative',
        justifyContent: 'center',
    },
    trackBackground: {
        position: 'absolute',
        height: 1,
        width: '100%',
        backgroundColor: '#777777',
        top: '50%',
        marginTop: -1,
        opacity: 0.3,
    },
    activeTrack: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#FF8541',
        top: '50%',
        marginTop: -1,
        left: 0,
    },
    tickContainer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    tick: {
        backgroundColor: '#CCCCCC',
    },
    thumb: {
        position: 'absolute',
        width: 17,
        height: 17,
        borderRadius: 8.5,
        backgroundColor: '#FF8541',
        transform: [{ translateX: -8.5 }],
        top: '50%',
        marginTop: -8.5,
        zIndex: 10,
        elevation: 3,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    sliderValueText: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000000',
        width: 20,
        textAlign: 'center',
        fontFamily: "Poppins-Regular",
    },
});

export default RatingSlider;