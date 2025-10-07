/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface LabelAndDateInputProps {
  label: string;
  value?: Date; // Make value prop optional
  onChange: (date: Date) => void;
}

const LabelAndDateInput: React.FC<LabelAndDateInputProps> = ({
  label,
  value = new Date(),
  onChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={{marginBottom: 10}}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{value.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
  },
  dateText: {
    backgroundColor: '#daedf5',
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    lineHeight: 30,
  },
});

export default LabelAndDateInput;
