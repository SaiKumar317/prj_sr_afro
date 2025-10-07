/* eslint-disable react-native/no-inline-styles */
import {
  faArrowLeft,
  faCartShopping,
  faFloppyDisk,
  faRefresh,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect} from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import {PaperProvider, Text} from 'react-native-paper';
import renderLoadingView from '../constants/LoadingView';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import SelectModal from '../constants/SelectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';
import TableInput from '../constants/TableInput';
import TableSingleSelect from '../constants/TableSingleSelect';

declare function alert(message?: any): void;

function DayInStockPage({
  SessionId,
  handleBackPage,
  handleLogout,
  navigation,
  route,
}: {
  SessionId: any;
  handleBackPage: (message: string) => void; // updated type
  handleLogout: () => void; // updated type
  navigation: any;
  route: any;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<any>(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [fatag, setFaTag] = React.useState<any>(null);
  const [preferenseData, setPreferenseData] = React.useState<any>(null);
  const [stockDayINData, setStockDayINData] = React.useState<any>([]);
  const [isCheckedAll, setIsCheckedAll] = React.useState<any>(false);
  const [reasonMList, setReasonMList] = React.useState<any>([]);

  const dateToInt = (date: {
    getDate: () => number;
    getMonth: () => number;
    getFullYear: () => number;
  }) => {
    return (
      date.getDate() + (date.getMonth() + 1) * 256 + date.getFullYear() * 65536
    );
  };
  useEffect(() => {
    getPreferencesData();
  }, []);

  async function getPreferencesData() {
    var storedHostname = await AsyncStorage.getItem('hostname');
    var storedUsername = await AsyncStorage.getItem('username');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
    console.log('storedPOSSalePreferenceData', parsedPOSSalesPreferences);
    setPreferenseData(parsedPOSSalesPreferences);
    // if (storedPOSSalePreferenceData) {
    //   // navigation.navigate('TabStack');
    //   // navigation.navigate('DayInStockPage');
    //   return;
    // }
    console.log(
      'storedUsername',
      storedUsername,
      storedUsername?.toUpperCase() !== 'SU',
    );
    setIsCheckedAll(false);
    const stockDataResponse = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `SELECT
	MAX(b.sBatchNo) AS sBatchNo,       -- Pick a representative batch name per batch id
	MAX(b.iBatchId) AS iBatchId,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN CONVERT(varchar, dbo.IntToDate(MAX(b.iExpiryDate)), 103) 
        ELSE NULL 
    END AS iExpiryDate,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN MAX(b.iExpiryDate) 
        ELSE NULL 
    END AS iExpiryDateId,
    SUM(i.fQuantityInBase) AS BatchQty,
    SUM(i.fQuantityInBase) AS openAccept,
	  i.iProduct,
    MAX(d.iInvTag) AS iInvTag,
    MAX(b.iMfDate) AS iMfDate,
	 MAX(p.sName) AS itemName,
	  MAX(u.sCode) AS unit,
    MAX(up.ItemType) AS ItemType
	--,
    --MIN(h.iDate) AS VoucherDate,
    --MAX(h.sVoucherNo) AS sVoucherNo,
    --MAX(h.iVoucherType) AS iVoucherType,
    --MAX(d.iBodyId) AS iBodyId
FROM tCore_Header_0 h
JOIN tCore_Data_0 d   ON d.iHeaderId = h.iHeaderId 
JOIN tCore_Indta_0 i  ON i.iBodyId = d.iBodyId
JOIN tCore_Batch_0 b  ON b.iBodyId = d.iBodyId 
join mCore_Product p on p.iMasterId = i.iProduct
 left join muCore_Product up on up.iMasterId = i.iProduct
left join muCore_Product_Units pu on pu.iMasterId = i.iProduct
left join mCore_Units u on u.iMasterId = pu.iDefaultBaseUnit

WHERE
    --i.iProduct = 16935 AND 
	d.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
    AND h.iDate <= dbo.DateToInt(GETDATE())
    AND h.bUpdateStocks = 1
    AND h.bSuspended = 0
    AND d.iAuthStatus < 2
    AND d.bSuspendUpdateStocks = 0 
GROUP BY
    i.iProduct
   -- b.iBatchId,
    --d.iInvTag
HAVING
    SUM(i.fQuantityInBase) <> 0
	order by iExpiryDate;`,
          },
        ],
      },
    );
    if (
      stockDataResponse &&
      stockDataResponse?.data &&
      stockDataResponse?.result === 1 &&
      stockDataResponse?.data?.[0]?.Table &&
      stockDataResponse?.data?.[0]?.Table?.length > 0
    ) {
      setStockDayINData(stockDataResponse?.data?.[0]?.Table);
    }

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
    if (
      reasonMData &&
      reasonMData?.data &&
      reasonMData?.result === 1 &&
      reasonMData?.data?.[0]?.Table &&
      reasonMData?.data?.[0]?.Table?.length > 0
    ) {
      setReasonMList(reasonMData?.data?.[0]?.Table);
    }
  }

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };
  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      // onData({isLoading: true});
      setIsLoading(true);
      const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');
      const response = await fetch(url, {
        method: requestData !== '' ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSessoin || '',
        },
        // body: JSON.stringify(requestData),
        // Conditionally add the body if the method is POST
        ...(requestData !== '' && {
          body: JSON.stringify(requestData), // Only include the body if method is POST
        }),
      });
      console.log('response', response);
      if (!response.ok) {
        setIsLoading(false);
        // onData({isLoading: false});
        // onDataFromLoginPage;
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.result === 1) {
        console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        // alert(data.message);
        showToast(data.message);
        setIsLoading(false);
        // onData;
        return data;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      setIsLoading(false);
      //   onData({isLoading: false});
    } finally {
      setIsLoading(false);
      //   onData({isLoading: false});
    }
  };

  const handleSubmit = async () => {
    const storedHostname = await AsyncStorage.getItem('hostname');
    if (!storedHostname) {
      Alert.alert('Error', 'Hostname not found');
      return;
    }

    // ✅ Validate selectedReason for selected items
    for (let [index, item] of stockDayINData.entries()) {
      if (item.selected && !item?.selectedReason?.value) {
        Alert.alert(
          'Validation Error',
          `Please select a Reason for selected items`,
          // `Please select a reason for checked item: ${item?.itemName || ''}`,
        );
        return;
      }
    }

    const dayInBody: any[] = [];
    const shortageBody: any[] = [];
    const excessBody: any[] = [];
    var stockConfirmDoc: any;
    var shortageDoc: any;
    var excessDoc: any;
    const storedFocusSessoin: any = await AsyncStorage.getItem('focusSessoin');
    // get stock by batch
    const stockDataByBatchResponse = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `SELECT
	MAX(b.sBatchNo) AS sBatchNo,       -- Pick a representative batch name per batch id
	b.iBatchId,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN CONVERT(varchar, dbo.IntToDate(MAX(b.iExpiryDate)), 103) 
        ELSE NULL 
    END AS iExpiryDate,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN MAX(b.iExpiryDate) 
        ELSE NULL 
    END AS iExpiryDateId,
    SUM(i.fQuantityInBase) AS BatchQty,
	  i.iProduct,
    d.iInvTag,
    MAX(b.iMfDate) AS iMfDate--,
    --MIN(h.iDate) AS VoucherDate,
    --MAX(h.sVoucherNo) AS sVoucherNo,
    --MAX(h.iVoucherType) AS iVoucherType,
    --MAX(d.iBodyId) AS iBodyId
FROM tCore_Header_0 h
JOIN tCore_Data_0 d   ON d.iHeaderId = h.iHeaderId 
JOIN tCore_Indta_0 i  ON i.iBodyId = d.iBodyId
JOIN tCore_Batch_0 b  ON b.iBodyId = d.iBodyId 
WHERE
    --i.iProduct = 16935 AND 
	d.iInvTag = ${preferenseData?.warehouseId}
    AND h.iDate <= dbo.DateToInt(GETDATE())
    AND h.bUpdateStocks = 1
    AND h.bSuspended = 0
    AND d.iAuthStatus < 2
    AND d.bSuspendUpdateStocks = 0 
GROUP BY
    i.iProduct,
    b.iBatchId,
    d.iInvTag
HAVING
    SUM(i.fQuantityInBase) <> 0
	order by iExpiryDate;;`,
          },
        ],
      },
    );
    var stockByBatchData: any[] = [];
    if (
      stockDataByBatchResponse &&
      stockDataByBatchResponse?.data &&
      stockDataByBatchResponse?.result === 1 &&
      stockDataByBatchResponse?.data?.[0]?.Table &&
      stockDataByBatchResponse?.data?.[0]?.Table?.length > 0
    ) {
      stockByBatchData = stockDataByBatchResponse?.data?.[0]?.Table;
    } else {
      Alert.alert('Error', 'No stock data found for the warehouse');
      return;
    }
    for (let item of stockDayINData) {
      const batchQty = Number(item?.BatchQty || 0);
      const openAccept = Number(item?.openAccept || 0);

      const baseData = {
        'Outlet StockLoss Reasons__Id': item?.selectedReason?.value || 0,
        Item__Id: item?.iProduct,
        Unit__Code: item?.unit,
        'Opening for the day': batchQty,
        'Closing for the day': 0,
        'Opening Accepted by User': openAccept,
        'Issues for the day': 0,
        'Receipts for the day': 0,
      };

      // Add all to main Day IN
      dayInBody.push(baseData);

      // Update batch info in shortageBody

      // Only selected rows go into shortage/excess
      if (item.selected) {
        if (openAccept < batchQty) {
          const shortageQty = batchQty - openAccept;

          // Get batches for this specific item
          const itemBatches = stockByBatchData.filter(
            batch => batch.iProduct === item.iProduct,
          );

          // Sort batches by expiry date (FIFO - First In First Out)
          itemBatches.sort(
            (a, b) => (a.iExpiryDateId || 0) - (b.iExpiryDateId || 0),
          );

          // Target total qty for shortage
          let targetQty = shortageQty;
          // let resultBatch: {
          //   BatchId: any;
          //   BatchNo: any;
          //   ExpDate__Id: any;
          //   MfgDate__Id: any;
          //   Qty: any;
          // }[] = [];
          let totalQty = 0;

          // Iterate over each batch and adjust the quantity to fit the target
          itemBatches.forEach(batch => {
            if (totalQty < targetQty) {
              let remainingQty = targetQty - totalQty;
              let shortBatchQty =
                batch.BatchQty <= remainingQty ? batch.BatchQty : remainingQty;

              // resultBatch.push({
              //   BatchId: batch.iBatchId,
              //   BatchNo: batch.sBatchNo,
              //   ExpDate__Id: batch.iExpiryDateId,
              //   MfgDate__Id: batch.iMfDate,
              //   Qty: shortBatchQty,
              // });
              // Add shortage entry with batch information
              shortageBody.push({
                ...baseData,
                'Item Type__Id': item?.ItemType,
                Quantity: shortBatchQty,
                Batch: {
                  BatchId: batch.iBatchId,
                  BatchNo: batch.sBatchNo,
                  ExpDate__Id: batch.iExpiryDateId,
                  MfgDate__Id: batch.iMfDate,
                  Qty: shortBatchQty,
                }, // Array of batches
              });
              totalQty += shortBatchQty;
            }
          });
        } else if (openAccept > batchQty) {
          const excessQty = openAccept - batchQty;

          // Get batches for this specific item for excess
          const itemBatches = stockByBatchData.filter(
            batch => batch.iProduct === item.iProduct,
          );

          // Sort batches by expiry date (FIFO)
          itemBatches.sort(
            (a, b) => (a.iExpiryDateId || 0) - (b.iExpiryDateId || 0),
          );

          // Target total qty for excess
          let targetQty = excessQty;
          // let resultBatch: {
          //   BatchId: any;
          //   BatchNo: any;
          //   ExpDate__Id: any;
          //   MfgDate__Id: any;
          //   Qty: any;
          // }[] = [];
          let totalQty = 0;

          // Iterate over each batch and adjust the quantity to fit the target
          itemBatches.forEach(batch => {
            if (totalQty < targetQty) {
              let remainingQty = targetQty - totalQty;
              let excessBatchQty =
                batch.BatchQty <= remainingQty ? batch.BatchQty : remainingQty;

              // resultBatch.push({
              //   BatchId: batch.iBatchId,
              //   BatchNo: batch.sBatchNo,
              //   ExpDate__Id: batch.iExpiryDateId,
              //   MfgDate__Id: batch.iMfDate,
              //   Qty: excessBatchQty,
              // });
              // Add excess entry with batch information
              excessBody.push({
                ...baseData,
                'Item Type__Id': item?.ItemType,
                Quantity: excessBatchQty,
                Batch: {
                  BatchId: batch.iBatchId,
                  BatchNo: batch.sBatchNo,
                  ExpDate__Id: batch.iExpiryDateId,
                  MfgDate__Id: batch.iMfDate,
                  Qty: excessBatchQty,
                }, // Array of batches
              });
              totalQty += excessBatchQty;
            }
          });
        }
      }
    }

    const headerData = {
      Segment__Code: 'SR AFRO',
      'Division Master__Id': preferenseData?.compBranchId,
      Branch__Id: preferenseData?.Branch,
      Warehouse__Id: preferenseData?.warehouseId,
      sNarration: '',
      DayInDate: dateToInt(new Date()),
      DayEndDate: 0,
    };

    try {
      // 1. Post main Day IN
      const mainResponse = await fetchDataFromApi(
        `${storedHostname}/focus8api/Transactions/8006/`,
        {
          data: [{Header: headerData, Body: dayInBody}],
        },
      );

      if (mainResponse?.result === 1) {
        stockConfirmDoc = mainResponse?.data?.[0]?.VoucherNo;
      }
      if (mainResponse?.result !== 1) {
        throw new Error(
          `${mainResponse?.message}\nMobile POS Day In-End Stock voucher posting failed` ||
            'Mobile POS Day In-End Stock voucher posting failed',
        );
      }
      async function deleteMainInvoice(voucherType: any, docNo: any) {
        const deleteInvoice = await fetch(
          `${storedHostname}/focus8api/Transactions/${voucherType}/${docNo}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              fSessionId: storedFocusSessoin,
            },
          },
        );
        const deleteInvoiceData = await deleteInvoice.json();
        console.log('deleteInvoice', deleteInvoiceData);
      }

      // 2. Post shortage if any
      if (shortageBody.length > 0) {
        const shortageResponse = await fetchDataFromApi(
          `${storedHostname}/focus8api/Transactions/5394/`,
          {
            data: [{Header: headerData, Body: shortageBody}],
          },
        );
        if (shortageResponse?.result === 1) {
          shortageDoc = shortageResponse?.data?.[0]?.VoucherNo;
        }

        if (shortageResponse?.result !== 1) {
          await deleteMainInvoice(8006, stockConfirmDoc);
          throw new Error(
            `${shortageResponse?.message}\nMobile POS Outlet Day In Shortages posting failed` ||
              'Mobile POS Outlet Day In Shortages posting failed',
          );
        }
      }

      // 3. Post excess if any
      if (excessBody.length > 0) {
        const excessResponse = await fetchDataFromApi(
          `${storedHostname}/focus8api/Transactions/2066/`,
          {
            data: [{Header: headerData, Body: excessBody}],
          },
        );
        if (excessResponse?.result === 1) {
          excessDoc = excessResponse?.data?.[0]?.VoucherNo;
        }
        if (excessResponse?.result !== 1) {
          await deleteMainInvoice(8006, stockConfirmDoc);
          await deleteMainInvoice(5394, shortageDoc);

          throw new Error(
            `${excessResponse?.message}\nMobile POS Outlet Day In Excess posting failed` ||
              'Mobile POS Outlet Day In Excess posting failed',
          );
        }
      }
      const POSSaleDateInEndData = await fetchDataFromApi(
        `${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query: `select top 1
          convert(nvarchar, dbo.IntToDate(eh.DayInDate), 105) AS DayInDate,
          convert(nvarchar, dbo.IntToDate(eh.DayEndDate), 105) AS DayEndDate,
          CASE 
              WHEN eh.DayInDate IS NOT NULL 
                   AND CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date) THEN 'true'
              ELSE 'false' 
          END AS IsDayInDateToday,
          CASE 
              WHEN eh.DayEndDate IS NULL OR eh.DayEndDate = 0 THEN 'false' 
              ELSE 'true' 
          END AS IsDayEndDatePresent,
          h.sVoucherNo,
        h.iHeaderId,
        eh.DayInDate intDayInDate
      from tCore_Header_0 h
      join tCore_HeaderData8006_0 eh on eh.iHeaderId = h.iHeaderId
      where h.iVoucherType = 8006
      order by h.iDate desc,h.iHeaderId desc`,
            },
          ],
        },
      );
      var POSSaleDateInEndResponse = [];
      if (
        POSSaleDateInEndData &&
        POSSaleDateInEndData?.data &&
        POSSaleDateInEndData?.result === 1 &&
        POSSaleDateInEndData?.data?.[0]?.Table &&
        POSSaleDateInEndData?.data?.[0]?.Table?.length > 0
      ) {
        POSSaleDateInEndResponse = POSSaleDateInEndData?.data?.[0]?.Table?.[0];
      }
      AsyncStorage.setItem(
        'POSSalePreferenceData',
        JSON.stringify({
          ...preferenseData,
          ...POSSaleDateInEndResponse,
        }),
      );

      // Success for all
      navigation.navigate('TabStack');
      Alert.alert('Success', 'Stock Confirmation During Day IN Successful');
    } catch (error: any) {
      Alert.alert('Failed', error.message || 'Stock Confirmation failed');
    }
  };

  const handleRefresh = async () => {
    await getPreferencesData();
  };

  const toggleCheckbox = (rowIndex: any) => {
    // Toggle selected state of the specific row
    const updatedStocckData = [...stockDayINData];
    const wasSelected = updatedStocckData[rowIndex].selected;
    updatedStocckData[rowIndex] = {
      ...updatedStocckData[rowIndex],
      selected: !wasSelected,
      ...(wasSelected && {openAccept: updatedStocckData?.[rowIndex]?.BatchQty}),
    };

    // Check if all checkboxes are now selected
    const allSelected = updatedStocckData.every(item => item.selected);
    setStockDayINData(updatedStocckData);
    setIsCheckedAll(allSelected);
  };

  const toggleCheckboxAll = () => {
    // Toggle all checkboxes based on current state
    const updatedStocckData = stockDayINData.map((item: any) => {
      const shouldSelect = !isCheckedAll; //&& !item.disabled;

      return {
        ...item,
        selected: shouldSelect,
        ...(!shouldSelect && {openAccept: item.BatchQty}), // ✅ Add openAccept when selecting
      };
    });
    setStockDayINData(updatedStocckData);
    setIsCheckedAll(!isCheckedAll);
  };

  const validateNumberInput = (value: any) => {
    console.log(value);
    let isValid = true;
    // Trim starting zeros
    value = value.replace(/^0+/, '');
    for (let i = 0; i < value.length; i++) {
      const char = value.charAt(i);

      // Allow only digits (no decimal point)
      if (!/[\d]/.test(char)) {
        isValid = false;
        break;
      }
    }
    return isValid;
  };
  const handleOpenAcceptChange = (rowIndex: any, value: string) => {
    const updatedStocckData = [...stockDayINData];
    if (!validateNumberInput(value)) {
      updatedStocckData[rowIndex] = {
        ...updatedStocckData[rowIndex],
        openAccept: '0',
      };
      setStockDayINData(updatedStocckData);
      showToast('Please enter a valid number');
      return;
    }
    // console.log('handleOpenAcceptChange', updatedStocckData[rowIndex], value);
    updatedStocckData[rowIndex] = {
      ...updatedStocckData[rowIndex],
      openAccept: value || '0',
    };
    setStockDayINData(updatedStocckData);
  };

  const handleSelectedReason = async (rowIndex: any, data: {value: any}) => {
    // console.log('selectedBranch', data);
    // if (data && data?.value) {
    //   setSelectedBranch(data);
    // } else {
    //   setSelectedBranch(null);
    // }
    const updatedStocckData = [...stockDayINData];

    updatedStocckData[rowIndex] = {
      ...updatedStocckData[rowIndex],
      selectedReason: data,
    };
    setStockDayINData(updatedStocckData);
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
            padding: 15,
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Confirm', 'Are you sure you want to logout?', [
                  {
                    text: 'No',
                    style: 'cancel',
                    // onPress: () => {
                    //   setSessionValid(true);
                    // },
                  },
                  {
                    text: 'Yes',
                    onPress: async () => {
                      handleLogout();
                    },
                  },
                ])
              } //onPress={() => handleBackPage('Cart')}
            >
              <View style={{alignItems: 'center', marginRight: 15}}>
                <FontAwesomeIcon icon={faSignOut} size={25} color="white" />
                <Text
                  style={{color: 'white', fontSize: 12, textAlign: 'center'}}>
                  Log Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              marginRight: 'auto',
              marginLeft: 10,
              fontWeight: 'bold',
            }}>
            Stock Confirmation During Day IN
          </Text>
        </View>
        <View style={{flex: 1, padding: 15}}>
          <View
            style={[
              styles.inspect,
              {
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}>
            <View style={{flex: 1, marginRight: 5}}>
              <FloatingLabelInput
                label={'Warehouse'}
                value={preferenseData?.warhouseName}
                // value={
                //   totalAmtPaid <= 0 || isNaN(totalAmtPaid)
                //     ? '0'
                //     : (totalAmtPaid - totalAmount)?.toFixed(2)?.toString()
                // }
                // onChangeText={handleUpiMpChange}
                keyboardType="phone-pad"
                editable={false}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={[styles.buttonText, {marginRight: 5}]}>
                Post Day IN
              </Text>
              <FontAwesomeIcon icon={faFloppyDisk} size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleRefresh}>
              <FontAwesomeIcon icon={faRefresh} size={20} color="white" />
            </TouchableOpacity>
          </View>
          {/* Stock Day IN Data Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={[styles.receivedDataContainer, {flex: 1}]}>
              {/* Sticky Header */}
              <View style={[styles.headerRow]}>
                <View
                  style={[
                    {
                      justifyContent: 'center', // centers vertically
                      alignItems: 'center',
                      width: 50,
                    },
                    styles.receivedItemText,
                    styles.cell,
                  ]}>
                  <CheckBox
                    tintColors={{true: '#083b16', false: 'white'}}
                    value={isCheckedAll}
                    onValueChange={toggleCheckboxAll}
                    disabled={stockDayINData?.length > 0 ? false : true}
                  />
                </View>

                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 250, color: 'white'},
                  ]}>
                  Item Name
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 100, color: 'white'},
                  ]}>
                  UOM
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 130, color: 'white'},
                  ]}>
                  Opening Qty
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 130, color: 'white'},
                  ]}>
                  Opening Acceptance
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 130, marginRight: 50, color: 'white'},
                  ]}>
                  Reason
                </Text>
              </View>

              {/* Scrollable Vertical Content */}
              {stockDayINData?.length > 0 ? (
                <ScrollView
                  // style={{marginTop: 40}}
                  showsVerticalScrollIndicator={true}>
                  {stockDayINData.map((item, index) => (
                    <TouchableWithoutFeedback key={index}>
                      <View
                        style={[
                          styles.tableRow,
                          index % 2 === 0 ? styles.evenRow : styles.oddRow,
                          item.selected && styles.selectedRow,
                        ]}>
                        <View
                          style={[
                            {
                              justifyContent: 'center', // centers vertically
                              alignItems: 'center',
                              width: 50,
                              borderLeftWidth: 1,
                              borderColor: '#ccc',
                            },
                            styles.receivedItemText,
                            styles.cell,
                          ]}>
                          <CheckBox
                            tintColors={{true: 'green', false: 'black'}}
                            value={item.selected}
                            onValueChange={() => toggleCheckbox(index)}
                          />
                        </View>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 250},
                          ]}>
                          {item.itemName}
                        </Text>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 100},
                          ]}>
                          {item.unit}
                        </Text>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 130, textAlign: 'right'},
                          ]}>
                          {item.BatchQty}
                        </Text>
                        <View
                          style={[
                            // styles.receivedItemText,
                            styles.cell,
                            {width: 130, padding: 0},
                          ]}>
                          <TableInput
                            label={'opening acceptance'}
                            value={item?.openAccept?.toString()}
                            // value={
                            //   totalAmtPaid <= 0 || isNaN(totalAmtPaid)
                            //     ? '0'
                            //     : (totalAmtPaid - totalAmount)?.toFixed(2)?.toString()
                            // }
                            onChangeText={value =>
                              handleOpenAcceptChange(index, value)
                            }
                            keyboardType="phone-pad"
                            editable={item?.selected || false}
                            autoCapitalize="none"
                          />
                        </View>
                        <View
                          style={[
                            // styles.receivedItemText,
                            styles.cell,
                            {width: 130, padding: 0, flex: 1},
                          ]}>
                          <TableSingleSelect
                            label="Reason"
                            onData={(data: any) =>
                              handleSelectedReason(index, data)
                            }
                            value={item?.selectedReason?.label || null}
                            items={reasonMList || []}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  ))}
                </ScrollView>
              ) : (
                <Text
                  style={[
                    styles.cell,
                    {
                      fontSize: 20,
                      color: 'black',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      borderWidth: 1,
                      borderColor: '#ccc',
                    },
                  ]}>
                  No Data found.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </PaperProvider>
    </>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f6cbd',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginLeft: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
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
  tableHeaderRow: {
    flexDirection: 'row',
    // backgroundColor: '#d9d8d7',
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
    // // textAlign: 'center',
    // // padding: 10,
    // justifyContent: 'center', // Center vertically within the text container
    alignItems: 'center', // Align text horizontally as well
    textAlignVertical: 'center',
    minHeight: 35,
  },
  highlightedRow: {
    backgroundColor: '#d0ebff', // light blue or your preferred color
  },
  headerText: {
    fontWeight: 'bold',
    color: 'white',
  },
  receivedDataContainer: {
    color: 'black',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowRadius: 5,
    marginBottom: 10,
  },
  cell: {
    color: 'black',
    borderRightWidth: 1,
    borderColor: '#ccc',
    padding: 9.5,
    minWidth: 100, // Adjust this value as needed
    // justifyContent: 'center', // This will center the content vertically
    // alignItems: 'center', // This will center the content horizontally
    // alignSelf: 'center',
    alignSelf: 'stretch',
    fontSize: 16,
    fontWeight: '700',
  },
  evenRow: {
    backgroundColor: '#FFFFFF', // White background for even rows
  },
  oddRow: {
    backgroundColor: '#F8F9FA', // Light gray background for odd rows
  },
  selectedRow: {
    backgroundColor: '#ecf3ecff', // Light gray background for odd rows
  },
  inspect: {
    // borderWidth: 2, // 2px border width
    // borderColor: '#000000', // Black border color
    // borderStyle: 'solid', // Solid border style (default is solid)
  },
  headerRow: {
    flexDirection: 'row',
    // backgroundColor: '#d9d8d7',
    backgroundColor: '#0f6cbd',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    color: 'white',
  },
  headerCell: {
    padding: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderColor: '#ccc',
    color: 'white',
    minWidth: 100,
    alignSelf: 'stretch',
  },
});

export default DayInStockPage;
