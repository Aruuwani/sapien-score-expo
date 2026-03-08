import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SuccessMessage = (message) => {
  return (
    <View style={styles.container}>
          <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 40, // pill shape
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 50,
  },
  text: {
    color: '#4A4A4A', // light grey text
    fontSize: 18,
    fontWeight: '400',
  },
});

export default SuccessMessage;
