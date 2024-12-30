/* eslint-disable react-native/no-inline-styles */
import {faCaretDown} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  TextStyle,
} from 'react-native';

interface LabelAndSelectProps {
  label: string;
  value?: any;
  items: any;
  onData: (data: any) => void;
  clearMultiSelect: any;
}

const MultiSelectModal: React.FC<LabelAndSelectProps> = ({
  onData,
  label,
  value,
  items,
  clearMultiSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedItems, setSelectedItems] = useState(value || []);
  const [allSelected, setAllSelected] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Your logic here to reload the page, if needed
    // setIsLoading(false);
    setSelectedItems([]);
  }, [clearMultiSelect]);

  useEffect(() => {
    const filtered = items.filter((item: any) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  useEffect(() => {
    setAllSelected(
      selectedItems.length > 0 && selectedItems.length === items.length,
    );
  }, [selectedItems, items]);

  const handlePressItem = (item: any) => {
    const newSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter((i: any) => i !== item)
      : [...selectedItems, item];
    setSelectedItems(newSelectedItems);
  };

  const handlePressOutsideModal = () => {
    setModalVisible(false);
    setSearchQuery('');
    onData(selectedItems);
  };

  const handleApply = () => {
    setModalVisible(false);
    setSearchQuery('');
    onData(selectedItems);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
    setAllSelected(!allSelected);
  };

  const modalHeight =
    filteredItems.length > 0 ? Math.min(300, filteredItems.length * 50) : 200;
  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: -6,
    fontSize: 12,
    color: '#888',
    zIndex: 20,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TouchableOpacity
        style={styles.labelContainer}
        onPress={() => setModalVisible(true)}>
        <View style={{flex: 1}}>
          {selectedItems.length === 0 ? (
            <Text style={styles.watermark}>{label}</Text>
          ) : (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.label}>
              {selectedItems.map((item: any) => item.label).join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <TouchableWithoutFeedback onPress={handlePressOutsideModal}>
          <View style={styles.modalOverlay}>
            <View
              ref={modalRef}
              style={[styles.modalContainer, {height: modalHeight}]}>
              <View style={styles.modalContent}>
                {filteredItems.length === 1 &&
                filteredItems[0].label === '' &&
                filteredItems[0].value === 0 ? (
                  <Text style={[styles.item, {color: 'black'}]}>
                    No options available
                  </Text>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={`Search ${label}`}
                      placeholderTextColor={'#888'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity
                      style={[
                        styles.item,
                        allSelected && styles.selectedItem,
                        {backgroundColor: '#f0f0f0'},
                      ]}
                      onPress={handleSelectAll}>
                      <Text style={{color: 'black'}}>
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                    <ScrollView>
                      {filteredItems.map((item: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.item,
                            selectedItems.includes(item) && styles.selectedItem,
                          ]}
                          onPress={() => handlePressItem(item)}>
                          <Text style={{color: 'black'}}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApply}>
                        <Text style={styles.applyButtonText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
  },
  iconContainer: {},
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'black',
  },
  modalContainer: {
    minHeight: 360,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    overflow: 'hidden',
    color: 'black',
  },
  modalContent: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    color: '#888',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
  watermark: {
    fontSize: 16,
    color: '#888',
  },
  applyButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default MultiSelectModal;
