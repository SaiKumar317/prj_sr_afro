/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {TextInput, View, Animated, TextStyle} from 'react-native';

interface FloatingLabelInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const translateY = new Animated.Value(!value ? 24 : 0);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: isFocused ? 14 : value ? 14 : 14,
    fontSize: 12,
    color: isFocused ? 'blue' : '#888',
    zIndex: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 4,
    fontWeight: isFocused ? 'normal' : 'bold',
  };

  return (
    <View style={{paddingTop: 18}}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        placeholder={label}
        placeholderTextColor="#8e918e"
        onChangeText={onChangeText}
        style={{
          borderRadius: 8,
          // borderBottomWidth: 1,
          // borderTopWidth: 1,
          // borderLeftWidth: 1,
          // borderRightWidth: 1,
          // borderColor: '#ccc',
          fontSize: 16,
          padding: 8,
          // marginTop: 6, // Adjust the top margin as needed
          color: 'black',
          backgroundColor: '#daedf5',
          marginBottom: 20,
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          height: 50,
        }}
      />
    </View>
  );
};

export default FloatingLabelInput;
