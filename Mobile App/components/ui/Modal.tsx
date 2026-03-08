import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';

// Define the props interface for the component
interface SuccessModalProps {
    visible: boolean;
    message?: string;
    duration?: number; // Auto-hide duration in milliseconds
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    message = 'Successfully Sent',
    duration = 2000, // Default 2 seconds
    onClose,
}) => {
    // Animation values
    const fadeAnim = new Animated.Value(0);
    const bgFadeAnim = new Animated.Value(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (visible) {
            // Animate the notification and background when becoming visible
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(bgFadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Auto-hide modal after duration
            if (duration > 0) {
                timer = setTimeout(() => {
                    // Fade out animations
                    Animated.parallel([
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(bgFadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        })
                    ]).start(() => {
                        onClose();
                    });
                }, duration);
            }
        } else {
            // Reset animation values when modal is hidden
            fadeAnim.setValue(0);
            bgFadeAnim.setValue(0);
        }

        // Clear timeout on unmount
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [visible, duration, onClose, fadeAnim, bgFadeAnim]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    styles.modalBackground,
                    { opacity: bgFadeAnim }
                ]}
            >
                <Animated.View
                    style={[
                        styles.notificationContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.messageText}>{message}</Text>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContainer: {
        width: width * 0.7,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20


    },
    messageText: {
        fontSize: 15,
        color: '#555555',
        fontWeight: '300',
        fontFamily: "Poppins-Regular",
        alignSelf: "flex-start",
        lineHeight: 30
    },
});

export default SuccessModal;