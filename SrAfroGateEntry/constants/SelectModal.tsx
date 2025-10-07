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
  Animated,
  TextStyle,
  FlatList,
} from 'react-native';

interface LabelAndSelectProps {
  label: string;
  value?: any;
  items: any;
  onData: (data: any) => void;
}

const SelectModal: React.FC<LabelAndSelectProps> = ({
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
    const filtered = items?.filter((item: any) =>
      item?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase()),
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
          {value === null ? (
            <Text style={styles.watermark}>{label}</Text>
          ) : (
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.label}>
              {value}
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
                    <FlatList
                      data={filteredItems}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={[
                            styles.item,
                            value === item.label && styles.selectedItem,
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
                    {/* <ScrollView>
                      {filteredItems.map((item: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          // style={styles.item}
                          style={[
                            styles.item,
                            value === item.label && styles.selectedItem,
                          ]}
                          onPress={() => handlePressItem(item)}>
                          <Text style={{color: 'black'}}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView> */}
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
  iconContainer: {
    // marginHorizontal: 3,
    // marginRight: 5,
    // paddingRight: 5,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    padding: 8,
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    color: 'black',
  },
  modalContainer: {
    minHeight: 300,
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
    // marginBottom: 10,
    color: '#888',
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
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
});

export default SelectModal;
