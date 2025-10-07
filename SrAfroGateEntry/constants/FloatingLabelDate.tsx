/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Animated,
  TextStyle,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FloatingLabelInputProps {
  label: string;
  value?: any;
  onChangeDate?: (text: string) => void;
  onData: (data: any) => void;
  reloadKey: any;
}

const FloatingLabelDate: React.FC<FloatingLabelInputProps> = ({
  onData,
  label,
  value,
  reloadKey,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [date, setDate] = React.useState(new Date());

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  React.useEffect(() => {
    onData({currentDate: value});
    setDate(value);
    console.log('handleDateChange', value);
  }, [reloadKey, value]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowDatePicker(true); // Show date picker when input is focused
  };

  const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setIsFocused(false);
    setDate(currentDate);
    onData({currentDate});
  };

  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: isFocused || value ? 14 : 14,
    fontSize: 12,
    fontWeight: isFocused ? 'normal' : 'bold',
    color: isFocused ? 'blue' : '#888',
    zIndex: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 4,
  };

  return (
    <View style={{paddingTop: 18, paddingBottom: 18}}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TouchableOpacity onPress={handleFocus} style={styles.input_date}>
        <Text style={styles.inputText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          {...props}
          value={value}
          testID="dateTimePicker"
          mode="date"
          display="default"
          onChange={handleDateChange}
          style={styles.input_date}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333', // Adjusted text color for labels
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inputText: {
    padding: 5,
    color: 'black', // Adjusted text color for input text
  },
  picker: {
    height: 50,
    width: 150,
  },
  input_date: {
    backgroundColor: '#daedf5',
    borderRadius: 8,
    // borderBottomWidth: 1,
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    borderColor: 'black',
    fontSize: 16,
    padding: 12,
    // height: 60,
    marginBottom: 6,
    // marginTop: , // Adjust the top margin as needed
    color: 'black',
  },
});

export default FloatingLabelDate;
