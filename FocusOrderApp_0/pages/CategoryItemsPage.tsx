/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */

import * as React from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
const focus_rt_black = require('../assets/images/focus_rt_black.png');
const bg_image = require('../assets/images/bg_image.jpg');

import {faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import ImageViewer from 'react-native-image-zoom-viewer';
import {getDBConnection} from '../services/SQLiteService';
import {
  addToCart,
  removeFromCart,
  createCartTable,
} from '../services/CartService';
import {parse} from '@fortawesome/fontawesome-svg-core';
import {useState} from 'react';

type CategoryItemsPageProps = {
  onData: (data: any) => void;
  masterResponse: string;
  // gridDataresponse: any;
  reloadPage: any;
  selectedCategory: any;
};

const screenHeight = Dimensions.get('window').height;

const CategoryItemsPage: React.FC<CategoryItemsPageProps> = ({
  onData,
  masterResponse,
  // gridDataresponse,
  selectedCategory,
  reloadPage,
}) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isLoading, setIsLoading] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<any>([]);
  const [categoryItems, setCategoryItems] = React.useState<any>([]);
  const [itemImages, setItemImages] = React.useState<{[key: string]: string}>(
    {},
  );

  const [inputQuantity, setInputQuantity] = React.useState<{
    [key: string]: any;
  }>({}); // Local state for input quantity
  const [isFocused, setIsFocused] = useState({});
  const [searchTerm, setSearchTerm] = React.useState(''); // State for search input
  const [currencyCode, setCurrencyCode] = React.useState('');
  const [loadingStates, setLoadingStates] = React.useState<{
    [key: string]: boolean;
  }>({});
  // Filter categoryItems based on the search term, checking both ProductName and ProductCode
  // const filteredCategoryItems = categoryItems.filter(
  //   (item: {ProductName: string; ProductCode: string}) =>
  //     item.ProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     item.ProductCode.toLowerCase().includes(searchTerm.toLowerCase()),
  // );

  const filteredCategoryItems = categoryItems.filter(
    (item: {ProductName: string; ProductCode: string}) => {
      // Split the search term into individual words and make them lowercase
      const searchWords = searchTerm.toLowerCase().split(/\s+/);

      // Check if all search words are found in either ProductName or ProductCode
      return searchWords.every(
        word =>
          item.ProductName.toLowerCase().includes(word) ||
          item.ProductCode.toLowerCase().includes(word),
      );
    },
  );

  const showToast = (message: React.SetStateAction<string>) => {
    console.log('showToast', message);
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };
  function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // console.log('categoryItems', categoryItems);
  const fetchCategoryItems = React.useCallback(async (category: any) => {
    try {
      onData({isLoading: true});
      const db = await getDBConnection();
      var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
        'POSSalePreferenceData',
      );
      var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
      // Get products for the selected category using actual column names
      const [results] = await db.executeSql(
        `SELECT 
          p.ProductId,
          p.ProductName,
          p.ProductCode,
          pr.Rate,
          p.ProductImage,
          p.CategoryId,
          p.CategoryName,
          p.CurrencyId,
          p.CurrencyCode,
          c.Quantity,
          pr.discountP,
          sum(b.ConsumedQty) AS ConsumedQty,
          (SUM(b.BatchQty) - COALESCE(SUM(b.ConsumedQty), 0) - COALESCE(SUM(b.ConsumedQtyLocal), 0)) AS TotalStock
        FROM Products p
        JOIN Prices pr on pr.ProductId = p.ProductId
        LEFT JOIN Cart c on c.ProductId = p.ProductId
        LEFT JOIN Stock b ON b.iProduct = p.ProductId
        WHERE CategoryId = ?
       AND b.iExpiryDate >= ${getCurrentDate()}
       --AND pr.endDate >= ${getCurrentDate()}
      AND b.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
       -- AND pr.compBranchId = ${parsedPOSSalesPreferences?.compBranchId}
        GROUP BY 
    p.ProductId, 
    p.ProductName, 
    p.ProductCode, 
    pr.Rate, 
    p.ProductImage, 
    p.CategoryId, 
    p.CategoryName, 
    p.CurrencyId, 
    p.CurrencyCode
    ORDER BY
    c.Quantity DESC, 
    TotalStock DESC;`,
        [category.CategoryId], // Use CategoryId directly
      );

      if (results.rows.length > 0) {
        const products = [];
        const images = {};
        console.log('products Total', results.rows.length);
        for (let i = 0; i < results.rows.length; i++) {
          const item = results.rows.item(i);
          products.push(item);

          // If product has an image, add it to images object
          if (item.ProductImage) {
            images[item.ProductId] = item.ProductImage; // Use ProductId directly
          }
        }

        setCategoryItems(products);
        // const cartItems: any = await getCartItems();
        const initialcartQty = products.reduce((acc, item) => {
          acc[item.ProductId] = item.Quantity; // Set ProductId as key and Quantity as value
          return acc;
        }, {} as {[key: string]: number}); // Initialize as an empty object
        setInputQuantity(initialcartQty);
        setItemImages(images);
        // setCartItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching category items:', error);
    } finally {
      onData({isLoading: false});
    }
  }, []);

  React.useEffect(() => {
    if (selectedCategory) {
      fetchCategoryItems(selectedCategory);
    }
    console.log('selectedCategory', selectedCategory);
  }, [selectedCategory, fetchCategoryItems]);

  React.useEffect(() => {
    createCartTable();
  }, []);

  // Function to add Quantity to categoryItems
  const addQuantityToCategoryItems = (
    categoryItems: any[],
    cartItems: any[],
  ) => {
    return categoryItems.map(item => {
      const cartItem = cartItems.find(cart => cart.itemId === item.ProductId);
      return {
        ...item,
        Quantity: cartItem ? cartItem.quantity : 0,
      };
    });
  };

  // Ensure this effect runs when cartItems changes
  React.useEffect(() => {
    if (categoryItems.length > 0 && cartItems.length > 0) {
      const updatedCategoryItems = addQuantityToCategoryItems(
        categoryItems,
        cartItems,
      );
      setCategoryItems(updatedCategoryItems);
    }
  }, [cartItems]);

  const handleAddToCart = async (item: {
    ProductName: any;
    Rate: any;
    ProductId: any;
  }) => {
    setLoadingStates(prev => ({...prev, [item.ProductId]: true})); // Use ProductId directly
    try {
      await addToCart(item.ProductId, 1); // Add item with quantity 1
      // await fetchCartItems(); // Fetch updated cart items

      // Update category items to reflect the new cart quantity
      setCategoryItems((prevItems: any[]) =>
        prevItems.map((prevItem: {ProductId: any; Quantity: any}) =>
          prevItem.ProductId === item.ProductId
            ? {...prevItem, Quantity: (prevItem.Quantity || 0) + 1} // Increment cart quantity
            : prevItem,
        ),
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoadingStates(prev => ({...prev, [item.ProductId]: false})); // Use ProductId directly
    }
  };
  // const handleFocus = (item: any) =>
  //   setIsFocused(prev => ({
  //     ...prev,
  //     [item?.ProductId]: true, // Update with valid quantity
  //   }));
  // const handleBlur = (item: any) =>
  //   setIsFocused(prev => ({
  //     ...prev,
  //     [item?.ProductId]: false, // Update with valid quantity
  //   }));
  const handleAddProduct = async (
    item: {
      ProductName: any;
      Rate: any;
      ProductId: any;
    },
    quantity: any,
  ) => {
    const qty = quantity.toString().replace(/^0+/, '');
    console.log('handleAddProducttest', quantity, !isNaN(quantity), qty);
    if (quantity < 0) {
      return;
    } // Prevent negative quantities
    // setLoadingStates(prev => ({...prev, [item.ProductId]: true})); // Use ProductId directly
    try {
      if (!isNaN(quantity)) {
        await addToCart(item.ProductId, qty); // Add item with the specified quantity
      } else {
      }
      // Update category items to reflect the new cart quantity
      // setCategoryItems((prevItems: any[]) =>
      //   prevItems.map((prevItem: {ProductId: any; Quantity: any}) =>
      //     prevItem.ProductId === item.ProductId
      //       ? {...prevItem, Quantity: quantity} // Update cart quantity
      //       : prevItem,
      //   ),
      // );
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // setLoadingStates(prev => ({...prev, [item.ProductId]: false})); // Use ProductId directly
    }
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
  ) => {
    setLoadingStates(prev => ({...prev, [productId]: true}));
    try {
      console.log('handleQuantityChange', newQuantity, newQuantity > 0);
      if (newQuantity > 0) {
        await addToCart(parseInt(productId), newQuantity); // Update quantity in the database
      } else {
        await removeFromCart(parseInt(productId)); // Remove item if quantity is 0
      }

      // Fetch updated cart items
      // await fetchCartItems(); // Fetch updated cart items

      // Update category items to reflect the new cart quantity
      setCategoryItems((prevItems: any[]) =>
        prevItems.map((item: {ProductId: string}) =>
          item.ProductId === productId
            ? {...item, Quantity: newQuantity} // Update cart quantity in local state
            : item,
        ),
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoadingStates(prev => ({...prev, [productId]: false}));
    }
  };

  const handleIncrementQuantity = (
    productId: string,
    currentQuantity: number,
  ) => {
    console.log('currentQuantity', currentQuantity);
    handleQuantityChange(productId, currentQuantity + 1); // Increment quantity
  };

  const handleDecrementQuantity = (
    productId: string,
    currentQuantity: number,
  ) => {
    if (currentQuantity > 1) {
      handleQuantityChange(productId, currentQuantity - 1); // Decrement quantity
    } else {
      handleQuantityChange(productId, 0); // Remove item if quantity is 0
    }
  };

  // Function to handle item deletion
  const handleDeleteItem = async (productId: any) => {
    try {
      await removeFromCart(productId); // Remove item from cart
      // Update category items state to set Quantity to 0 for the deleted item
      setCategoryItems((prevItems: any[]) =>
        prevItems.map(
          (item: {ProductId: any}) =>
            item.ProductId === productId ? {...item, Quantity: 0} : item, // Set Quantity to 0 for the deleted item
        ),
      );
    } catch (error) {
      console.error('Error deleting item from cart:', error);
    }
  };

  // Add new state for modal
  const [selectedItem, setSelectedItem] = React.useState<{
    image: string;
    name: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  // Add handler for image press
  const handleImagePress = (imageUri: string, itemName: string) => {
    console.log('imageUri', imageUri);
    setSelectedItem({image: imageUri, name: itemName});
    setModalVisible(true);
  };

  // Add modal close handler
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Update the image rendering in renderItem
  const renderItem = ({item}) => (
    <View
      style={[
        styles.item,
        {
          borderWidth: 0.4,
          borderColor: '#0f6cbd',
        },
      ]}>
      <View style={[styles.row, styles.inspect]}>
        <View
          style={[styles.inspect, {flexDirection: 'row', paddingBottom: 8}]}>
          <View style={styles.imageContainer}>
            <TouchableOpacity
              onPress={() =>
                handleImagePress(
                  item.ProductImage && item?.ProductImage !== 'AA=='
                    ? `data:image/png;base64,${item.ProductImage}`
                    : focus_rt_black,
                  item.ProductName,
                )
              }>
              <Image
                source={
                  item.ProductImage && item?.ProductImage !== 'AA=='
                    ? {
                        uri: `data:image/png;base64,${item.ProductImage}`,
                      }
                    : focus_rt_black
                }
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.textContainer}>
            {/* Product name */}
            <View>
              <Text style={styles.title}>{item.ProductName}</Text>
              <Text style={styles.subText}>{item.ProductCode}</Text>

              {/* Product quantity */}
              <Text style={styles.subText}>
                Available Stock:{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {/* {item.ConsumedQty} */}
                  {item.TotalStock || 0}
                </Text>
              </Text>

              {/* Product rate */}
              <Text style={styles.subText}>
                Rate: {item.CurrencyCode}{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {item.Rate}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        {/* Line above the quantity container */}
        <View style={styles.divider} />
        <View style={styles.quantityContainer}>
          {/* Quantity */}
          <Text style={styles.subText}>Quantity: </Text>

          {/* {loadingStates[item.ProductId] ? (
            // Show single loader when any action is in progress
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#51c7d6" />
            </View>
          ) : (  )} */}
          {/* // Show actions when not loading */}
          <>
            {/* {item?.Quantity == 0 || !item?.Quantity ? ( */}
            {false ? (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    opacity: item?.Rate <= 0 || item?.TotalStock <= 0 ? 0.5 : 1,
                  }, // Disable button if Rate <= 0 or Stock <= 0
                ]}
                onPress={() => {
                  if (true) {
                    handleAddToCart(item);
                  }
                }}
                // onPress={() => {
                //   if (item?.Rate > 0 && item?.TotalStock > 0) {
                //     handleAddToCart(item);
                //   }
                // }}
                // disabled={item?.Rate <= 0 || item?.TotalStock <= 0} // Disable button
              >
                <Text style={styles.addButtonText}>Add Quantity</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityContainer}>
                {/* {item?.Quantity == 1 ? (
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleDeleteItem(item?.ProductId)}>
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        size={20}
                        color="#51c7d6"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        handleDecrementQuantity(item?.ProductId, item?.Quantity)
                      }>
                      <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                  )} */}

                {/* <Text style={styles.quantityText}>{item?.Quantity}</Text> */}
                {/* <TextInput
                    style={styles.quantityText}
                    value={item?.Quantity}
                  /> */}
                <TextInput
                  editable={item.TotalStock && item.Rate > 0 ? true : false}
                  // value={item?.Quantity.toString()}
                  value={inputQuantity?.[item?.ProductId]?.toString()}
                  placeholder="Add Quantity"
                  placeholderTextColor="#8e918e"
                  // onFocus={handleFocus(item)}
                  // onBlur={handleBlur(item)}
                  onChangeText={quantity => {
                    const parsedQuantity = parseInt(quantity);

                    if (
                      !isNaN(parsedQuantity) &&
                      parsedQuantity <= item.TotalStock &&
                      parsedQuantity > 0
                    ) {
                      handleAddProduct(item, parsedQuantity);
                      setInputQuantity(prev => ({
                        ...prev,
                        [item?.ProductId]: parsedQuantity, // Update with valid quantity
                      }));
                    } else {
                      setInputQuantity(prev => ({
                        ...prev,
                        [item?.ProductId]: '', // Update with valid quantity
                      }));
                      // Handle invalid input (optional: show an error message, etc.)
                      if (isNaN(parsedQuantity)) {
                        handleAddProduct(item, quantity);
                        console.log('Invalid quantity entered');
                      } else {
                        console.log(
                          `Quantity exceeds available stock. Max is ${item.TotalStock}`,
                        );
                        handleAddProduct(item, 0);
                        showToast(
                          `Quantity exceeds available stock. Max is ${item.TotalStock}`,
                        );
                      }
                    }
                  }}
                  // onBlur={() => {
                  //   const parsedQuantity = parseInt(
                  //     inputQuantity[item.ProductId],
                  //   );

                  //   if (!isNaN(parsedQuantity)) {
                  //     handleAddProduct(item, inputQuantity[item.ProductId]);
                  //   }
                  // }} // Save to cart on blur
                  // onChangeText={quantity => {
                  //   const parsedQuantity = parseInt(quantity) || 0; // Parse the input quantity
                  //   handleAddProduct(item, parsedQuantity); // Update cart in real-time
                  // }}
                  keyboardType="phone-pad"
                  style={{
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#0f6cbd',
                    fontSize: 15,
                    fontWeight: 'bold',
                    padding: 8,
                    color: 'black',
                    backgroundColor: '#daedf5',
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    height: 40,
                  }}
                />

                {/* <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      handleIncrementQuantity(item?.ProductId, item?.Quantity)
                    }>
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity> */}

                {/* <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item?.ProductId)}>
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    size={20}
                    color="#51c7d6"
                  />
                </TouchableOpacity> */}
              </View>
            )}
          </>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {/* Add Modal component before the main View */}
      {toastVisible && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <View
              style={{
                backgroundColor: 'white',
                width: 33,
                height: 33,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}>
              <Image
                source={require('../assets/images/focus_rt.png')}
                style={styles.toastImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        animationType="fade">
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedItem?.name}
                  </Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={handleCloseModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.modalImageContainer}>
                  <ImageViewer
                    imageUrls={[
                      {
                        url:
                          typeof selectedItem?.image === 'string'
                            ? selectedItem.image
                            : Image.resolveAssetSource(focus_rt_black).uri,
                      },
                    ]}
                    enableSwipeDown={false}
                    enableImageZoom={true}
                    enablePreload={true}
                    saveToLocalByLongPress={false}
                    style={styles.modalImage}
                    backgroundColor="white"
                    renderIndicator={() => null}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View>
        <View style={styles.menuDropDown}>
          <View style={styles.inputContainer}>
            <View
              style={{
                flex: 1,
                marginRight: 10,
              }}>
              <FloatingLabelInput
                label="Search Item"
                value={searchTerm}
                onChangeText={setSearchTerm} // Update search term
                kbType="default"
                editable={!isLoading}
                autoCapitalize="none"
                // secureTextEntry={true}
              />
            </View>
          </View>

          {filteredCategoryItems.length === 0 ? (
            <View style={styles.noItemsContainer}>
              <Image source={focus_rt_black} style={styles.noItemsImage} />
              <Text style={styles.noItemsTitle}>No Items Found</Text>
              <Text style={styles.noItemsSubtext}>
                {searchTerm
                  ? `No results found for "${searchTerm}"`
                  : 'No items available for selected category'}
              </Text>
            </View>
          ) : (
            <View
              style={{
                width: Dimensions.get('window').width,
                marginBottom: 100,
              }}>
              <FlatList
                data={filteredCategoryItems}
                renderItem={renderItem}
                keyExtractor={item => item.ProductId.toString()}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => ({
                  length: 120,
                  offset: 120 * index,
                  index,
                })}
                contentContainerStyle={{paddingBottom: 300}}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastImage: {
    width: 25,
    height: 25,
    // marginRight: 10,
    marginTop: 5,
    borderRadius: 25,
  },
  toastText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: 'Poppins-Bold', // Bold for title
    fontSize: 17,
    color: '#333',
    fontWeight: '700',
  },
  subText: {
    fontFamily: 'Open Sans-Regular', // Regular for subtext
    fontSize: 14,
    color: '#4d4c4c',
    marginTop: 5,
    fontWeight: '700',
  },
  addButtonText: {
    fontFamily: 'Lato-Bold', // Bold for button text
    color: 'white',
    fontSize: 16,
  },
  quantityText: {
    fontFamily: 'Roboto-Regular', // Regular font for quantity
    fontSize: 16,
    color: 'black',
    fontWeight: '700',
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold', // SemiBold for modal title
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    fontFamily: 'Arial', // Neutral font for modals
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    // margin: 5,
    // borderBottomWidth: 2, // Adds a border around the container
    // borderBottomColor: 'black', // Light gray color for the border
    borderRadius: 10,
    // backgroundColor: '#e1eaf2',
    // overflow: 'hidden',
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    // padding: 5,
  },
  icon: {
    marginRight: 10,
    marginBottom: 16,
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 15,
    padding: 8,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDropDown: {
    // flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    height: screenHeight,
    padding: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    // flexDirection: 'row', // Horizontal layout for image and text
    // alignItems: 'center',
    // justifyContent: 'flex-start',
    margin: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    borderWidth: 0.4,
    // height: 120, // Adjust height to fit content
  },
  row: {
    flexDirection: 'column', // Image and text in a row
    alignItems: 'center',
  },
  imageContainer: {
    // borderWidth: 2, // 2px border width
    // borderColor: '#000000', // Black border color
    // borderStyle: 'solid', // Solid border style (default is solid)
    marginRight: 15, // Space between image and text
    borderWidth: 0.4,
    borderRadius: 8,
  },
  image: {
    width: 80, // Adjust the image size
    height: 80,
    marginTop: 5,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1, // Take up the remaining space
    justifyContent: 'center',
  },
  // title: {
  //   fontSize: 15,
  //   fontWeight: 'bold',
  //   color: 'black',
  //   flexWrap: 'wrap',
  // },
  // subText: {
  //   fontSize: 14,
  //   color: '#666',
  //   marginTop: 5,
  // },
  inspect: {
    // borderWidth: 2, // 2px border width
    // borderColor: '#000000', // Black border color
    // borderStyle: 'solid', // Solid border style (default is solid)
  },
  divider: {
    borderColor: '#9e9d9b',
    backgroundColor: '#9e9d9b',
    borderWidth: 0.3,
    width: '100%',
  },
  quantityContainer: {
    flexDirection: 'row', // Layout items in a row
    alignItems: 'center',
    marginTop: 5, // Add some space between the product rate and quantity
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'center',
  },
  // addButtonText: {
  //   color: 'white',
  //   fontSize: 14,
  //   fontWeight: 'bold',
  // },
  quantityButton: {
    marginHorizontal: 10,
    padding: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // quantityText: {
  //   fontSize: 16,
  //   color: 'black',
  // },
  loadingImage: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noItemsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    width: '100%',
  },
  noItemsImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.5,
  },
  noItemsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noItemsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loaderContainer: {
    marginHorizontal: 10,
    padding: 13,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  // modalTitle: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   color: '#333',
  //   flex: 1,
  //   marginRight: 40,
  // },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    top: 12,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 25,
    fontWeight: 'bold',
  },
  modalImageContainer: {
    backgroundColor: '#fff',
    height: screenHeight * 0.6,
    width: '100%',
  },
  // modalImage: {
  //   width: '100%',
  //   height: '100%',
  // },
});

export default CategoryItemsPage;
