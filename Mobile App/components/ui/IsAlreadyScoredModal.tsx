// IsAlreadyScoredModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface IsAlreadyScoredModalProps {
  visible: boolean;
  onClose: () => void;
  relationName?: string;
}

const IsAlreadyScoredModal: React.FC<IsAlreadyScoredModalProps> = ({
  visible,
  onClose,
  relationName,
}) => {
  const message = relationName
    ? `You have already scored this person as "${relationName}".\n\nPlease select another category`
    : 'You have already scored this person in the selected category.\n\nPlease select another category';

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.messageContainer}>
          <View style={styles.contentContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={onClose}
            >
              <Text style={styles.messageText}>
                {message}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Bubble decorations */}
        <View style={styles.bubbleLarge} />
        <View style={styles.bubbleSmall} />
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#33353A', // Dark gray background as shown in image
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  messageContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: "50%",
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1.6,
    elevation: 5,
    transform: [{ rotate: '-20deg' }],
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.2,
    textAlignVertical: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontWeight: '300',
    color: '#000',
    fontFamily: 'Poppins-Light',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '20deg' }],
  },
  bubbleLarge: {
    position: 'absolute',
    bottom: '30%',
    left: '14%',
    width: 33,
    height: 39,
    backgroundColor: 'white',
    borderRadius: "50%",
    transform: [{ rotate: '104.11deg' }],
  },
  bubbleSmall: {
    position: 'absolute',
    bottom: '29%',
    left: '8%',
    width: 20,
    height: 18,
    backgroundColor: 'white',
    opacity: 1,
    borderRadius: "50%",
    transform: [{ rotate: '104.11deg' }],
  }
});

export default IsAlreadyScoredModal;

