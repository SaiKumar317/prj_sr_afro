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
  Dimensions,
} from 'react-native';

interface LabelAndSelectProps {
  label: string;
  value?: any;
  items: any;
  onData: (data: any) => void;
}

const TableSelectModal: React.FC<LabelAndSelectProps> = ({
  onData,
  label,
  value,
  items,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const modalRef = useRef(null);
  //   const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Filter items based on search query
    const filtered = items.filter((item: any) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const handlePressItem = (item: any) => {
    setModalVisible(false);
    setSearchQuery('');
    console.log('selectedItem', item);
    onData(item);
  };

  const handlePressOutsideModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const modalHeight =
    filteredItems.length > 0 ? Math.min(300, filteredItems.length * 50) : 200;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.labelContainer}
        onPress={() => setModalVisible(true)}>
        <View style={{flex: 1}}>
          {value === null ? (
            <Text style={styles.watermark}>{label}</Text>
          ) : (
            <Text style={styles.label}>{value}</Text>
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
                <TextInput
                  style={styles.input}
                  placeholder={`Search ${label}`}
                  placeholderTextColor={'#888'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <ScrollView>
                  {filteredItems.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.item}
                      onPress={() => handlePressItem(item)}>
                      <Text style={{color: 'black'}}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
    marginBottom: 8,
  },
  iconContainer: {
    // marginHorizontal: 3,
    // marginRight: 5,
    // paddingRight: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    color: 'black',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    // paddingRight: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    // overflow: 'scroll',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    minHeight: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  item: {
    color: 'black',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  watermark: {
    fontSize: 16,
    color: '#888',
  },
});

export default TableSelectModal;
