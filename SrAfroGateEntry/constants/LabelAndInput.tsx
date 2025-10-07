/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TextInput, TextInputProps} from 'react-native';

interface LabelAndInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  kbType: any;
  // Other props for TextInput
}

const LabelAndInput: React.FC<LabelAndInputProps & TextInputProps> = ({
  label,
  value,
  onChangeText,
  kbType,
  ...otherProps
}) => {
  return (
    <View style={{marginBottom: 10}}>
      <Text style={{fontWeight: 'bold'}}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#8e918e"
        style={{
          backgroundColor: '#daf0df',
          padding: 10,
          borderRadius: 10,
          marginTop: 5,
          marginBottom: 5,
        }}
        keyboardType={kbType}
        {...otherProps}
      />
    </View>
  );
};

export default LabelAndInput;
