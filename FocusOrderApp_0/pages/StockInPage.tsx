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
  getSalesInvoiceDetails,
  getSalesInvoicesPending,
  getSubDivision,
  updateConsumedReturnQtyLocal,
  updateSalesInvoiceQty,
} from '../services/SQLiteService';
import {addToCart} from '../services/CartService';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import PortalHost from 'react-native-paper/lib/typescript/components/Portal/PortalHost';
import {
  createMaterialRequestTable,
  createSalesReturnTable,
  insertMaterialRequest,
  insertSalesReturn,
} from '../services/OrdersServices';
import {syncDivision} from '../services/syncdivision';
import MultiSelectModal from '../constants/MultiSelectModal';
import FloatingLabelDate from '../constants/FloatingLabelDate';
import TableSingleSelect from '../constants/TableSingleSelect';

const focus_rt_black = require('../assets/images/focus_rt_black.png');

let storedHostname: any = '';
let masterResponse = '';
const screenHeight = Dimensions.get('window').height;

function StockInPage({
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
  const [stockInData, setStockInData] = useState<any>([{label: '', value: 0}]);
  const [stockInDetails, setStockInDetails] = useState<any>([]);
  const [divisionData, setDivision] = useState<any>([{label: '', value: 0}]);
  const [itemTypeData, setItemType] = useState<any>([{label: '', value: 0}]);
  const [itemData, setItem] = useState<any>([{label: '', value: 0}]);

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [loadingImages, setLoadingImages] = useState<any>({});
  const [itemImages, setItemImages] = useState<any>({});

  const [showManditory, setShowManditory] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [showBillDetails, setShowBillDetails] = useState(false);
  const [totalCash, setTotalCash] = useState<any>(0);
  const [totalUpiMp, setTotalUpiMp] = useState<any>(0);
  const [customerName, setCustomerName] = useState<any>(null);
  const [mobileNum, setMobileNum] = useState<any>(null);
  const [narration, setNarration] = useState<any>(null);
  const [selectedSubDivision, setSelectedSubDivision] = useState<any>(null);
  const [selectedStockIn, setSelectedStockIn] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reasonMList, setReasonMList] = React.useState<any>([]);

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
  const fetchCategoryItems = React.useCallback(
    async (storedStockInItems: any) => {
      try {
        onData({isLoading: true});
        setIsLoading(true);
        const db = await getDBConnection();
        var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
          'POSSalePreferenceData',
        );
        var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);

        if (storedStockInItems?.length > 0) {
          const products = [];
          const images = {};
          for (let i = 0; i < storedStockInItems?.length; i++) {
            const item = storedStockInItems?.[i];
            try {
              // getting product images individually
              const [productImageResult] = await db.executeSql(
                'SELECT ProductImage FROM Products WHERE ProductId = ?',
                [item.iProduct],
              );
              // console.log('productImageResult', productImageResult);
              if (productImageResult.rows.length > 0) {
                const productImageItem = productImageResult.rows.item(0);
                // console.log('productImageItem', productImageItem);

                if (productImageItem?.ProductImage) {
                  item.ProductImage = productImageItem.ProductImage;
                }
              }
            } catch (error) {
              console.log('error at productsIMage', error);
            }
            products.push(item);
          }

          const initialcartQty = products.reduce((acc, item) => {
            acc[item.iBodyId] = ''; // Set ProductId as key and Quantity as value
            return acc;
          }, {} as {[key: string]: number}); // Initialize as an empty object
          setInputQuantity(initialcartQty);
        } else {
          showToast('No data found for the selection');
        }
      } catch (error) {
        console.error('Error fetching Stock Out items:', error);
        setIsLoading(false);
      } finally {
        onData({isLoading: false});
        setIsLoading(false);
      }
    },
    [],
  );

  // Function to calculate the total quantity and total amount
  const calculateBillingDetails = () => {
    let totalVarietie = 0;
    let selectedItems = [];

    // Count items with quantity > 0 from inputQuantity
    selectedItems = stockInDetails?.filter(
      (item: {Quantity: any}) => parseInt(item?.Quantity) > 0,
    );
    totalVarietie = selectedItems?.length;

    setTotalVarieties(totalVarietie);
    setSelectedItemQuantity(selectedItems);
  };

  //   Update the billing details whenever salesInvoiceDetails or cartItems change
  useEffect(() => {
    if (stockInDetails?.length > 0) {
      calculateBillingDetails();
    }
  }, [stockInDetails]);

  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };

  const getsubDivision = async () => {
    var storedSubDivision;
    storedHostname = await AsyncStorage.getItem('hostname');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
    const subDivision = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `select sd.sName label,sd.sCode  ,sd.iMasterId value, usd.Division from mCore_division sd
join muCore_division usd on usd.iMasterId = sd.iMasterId
where sd.iMasterId != 0 and sd.iStatus <> 5 and sd.bGroup = 0 and usd.Division=${parsedPOSSalesPreferences?.compBranchId};`,
          },
        ],
      },
    );
    if (
      subDivision &&
      subDivision?.data &&
      subDivision?.result === 1 &&
      subDivision?.data?.[0]?.Table &&
      subDivision?.data?.[0]?.Table?.length > 0
    ) {
      storedSubDivision = subDivision.data[0].Table;
      setSubDivision(storedSubDivision);
    } else {
      showToast(subDivision?.message);
    }
    return [];
  };
  const getReason = async () => {
    const reasonMData = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `select sName label, iMasterId value from mCore_outletstocklossreasons 
	where iMasterId <> 0 and iStatus <>5`, // updated query
          },
        ],
      },
    );
    console.log('reasonMData', reasonMData);
    if (
      reasonMData &&
      reasonMData?.data &&
      reasonMData?.result === 1 &&
      reasonMData?.data?.[0]?.Table &&
      reasonMData?.data?.[0]?.Table?.length > 0
    ) {
      setReasonMList(reasonMData?.data?.[0]?.Table);
    } else {
      showToast(reasonMData?.message);
    }
    return [];
  };

  const getStockIn = async () => {
    var storedStockIn;
    storedHostname = await AsyncStorage.getItem('hostname');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
    const stockInDataRes = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `select *
from(
select h.sVoucherNo label, h.iHeaderId value,
        CASE 
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0
            AND ISNULL(SUM(vl.Base), 0) > ISNULL(SUM(vl.Balance), 0) THEN 'Partial Consumed'
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0 THEN 'Pending'
ELSE '' END [LinkStatus],d.iFaTag [companyBranchId],tag.iTag6 [branchId]
    FROM tCore_Header_0 h
        --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
        JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
        join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
        JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
        LEFT JOIN vCore_AllLinks402851079_0 vl ON vl.iRefId = d.iTransactionId
    WHERE h.iVoucherType=6147 AND
        (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0 AND h.iAuth =1
        and bClosed<>1 --and d.iFaTag=${parsedPOSSalesPreferences?.compBranchId} and tag.iTag6=${parsedPOSSalesPreferences?.Branch}
    GROUP BY 
h.iHeaderId,h.iDate, h.sVoucherNo,d.iFaTag, tag.iTag6 ) a
where a.[LinkStatus]<>''
order by a.value;`,
          },
        ],
      },
    );
    if (
      stockInDataRes &&
      stockInDataRes?.data &&
      stockInDataRes?.result === 1 &&
      stockInDataRes?.data?.[0]?.Table &&
      stockInDataRes?.data?.[0]?.Table?.length > 0
    ) {
      storedStockIn = stockInDataRes.data[0].Table;
      setStockInData(storedStockIn);
    } else {
      showToast(stockInDataRes?.message);
    }
    return [];
  };

  const getStockInDetails = async (iHeaderId: any) => {
    var storedStockInDetails;
    storedHostname = await AsyncStorage.getItem('hostname');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
    const stockInDataDetails = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `
select distinct h.sVoucherNo, h.iHeaderId, d.iBodyId, abs(ind.fQuantity) [orderQty], ind.iProduct,p.sName ProductName, p.sCode ProductCode, vl.Balance,ind.mRate
,indb.mInput0 [discountP],b.iBatchId, b.sBatchNo, b.iExpiryDate
,d.iFaTag [companyBranchId],tag.iTag6 [branchId], 
h.iDate [invoiceDate], b.iMfDate, d.iBookNo, h.iAuth, up.ItemType AS ItemType
FROM tCore_Header_0 h
    --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
    JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
    JOIN tCore_Batch_0 b ON b.iBodyId = d.iBodyId
    JOIN tCore_HeaderData6147_0 hd ON hd.iHeaderId = h.iHeaderId        
    join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
    JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
    JOIN mCore_Product p on p.iMasterId = ind.iProduct
    JOIN tCore_IndtaBodyScreenData_0 indb ON indb.iBodyId = d.iBodyId
    left join muCore_Product up on up.iMasterId = ind.iProduct
    LEFT JOIN vCore_AllLinks402851079_0 vl ON vl.iRefId = d.iTransactionId
WHERE h.iVoucherType=6147 AND
    (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0 AND h.iAuth =1 and h.iHeaderId = ${iHeaderId}
    and bClosed<>1 --and d.iFaTag=${parsedPOSSalesPreferences?.compBranchId} and tag.iTag6=${parsedPOSSalesPreferences?.Branch}
order by h.iHeaderId desc, d.iBodyId;`,
          },
        ],
      },
    );
    if (
      stockInDataDetails &&
      stockInDataDetails?.data &&
      stockInDataDetails?.result === 1 &&
      stockInDataDetails?.data?.[0]?.Table &&
      stockInDataDetails?.data?.[0]?.Table?.length > 0
    ) {
      storedStockInDetails = stockInDataDetails.data[0].Table;
      setStockInDetails(storedStockInDetails);
      if (storedStockInDetails) {
        fetchCategoryItems(storedStockInDetails);
        // console.log('selectedItem', itemSelected);
      }
    } else {
      showToast(stockInDataDetails?.message);
    }
    return [];
  };

  useEffect(() => {
    getsubDivision();
    getStockIn();
    getReason();
  }, []);

  useEffect(() => {
    const reloadSubDivision = async () => {
      getsubDivision();
      getStockIn();
      getReason();
    };

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
  const handleSelectedStockIn = async (data: any) => {
    console.log('handleSelectedStockIn', data);
    if (data && data?.value) {
      setSelectedStockIn(data);
      await getStockInDetails(data?.value);
    } else {
      setSelectedStockIn(null);
    }
  };

  const handleAddProduct = async (
    item: {
      ProductName: any;
      Rate: any;
      iProduct: any;
      iBodyId: any;
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
        setStockInDetails((prevItems: any[]) =>
          prevItems.map((i: {iBodyId: string}) =>
            i.iBodyId === item.iBodyId
              ? {...i, Quantity: quantity} // Update cart quantity in local state
              : i,
          ),
        );
      } else {
        setStockInDetails((prevItems: any[]) =>
          prevItems.map((i: {iBodyId: string}) =>
            i.iBodyId === item.iBodyId
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

  const handleSelectedReason = async (item: any, data: {value: any}) => {
    console.log('handleSelectedReason', item, data);
    setStockInDetails((prevItems: any[]) =>
      prevItems.map((i: {iBodyId: string}) =>
        i.iBodyId === item.iBodyId ? {...i, selectedReason: data} : i,
      ),
    );
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
                        uri: `data:image/png;base64,${item?.ProductImage}`,
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
                Stock Out Qty:{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {/* {item.ConsumedQty} */}
                  {item?.Balance || 0}
                </Text>
              </Text>
              <Text style={styles.subText}>
                Quantity Received:{' '}
                <Text
                  style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                  {/* {item.ConsumedQty} */}
                  {item?.Balance - inputQuantity?.[item?.iBodyId] || 0}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        {/* Line above the quantity container */}
        <View style={styles.divider} />
        <View style={styles.quantityContainer}>
          {/* Quantity */}
          <Text style={[styles.subText, {width: 130}]}>Quantity Damaged: </Text>
          <>
            <View style={styles.quantityContainer}>
              <TextInput
                editable={item?.Balance ? true : false}
                // value={item?.Quantity.toString()}
                value={inputQuantity?.[item?.iBodyId]?.toString()}
                placeholder="Add Quantity"
                placeholderTextColor={item?.Balance > 0 ? '#8e918e' : '#ccc'}
                // onFocus={handleFocus(item)}
                // onBlur={handleBlur(item)}
                onChangeText={quantity => {
                  const parsedQuantity = parseInt(quantity);

                  if (
                    !isNaN(parsedQuantity) &&
                    parsedQuantity <= item?.Balance &&
                    parsedQuantity > 0
                  ) {
                    handleAddProduct(item, parsedQuantity);
                    setInputQuantity(prev => ({
                      ...prev,
                      [item?.iBodyId]: parsedQuantity, // Update with valid quantity
                    }));
                  } else {
                    setInputQuantity(prev => ({
                      ...prev,
                      [item?.iBodyId]: '', // Update with valid quantity
                    }));
                    // Handle invalid input (optional: show an error message, etc.)
                    if (isNaN(parsedQuantity)) {
                      handleAddProduct(item, quantity);
                      console.log('Invalid quantity entered');
                    } else {
                      console.log(
                        `Quantity exceeds Stock Out Qty. Maximum is ${item?.Balance}`,
                      );
                      handleAddProduct(item, 0);
                      showToast(
                        `Quantity exceeds Stock Out Qty. Maximum is ${item?.Balance}`,
                      );
                    }
                  }
                }}
                keyboardType="phone-pad"
                style={{
                  textAlign: 'center',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: item?.Balance > 0 ? '#0f6cbd' : '#ccc',
                  fontSize: 15,
                  fontWeight: 'bold',
                  padding: 8,
                  color: 'black',
                  backgroundColor: item?.Balance > 0 ? '#daedf5' : '#f0f0f0',
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  height: 40,
                }}
              />
            </View>
          </>
        </View>
        <View style={styles.quantityContainer}>
          {/* Quantity */}
          <Text style={[styles.subText, {width: 100}]}>Reason: </Text>
          <>
            <View style={styles.quantityContainer}>
              <View
                style={[
                  // styles.receivedItemText,
                  styles.cell,
                  {padding: 0, width: 140},
                ]}>
                <TableSingleSelect
                  label="Reason"
                  onData={(data: any) => handleSelectedReason(item, data)}
                  value={item?.selectedReason?.label || null}
                  items={reasonMList || []}
                />
              </View>
            </View>
          </>
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
    console.log('onConfirmRequest', selectedItemQuantity);
    const allHaveSelectedReasonWithValue = selectedItemQuantity.every(
      (item: any) =>
        item.selectedReason !== undefined &&
        item.selectedReason !== null &&
        item.selectedReason.hasOwnProperty('value') &&
        item.selectedReason.value !== null &&
        item.selectedReason.value !== undefined,
    );

    let alertMsg = [];
    if (!selectedSubDivision) {
      alertMsg.push('Sub-Division');
    }
    if (!selectedStockIn) {
      alertMsg.push('Stock Out Doc No.');
    }
    if (alertMsg?.length > 0) {
      showToast(`Please select, ${alertMsg.join(', ')}`);
    } else {
      if (!allHaveSelectedReasonWithValue) {
        showToast('Please select reason for all the items of Damaged Qty');
        return;
      } else {
        await placeOrder();
        setShowPlaceOrderModal(true);
        setShowBillDetails(true);
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
      // console.log('selectedItemQuantity', selectedItemQuantity);
      if (parsedPOSSalesPreferences) {
        setShowPlaceOrderModal(false);
        let stockOutRequest = '';
        storedHostname = await AsyncStorage.getItem('hostname');
        const stockOutRequestUrl = `${storedHostname}/focus8api/Transactions/1287/`;
        const bodyData: any = [];
        const stockOutRequestDetailsArray = stockInDetails;

        for (let x in stockOutRequestDetailsArray) {
          const receivedQty: any =
            stockOutRequestDetailsArray[x]?.Balance -
            (stockOutRequestDetailsArray[x]?.Quantity || 0);
          console.log(
            'receivedQty',
            receivedQty,
            stockOutRequestDetailsArray[x]?.Balance,
            stockOutRequestDetailsArray[x]?.Quantity,
          );
          const gross =
            parseInt(receivedQty) *
            parseFloat(stockOutRequestDetailsArray[x]?.mRate);
          bodyData.push({
            'Item Type__Id': stockOutRequestDetailsArray[x]?.ItemType,
            Item__Id: stockOutRequestDetailsArray[x]?.iProduct,
            Quantity: receivedQty,
            // Quantity: stockOutRequestDetailsArray[x]?.Quantity,
            //
            Batch: {
              BatchId: stockOutRequestDetailsArray[x]?.iBatchId,
              BatchNo: stockOutRequestDetailsArray[x]?.sBatchNo,
              // ExpDate: batch.iExpiryDate,
              ExpDate__Id: stockOutRequestDetailsArray[x]?.iExpiryDate,
              MfgDate__Id: stockOutRequestDetailsArray[x]?.mfDate,
              Qty: receivedQty,
            },
            'L-Outlet Stock Out': [
              {
                BaseTransactionId: stockOutRequestDetailsArray[x]?.iBodyId,
                VoucherType: 6147,
                //   VoucherNo: 'MPOSSale:1',
                UsedValue: receivedQty,
                LinkId: 402851079,
                RefId: stockOutRequestDetailsArray[x]?.iBodyId,
              },
            ],
            //
            Rate: stockOutRequestDetailsArray[x]?.mRate,
            Gross: gross,
            Discount: stockOutRequestDetailsArray[x]?.discountP,
            STONo: stockOutRequestDetailsArray[x]?.sVoucherNo,
            STODate: stockOutRequestDetailsArray[x]?.invoiceDate,
          });
        }
        // getting fatag from POSSalePreferenceTagData
        var storedFatag = await AsyncStorage.getItem(
          'POSSalePreferenceTagData',
        );
        var parsedFatag = JSON.parse(storedFatag || '{}');
        var compBranchCaption = `${parsedFatag.FaTag}__Id`;

        stockOutRequest = JSON.stringify({
          data: [
            {
              Body: bodyData,
              Header: {
                Date: dateToInt(new Date()),
                [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId, //'Division Master__Id'
                Warehouse__Id: parsedPOSSalesPreferences?.warehouseId,
                Branch__Id: selectedStockIn?.branchId,
                'Sub Division__Id': selectedSubDivision?.value,
                VendorAC__Id: stockOutRequestDetailsArray?.[0]?.iBookNo,
                Segment__Code: 'SR AFRO',
              },
            },
          ],
        });

        const stockOutRequestRes = await fetchDataFromApi(
          stockOutRequestUrl,
          stockOutRequest,
        );

        //   if (false) {
        //for testing purpose(withOut internet)
        if (stockOutRequestRes?.result == 1) {
          // post voucher Mobile POS In-Transit Damages 1293 for selected items
          let stockInTransitDamagesRequest = '';
          const stockInTransitDamagesRequestUrl = `${storedHostname}/focus8api/Transactions/1293/`;
          const bodyDataTransit: any = [];
          const stockInRequestDetailsArray = selectedItemQuantity;
          for (let x in stockInRequestDetailsArray) {
            const gross =
              parseInt(stockInRequestDetailsArray[x]?.Quantity) *
              parseFloat(stockInRequestDetailsArray[x]?.mRate);
            bodyDataTransit.push({
              'Item Type__Id': stockOutRequestDetailsArray[x]?.ItemType,
              Item__Id: stockInRequestDetailsArray[x]?.iProduct,
              Quantity: stockInRequestDetailsArray[x]?.Quantity,
              // Quantity: stockInRequestDetailsArray[x]?.Quantity,
              Batch: {
                BatchId: stockInRequestDetailsArray[x]?.iBatchId,
                BatchNo: stockInRequestDetailsArray[x]?.sBatchNo,
                // ExpDate: batch.iExpiryDate,
                ExpDate__Id: stockInRequestDetailsArray[x]?.iExpiryDate,
                MfgDate__Id: stockInRequestDetailsArray[x]?.mfDate,
                Qty: stockInRequestDetailsArray[x]?.Quantity,
              },
              'L-Outlet Stock Out': [
                {
                  BaseTransactionId: stockOutRequestDetailsArray[x]?.iBodyId,
                  VoucherType: 6147,
                  //   VoucherNo: 'MPOSSale:1',
                  UsedValue: stockInRequestDetailsArray[x]?.Quantity,
                  LinkId: 402851079,
                  RefId: stockOutRequestDetailsArray[x]?.iBodyId,
                },
              ],
              Rate: stockInRequestDetailsArray[x]?.mRate,
              Gross: gross,
              Discount: stockInRequestDetailsArray[x]?.discountP,
              'Outlet StockLoss Reasons__Id':
                stockInRequestDetailsArray[x]?.selectedReason?.value,
              STONo: stockInRequestDetailsArray[x]?.sVoucherNo,
              STODate: stockInRequestDetailsArray[x]?.invoiceDate,
            });
          }
          stockInTransitDamagesRequest = JSON.stringify({
            data: [
              {
                Body: bodyDataTransit,
                Header: {
                  Date: dateToInt(new Date()),
                  [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId, //'Division Master__Id'
                  Warehouse__Id: parsedPOSSalesPreferences?.warehouseId,
                  Branch__Id: selectedStockIn?.branchId,
                  'Sub Division__Id': selectedSubDivision?.value,
                  VendorAC__Id: stockInRequestDetailsArray?.[0]?.iBookNo,
                  Segment__Code: 'SR AFRO',
                  Narration: `Mobile POS Stock IN.: ${stockOutRequestRes?.data?.[0]?.VoucherNo}`,
                },
              },
            ],
          });
          const stockInTransitDamagesRequestRes = await fetchDataFromApi(
            stockInTransitDamagesRequestUrl,
            stockInTransitDamagesRequest,
          );
          console.log(
            'stockInTransitDamagesRequestRes',
            stockInTransitDamagesRequestRes,
          );
          //end of post voucher Mobile POS In-Transit Damages 1293 for selected items

          if (
            stockInTransitDamagesRequestRes?.result != 1 &&
            stockInTransitDamagesRequestRes?.message === 'Request timed out'
          ) {
            Alert.alert(
              'Failed', // Title of the alert
              `Mobile POS In-Transit Damages placement failed: ${
                stockInTransitDamagesRequestRes?.message || ''
              }`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          } else {
            setIsLoading(false);
            setShowManditory(false);
            setSelectedSubDivision(null);
            setSelectedStockIn(null);
            setStockInDetails([]);
            setSelectedItemQuantity([]);
            setReloadKey(prev => !prev);
            onData({reloadKey});
            setShowPlaceOrderModal(false);
            Alert.alert(
              'Success',
              `Mobile POS Stock IN placed Successfully\n Mobile POS Stock IN.: ${stockOutRequestRes?.data?.[0]?.VoucherNo}\n`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          }
        } else {
          // Save to local database if result is not 1
          // if (false) {
          // //for testing purpose(withOut internet)
          if (stockOutRequestRes?.result == -1) {
            Alert.alert(
              'Failed', // Title of the alert
              `Order placement failed: ${stockOutRequestRes?.message || ''}`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          } else {
            if (stockOutRequestRes?.message === 'Request timed out') {
              Alert.alert(
                'Failed', // Title of the alert
                `Order placement failed: ${stockOutRequestRes?.message || ''}`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            }
          }
        }
      } else {
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  }

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
            Stock IN
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
                  label={'Stock Out Doc No.'}
                  items={stockInData || [{label: '', value: 0}]}
                  value={selectedStockIn?.label || null}
                  onData={(data: any) => handleSelectedStockIn(data)}
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
                  data={stockInDetails}
                  renderItem={renderItem}
                  keyExtractor={item => item.iProduct.toString()}
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
    // borderRightWidth: 1,
    // borderColor: '#ccc',
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

export default StockInPage;
