/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, ActivityIndicator} from 'react-native';

const renderLoadingView = () => (
  <View
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 5003,
    }}>
    <ActivityIndicator size="large" color="#007bff" />
  </View>
);

export default renderLoadingView;
