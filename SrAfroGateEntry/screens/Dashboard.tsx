/* eslint-disable react-native/no-inline-styles */

// SettingsScreen.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Dashboard() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={styles.text}>Dashboard Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333', // Adjusted text color for labels
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  text: {
    color: '#333', // Adjusted text color for input text
  },
  picker: {
    height: 50,
    width: 150,
  },
});
