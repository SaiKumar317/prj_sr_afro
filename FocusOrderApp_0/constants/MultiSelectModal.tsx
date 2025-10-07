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
  FlatList,
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
    // const filtered = items.filter((item: any) =>
    //   item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    // );
    const lowerSearch = searchQuery?.toLowerCase() ?? '';
    const filtered = items?.filter((item: any) =>
      Object.values(item).some(
        field =>
          (typeof field === 'string' &&
            field.toLowerCase().includes(lowerSearch)) ||
          (typeof field === 'number' && field.toString().includes(lowerSearch)),
      ),
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
    color: 'black',
    zIndex: 20,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    fontWeight: 'bold',
    borderWidth: 0.3,
    borderColor: 'black',
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
              {/* {selectedItems.map((item: any) => item.label).join(', ')} */}
              {selectedItems.length === items.length
                ? 'All are selected'
                : selectedItems.length > 1
                ? `${selectedItems[0].label} ,+ ${selectedItems.length - 1}`
                : selectedItems[0].label}

              {/* {selectedItems.length === items.length
                ? 'All are selected'
                : ' selected'} */}
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
                      <Text
                        style={{
                          color: 'black',
                          fontWeight: '600',
                          fontSize: 15,
                        }}>
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                    {/* <ScrollView>
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
                    </ScrollView> */}
                    <FlatList
                      data={filteredItems}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          // style={styles.item}
                          style={[
                            styles.item,
                            selectedItems.includes(item) && styles.selectedItem,
                          ]}
                          onPress={() => handlePressItem(item)}>
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '600',
                              fontSize: 15,
                            }}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
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
    borderWidth: 0.3,
    borderColor: 'black',
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
    borderColor: 'black',
    fontWeight: 'bold',
    borderRadius: 5,
    padding: 10,
    // color: '#888',
    color: '#333',
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    borderBottomColor: '#333',
    color: 'black',
  },
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
  watermark: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
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
