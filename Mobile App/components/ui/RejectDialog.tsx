import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  submessage: string;
  options: {
    left: {
      text: string;
      action: () => void;
      bold?: boolean;
    };
    right: {
      text: string;
      action: () => void;
      bold?: boolean;
    };
  };
  type: 'reject' | 'accept';
}

const RejectDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  // title,
  message,
  submessage,
  options,
  // type,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={options.left.action}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogOuterWrapper}>
          {/* Main dialog - styled like the image with the rotation */}
          <View style={styles.dialogContainer}>
            <View style={styles.contentContainer}>
              {/* <Text style={styles.title}>{title}</Text> */}
              <Text style={styles.message}>{message}</Text>
              <Text style={styles.submessage}>{submessage}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.leftButton}
                  onPress={options.left.action}
                >
                  <Text style={styles.leftButtonText}>
                    {options.left.text}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rightButton}
                  onPress={options.right.action}
                >
                  <Text style={styles.rightButtonText}>
                    {options.right.text}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Speech bubble elements - positioned relative to the container */}
          <View style={styles.bubbleLarge} />
          <View style={styles.bubbleSmall} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 53, 58, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dialogOuterWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: "50%",
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1.7,
    elevation: 5,
    transform: [{ rotate: '-20deg' }],
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '20deg' }],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    color: '#000',
  },
  message: {
    fontFamily: 'Poppins-Light',
    fontWeight: '300',
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: "rgba(0, 0, 0, 1)"
  },
  submessage: {
    fontFamily: 'Poppins-Light',
    fontWeight: '300',
    fontSize: 10,
    lineHeight: 24,
    letterSpacing: -0.3,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: "rgba(0, 0, 0, 1)"
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  leftButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  rightButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 133, 65, 1)',
    alignItems: 'center',
  },
  leftButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  rightButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
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
  },
});

export default RejectDialog;