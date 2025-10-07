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

import FloatingLabelInput from '../constants/FloatingLabelInput';

import {
  createExpenseAccTable,
  createExpenseTable,
  insertExpense,
} from '../services/OrdersServices';
import SelectModal from '../constants/SelectModal';
import {getExpenseAccounts} from '../services/SQLiteService';
import {syncExpenseAccounts} from '../services/SyncSalesInvoiceService';

const focus_rt_black = require('../assets/images/focus_rt_black.png');

let storedHostname: any = '';
let masterResponse = '';
const screenHeight = Dimensions.get('window').height;

function ExpensePage({
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

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);

  const [showManditory, setShowManditory] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [cashValue, setCashValue] = useState<any>('');
  const [upiValue, setUpiValue] = useState<any>('');
  const [mtnValue, setMtnValue] = useState<any>('');

  const [expenseName, setExpenseName] = useState<any>(null);
  const [remarks, setRemarks] = useState<any>(null);

  const [expenseAccData, setExpenseAccData] = useState<any>([]);
  const [selectedExpenseAcc, setSelectedExpenseAcc] = useState<any>(null);

  const showToast = (message: React.SetStateAction<string>) => {
    console.log('showToast', message);
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

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
    createExpenseTable();
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
  const getExpenseAccData = async () => {
    var storedExpenseAccData;
    storedExpenseAccData = await getExpenseAccounts();
    if (storedExpenseAccData) {
      setExpenseAccData(storedExpenseAccData);
      // return storedExpenseAccData;
    }
    const responseExpenseAccPending = await syncExpenseAccounts();
    if (responseExpenseAccPending?.message === 'Invalid Session') {
      showToast(responseExpenseAccPending?.message);
    }
    storedExpenseAccData = await getExpenseAccounts();
    if (storedExpenseAccData) {
      setExpenseAccData(storedExpenseAccData);
      return storedExpenseAccData;
    }

    return [];
  };

  useEffect(() => {
    getExpenseAccData();
    createExpenseAccTable();
  }, []);

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
    let alertMsg = [];

    if (!selectedExpenseAcc) {
      alertMsg.push('Expense Account');
    }

    if (!expenseName) {
      alertMsg.push('Expense Name');
    }
    if (!cashValue && !upiValue && !mtnValue) {
      if (!cashValue) {
        alertMsg.push('Cash');
      }
      if (!upiValue) {
        alertMsg.push('or UPI/MP');
      }
      if (!mtnValue) {
        alertMsg.push('or MTN');
      }
    }

    if (alertMsg?.length > 0) {
      showToast(`Please select, ${alertMsg.join(', ')}`);
    } else {
      //   showToast('Please enter quantity');
      placeOrder();
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
        setShowPlaceOrderModal(false);

        storedHostname = await AsyncStorage.getItem('hostname');
        const expenseUrl = `${storedHostname}/focus8api/Transactions/4102/`;

        // getting fatag from POSSalePreferenceTagData
        var storedFatag = await AsyncStorage.getItem(
          'POSSalePreferenceTagData',
        );
        var parsedFatag = JSON.parse(storedFatag || '{}');
        var compBranchCaption = `${parsedFatag.FaTag}__Id`;

        let expenseRequest = JSON.stringify({
          data: [
            {
              Body: [
                ...(cashValue > 0
                  ? [
                      {
                        Account__Id: parsedPOSSalesPreferences?.CashAccount,
                        Amount: cashValue,
                        PaymentType: 0,
                      },
                    ]
                  : []),

                ...(upiValue > 0
                  ? [
                      {
                        Account__Id: parsedPOSSalesPreferences?.UPI_MPAccount,
                        Amount: upiValue,
                        PaymentType: 1,
                      },
                    ]
                  : []),
                ...(mtnValue > 0
                  ? [
                      {
                        Account__Id: parsedPOSSalesPreferences?.MTNAccount,
                        Amount: mtnValue,
                        PaymentType: 2,
                      },
                    ]
                  : []),
              ],
              Header: {
                Date: dateToInt(new Date()),
                [compBranchCaption]: parsedPOSSalesPreferences?.compBranchId, //'Division Master__Id'
                Branch__Id: parsedPOSSalesPreferences?.Branch,
                Account__Id: selectedExpenseAcc?.value,
                ExpenseDescription: expenseName,
                ExpenseRemarks: remarks,
              },
            },
          ],
        });

        const expenseRequestRes = await fetchDataFromApi(
          expenseUrl,
          expenseRequest,
        );

        // if (false) {
        //for testing purpose(withOut internet)
        if (expenseRequestRes?.result == 1) {
          setIsLoading(false);
          setShowManditory(false);
          setExpenseName('');
          setCashValue('');
          setUpiValue('');
          setMtnValue('');
          setSelectedExpenseAcc(null);
          setRemarks('');
          setReloadKey(prev => !prev);
          onData({reloadKey});
          setShowPlaceOrderModal(false);

          Alert.alert(
            'Success',
            `Mobile POS Expense placed Successfully\n Mobile POS Expense.: ${expenseRequestRes?.data?.[0]?.VoucherNo}\n`,
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          );
        } else {
          // Save to local database if result is not 1
          //   if (false) {
          // //for testing purpose(withOut internet)
          if (expenseRequestRes?.result == -1) {
            Alert.alert(
              'Failed', // Title of the alert
              `Mobile POS Expense failed: ${expenseRequestRes?.message || ''}`,
              [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            );
          } else {
            if (expenseRequestRes?.message === 'Request timed out') {
              Alert.alert(
                'Failed', // Title of the alert
                `Mobile POS Expense failed: ${
                  expenseRequestRes?.message || ''
                }`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            } else {
              await insertExpense(expenseRequest); // Save the response to local DB
              setIsLoading(false);
              setShowManditory(false);
              setExpenseName('');
              setCashValue('');
              setUpiValue('');
              setMtnValue('');
              setSelectedExpenseAcc(null);
              setRemarks('');
              setReloadKey(prev => !prev);
              onData({reloadKey});
              setShowPlaceOrderModal(false);

              Alert.alert(
                'Failed', // Title of the alert
                `Mobile POS Expense failed: ${
                  expenseRequestRes?.message || ''
                }\n Saved in local`,
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  }

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

    let cash = parseFloat(numericValue || '0');
    setCashValue(cash);
  };
  const handleUpiChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericValue = text.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point

    // Ensure there is only one decimal point
    const splitText = numericValue.split('.');
    if (splitText.length > 2) {
      // If there are multiple decimal points, take only the first part
      return;
    }

    let cash = parseFloat(numericValue || '0');
    setUpiValue(cash);
  };
  const handleMtnChange = (text: string) => {
    // Allow only numbers and a single decimal point
    const numericValue = text.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal point

    // Ensure there is only one decimal point
    const splitText = numericValue.split('.');
    if (splitText.length > 2) {
      // If there are multiple decimal points, take only the first part
      return;
    }

    let cash = parseFloat(numericValue || '0');
    setMtnValue(cash);
  };

  const handleSelectedExpenseAcc = (data: any) => {
    console.log('handleSelectedExpenseAcc', data);
    if (data && data?.value) {
      setSelectedExpenseAcc(data);
    } else {
      setSelectedExpenseAcc(null);
    }
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
            Expense Page
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
                  label={'Expense Account'}
                  items={expenseAccData || [{label: '', value: 0}]}
                  value={selectedExpenseAcc?.label || null}
                  onData={(data: any) => handleSelectedExpenseAcc(data)}
                />
              </View>
              <View style={{paddingTop: 10, paddingHorizontal: 10}}>
                <FloatingLabelInput
                  label={'Expense Name'}
                  value={expenseName}
                  onChangeText={text =>
                    setExpenseName(text.replace(/^\s+/, ''))
                  }
                  kbType="default"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <FloatingLabelInput
                  label={'Cash'}
                  value={cashValue.toString()}
                  onChangeText={handleCashChange}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <FloatingLabelInput
                  label={'UPI/MP'}
                  value={upiValue.toString()}
                  onChangeText={handleUpiChange}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <View style={{paddingHorizontal: 10}}>
                <FloatingLabelInput
                  label={'MTN'}
                  value={mtnValue.toString()}
                  onChangeText={handleMtnChange}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
              <View style={{paddingTop: 10, paddingHorizontal: 10}}>
                <FloatingLabelInput
                  label={'Remarks'}
                  value={remarks}
                  onChangeText={text => setRemarks(text.replace(/^\s+/, ''))}
                  kbType="default"
                  editable={!isLoading}
                  autoCapitalize="none"
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

export default ExpensePage;
