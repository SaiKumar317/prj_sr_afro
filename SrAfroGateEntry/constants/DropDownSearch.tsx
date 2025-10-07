import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, Text, FlatList} from 'react-native';

const Dropdown = ({options, onOptionSelected}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [showOptions, setShowOptions] = useState(false);

  const filterOptions = text => {
    setSearchText(text);
    setFilteredOptions(
      options.filter(option =>
        option.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowOptions(true);
  };

  const onOptionPress = option => {
    setSearchText(option);
    onOptionSelected(option);
    setShowOptions(false);
  };

  return (
    <View>
      <TextInput
        value={searchText}
        onFocus={() => setShowOptions(true)}
        onChangeText={filterOptions}
        placeholder="Search..."
      />
      {showOptions && (
        <FlatList
          data={filteredOptions}
          contentContainerStyle={{height: 150}}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => onOptionPress(item)}
              style={{height: 30}}>
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
      )}
    </View>
  );
};

export default Dropdown;
