/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Animated,
  TextStyle,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DropDownPicker, {ItemType} from 'react-native-dropdown-picker';

interface LabelAndSelectProps {
  label: string;
  value?: any;
  items: any;
  onData: (data: any) => void;
  zIndexValue: any;
  isDropDownShow: any;
  isOpen: any;
  onToggle: any;
}

const LabelAndSelect: React.FC<LabelAndSelectProps> = ({
  onData,
  label,
  value,
  items,
  zIndexValue,
  isDropDownShow,
  isOpen,
  onToggle,
  ...props
}) => {
  const [showDropDown, setshowDropDown] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  useEffect(() => {
    setshowDropDown(false);
    // Your logic here to reload the page, if needed
  }, [isDropDownShow]);

  // Use isOpen prop to set the dropdown visibility
  useEffect(() => {
    setshowDropDown(isOpen);
    console.log(isOpen);
  }, [isOpen]);

  // Function to handle opening and closing of dropdown
  const handleToggle = () => {
    onToggle(); // Notify the parent component about the toggle
  };

  // Call handleToggle to close the dropdown when clicked outside
  const handlePressOutside = () => {
    console.log('dropdownClicked');
    handleToggle();
  };

  const labelStyle: TextStyle = {
    // borderRadius: 6,
    // position: 'absolute',
    // left: 4,
    // top: showDropDown || value ? 14 : 14,
    // fontSize: 12,
    // color: showDropDown ? 'blue' : 'black',
    // zIndex: zIndexValue + 0.5,
    // paddingRight: 4,
    // paddingLeft: 4,
    // backgroundColor: 'white',
    // marginHorizontal: 12,
    fontWeight: 'bold',

    marginBottom: 5,
  };
  const placeholder = `Select ${label.toLowerCase()}`;
  // Conditionally set container height based on showDropDown
  // useEffect(() => {
  //   if (showDropDown) {
  //     setContainerHeight(250); // Set your desired height here when dropdown is shown
  //   } else {
  //     setContainerHeight(40); // Set default height when dropdown is not shown
  //   }
  // }, [showDropDown]);
  return (
    <View style={[styles.container]}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <DropDownPicker
        {...props}
        open={showDropDown}
        value={value}
        items={items}
        searchable={true}
        placeholder={placeholder}
        placeholderStyle={{color: '#8e918e'}}
        zIndex={zIndexValue}
        containerStyle={styles.dropdownContainer}
        onSelectItem={(item: ItemType<any>) => {
          console.log(item.value);
          // setSelectedItem(item.value);
          onData({value: item.value, label: item.label});
        }}
        style={{
          borderWidth: 0,
          backgroundColor: '#daf0df',
        }}
        dropDownContainerStyle={styles.dropdownContainerstyles}
        onOpen={handlePressOutside}
        onClose={handlePressOutside}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingTop: 18,
    marginBottom: 8,
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
  dropdownContainer: {
    height: 40,
    marginBottom: 15,
  },
  dropdownContainerstyles: {
    // zIndex: 100,
    // overflow: 'scroll', // Allow scrolling when overflow occurs
    // maxHeight: 200, // Adjust maximum height as needed
  },
});

export default LabelAndSelect;
