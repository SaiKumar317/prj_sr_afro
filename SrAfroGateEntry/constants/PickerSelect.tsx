import React, {useState} from 'react';
import RNPickerSelect from 'react-native-picker-select';
import {View, Text} from 'react-native';

const PickerSelect = () => {
  const [selectedValue, setSelectedValue] = useState(null);

  const placeholder = {
    label: 'Select an option...',
    value: null,
  };

  const options = [
    {label: 'Option 1', value: 'option1'},
    {label: 'Option 2', value: 'option2'},
    {label: 'Option 3', value: 'option3'},
  ];

  return (
    <View>
      <Text>Select an option:</Text>
      <RNPickerSelect
        placeholder={placeholder}
        items={options}
        onValueChange={value => setSelectedValue(value)}
        value={selectedValue}
        pickerProps={{
          mode: 'dropdown', // Change mode to dropdown
          dropdownIconColor: 'blue', // Customize dropdown icon color
          style: {
            fontSize: 16,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 0.5,
            borderColor: 'purple',
            borderRadius: 8,
            color: 'black',
            paddingRight: 30, // to ensure the text is never behind the icon
          },
        }}
      />
      {selectedValue && <Text>Selected: {selectedValue}</Text>}
    </View>
  );
};

export default PickerSelect;
