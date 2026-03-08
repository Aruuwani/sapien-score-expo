// BlockedMessageModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';


interface BlockedMessageModalProps {
  visible: boolean;
  onClose: () => void;
}

const BlockedMessageModal: React.FC<BlockedMessageModalProps> = ({
  visible,
   onClose,
}) => {
  return (
    <Modal
      transparent={true}  
      visible={visible}
      animationType="fade"

    >
      <View style={styles.overlay}>
        <View style={styles.messageContainer}>
          <View style={styles.contentContainer}>

            <TouchableOpacity
              onPress={onClose}
            >
              <Text style={styles.messageText}>Blocked User</Text>
            </TouchableOpacity>
          </View>

        </View>
        {/* Bubble decorations */}
        <View style={styles.bubbleLarge} />
        <View style={styles.bubbleSmall} />
      </View>
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

export default BlockedMessageModal;