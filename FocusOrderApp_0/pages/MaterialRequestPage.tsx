/* eslint-disable react-native/no-inline-styles */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';

import {ActivityIndicator, Provider as PaperProvider} from 'react-native-paper';

import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faBars,
  faCartShopping,
} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';

import {BackHandler} from 'react-native';
import {SelectList} from 'react-native-dropdown-search-list';
import SelectModal from '../constants/SelectModal';
import {syncSalesInvoicesPending} from '../services/SyncSalesInvoiceService';
import {
  getDBConnection,
  getDivision,
  getItem,
  getItemType,
  getSubDivision,
} from '../services/SQLiteService';

import {
  createMaterialRequestTable,
  insertMaterialRequest,
} from '../services/OrdersServices';
import {syncDivision} from '../services/syncdivision';
import MultiSelectModal from '../constants/MultiSelectModal';
import FloatingLabelDate from '../constants/FloatingLabelDate';

const focus_rt_black = require('../assets/images/focus_rt_black.png');

let storedHostname: any = '';
let masterResponse = '';
const screenHeight = Dimensions.get('window').height;

function MaterialRequestPage({
  navigation,
  drawerRef,
  onData,
  route,
}: {
  //   handleBackPage: (message: string) => void; // updated type
  navigation: any;
  drawerRef: any;
  onData: (data: any) => void;
  route: any;
}) {
  const [reloadKey, setReloadKey] = useState(true);
  const [reloadMultiSelect, setReloadMultiSelect] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [subDivisionData, setSubDivision] = useState<any>([
    {label: '', value: 0},
  ]);
  const [divisionData, setDivision] = useState<any>([{label: '', value: 0}]);
  const [itemTypeData, setItemType] = useState<any>([{label: '', value: 0}]);
  const [itemData, setItem] = useState<any>([{label: '', value: 0}]);

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);

  const [itemImages, setItemImages] = useState<any>({});

  const [showManditory, setShowManditory] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [showBillDetails, setShowBillDetails] = useState(false);

  const [selectedSubDivision, setSelectedSubDivision] = useState<any>(null);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filteredCategoryItems, setFilteredCategoryItems] = React.useState<any>(
    [],
  );
  const [selectedItemQuantity, setSelectedItemQuantity] = React.useState<any>(
    [],
  );
  const [dueDate, setDueDate] = React.useState<any>('');

  const [inputQuantity, setInputQuantity] = useState<any>({});

  const [totalVarieties, setTotalVarieties] = useState(0);

  const showToast = (message: React.SetStateAction<string>) => {
    console.log('showToast', message);
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  // console.log('categoryItems', categoryItems);
  const fetchCategoryItems = React.useCallback(async (category: any) => {
    try {
      console.log('fetchCategoryItems', category);
      onData({isLoading: true});
      setIsLoading(true);
      const db = await getDBConnection();
      var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
        'POSSalePreferenceData',
      );
      var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
      // Get products for the selected category using actual column names
      const [results] = await db.executeSql(
        `WITH StockAgg AS (
  SELECT
    iProduct,
    iInvTag,
    SUM(CASE WHEN iExpiryDate >= CURRENT_DATE THEN BatchQty ELSE 0 END) AS TotalBatchQty,
    SUM(CASE WHEN iExpiryDate >= CURRENT_DATE THEN ConsumedQty ELSE 0 END) AS TotalConsumedQty,
    SUM(CASE WHEN iExpiryDate >= CURRENT_DATE THEN ConsumedQtyLocal ELSE 0 END) AS TotalConsumedQtyLocal,
    MAX(iExpiryDate) AS MaxExpiryDate
  FROM Stock
  WHERE iExpiryDate >= CURRENT_DATE
    AND iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
  GROUP BY iProduct, iInvTag
),
ReorderMinRow AS (
  SELECT r1.ProductId, r1.iInvTag, r1.fInvReorderLevel
  FROM ProductsReorder r1
  INNER JOIN (
    SELECT ProductId, iInvTag, MIN(iRowIndex) AS MinRow
    FROM ProductsReorder
    GROUP BY ProductId, iInvTag
  ) r2 ON r1.ProductId = r2.ProductId AND r1.iInvTag = r2.iInvTag AND r1.iRowIndex = r2.MinRow
)
SELECT 
  p.ProductId,
  p.ProductName,
  p.ProductCode,
  CASE 
    WHEN pr.endDate >= CURRENT_DATE AND pr.compBranchId = ${parsedPOSSalesPreferences?.compBranchId} THEN pr.Rate ELSE 0 
  END AS Rate,
  pr.endDate,
  p.CategoryId,
  p.CategoryName,
  p.CurrencyId,
  p.CurrencyCode,
  MAX(sa.MaxExpiryDate) AS MaxExpiryDate,
  0 AS Quantity,
  pr.discountP,
  COALESCE(MAX(sa.TotalConsumedQty), 0) AS ConsumedQty,
  (COALESCE(MAX(sa.TotalBatchQty), 0) - COALESCE(MAX(sa.TotalConsumedQty), 0) - COALESCE(MAX(sa.TotalConsumedQtyLocal), 0)) AS TotalStock,
  MAX(r.fInvReorderLevel) AS reorderLevel,
  MAX(p.iDefaultBaseUnit) AS iDefaultBaseUnit
FROM Products p
JOIN Prices pr ON pr.ProductId = p.ProductId
LEFT JOIN Cart c ON c.ProductId = p.ProductId
LEFT JOIN StockAgg sa ON sa.iProduct = p.ProductId AND sa.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
LEFT JOIN ReorderMinRow r ON r.ProductId = p.ProductId AND r.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
WHERE p.ProductId in (${category})
GROUP BY 
  p.ProductId,
  p.ProductName,
  p.ProductCode,
  pr.endDate,
  p.CategoryId,
  p.CategoryName,
  p.CurrencyId,
  p.CurrencyCode,
  pr.discountP
ORDER BY (TotalStock - MAX(r.fInvReorderLevel)) DESC, TotalStock DESC;
`,
        // Use CategoryId directly
      );

      console.log('products Total', results?.rows?.length);
      if (results.rows.length > 0) {
        const products = [];
        const images = {};
        for (let i = 0; i < results.rows.length; i++) {
          const item = results.rows.item(i);
          try {
            // getting product images individually
            const [productImageResult] = await db.executeSql(
              'SELECT ProductImage FROM Products WHERE ProductId = ?',
              [item.ProductId],
            );
            // console.log('productImageResult', productImageResult);
            if (productImageResult.rows.length > 0) {
              const productImageItem = productImageResult.rows.item(0);
              // console.log('productImageItem', productImageItem);

              if (productImageItem?.ProductImage) {
                item.ProductImage = productImageItem.ProductImage;
                images[item.ProductId] = productImageItem.ProductImage;
              }
            }

            // // If product has an image, add it to images object
            // if (item.ProductImage) {
            //   images[item.ProductId] = item?.ProductImage; // Use ProductId directly
            // }
          } catch (error) {
            console.log('error at productsIMage', error);
          }
          products.push(item);
        }

        // setCategoryItems(products);
        setFilteredCategoryItems(products);
        // const cartItems: any = await getCartItems();
        const initialcartQty = products.reduce((acc, item) => {
          acc[item.ProductId] = ''; // Set ProductId as key and Quantity as value
          return acc;
        }, {} as {[key: string]: number}); // Initialize as an empty object
        setInputQuantity(initialcartQty);
        setItemImages(images);
        // setCartItems(cartItems);
      } else {
        showToast('No data found for the selection');
      }
    } catch (error) {
      console.error('Error fetching category items:', error);
      setIsLoading(false);
    } finally {
      onData({isLoading: false});
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedItem) {
      let itemSelected = selectedItem
        .map((item: {value: any}) => item.value)
        .join(',');
      fetchCategoryItems(itemSelected);
      // console.log('selectedItem', itemSelected);
    } else {
      setFilteredCategoryItems(null);
    }
  }, [selectedItem, fetchCategoryItems]);

  // Function to calculate the total quantity and total amount
  const calculateBillingDetails = () => {
    let totalVarietie = 0;
    let selectedItems = [];
    console.log('filteredCategoryItems', filteredCategoryItems);
    // Count items with quantity > 0 from inputQuantity
    selectedItems = filteredCategoryItems?.filter(
      (item: {Quantity: any}) => parseInt(item?.Quantity) > 0,
    );
    totalVarietie = selectedItems?.length;

    setTotalVarieties(totalVarietie);
    setSelectedItemQuantity(selectedItems);
  };

  //   Update the billing details whenever salesInvoiceDetails or cartItems change
  useEffect(() => {
    if (filteredCategoryItems?.length > 0) {
      calculateBillingDetails();
    }
  }, [filteredCategoryItems]);

  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };

  const getsubDivision = async () => {
    var storedSubDivision;
    var storedDivision;
    var storedItemType;
    storedSubDivision = await getSubDivision();
    storedDivision = await getDivision();
    storedItemType = await getItemType();
    if (storedSubDivision) {
      setSubDivision(storedSubDivision);
      // return storedSubDivision;
    }
    if (storedDivision) {
      setDivision(storedDivision);
      // return storedSubDivision;
    }
    if (storedItemType) {
      setItemType(storedItemType);
      // return storedSubDivision;
    }
    const responseSalesInvoicesPending = await syncDivision();
    if (responseSalesInvoicesPending?.message === 'Invalid Session') {
      showToast(responseSalesInvoicesPending?.message);
    }
    storedSubDivision = await getSubDivision();
    storedDivision = await getDivision();
    if (storedSubDivision) {
      setSubDivision(storedSubDivision);
      return storedSubDivision;
    }
    if (storedDivision) {
      setDivision(storedDivision);
      return storedDivision;
    }

    return [];
  };
  useEffect(() => {
    getsubDivision();
    createMaterialRequestTable();
  }, []);

  const reloadSubDivision = async () => {
    const storedSubDivision = await getSubDivision();
    if (storedSubDivision) {
      setSubDivision(storedSubDivision);
    }
  };

  useEffect(() => {
    reloadSubDivision();
  }, [reloadKey]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Your logic here to reload the page, if needed
  }, [reloadKey]);
  const dateToInt = (date: {
    getDate: () => number;
    getMonth: () => number;
    getFullYear: () => number;
  }) => {
    return (
      date.getDate() + (date.getMonth() + 1) * 256 + date.getFullYear() * 65536
    );
  };

  const handleSelectedSubDivision = (data: any) => {
    console.log('handleSelectedSubDivision', data);
    if (data && data?.value) {
      setSelectedSubDivision(data);
    } else {
      setSelectedSubDivision(null);
    }
  };
  const handleSelectedDivision = (data: any) => {
    console.log('handleSelectedDivision', data);
    if (data && data?.value) {
      setSelectedDivision(data);
    } else {
      setSelectedDivision(null);
    }
  };
  const handleSelectedItemType = async (data: any) => {
    console.log('handleSelectedItemType', data);
    if (data && data?.length > 0) {
      const itemTypeID = data.map((item: {value: any}) => item.value).join(',');
      const selectItemId = selectedItemType
        ?.map((item: {value: any}) => item?.value)
        ?.join(',');
      if (itemTypeID != selectItemId) {
        setSelectedItem(null);
        setReloadMultiSelect(!reloadMultiSelect);
      }
      setSelectedItemType(data);
      const storedItem = await getItem(itemTypeID);
      if (storedItem) {
        setItem(storedItem);
      } else {
        setItem(null);
        setSelectedItem(null);
        setReloadMultiSelect(!reloadMultiSelect);
      }
    } else {
      setSelectedItemType(null);
      setItem(null);
      setSelectedItem(null);
      setReloadMultiSelect(!reloadMultiSelect);
    }
  };
  const handleSelectedItem = (data: any) => {
    console.log('handleSelectedItem', data);
    if (data && data?.length > 0) {
      setSelectedItem(data);
    } else {
      setSelectedItem(null);
    }
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
        setFilteredCategoryItems((prevItems: any[]) =>
          prevItems.map((i: {ProductId: string}) =>
            i.ProductId === item.ProductId
              ? {...i, Quantity: quantity} // Update cart quantity in local state
              : i,
          ),
        );
      } else {
        setFilteredCategoryItems((prevItems: any[]) =>
          prevItems.map((i: {ProductId: string}) =>
            i.ProductId === item.ProductId
              ? {...i, Quantity: 0} // Update cart quantity in local state
              : i,
          ),
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // setLoadingStates(prev => ({...prev, [item.ProductId]: false})); // Use ProductId directly
    }
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
            // onPress={() =>
            //   handleImagePress(
            //     item.ProductImage && item?.ProductImage !== 'AA=='
            //       ? `data:image/png;base64,${item.ProductImage}`
            //       : focus_rt_black,
            //     item.ProductName,
            //   )
            // }
            >
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
              {/* <Text style={styles.subText}>{item.iExpiryDate}</Text> */}
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
                Reorder Level:{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {item.reorderLevel}
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
          <>
            <View style={styles.quantityContainer}>
              <TextInput
                editable={item.TotalStock - item.reorderLevel ? true : false}
                // value={item?.Quantity.toString()}
                value={inputQuantity?.[item?.ProductId]?.toString()}
                placeholder="Add Quantity"
                placeholderTextColor={
                  item.TotalStock - item.reorderLevel > 0 ? '#8e918e' : '#ccc'
                }
                // onFocus={handleFocus(item)}
                // onBlur={handleBlur(item)}
                onChangeText={quantity => {
                  const parsedQuantity = parseInt(quantity);

                  if (
                    !isNaN(parsedQuantity) &&
                    parsedQuantity <= item.TotalStock - item.reorderLevel &&
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
                        `Quantity exceeds available stock. Maximum is ${
                          item.TotalStock - item.reorderLevel
                        }`,
                      );
                      handleAddProduct(item, 0);
                      showToast(
                        `Quantity exceeds available stock. Maximum is ${
                          item.TotalStock - item.reorderLevel
                        }`,
                      );
                    }
                  }
                }}
                keyboardType="phone-pad"
                style={{
                  textAlign: 'center',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    item.TotalStock - item.reorderLevel > 0
                      ? '#0f6cbd'
                      : '#ccc',
                  fontSize: 15,
                  fontWeight: 'bold',
                  padding: 8,
                  color: 'black',
                  backgroundColor:
                    item.TotalStock - item.reorderLevel > 0
                      ? '#daedf5'
                      : '#f0f0f0',
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  height: 40,
                }}
              />
            </View>
          </>
        </View>
      </View>
    </View>
  );

  const renderSelectedItem = ({item}) => (
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
            <TouchableOpacity>
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
              {/* <Text style={styles.subText}>{item.iExpiryDate}</Text> */}
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
                Reorder Level:{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {item.reorderLevel}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        {/* Line above the quantity container */}
        <View style={styles.divider} />
        <View style={styles.quantityContainer}>
          {/* Quantity */}
          <Text style={styles.subText}>
            Quantity:{' '}
            <Text style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
              {/* {item.ConsumedQty} */}
              {inputQuantity?.[item?.ProductId]?.toString()}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );

  async function fetchDataFromApi(url: any, requestData: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 5 seconds timeout

    setIsLoading(true);
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
        setIsLoading(false);
        return {success: false, message: 'Response not OK'}; // Return object with failure message
      }

      const data = await response.json();
      return data; // Return object with success status and data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Fetch request timed out:', error);
        setIsLoading(false);
        return {success: false, message: 'Request timed out'}; // Return object with timeout message
      } else {
        console.error('There was a problem with the fetch request:', error);
        setIsLoading(false);
        return {success: false, message: 'Fetch request failed'}; // Return object with error message
      }
    } finally {
      setIsLoading(false);
    }
  }

  const onConfirmRequest = async () => {
    console.log('selectedItemQuantity', selectedItemQuantity);
    if (
      selectedItemQuantity?.length > 0 &&
      selectedSubDivision &&
      selectedDivision
    ) {
      setShowPlaceOrderModal(true);
      setShowBillDetails(true);
    } else {
      let alertMsg = [];
      if (!selectedSubDivision) {
        alertMsg.push('Sub-Division');
      }
      if (!selectedDivision) {
        alertMsg.push('Division');
      }
      if (!selectedItemType) {
        alertMsg.push('Item Type');
      }
      if (!selectedItem) {
        alertMsg.push('Item');
      }
      if (alertMsg?.length > 0) {
        showToast(`Please select, ${alertMsg.join(', ')}`);
      } else {
        showToast('Please enter quantity');
      }
    }
  };

  function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  }

  async function placeOrder() {
    try {
      setIsLoading(false);
      var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
        'POSSalePreferenceData',
      );
      var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
      console.log('selectedItemQuantity', selectedItemQuantity);
      if (parsedPOSSalesPreferences && dueDate) {
        if (selectedItemQuantity?.length > 0 && dueDate) {
          setShowPlaceOrderModal(false);
          let materialRequest = '';
          storedHostname = await AsyncStorage.getItem('hostname');
          const materialRequestUrl = `${storedHostname}/focus8api/Transactions/8003/`;
          const bodyData: any = [];
          const materialRequestDetailsArray = selectedItemQuantity;

          for (let x in materialRequestDetailsArray) {
            bodyData.push({
              'Item Type__Id': materialRequestDetailsArray[x]?.CategoryId,
              Item__Id: materialRequestDetailsArray[x]?.ProductId,
              Quantity: materialRequestDetailsArray[x]?.Quantity,
              Unit__Id: materialRequestDetailsArray[x]?.iDefaultBaseUnit,
              'Available Stock': materialRequestDetailsArray[x]?.TotalStock,
              DueDate: dateToInt(dueDate),
            });
          }
          // getting fatag from POSSalePreferenceTagData
          var storedFatag = await AsyncStorage.getItem(
            'POSSalePreferenceTagData',
          );
          var parsedFatag = JSON.parse(storedFatag || '{}');
          var compBranchCaption = `${parsedFatag.FaTag}__Id`;

          materialRequest = JSON.stringify({
            data: [
              {
                Body: bodyData,
                Header: {
                  Date: dateToInt(new Date()),
                  [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId, //'Division Master__Id'
                  Warehouse__Id: parsedPOSSalesPreferences?.warehouseId,
                  Branch__Id: parsedPOSSalesPreferences?.Branch,
                  'Sub Division__Id': selectedSubDivision?.value,
                  ToDivision__Id: selectedDivision?.value,
                  Segment__Code: 'SR AFRO',
                },
              },
            ],
          });

          const materialRequestRes = await fetchDataFromApi(
            materialRequestUrl,
            materialRequest,
          );

          // if (false) {
          //for testing purpose(withOut internet)
          if (materialRequestRes?.result == 1) {
            setIsLoading(false);
            setShowManditory(false);
            setSelectedSubDivision(null);
            setSelectedDivision(null);
            setSelectedItemType(null);
            setSelectedItem(null);
            setDueDate(null);
            setFilteredCategoryItems(null);
            setSelectedItemQuantity([]);
            setReloadKey(prev => !prev);
            onData({reloadKey});
            setShowPlaceOrderModal(false);
            setReloadMultiSelect(!reloadMultiSelect);
            Alert.alert(
              'Success',
              `Mobile POS Material Request placed Successfully\n Mobile POS Material Request.: ${materialRequestRes?.data?.[0]?.VoucherNo}\n`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          } else {
            // Save to local database if result is not 1
            // if (false) {
            // //for testing purpose(withOut internet)
            if (materialRequestRes?.result == -1) {
              Alert.alert(
                'Failed', // Title of the alert
                `Order placement failed: ${materialRequestRes?.message || ''}`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            } else {
              if (materialRequestRes?.message === 'Request timed out') {
                Alert.alert(
                  'Failed', // Title of the alert
                  `Order placement failed: ${
                    materialRequestRes?.message || ''
                  }`,
                  [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                );
              } else {
                await insertMaterialRequest(materialRequest); // Save the response to local DB

                setIsLoading(false);
                setShowManditory(false);
                setSelectedSubDivision(null);
                setSelectedDivision(null);
                setSelectedItemType(null);
                setSelectedItem(null);
                setDueDate(null);
                setFilteredCategoryItems(null);
                setSelectedItemQuantity([]);
                setReloadKey(prev => !prev);
                onData({reloadKey});
                setShowPlaceOrderModal(false);
                setReloadMultiSelect(!reloadMultiSelect);
                Alert.alert(
                  'Failed', // Title of the alert
                  `Order placement failed: ${
                    materialRequestRes?.message || ''
                  }\n Saved in local`,
                  [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                );
              }
            }
          }
        }
      } else {
        setShowManditory(true);
        // showToast('Select Customer Account');

        if (!dueDate) {
          showToast(`*Select ${!dueDate ? 'Due Date ' : ''}`);
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDueDate = (value: any) => {
    console.log('handleDueDate', value?.currentDate);
    setDueDate(value?.currentDate);
  };

  return (
    <>
      <PaperProvider>
        {isLoading && renderLoadingView()}
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
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#0f6cbd',
            padding: 5,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => drawerRef.current.openDrawer()} //onPress={() => handleBackPage('')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
                marginLeft: 5,
                padding: 10,
              }}>
              <FontAwesomeIcon icon={faBars} size={27} color="white" />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              marginRight: 'auto',
              fontWeight: 'bold',
            }}>
            Material Request
          </Text>
        </View>
        <ScrollView nestedScrollEnabled={true}>
          <View style={styles.menuDropDown}>
            <View
              style={{
                width: Dimensions.get('window').width,
                flex: 1,
              }}>
              <View style={{paddingTop: 10, paddingHorizontal: 10}}>
                <SelectModal
                  label={'Sub Division'}
                  items={subDivisionData || [{label: '', value: 0}]}
                  value={selectedSubDivision?.label || null}
                  onData={(data: any) => handleSelectedSubDivision(data)}
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <SelectModal
                  label={'Division'}
                  items={divisionData || [{label: '', value: 0}]}
                  value={selectedDivision?.label || null}
                  onData={(data: any) => handleSelectedDivision(data)}
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <MultiSelectModal
                  label={'Item Type'}
                  items={itemTypeData || [{label: '', value: 0}]}
                  value={selectedItemType || null}
                  onData={(data: any) => handleSelectedItemType(data)}
                  clearMultiSelect={reloadKey}
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <MultiSelectModal
                  label={'Item'}
                  items={itemData || [{label: '', value: 0}]}
                  value={selectedItem || null}
                  onData={(data: any) => handleSelectedItem(data)}
                  clearMultiSelect={reloadMultiSelect}
                />
              </View>
              <View
                style={{
                  width: Dimensions.get('window').width,
                  // marginBottom: 40,
                  // flex: 1,
                  // height: windowHeight * 0.6, // Adjust height based on your layout
                }}>
                <FlatList
                  nestedScrollEnabled={true}
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
                  contentContainerStyle={{
                    paddingBottom: 300,
                    backgroundColor: 'white',
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
        {true && (
          <>
            <View style={styles.buttonPO}>
              <TouchableOpacity
                style={styles.buttonStyles}
                onPress={onConfirmRequest}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonStyles}
                onPress={() => {
                  Alert.alert(
                    'Confirm',
                    'Are you sure you want to cancel?',
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      {
                        text: 'Yes',
                        onPress: () => navigation.navigate('TabStack'),
                      },
                    ],
                    {cancelable: false},
                  );
                }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Modal
          visible={showPlaceOrderModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPlaceOrderModal(false)}>
          <View
            style={styles.modalOverlay}
            // activeOpacity={1}
            // onPress={() => setShowPlaceOrderModal(false)}
          >
            <View
              // activeOpacity={1}
              // onPress={e => e.stopPropagation()}
              style={[styles.modalContent]}>
              <Text style={styles.modalTitle}>Confirm</Text>
              {/* <Text style={styles.modalMessage}>
              Are you sure you want to place the order?
            </Text> */}
              <ScrollView
                nestedScrollEnabled={true}
                style={[styles.inspect, {width: '100%', marginBottom: 50}]}>
                <View style={{padding: 5}}>
                  <FloatingLabelDate
                    label="Due Date"
                    value={dueDate}
                    onData={data => handleDueDate(data)}
                    reloadKey={reloadPage}
                    // onChangeDate={handleExpiryDate}
                  />
                </View>
                {showManditory && (
                  <Text style={{color: 'red', paddingBottom: 10}}>
                    {!dueDate ? `*Select ${!dueDate ? 'Due Date' : ''}` : ''}
                  </Text>
                )}

                <View
                  style={{
                    // width: Dimensions.get('window').width,
                    // marginBottom: 40,
                    // flex: 1,
                    height: Dimensions.get('window').height * 0.7, // Adjust height based on your layout
                  }}>
                  <FlatList
                    nestedScrollEnabled={true}
                    data={selectedItemQuantity}
                    renderItem={renderSelectedItem}
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
                    contentContainerStyle={{
                      paddingBottom: 300,
                      backgroundColor: 'white',
                    }}
                  />
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.yesButton]}
                  onPress={placeOrder}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.noButton]}
                  onPress={() =>
                    Alert.alert(
                      'Confirm',
                      'Are you sure you want to cancel?',
                      [
                        {
                          text: 'No',
                          style: 'cancel',
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            setShowPlaceOrderModal(false);
                            navigation.navigate('TabStack');
                          },
                        },
                      ],
                      {cancelable: false},
                    )
                  }>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer1}>
                <TouchableOpacity
                  style={[styles.button, styles.noButton]}
                  onPress={() => setShowPlaceOrderModal(false)}>
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
      </PaperProvider>
    </>
  );
}

const styles = StyleSheet.create({
  receivedDataContainer: {
    color: 'black',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 60,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#d9d8d7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRow: {
    color: 'black',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 40,
  },
  receivedItemText: {
    flex: 1,
    textAlign: 'center',
    padding: 10,
    justifyContent: 'center', // Center vertically within the text container
    alignItems: 'center', // Align text horizontally as well
    textAlignVertical: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: 'black',
  },
  cell: {
    color: 'black',
    fontWeight: '500',
    borderRightWidth: 1,
    borderColor: '#ccc',
    padding: 9.5,
    minWidth: 100, // Adjust this value as needed
    // justifyContent: 'center', // This will center the content vertically
    // alignItems: 'center', // This will center the content horizontally
    // alignSelf: 'center',
    alignSelf: 'stretch',
  },
  evenRow: {
    backgroundColor: '#FFFFFF', // White background for even rows
  },
  oddRow: {
    backgroundColor: '#F8F9FA', // Light gray background for odd rows
  },
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
  section: {
    width: Dimensions.get('window').width * 0.75,
    backgroundColor: '#fff',
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeSectionBorder: {
    borderColor: '#0f6cbd',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 13,
    color: '#333',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
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
  billTotalText: {
    // alignSelf: 'flex-end',
  },
  billingText: {
    borderWidth: 1,
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
    bottom: 2,
    left: 30,
    right: 30,
    margin: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyles: {
    backgroundColor: '#0f6cbd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    // flexDirection: 'row', // Align text and icon horizontally
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
    // backgroundColor: '#f9f9f9', // Light background color for the whole list
    backgroundColor: 'white',
    height: screenHeight,
    padding: 15, // Added more padding to the container for better spacing
    // borderBottomRightRadius: 15, // Slightly more rounded corners
    // borderBottomLeftRadius: 15,
    // shadowOpacity: 0.15,
    // shadowRadius: 5,
    // elevation: 5,
    marginBottom: 100,
    // paddingBottom: 100,
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
  billContent: {
    // margin: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
  },
  line: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fafafa',
    paddingTop: 5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    color: 'gray',
    fontSize: 16,
  },
  value: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  row: {
    flexDirection: 'column', // Image and text in a row
    alignItems: 'center',
  },
  inspect: {
    // borderWidth: 2, // 2px border width
    // borderColor: '#000000', // Black border color
    // borderStyle: 'solid', // Solid border style (default is solid)
  },
  imageContainer: {
    marginRight: 15, // Space between image and text
    borderWidth: 0.4,
    borderRadius: 8,
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
    bottom: 60,
  },
  buttonContainer1: {
    flexDirection: 'row', // Ensure buttons are in a row
    justifyContent: 'flex-start', // Space between buttons
    width: '100%', // Full width for the container
    paddingHorizontal: 20,
    marginTop: 10, // Add some margin to separate from the message
    position: 'absolute',
    bottom: 10,
  },
  noButton: {
    backgroundColor: '#0f6cbd',
    marginRight: 10,
  },
  yesButton: {
    backgroundColor: '#0f6cbd',
  },
});

export default MaterialRequestPage;
