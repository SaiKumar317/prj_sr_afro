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
  getSalesInvoiceDetails,
  getSalesInvoicesPending,
  updateConsumedReturnQtyLocal,
  updateSalesInvoiceQty,
} from '../services/SQLiteService';
import {addToCart} from '../services/CartService';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import PortalHost from 'react-native-paper/lib/typescript/components/Portal/PortalHost';
import {
  createSalesReturnTable,
  insertSalesReturn,
} from '../services/OrdersServices';

const focus_rt_black = require('../assets/images/focus_rt_black.png');

let storedHostname: any = '';
let masterResponse = '';
const screenHeight = Dimensions.get('window').height;

function SalesReturnsPage({
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

  const [isLoading, setIsLoading] = useState(false);

  const [salesInvoiceData, setSalesInvoiceData] = useState<any>([
    {label: '', value: 0},
  ]);

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
  const [selectedSalesInvoice, setSelectedSalesInvoice] = useState<any>(null);
  const [salesInvoiceDetails, setSalesInvoiceDetails] = useState<any[]>([]);
  const [inputQuantity, setInputQuantity] = useState<any>({});

  const [totalCalcGross, setTotalCalcGross] = useState(0);
  const [totalCalcDiscountPer, setTotalCalcDiscountPer] = useState(0);
  const [totalCalcDiscountAmt, setTotalCalcDiscountAmt] = useState(0);
  const [totalCalcVAT, setTotalCalcVAT] = useState(0);
  const [totalCalcExcise, setTotalCalcExcise] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [totalVarieties, setTotalVarieties] = useState(0);

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
    let totalGross = 0;
    let totalDiscountPer = 0;
    let totalDiscountAmt = 0;
    let totalVAT = 0;
    let totalExcise = 0;
    let totalAmt = 0;
    let totalVarieties = 0;

    // Count items with quantity > 0 from inputQuantity
    totalVarieties = salesInvoiceDetails?.filter(
      quantity => quantity?.inputQty > 0,
    ).length;

    // Calculate total quantity and total amount based on inputQuantity
    for (const eachItem of salesInvoiceDetails) {
      const {
        ProductId,
        BodyId,
        mRate,
        discountP,
        discountAmt,
        vat,
        excise,
        inputQty,
      } = eachItem;
      const item = salesInvoiceDetails.find(
        (item: {BodyId: any; ProductId: string}) => item.BodyId === BodyId,
      );
      if (item && inputQty > 0) {
        let calcGross = inputQty * item.mRate;
        totalQty += inputQty;
        totalGross += calcGross;
        totalDiscountPer += calcGross * (item?.discountP / 100);
        totalDiscountAmt += item?.discountAmt || 0;
        totalVAT += calcGross * (item?.vat / 100);
        totalExcise += calcGross * (item?.excise / 100);
      }
    }

    totalAmt = parseFloat(
      (
        totalGross -
        (totalDiscountPer + totalDiscountAmt) +
        totalVAT +
        totalExcise
      ).toFixed(2),
    );

    setTotalCalcGross(totalGross);
    setTotalCalcDiscountPer(totalDiscountPer);
    setTotalCalcDiscountAmt(totalDiscountAmt);
    setTotalCalcVAT(totalVAT);
    setTotalCalcExcise(totalExcise);
    setTotalQuantity(totalQty);
    setTotalAmount(totalAmt);
    setTotalCash(totalAmt.toFixed(2));
    setTotalUpiMp(0); // Assuming you will set this value elsewhere
    setTotalVarieties(totalVarieties);
    setNarration('');
  };

  //   Update the billing details whenever salesInvoiceDetails or cartItems change
  useEffect(() => {
    if (salesInvoiceDetails.length > 0) {
      calculateBillingDetails();
    }
  }, [salesInvoiceDetails]);

  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };

  const getSalesInvoiceData = async () => {
    var storedSalesInvoiceData;
    storedSalesInvoiceData = await getSalesInvoicesPending();
    if (storedSalesInvoiceData) {
      setSalesInvoiceData(storedSalesInvoiceData);
      // return storedSalesInvoiceData;
    }
    const responseSalesInvoicesPending = await syncSalesInvoicesPending();
    if (responseSalesInvoicesPending?.message === 'Invalid Session') {
      showToast(responseSalesInvoicesPending?.message);
    }
    storedSalesInvoiceData = await getSalesInvoicesPending();
    if (storedSalesInvoiceData) {
      setSalesInvoiceData(storedSalesInvoiceData);
      return storedSalesInvoiceData;
    }

    return [];
  };
  useEffect(() => {
    getSalesInvoiceData();
    createSalesReturnTable();
  }, []);

  const reloadSalesInvoiceData = async () => {
    const storedSalesInvoiceData = await getSalesInvoicesPending();
    if (storedSalesInvoiceData) {
      setSalesInvoiceData(storedSalesInvoiceData);
    }
  };

  useEffect(() => {
    reloadSalesInvoiceData();
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

  const loadSalesInvoiceDetails = async (headerId: number) => {
    try {
      const details = await getSalesInvoiceDetails(headerId); // Only records matching the provided HeaderId and Balance condition
      //   console.log(details); // Do something with the details (e.g., display in the UI)
      // const db = await getDBConnection();
      // for (let i = 0; i < details.length; i++) {
      //   try {
      //     const [result] = await db.executeSql(
      //       `SELECT ProductImage FROM Products WHERE ProductId = ?`,
      //       [details[i].ProductId],
      //     );
      //     if (result.rows.length > 0) {
      //       const productImage = result.rows.item(0).ProductImage;
      //       //  salesInvoiceDetails[i].ProductImage = productImage;
      //       details[i].ProductImage = productImage;
      //       console.log('productImage sales return', productImage);
      //     }
      //   } catch (error) {
      //     console.log('error at getting ProductImage', error);
      //   }
      // }
      setSalesInvoiceDetails(details);
    } catch (error) {
      console.error('Error fetching sales invoice details:', error);
    }
  };

  useEffect(() => {
    if (selectedSalesInvoice) {
      loadSalesInvoiceDetails(selectedSalesInvoice.value);
    }
  }, [selectedSalesInvoice]);

  const handleSelectedSalesInvoice = (data: any) => {
    console.log('handleSelectedSalesInvoice', data);
    if (data && data?.value) {
      setSelectedSalesInvoice(data);
    } else {
      setSelectedSalesInvoice(null);
    }
  };

  const handleAddProduct = async (
    item: {
      ProductName: any;
      Rate: any;
      ProductId: any;
      BodyId: any;
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
        setSalesInvoiceDetails(prev =>
          prev.map(i =>
            i.BodyId === item.BodyId ? {...i, inputQty: quantity} : i,
          ),
        );
        // await addToCart(item.ProductId, qty); // Add item with the specified quantity
      } else {
        setSalesInvoiceDetails(prev =>
          prev.map(i => (i.BodyId === item.BodyId ? {...i, inputQty: 0} : i)),
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // setLoadingStates(prev => ({...prev, [item.ProductId]: false})); // Use ProductId directly
    }
  };
  const renderItem = ({item}) => (
    <TouchableWithoutFeedback onPress={() => setShowBillDetails(false)}>
      <View style={[styles.item, {borderWidth: 0.4, borderColor: '#0f6cbd'}]}>
        <View style={styles.row}>
          <View
            style={[styles.inspect, {flexDirection: 'row', paddingBottom: 8}]}>
            <View style={[styles.inspect, styles.imageContainer]}>
              {/* {item.ProductId && item.ProductImage !== 'AA==' ? ( */}
              {false ? (
                <View style={[styles.image, styles.loadingImage]}>
                  <ActivityIndicator size="small" color="#51c7d6" />
                </View>
              ) : (
                <Image
                  source={
                    item.ProductImage
                      ? {
                          uri: `data:image/png;base64,${[item.ProductImage]}`,
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
                  Sales Quantity:{' '}
                  <Text
                    style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                    {/* {item.ConsumedQty} */}
                    {item.orderQty}
                  </Text>
                </Text>
                {/* previous return qty */}
                <Text style={styles.subText}>
                  Previous Return Qty:{' '}
                  <Text
                    style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                    {item.orderQty - (item.Balance - item.LocalReturn)}
                  </Text>
                </Text>
                {/* Product Rate */}
                <Text style={styles.subText}>
                  Rate: {item.CurrencyCode}{' '}
                  <Text
                    style={{color: 'black', fontWeight: 'bold', fontSize: 17}}>
                    {item.mRate}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.quantityContainer}>
            <Text style={styles.subText}>Sales Return Quantity: </Text>
            <View style={styles.quantityContainer}>
              <TextInput
                placeholder="Add Quantity"
                placeholderTextColor="#8e918e"
                value={item?.inputQty?.toString() || ''}
                onChangeText={quantity => {
                  const parsedQuantity = parseInt(quantity);
                  setShowBillDetails(false);
                  console.log(
                    item.Balance,
                    parsedQuantity,
                    parsedQuantity <= item.Balance - item.LocalReturn,
                  );

                  if (
                    !isNaN(parsedQuantity) &&
                    parsedQuantity <= item.Balance - item.LocalReturn &&
                    parsedQuantity > 0
                  ) {
                    handleAddProduct(item, parsedQuantity);
                  } else {
                    // Handle invalid input (optional: show an error message, etc.)
                    if (isNaN(parsedQuantity)) {
                      handleAddProduct(item, quantity);
                      console.log('Invalid quantity entered');
                    } else {
                      console.log(
                        `Quantity exceeds Sales quantity. Max is ${
                          item.Balance - item.LocalReturn
                        }`,
                      );
                      handleAddProduct(item, 0);
                      showToast(
                        `Quantity exceeds Sales quantity. Maximum is ${
                          item.Balance - item.LocalReturn
                        }`,
                      );
                    }
                  }
                }}
                onFocus={() => setShowBillDetails(false)}
                keyboardType="phone-pad"
                style={{
                  textAlign: 'center',
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
                  //   width: 150,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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

  const onPlaceOrder = async () => {
    if (totalVarieties > 0) {
      setShowPlaceOrderModal(true);
      setShowBillDetails(true);
    } else {
      showToast('Please enter quantity');
    }
  };

  // Function to handle cash input change
  const handleCashChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericValue = text.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point

    // Ensure there is only one decimal point
    const splitText = numericValue.split('.');
    if (splitText.length > 2) {
      // If there are multiple decimal points, take only the first part
      return;
    }

    let cashValue = parseFloat(numericValue || '0');
    cashValue = totalAmount;
    console.log('handleCashChange', totalAmount, cashValue, totalCash);

    if (cashValue <= totalAmount) {
      // setTotalCash(numericValue.replace(/^0+/, '') || '0');
      setTotalCash(totalAmount);
      // Calculate UPI/MP based on total amount
      // cashValue = Math.round(cashValue * 100) / 100;
      const newUpiMp = totalAmount - cashValue;
      const roundedUpiMp = Math.round(newUpiMp * 100) / 100;
      setTotalUpiMp('0'); // Ensure UPI/MP is not negative
    }
  };

  // Function to handle UPI/MP input change
  const handleUpiMpChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericValue = text.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point

    // Ensure there is only one decimal point
    const splitText = numericValue.split('.');
    if (splitText.length > 2) {
      // If there are multiple decimal points, take only the first part
      return;
    }

    let upiMpValue = parseFloat(numericValue || '0');

    if (upiMpValue <= totalAmount) {
      setTotalUpiMp(numericValue.replace(/^0+/, '') || '0');
      // Calculate cash based on total amount
      upiMpValue = Math.round(upiMpValue * 100) / 100;
      const newCash = totalAmount - upiMpValue;
      const roundedCash = Math.round(newCash * 100) / 100;
      setTotalCash(roundedCash >= 0 ? roundedCash.toString() : '0'); // Ensure cash is not negative
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

      if (parsedPOSSalesPreferences) {
        if (salesInvoiceDetails) {
          setShowPlaceOrderModal(false);
          let salesOrderRequest = '';
          storedHostname = await AsyncStorage.getItem('hostname');
          const salesReturnUrl = `${storedHostname}/focus8api/Transactions/1795/`;
          const bodyData: any = [];
          const db = await getDBConnection();
          const consumedQty: any[] = [];

          const salesInvoiceDetailsArray = salesInvoiceDetails.map(
            (item: {
              Product: any;
              BodyId: any;
              POSCustomerName: any;
              POSCustomerMobileNumber: any;
              invoiceDate: any;
              iMfDate: any;
              inputQty: any;
              mRate: any;
              discountP: any;
              discountAmt: any;
              vat: any;
              excise: any;
              ExpiryDate: any;
              BatchId: any;
              BatchNo: any;
              sVoucherNo: any;
            }) => {
              return {
                // Return an object with required properties
                ProductId: item.Product,
                bodyId: item.BodyId,
                PosCustomerName: item.POSCustomerName,
                PosCustomerMobileNumber: item.POSCustomerMobileNumber,
                invoiceDate: item.invoiceDate,
                mfDate: item.iMfDate,
                Quantity: item.inputQty,
                Rate: item.mRate,
                discountP: item.discountP,
                discountAmt: item.discountAmt,
                vat: item.vat,
                excise: item.excise,
                iInvTag: parsedPOSSalesPreferences?.warehouseId,
                iExpiryDate: item.ExpiryDate,
                iBatchId: item.BatchId,
                sBatchNo: item.BatchNo,
                sVoucherNo: item.sVoucherNo,
              };
            },
          );
          const filteredSalesInvoiceDetails = salesInvoiceDetailsArray.filter(
            (item: {Quantity: any}) => item.Quantity > 0, // Filter items with quantity > 0
          );

          for (let x in filteredSalesInvoiceDetails) {
            const gross =
              parseInt(filteredSalesInvoiceDetails[x]?.Quantity) *
              parseFloat(filteredSalesInvoiceDetails[x]?.Rate);
            const taxableValue =
              gross -
              (gross * parseFloat(filteredSalesInvoiceDetails[x]?.discountP)) /
                100 -
              parseFloat(filteredSalesInvoiceDetails[x]?.discountAmt);
            const iProduct = filteredSalesInvoiceDetails[x]?.ProductId;
            const iInvTag = parsedPOSSalesPreferences?.warehouseId;
            const iExpiryDate = getCurrentDate();
            const iMfDate = getCurrentDate();
            bodyData.push({
              Item__Id: filteredSalesInvoiceDetails[x]?.ProductId,
              Quantity: filteredSalesInvoiceDetails[x]?.Quantity,
              Rate: filteredSalesInvoiceDetails[x]?.Rate,
              Gross: gross,
              Discount: filteredSalesInvoiceDetails[x]?.discountP,
              'Discount amount': filteredSalesInvoiceDetails[x]?.discountAmt,
              'Taxable Value': taxableValue,
              VAT: filteredSalesInvoiceDetails[x]?.vat,
              Excise: filteredSalesInvoiceDetails[x]?.excise,
              Batch: {
                BatchId: filteredSalesInvoiceDetails[x]?.iBatchId,
                BatchNo: filteredSalesInvoiceDetails[x]?.sBatchNo,
                // ExpDate: batch.iExpiryDate,
                ExpDate__Id: filteredSalesInvoiceDetails[x]?.iExpiryDate,
                MfgDate__Id: filteredSalesInvoiceDetails[x]?.mfDate,
                Qty: filteredSalesInvoiceDetails[x]?.Quantity,
              },
              'L-Mobile POS Sales Invoice': [
                {
                  BaseTransactionId: filteredSalesInvoiceDetails[x]?.bodyId,
                  VoucherType: 3342,
                  VoucherNo: 'MPOSSale:1',
                  UsedValue: filteredSalesInvoiceDetails[x]?.Quantity,
                  LinkId: 219023107,
                  RefId: filteredSalesInvoiceDetails[x]?.bodyId,
                },
              ],
            });
          }
          // getting fatag from POSSalePreferenceTagData
          var storedFatag = await AsyncStorage.getItem(
            'POSSalePreferenceTagData',
          );
          var parsedFatag = JSON.parse(storedFatag || '{}');
          var compBranchCaption = `${parsedFatag.FaTag}__Id`;

          salesOrderRequest = JSON.stringify({
            data: [
              {
                Body: bodyData,
                Header: {
                  Date: dateToInt(new Date()),
                  SalesAC__Id: parsedPOSSalesPreferences?.SalesAccount,
                  CustomerAC__Id: parsedPOSSalesPreferences?.CustomerAccount,
                  [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId,
                  Warehouse__Id: parsedPOSSalesPreferences?.warehouseId,
                  Branch__Id: parsedPOSSalesPreferences?.Branch,
                  Employee__Id: parsedPOSSalesPreferences?.employeeId,
                  sNarration: narration,
                  POSCustomerName:
                    filteredSalesInvoiceDetails[0]?.PosCustomerName,
                  POSCustomerMobileNumber:
                    filteredSalesInvoiceDetails[0]?.PosCustomerMobileNumber,
                  MobilePOSSaleNumber: `${filteredSalesInvoiceDetails[0]?.sVoucherNo}`,
                  MobilePOSSaleDate:
                    filteredSalesInvoiceDetails[0]?.invoiceDate,
                },
              },
            ],
          });

          const salesOrdersRes = await fetchDataFromApi(
            salesReturnUrl,
            salesOrderRequest,
          );

          const salesReceiptBody = {
            data: [
              {
                Body: [
                  ...(totalCash > 0
                    ? [
                        {
                          Account__Id: parsedPOSSalesPreferences?.CashAccount,
                          Amount: totalCash,
                          PaymentType: 0,
                        },
                      ]
                    : []),

                  ...(totalUpiMp > 0
                    ? [
                        {
                          Account__Id: parsedPOSSalesPreferences?.UPI_MPAccount,
                          Amount: totalUpiMp,
                          PaymentType: 1,
                        },
                      ]
                    : []),
                ],
                Header: {
                  Date: dateToInt(new Date()),
                  // Account__Id: parsedPOSSalesPreferences?.CustomerAccount,
                  CashBankAC__Id: parsedPOSSalesPreferences?.CashAccount,
                  [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId,
                  Branch__Id: parsedPOSSalesPreferences?.Branch,
                  Employee__Id: parsedPOSSalesPreferences?.employeeId,
                  MobilePOSSaleDate:
                    filteredSalesInvoiceDetails[0]?.invoiceDate,
                  sNarration: narration,
                  MobilePOSSaleNumber: `${filteredSalesInvoiceDetails[0]?.sVoucherNo}`,
                  POSCustomerName:
                    filteredSalesInvoiceDetails[0]?.PosCustomerName,
                  POSCustomerMobileNumber:
                    filteredSalesInvoiceDetails[0]?.PosCustomerMobileNumber,
                  MobilePOSSalesReturnNo: '',
                  MobilePOSSalesReturnDate: dateToInt(new Date()),
                },
              },
            ],
          };
          // if (false) {
          //for testing purpose(withOut internet)
          if (salesOrdersRes?.result == 1) {
            const salesReceiptUrl = `${storedHostname}/focus8api/Transactions/4872/`;
            salesReceiptBody.data[0].Header.MobilePOSSalesReturnNo = `${salesOrdersRes?.data?.[0]?.VoucherNo}`;
            const salesReceiptRes = await fetchDataFromApi(
              salesReceiptUrl,
              salesReceiptBody,
            );

            if (salesReceiptRes?.result == 1) {
              setIsLoading(false);
              setSelectedSalesInvoice(null);
              setSalesInvoiceDetails([]);
              setReloadKey(prev => !prev);

              // const storedSalesInvoiceData = await getSalesInvoicesPending();
              // if (storedSalesInvoiceData) {
              //   setSalesInvoiceData(storedSalesInvoiceData);
              // }
              setShowPlaceOrderModal(false);
              await updateSalesInvoiceQty(db, filteredSalesInvoiceDetails);

              //   await updateConsumedQty(db, consumedQty)
              //     .then(() => {
              //       console.log(
              //         `ConsumedQty updated successfully for ${consumedQty?.length} records.`,
              //       );
              //     })
              //     .catch(error => {
              //       console.error('Error updating ConsumedQty:', error);
              //     });
              Alert.alert(
                'Success',
                `Sales Return placed Successfully\n Mobile POS Sales Return.: ${salesOrdersRes?.data?.[0]?.VoucherNo}\n Mobile POS Sale Return Payment.: ${salesReceiptRes?.data?.[0]?.VoucherNo}`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
              //   // After order is placed, clear the cart items
              //   await deleteAllCartData()
              //     .then(() => {
              //       console.log('All data cleared.');
              //     })
              //     .catch(error => {
              //       console.error('Error clearing data:', error);
              //     });
              //   setCartItems([]); // Reset cartItems state
              //   setCategoryItems([]); // Reset salesInvoiceDetails state
            } else {
              if (salesReceiptRes?.result == -1) {
                Alert.alert(
                  'Failed',
                  `Posting failed for Mobile POS Return: ${salesReceiptRes?.message}`,
                );
              }

              const storedFocusSessoin = await AsyncStorage.getItem(
                'focusSessoin',
              );
              const response = await fetch(
                `${storedHostname}/focus8api/Transactions/1795/${salesOrdersRes?.data?.[0]?.VoucherNo}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    fSessionId: storedFocusSessoin || '',
                  },
                },
              );

              const data = await response?.json();
              console.log(
                `${storedHostname}/focus8api/Transactions/1795/${salesOrdersRes?.data?.[0]?.VoucherNo}`,
                data,
              );
            }
          } else {
            // Save to local database if result is not 1
            // if (false) {
            // //for testing purpose(withOut internet)
            if (salesOrdersRes?.result == -1) {
              Alert.alert(
                'Failed', // Title of the alert
                `Order placement failed: ${salesOrdersRes?.message || ''}`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            } else {
              if (salesOrdersRes?.message === 'Request timed out') {
                Alert.alert(
                  'Failed', // Title of the alert
                  `Order placement failed: ${salesOrdersRes?.message || ''}`,
                  [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                );
              } else {
                await insertSalesReturn(salesOrderRequest, salesReceiptBody); // Save the response to local DB

                await updateConsumedReturnQtyLocal(
                  db,
                  filteredSalesInvoiceDetails,
                )
                  .then(() => {
                    console.log(
                      `updateConsumedReturnQtyLocal updated successfully for ${filteredSalesInvoiceDetails?.length} records.`,
                    );
                  })
                  .catch(error => {
                    console.error(
                      'Error updating updateConsumedReturnQtyLocal:',
                      error,
                    );
                  });

                setIsLoading(false);
                setShowManditory(false);
                setSelectedSalesInvoice(null);
                setSalesInvoiceData([]);

                setSalesInvoiceDetails([]);
                setReloadKey(prev => !prev);
                onData({reloadKey});

                // const storedSalesInvoiceData = await getSalesInvoicesPending();
                // if (storedSalesInvoiceData) {
                //   setSalesInvoiceData(storedSalesInvoiceData);
                // }
                setShowPlaceOrderModal(false);
                Alert.alert(
                  'Failed', // Title of the alert
                  `Order placement failed: ${
                    salesOrdersRes?.message || ''
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

        // if (!customerName || !mobileNum || mobileNum.toString()?.length < 10) {
        //   showToast(
        //     `*Select ${!customerName ? 'POS Customer Name, ' : ''}${
        //       !mobileNum || mobileNum.toString()?.length < 10
        //         ? 'POS Customer Mobile Number'
        //         : ''
        //     }`,
        //   );
        // }
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
            Sales Return
          </Text>
        </View>
        <View style={{paddingTop: 10, paddingHorizontal: 10}}>
          <SelectModal
            label={'Sales Invoice'}
            items={salesInvoiceData || [{label: '', value: 0}]}
            value={selectedSalesInvoice?.label || null}
            onData={(data: any) => handleSelectedSalesInvoice(data)}
          />
        </View>
        <View style={styles.menuDropDown}>
          <View
            style={{
              width: Dimensions.get('window').width,
              flex: 1,
            }}>
            <FlatList
              data={salesInvoiceDetails}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={1}
              style={{flex: 1}}
            />
          </View>
          {!selectedSalesInvoice && (
            <>
              <View style={{flex: 1}}>
                <Text style={{fontSize: 20, color: 'black'}}>
                  Select Sales Invoice
                </Text>
              </View>
            </>
          )}
          {selectedSalesInvoice && (
            <>
              <View>
                <TouchableOpacity
                  style={[
                    styles.section,
                    styles.activeSectionBorder,
                    // !showBillDetails && styles.activeSectionBorder,
                  ]}
                  onPress={() => setShowBillDetails(!showBillDetails)}>
                  {showBillDetails ? (
                    // <View style={styles.content}>
                    //   <HTML
                    //     source={{html: availabilityContent}}
                    //     contentWidth={width - 64}
                    //     tagsStyles={customHTMLStyles}
                    //   />
                    // </View>
                    <>
                      {/* <Text style={styles.billingDetailsHeader}>
                                    Billing Details
                                  </Text> */}
                      <Text style={styles.sectionTitle}>Billing Details</Text>
                      <View style={styles.billContent}>
                        <View style={styles.billRow}>
                          <Text style={styles.label}>Total Items:</Text>
                          <Text style={styles.value}>
                            {totalVarieties.toFixed(2)}
                          </Text>
                        </View>
                        <View style={[styles.billRow]}>
                          <Text style={styles.label}>Total Quantity:</Text>
                          <Text style={styles.value}>
                            {totalQuantity.toFixed(2)}
                          </Text>
                        </View>
                        <View style={[styles.billRow, styles.line]}>
                          <Text style={styles.label}>Total Gross:</Text>
                          <Text style={styles.value}>
                            {`+  ${totalCalcGross.toFixed(2)}`}
                          </Text>
                        </View>
                        <View style={styles.billRow}>
                          <Text style={styles.label}>Total Discount:</Text>
                          <Text style={styles.value}>
                            {`-  ${(
                              totalCalcDiscountPer + totalCalcDiscountAmt
                            ).toFixed(2)}`}
                          </Text>
                        </View>
                        <View style={styles.billRow}>
                          <Text style={styles.label}>Total VAT:</Text>
                          <Text style={styles.value}>
                            {`+  ${totalCalcVAT.toFixed(2)}`}
                          </Text>
                        </View>
                        <View style={styles.billRow}>
                          <Text style={styles.label}>Total Excise:</Text>
                          <Text style={styles.value}>
                            {`+  ${totalCalcExcise.toFixed(2)}`}
                          </Text>
                        </View>
                        <View style={[styles.billRow, styles.line]}>
                          <Text style={styles.label}>
                            Net Amount: {salesInvoiceDetails?.[0]?.CurrencyCode}
                          </Text>
                          <Text style={styles.value}>
                            {totalAmount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Billing Details</Text>
                      <View
                        style={[
                          styles.billRow,
                          {
                            borderTopWidth: 1,
                            borderTopColor: '#ddd',
                            backgroundColor: '#fafafa',
                            padding: 15,
                          },
                        ]}>
                        <Text style={styles.label}>
                          Net Amount: {salesInvoiceDetails?.[0]?.CurrencyCode}
                        </Text>
                        <Text style={styles.value}>
                          {totalAmount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        {selectedSalesInvoice && (
          <>
            <TouchableOpacity style={styles.buttonPO} onPress={onPlaceOrder}>
              <Text style={styles.buttonText}>Place Return</Text>
            </TouchableOpacity>
          </>
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
              style={[styles.modalContent]}>
              <Text style={styles.modalTitle}>Confirm</Text>
              {/* <Text style={styles.modalMessage}>
                            Are you sure you want to place the order?
                          </Text> */}
              <ScrollView
                style={[styles.inspect, {width: '100%', marginBottom: 50}]}>
                <View
                  style={{flex: 1, justifyContent: 'space-between', gap: 50}}>
                  <View>
                    <View
                      style={[
                        styles.inspect,
                        {
                          flex: 1,
                          flexDirection: 'row',
                          //   justifyContent: 'space-around',
                          gap: 20,
                          padding: 5,
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
                      {/* <View style={{flex: 1}}>
                    <FloatingLabelInput
                      label={'UPI/MP'}
                      value={totalUpiMp.toString()}
                      onChangeText={handleUpiMpChange}
                      keyboardType="phone-pad"
                      editable={!isLoading}
                      autoCapitalize="none"
                    />
                  </View> */}
                    </View>

                    {/* <View style={{padding: 5}}>
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
                </View> */}
                    {/* 
                <View style={{padding: 5}}>
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
                </View> */}
                    <View style={{padding: 5}}>
                      <FloatingLabelInput
                        label={'Narration'}
                        value={narration}
                        onChangeText={text =>
                          setNarration(text.replace(/^\s+/, ''))
                        }
                        kbType="default"
                        editable={!isLoading}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  {/* {showManditory && (
                  <Text style={{color: 'red', paddingBottom: 20}}>
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
                )} */}

                  <View
                    style={[
                      {alignSelf: 'center', marginTop: 20},
                      styles.inspect,
                    ]}>
                    <TouchableOpacity
                      style={[
                        styles.section,
                        styles.activeSectionBorder,
                        // !showBillDetails && styles.activeSectionBorder,
                      ]}
                      onPress={() => setShowBillDetails(!showBillDetails)}>
                      {showBillDetails ? (
                        // <View style={styles.content}>
                        //   <HTML
                        //     source={{html: availabilityContent}}
                        //     contentWidth={width - 64}
                        //     tagsStyles={customHTMLStyles}
                        //   />
                        // </View>
                        <>
                          {/* <Text style={styles.billingDetailsHeader}>
                                    Billing Details
                                  </Text> */}
                          <Text style={styles.sectionTitle}>
                            Billing Details
                          </Text>
                          <View style={styles.billContent}>
                            <View style={styles.billRow}>
                              <Text style={styles.label}>Total Items:</Text>
                              <Text style={styles.value}>
                                {totalVarieties.toFixed(2)}
                              </Text>
                            </View>
                            <View style={[styles.billRow]}>
                              <Text style={styles.label}>Total Quantity:</Text>
                              <Text style={styles.value}>
                                {totalQuantity.toFixed(2)}
                              </Text>
                            </View>
                            <View style={[styles.billRow, styles.line]}>
                              <Text style={styles.label}>Total Gross:</Text>
                              <Text style={styles.value}>
                                {`+  ${totalCalcGross.toFixed(2)}`}
                              </Text>
                            </View>
                            <View style={styles.billRow}>
                              <Text style={styles.label}>Total Discount:</Text>
                              <Text style={styles.value}>
                                {`-  ${(
                                  totalCalcDiscountPer + totalCalcDiscountAmt
                                ).toFixed(2)}`}
                              </Text>
                            </View>
                            <View style={styles.billRow}>
                              <Text style={styles.label}>Total VAT:</Text>
                              <Text style={styles.value}>
                                {`+  ${totalCalcVAT.toFixed(2)}`}
                              </Text>
                            </View>
                            <View style={styles.billRow}>
                              <Text style={styles.label}>Total Excise:</Text>
                              <Text style={styles.value}>
                                {`+  ${totalCalcExcise.toFixed(2)}`}
                              </Text>
                            </View>
                            <View style={[styles.billRow, styles.line]}>
                              <Text style={styles.label}>
                                Net Amount:{' '}
                                {salesInvoiceDetails?.[0]?.CurrencyCode}
                              </Text>
                              <Text style={styles.value}>
                                {totalAmount.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </>
                      ) : (
                        <View>
                          <Text style={styles.sectionTitle}>
                            Billing Details
                          </Text>
                          <View
                            style={[
                              styles.billRow,
                              {
                                borderTopWidth: 1,
                                borderTopColor: '#ddd',
                                backgroundColor: '#fafafa',
                                padding: 15,
                              },
                            ]}>
                            <Text style={styles.label}>
                              Net Amount:{' '}
                              {salesInvoiceDetails?.[0]?.CurrencyCode}
                            </Text>
                            <Text style={styles.value}>
                              {totalAmount.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              {/* <View style={[styles.billingDetailsContainer, {marginBottom: 60}]}>
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
                                Total Amount: {salesInvoiceDetails?.[0]?.CurrencyCode}{' '}
                                <Text style={{color: 'black', fontWeight: 'bold'}}>
                                  {totalAmount.toFixed(2)}
                                </Text>
                              </Text>
                            </View>
                          </View> */}
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
      </PaperProvider>
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
    // backgroundColor: '#f9f9f9', // Light background color for the whole list
    backgroundColor: 'white',
    height: screenHeight,
    padding: 15, // Added more padding to the container for better spacing
    borderBottomRightRadius: 15, // Slightly more rounded corners
    borderBottomLeftRadius: 15,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    // marginBottom: 30,
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
  // inspect: {
  //   borderWidth: 2, // 2px border width
  //   borderColor: '#000000', // Black border color
  //   borderStyle: 'solid', // Solid border style (default is solid)
  // },
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

export default SalesReturnsPage;
