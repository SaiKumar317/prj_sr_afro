/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
// SettingsScreen.js
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, {useCallback, useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import renderLoadingView from '../constants/LoadingView';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';

const focus_rt = require('../assets/images/focus_rt.png');
const focus_rt_black = require('../assets/images/focus_rt_black.png');
const empty_cart = require('../assets/images/empty_cart.gif');
const empty_cart1 = require('../assets/images/empty_cart1.jpg');

import {
  addToCart,
  createCartTable,
  getCartItems,
  removeFromCart,
  deleteAllCartData,
} from '../services/CartService';
import {getDBConnection} from '../services/SQLiteService';
import SelectModal from '../constants/SelectModal';
import {
  createSalesOrdersTable,
  insertSalesOrder,
} from '../services/OrdersServices'; // Import your database service
import {useFocusEffect} from '@react-navigation/native';
import {MultiSelect} from 'react-native-element-dropdown';
import MultiSelectModal from '../constants/MultiSelectModal';
import FloatingLabelInput from '../constants/FloatingLabelInput';

declare function alert(message?: any): void;
let storedHostname;

const screenHeight = Dimensions.get('window').height;

function Cart({
  route,
  reloadCategory,
  SessionId,
  handleLogout,
  onData,
}: {
  reloadCategory: any;
  SessionId: any;
  handleLogout: () => void;
  onData: (data: any) => void;
  route: any;
}) {
  const {refresh} = route.params || {}; // Get the refresh parameter
  console.log('CartPage', route);
  const [cartItems, setCartItems] = useState<any>([]);
  const [categoryItems, setCategoryItems] = useState<any>([]);
  const [selectedCustAcc, setSelectedCustAcc] = useState<any>(null);

  const [showManditory, setShowManditory] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [itemImages, setItemImages] = useState<{[key: string]: string}>({});
  const [loadingImages, setLoadingImages] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [inputQuantity, setInputQuantity] = React.useState<{
    [key: string]: any;
  }>({}); // Local state for input quantity

  const [totalVarieties, setTotalVarieties] = useState(0);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const [pendingVochNo, setPendingVochNo] = useState<any>([]);

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [customerAccounts, setCustomerAccounts] = useState<any[]>([]); // State to hold customer accounts

  const [totalCash, setTotalCash] = useState<any>(0);
  const [totalUpiMp, setTotalUpiMp] = useState<any>(0);
  const [customerName, setCustomerName] = useState<any>(null);
  const [mobileNum, setMobileNum] = useState<any>(null);

  const showToast = (message: React.SetStateAction<string>) => {
    console.log('showToast', message);
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };
  // Function to calculate the total quantity and total amount
  const calculateBillingDetails = () => {
    let totalQty = 0;
    let totalAmt = 0;

    let totalVarieties = 0;

    // // Count items with quantity > 0
    // totalVarieties = categoryItems.filter(
    //   (item: {Quantity: number}) => item.Quantity > 0,
    // ).length;

    // categoryItems.forEach((item: {Quantity: number; Rate: number}) => {
    //   if (item.Quantity) {
    //     totalQty += item.Quantity;
    //     totalAmt += item.Quantity * item.Rate;
    //   }
    // });

    // Count items with quantity > 0 from inputQuantity
    totalVarieties = Object.values(inputQuantity).filter(
      quantity => quantity > 0,
    ).length;

    // Calculate total quantity and total amount based on inputQuantity
    for (const [productId, quantity] of Object.entries(inputQuantity)) {
      const item = categoryItems.find(
        (item: {ProductId: string}) => item.ProductId == productId,
      );
      if (item && quantity > 0) {
        totalQty += quantity;
        totalAmt += quantity * item.Rate; // Assuming item has a Rate property
      }
    }

    setTotalQuantity(totalQty);
    setTotalAmount(totalAmt);
    setTotalCash(totalAmt);
    setTotalUpiMp(0);
    setTotalVarieties(totalVarieties);
  };

  // Update the billing details whenever categoryItems or cartItems change
  useEffect(() => {
    calculateBillingDetails();
    AsyncStorage.getItem('POSSalePreferenceData')
      .then(data => {
        if (data !== null) {
          const parsedData = JSON.parse(data);
          console.log('POSSalePreferenceData', parsedData);
        }
      })
      .catch(error => {
        console.log('Error retrieving data', error);
      });
  }, [categoryItems, cartItems, inputQuantity]);
  // console.log('categoryItems', categoryItems);
  const fetchCategoryItems = React.useCallback(async () => {
    try {
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
          SUM(b.BatchQty) AS TotalStock
        FROM Products p
        JOIN Prices pr on pr.ProductId = p.ProductId
        JOIN Cart c on c.ProductId = p.ProductId
        LEFT JOIN Stock b ON b.iProduct = p.ProductId
       -- WHERE
       -- b.iExpiryDate >= CURRENT_DATE
        --AND pr.endDate >= CURRENT_DATE
        --AND b.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
        --AND pr.compBranchId = ${parsedPOSSalesPreferences?.compBranchId}
       -- AND c.Quantity != ''
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
    TotalStock DESC;
`,
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
        setItemImages(images);
        // setCartItems(cartItems);
        const initialcartQty = products.reduce((acc, item) => {
          acc[item.ProductId] = item.Quantity; // Set ProductId as key and Quantity as value
          return acc;
        }, {} as {[key: string]: number}); // Initialize as an empty object
        setInputQuantity(initialcartQty);
      }
    } catch (error) {
      console.error('Error fetching category items:', error);
    } finally {
      // onData({isLoading: false});
    }
  }, []);
  // Use useFocusEffect to fetch cart items whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCategoryItems([]);
      setInputQuantity({});
      setSelectedCustAcc(null);
      setCustomerName(null);
      setMobileNum(null);
      fetchCategoryItems(); // Fetch cart items when the screen is focused
    }, []),
  );

  useEffect(() => {
    fetchCategoryItems();
  }, [fetchCategoryItems, reloadCategory]);

  React.useEffect(() => {
    createCartTable();
    createSalesOrdersTable();
  }, []);

  async function fetchDataFromApi(url: any, requestData: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 5 seconds timeout

    onData({isLoading: true});
    const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSessoin || '',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal, // Attach the abort signal
      });
      clearTimeout(timeoutId); // Clear the timeout if the request completes in time

      if (!response.ok) {
        return {success: false, message: 'Response not OK'}; // Return object with failure message
      }

      const data = await response.json();
      return data; // Return object with success status and data
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Fetch request timed out:', error);
        return {success: false, message: 'Request timed out'}; // Return object with timeout message
      } else {
        console.error('There was a problem with the fetch request:', error);
        return {success: false, message: 'Fetch request failed'}; // Return object with error message
      }
    } finally {
      onData({isLoading: false});
    }
  }

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
      // await fetchCartItems(); // Fetch updated cart
      // Remove the deleted item from the category items state
      setCategoryItems(
        (prevItems: any[]) =>
          prevItems.filter(
            (item: {ProductId: any}) => item.ProductId !== productId,
          ), // Remove the item with the matching ProductId
      );
      // Remove the deleted item from inputQuantity state
      setInputQuantity(prev => {
        const newInputQuantity = {...prev}; // Create a copy of the current inputQuantity
        delete newInputQuantity[productId]; // Delete the item with the matching ProductId
        return newInputQuantity; // Return the updated inputQuantity
      });
    } catch (error) {
      console.error('Error deleting item from cart:', error);
    }
  };
  const onPlaceOrder = async () => {
    if (totalVarieties > 0) {
      setShowPlaceOrderModal(true);
    } else {
      showToast('Please enter quantity');
    }
    // Alert.alert('Confirm', 'Please confirm to place order', [
    //   {
    //     text: 'Cancel',
    //     style: 'cancel',
    //     // onPress: () => {
    //     //   setSessionValid(true);
    //     // },
    //   },
    //   {
    //     text: 'Confirm',
    //     onPress: async () => {
    //       // setSelectedValues(initialSelectedValues);
    //       await placeOrder();
    //     },
    //   },
    // ]);
  };
  async function placeOrder() {
    try {
      setIsLoading(false);
      if (selectedCustAcc) {
        if (categoryItems) {
          setShowPlaceOrderModal(false);
          let salesOrderRequest = '';
          storedHostname = await AsyncStorage.getItem('hostname');
          const salesOrderUrl = `${storedHostname}/focus8api/Transactions/5632/`;
          const bodyData = [];
          for (let x in categoryItems) {
            bodyData.push({
              Item__Id: categoryItems[x]?.ProductId,
              Quantity: categoryItems[x]?.Quantity,
              Rate: categoryItems[x]?.Rate,
            });
          }
          salesOrderRequest = JSON.stringify({
            data: [
              {
                Body: bodyData,
                Header: {
                  CustomerAC__Id: selectedCustAcc?.value,
                },
              },
            ],
          });

          const salesOrdersRes = await fetchDataFromApi(
            salesOrderUrl,
            salesOrderRequest,
          );
          if (salesOrdersRes?.result == 1) {
            setIsLoading(false);
            setShowPlaceOrderModal(false);
            Alert.alert(
              'Success',
              `Order placed Successfully\nSales Order No.: ${salesOrdersRes?.data?.[0]?.VoucherNo}`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
            // After order is placed, clear the cart items
            await deleteAllCartData()
              .then(() => {
                console.log('All data cleared.');
              })
              .catch(error => {
                console.error('Error clearing data:', error);
              });
            setCartItems([]); // Reset cartItems state
            setCategoryItems([]); // Reset categoryItems state
          } else {
            // Save to local database if result is not 1
            await insertSalesOrder(salesOrderRequest); // Save the response to local DB
            await deleteAllCartData()
              .then(() => {
                console.log('All data cleared.');
              })
              .catch(error => {
                console.error('Error clearing data:', error);
              });
            setCartItems([]); // Reset cartItems state
            setCategoryItems([]); // Reset categoryItems state
            onData({isLoading: false, isreload: true});

            setIsLoading(false);
            setShowManditory(false);
            Alert.alert(
              'Failed', // Title of the alert
              `Order placement failed: ${
                salesOrdersRes?.message || ''
              }\n Saved in local`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          }
        }
      } else {
        setShowManditory(true);
        // showToast('Select Customer Account');
        showToast(
          !customerName || !mobileNum || mobileNum.toString()?.length < 10
            ? `*Select ${!customerName ? 'POS Customer Name, ' : ''}${
                !mobileNum || mobileNum.toString()?.length < 10
                  ? 'POS Customer Mobile Number'
                  : ''
              }`
            : '',
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectedCustAcc = async (data: {value: any}) => {
    console.log('selectedCustAcc', data);
    if (data && data?.value) {
      setSelectedCustAcc(data);
    } else {
      setSelectedCustAcc(null);
    }
  };
  const handleSelectedPendingVochNo = async (data: any) => {
    console.log('SelectedPendingVochNo', data);
    setPendingVochNo(data);

    // return reloadPage;
  };

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
      // await addToCart(item.ProductId, 1);
      return;
    } // Prevent negative quantities
    // setLoadingStates(prev => ({...prev, [item.ProductId]: true})); // Use ProductId directly
    try {
      if (!isNaN(quantity)) {
        await addToCart(item.ProductId, qty); // Add item with the specified quantity
      } else {
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // setLoadingStates(prev => ({...prev, [item.ProductId]: false})); // Use ProductId directly
    }
  };

  const renderItem = ({item}) => (
    <View style={[styles.item, {borderWidth: 0.4, borderColor: '#0f6cbd'}]}>
      <View style={styles.row}>
        <View
          style={[styles.inspect, {flexDirection: 'row', paddingBottom: 8}]}>
          <View style={[styles.inspect, styles.imageContainer]}>
            {loadingImages[item.ProductId] &&
            itemImages[item.ProductId] !== 'AA==' ? (
              <View style={[styles.image, styles.loadingImage]}>
                <ActivityIndicator size="small" color="#51c7d6" />
              </View>
            ) : (
              <Image
                source={
                  itemImages?.[item.ProductId] &&
                  itemImages[item.ProductId] !== 'AA=='
                    ? {
                        uri: `data:image/png;base64,${
                          itemImages[item.ProductId]
                        }`,
                      }
                    : focus_rt_black
                }
                style={styles.image}
              />
            )}
          </View>
          {/* Text and button on the right */}
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
                  {item.TotalStock}
                </Text>
              </Text>
              {/* Product Rate */}
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
        <View style={styles.divider} />
        <View style={styles.quantityContainer}>
          {/* Quantity */}
          <Text style={styles.subText}>Quantity: </Text>

          {/* Add button */}

          <View style={styles.quantityContainer}>
            {/* {item?.Quantity == 1 ? (
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDeleteItem(item?.ProductId)}>
                <FontAwesomeIcon icon={faTrashAlt} size={20} color="#51c7d6" />
              </TouchableOpacity>
            ) : ( */}
            {/* <TouchableOpacity
              style={styles.quantityButton}
              disabled={loadingStates[`dec_${item.ProductId}`]}
              onPress={() =>
                handleDecrementQuantity(item?.ProductId, item?.Quantity)
              }>
              {loadingStates[`dec_${item.ProductId}`] ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.quantityText}>-</Text>
              )}
            </TouchableOpacity> */}
            {/* // )} */}

            {/* <Text style={styles.quantityText}>{item?.Quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              disabled={loadingStates[`inc_${item.ProductId}`]}
              onPress={() =>
                handleIncrementQuantity(item?.ProductId, item?.Quantity)
              }>
              {loadingStates[`inc_${item.ProductId}`] ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.quantityText}>+</Text>
              )}
            </TouchableOpacity> */}
            {/* Delete Button */}
            <TextInput
              // editable={!loadingStates[item.ProductId]}
              // value={item?.Quantity.toString()}
              value={inputQuantity?.[item?.ProductId]?.toString()}
              placeholder="Add Quantity"
              placeholderTextColor="#8e918e"
              onChangeText={quantity => {
                const parsedQuantity = parseInt(quantity);

                if (!isNaN(parsedQuantity)) {
                  handleAddProduct(item, parsedQuantity);
                  setInputQuantity(prev => ({
                    ...prev,
                    [item?.ProductId]: parsedQuantity, // Update with valid quantity
                  }));
                } else {
                  handleAddProduct(item, quantity);
                  setInputQuantity(prev => ({
                    ...prev,
                    [item?.ProductId]: '', // Update with valid quantity
                  }));
                  // Handle invalid input (optional: show an error message, etc.)
                  console.log('Invalid quantity entered');
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
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item?.ProductId)}>
              <FontAwesomeIcon icon={faTrashAlt} size={20} color="#0f6cbd" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Function to fetch customer accounts
  const fetchCustomerAccounts = async () => {
    try {
      const db = await getDBConnection();
      const [results] = await db.executeSql('SELECT * FROM Customers'); // Adjust the table name as needed

      const customerAccounts = [];
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        customerAccounts.push({
          label: item.accountName, // Adjust based on your customer name field
          value: item.accountId, // Adjust based on your customer ID field
        });
      }
      // console.log('customerAccounts', customerAccounts);
      return customerAccounts; // Return the list of customer accounts
    } catch (error) {
      console.error('Error fetching customer accounts:', error);
      return []; // Return an empty array on error
    }
  };

  useEffect(() => {
    const loadCustomerAccounts = async () => {
      const accounts = await fetchCustomerAccounts();
      setCustomerAccounts(accounts); // Set the fetched accounts to state
    };

    // loadCustomerAccounts();
  }, [reloadCategory]);

  // Function to handle cash input change
  const handleCashChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Allow only numbers
    const cashValue = parseInt(numericValue || '0', 10);

    if (cashValue <= totalAmount) {
      setTotalCash(numericValue.replace(/^0+/, '') || '0');
      // Calculate UPI/MP based on total amount
      const newUpiMp = totalAmount - parseInt(numericValue || '0', 10);
      setTotalUpiMp(newUpiMp >= 0 ? newUpiMp.toString() : '0'); // Ensure UPI/MP is not negative
    }
  };

  // Function to handle UPI/MP input change
  const handleUpiMpChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Allow only numbers
    const upiMpValue = parseInt(numericValue || '0', 10);
    if (upiMpValue <= totalAmount) {
      setTotalUpiMp(numericValue.replace(/^0+/, '') || '0');
      // Calculate cash based on total amount
      const newCash = totalAmount - parseInt(numericValue || '0', 10);
      setTotalCash(newCash >= 0 ? newCash.toString() : '0'); // Ensure cash is not negative
    }
  };

  return (
    <>
      {isLoading && renderLoadingView()}
      {categoryItems?.length > 0 ? (
        <>
          <View style={styles.menuDropDown}>
            <View
              style={{
                width: Dimensions.get('window').width,
                flex: 1,
                // paddingBottom: 100,
              }}>
              <FlatList
                data={categoryItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={1}
                style={{flex: 1}}
              />
            </View>

            {/* Billing Details Section */}
            <View style={styles.billingDetailsContainer}>
              <Text style={styles.billingDetailsHeader}>Billing Details</Text>
              <View style={styles.billingDetailsContent}>
                <Text style={styles.billingText}>
                  Total Items:{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalVarieties}
                  </Text>
                </Text>
                <Text style={styles.billingText}>
                  Total Quantity:{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalQuantity}
                  </Text>
                </Text>
                <Text style={styles.billingText}>
                  Total Amount: {categoryItems?.[0]?.CurrencyCode}{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalAmount.toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.buttonPO} onPress={onPlaceOrder}>
            <Text style={styles.buttonText}>Place Order</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ImageBackground
            source={empty_cart1}
            style={styles.background}
            resizeMode="stretch">
            <Text
              style={{
                textAlign: 'center',
                color: 'black',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
              Your Cart is Empty
            </Text>
          </ImageBackground>
        </>
      )}
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
        visible={showPlaceOrderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlaceOrderModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaceOrderModal(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm</Text>
            {/* <Text style={styles.modalMessage}>
              Are you sure you want to place the order?
            </Text> */}
            <ScrollView style={{width: '100%'}}>
              <View
                style={[
                  // styles.inspect,
                  {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 20,
                    padding: 10,
                  },
                ]}>
                <View style={{flex: 1}}>
                  <FloatingLabelInput
                    label={'Cash'}
                    value={totalCash.toString()}
                    onChangeText={handleCashChange}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                </View>
                <View style={{flex: 1}}>
                  <FloatingLabelInput
                    label={'UPI/MP'}
                    value={totalUpiMp.toString()}
                    onChangeText={handleUpiMpChange}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={{padding: 10}}>
                <FloatingLabelInput
                  label={'POS Customer Name'}
                  value={customerName}
                  onChangeText={text =>
                    setCustomerName(text.replace(/^\s+/, ''))
                  }
                  kbType="default"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <View style={{padding: 10}}>
                <FloatingLabelInput
                  label={'POS Customer Mobile Number'}
                  value={mobileNum}
                  onChangeText={mobileNum => {
                    const inputNum = mobileNum.replace(/[^0-9]/g, '');
                    if (inputNum.length <= 16) {
                      setMobileNum(inputNum.replace(/^0+/, '') || '0');
                    }
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              {/* <SelectModal
                label="Customer Account"
                onData={(data: any) => handleSelectedCustAcc(data)}
                value={selectedCustAcc?.label || null}
                items={customerAccounts}
                // items={
                //   (fCompanyList && fCompanyList?.length > 0 && fCompanyList) ||
                //   productsArray
                // }
              /> */}
              {/* <MultiSelectModal
                label="Customer Account"
                value={pendingVochNo}
                items={customerAccounts}
                onData={(data: any) => handleSelectedPendingVochNo(data)}
                clearMultiSelect={undefined}
              /> */}

              {showManditory && (
                <Text style={{color: 'red'}}>
                  {!customerName ||
                  !mobileNum ||
                  mobileNum.toString()?.length < 10
                    ? `*Select ${!customerName ? 'POS Customer Name, ' : ''}${
                        !mobileNum || mobileNum.toString()?.length < 10
                          ? 'POS Customer Mobile Number'
                          : ''
                      }`
                    : ''}
                </Text>
              )}
            </ScrollView>
            <View style={[styles.billingDetailsContainer, {marginBottom: 60}]}>
              <Text style={styles.billingDetailsHeader}>Billing Details</Text>
              <View style={styles.billingDetailsContent}>
                <Text style={styles.billingText}>
                  Total Items:{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalVarieties}
                  </Text>
                </Text>
                <Text style={styles.billingText}>
                  Total Quantity:{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalQuantity}
                  </Text>
                </Text>
                <Text style={styles.billingText}>
                  Total Amount: {categoryItems?.[0]?.CurrencyCode}{' '}
                  <Text style={{color: 'black', fontWeight: 'bold'}}>
                    {totalAmount.toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={() => setShowPlaceOrderModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={placeOrder}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
      </Modal>
    </>
  );
}
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
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
  },
  subText: {
    fontFamily: 'Open Sans-Regular', // Regular for subtext
    fontSize: 14,
    // color: '#666',
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
  // modalTitle: {
  //   fontFamily: 'Poppins-SemiBold', // SemiBold for modal title
  //   fontSize: 16,
  //   color: '#333',
  // },
  modalImage: {
    width: '100%',
    height: '100%',
    fontFamily: 'Arial', // Neutral font for modals
  },
  // New Style for delete button
  billingDetailsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 0.4,
    borderColor: '#0f6cbd',
  },
  billingDetailsHeader: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  billingDetailsContent: {
    marginTop: 10,
    gap: 8,
  },
  billingText: {
    fontFamily: 'Open Sans-Regular',
    fontSize: 16,
    // color: '#666',
    color: '#4d4c4c',
    fontWeight: '700',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    marginRight: 5,
    fontWeight: 'bold',
  },
  buttonPO: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 0,
    backgroundColor: '#0f6cbd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Align text and icon horizontally},
  },
  button: {
    flex: 1, // Allow buttons to take equal space
    marginHorizontal: 5, // Add horizontal margin to prevent overlap
    paddingVertical: 10, // Adjust padding for better touch area
    alignItems: 'center', // Center text in button
    justifyContent: 'center', // Center text in button
    borderRadius: 5, // Optional: Add rounded corners
  },
  deleteButton: {
    marginLeft: 15,
    padding: 8,
    backgroundColor: '#ccc', // Light red color for delete button
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 0.4,
    borderColor: '#0f6cbd',
  },

  menuDropDown: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between', // Changed to align at the top
    backgroundColor: '#f9f9f9', // Light background color for the whole list
    height: screenHeight,
    padding: 15, // Added more padding to the container for better spacing
    borderBottomRightRadius: 15, // Slightly more rounded corners
    borderBottomLeftRadius: 15,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 30,
  },
  item: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'flex-start',
    margin: 10, // Increased vertical spacing between items
    padding: 15,
    backgroundColor: '#ffffff',

    borderRadius: 15, // Added rounded corners
    elevation: 3, // Slight shadow for a card-like effect
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 5,
    // width: '100%', // Ensures the item stretches across the container width
    // backgroundColor: 'linear-gradient(135deg, #ff6a00, #fbbc05)'
  },
  row: {
    flexDirection: 'column', // Image and text in a row
    alignItems: 'center',
  },
  // inspect: {
  //   borderWidth: 2, // 2px border width
  //   borderColor: '#000000', // Black border color
  //   borderStyle: 'solid', // Solid border style (default is solid)
  // },
  imageContainer: {
    marginRight: 15, // Space between image and text
  },
  image: {
    width: 80, // Adjust the image size
    height: 80,
    borderRadius: 10,
    marginTop: 5,
  },
  textContainer: {
    flex: 1, // Take up the remaining space
    justifyContent: 'center',
    // minHeight: 80,
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
  divider: {
    borderColor: '#9e9d9b',
    backgroundColor: '#9e9d9b',
    borderWidth: 0.3,
    width: '100%',
  },
  quantityContainer: {
    minWidth: 60,
    flexDirection: 'row', // Layout items in a row
    alignItems: 'center',
    marginTop: 5, // Add some space between the product Rate and quantity
  },
  addButton: {
    marginLeft: 10, // Space between Quantity text and Add button
    backgroundColor: '#4CAF50', // Green button
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
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
  empty_cart: {
    // flex: 1,
    // // justifyContent: 'center',
    // alignItems: 'center',
    // width: 100, // Adjust the image size
    // height: 100,
    // flex: 1,
    borderRadius: 10,
  },
  background: {
    flex: 1, // Make sure the background image fills the entire screen
    justifyContent: 'flex-end', // Center content vertically
    alignItems: 'center', // Center content horizontally
    // height: screenHeight,
    paddingBottom: 100,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    // margin: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    margin: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f6cbd',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row', // Ensure buttons are in a row
    justifyContent: 'flex-start', // Space between buttons
    width: '100%', // Full width for the container
    paddingHorizontal: 20,
    marginTop: 10, // Add some margin to separate from the message
    position: 'absolute',
    bottom: 30,
  },
  noButton: {
    backgroundColor: '#0f6cbd',
    marginRight: 10,
  },
  yesButton: {
    backgroundColor: '#0f6cbd',
  },
});

export default Cart;
