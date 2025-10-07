/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {TextInput, View, Animated, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';

interface FloatingLabelInputProps {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
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
    color: isFocused ? '#0f6cbd' : 'black',
    zIndex: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 4,
    fontWeight: isFocused ? 'bold' : 'bold',
    borderWidth: isFocused ? 0.3 : 0.3,
    borderColor: isFocused ? '#0f6cbd' : 'black',
  };

  const inputBackgroundColor = editable
    ? '#daedf5' // Editable but not focused and no value
    : '#e0e0e0'; // Non-editable, gray background

  return (
    <View style={{paddingTop: 18}}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {editable ? (
        <TextInput
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          placeholder={label}
          placeholderTextColor="#8e918e"
          onChangeText={onChangeText}
          editable={editable}
          style={{
            borderRadius: 8,
            // borderBottomWidth: 1,
            // borderTopWidth: 1,
            // borderLeftWidth: 1,
            // borderRightWidth: 1,
            borderWidth: isFocused ? 1 : 0.4,
            borderColor: isFocused ? '#0f6cbd' : 'black',
            fontSize: 17,
            fontWeight: '600',
            padding: 8,
            // marginTop: 6, // Adjust the top margin as needed
            color: 'black',
            backgroundColor: inputBackgroundColor,
            marginBottom: 20,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            height: 50,
            // width: 300,
            // flex: 1,
          }}
        />
      ) : (
        <Text
          // numberOfLines={1} // or remove for wrapping
          // ellipsizeMode="tail" // show "..." when text overflows
          style={{
            borderRadius: 8,
            fontSize: 17,
            fontWeight: '600',
            padding: 8,
            color: 'black',
            borderWidth: isFocused ? 1 : 0.4,
            borderColor: isFocused ? '#0f6cbd' : 'black',
            backgroundColor: inputBackgroundColor,
            marginBottom: 20,
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            // Allow the text to wrap and grow vertically
            flexWrap: 'wrap',
            // Optional: width constraint
            width: '100%', // or a fixed width like 300
            minHeight: 50,
            // textAlign: 'center', // ⬅️ Horizontally center text
            textAlignVertical: 'center', // ⬅️ Vertically center (Android only)
          }}>
          {value}
        </Text>
      )}
    </View>
  );
};

export default FloatingLabelInput;
