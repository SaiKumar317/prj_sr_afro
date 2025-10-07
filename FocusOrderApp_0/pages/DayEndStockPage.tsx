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
import AsyncStorage from '@react-native-async-storage/async-storage';

declare function alert(message?: any): void;

function DayEndStockPage({
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
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
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
    //   // navigation.navigate('DayEndStockPage');
    //   return;
    // }
    console.log(
      'storedUsername',
      storedUsername,
      storedUsername?.toUpperCase() !== 'SU',
    );
    setIsCheckedAll(false);

    const dayInDataResponse = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `
SELECT 
    CONVERT(nvarchar, dbo.IntToDate(ISNULL(eh.DayInDate, 0)), 105) AS DayInDate,
    CONVERT(nvarchar, dbo.IntToDate(ISNULL(eh.DayEndDate, 0)), 105) AS DayEndDate,
    
    CASE 
        WHEN eh.DayInDate IS NOT NULL 
             AND CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date) THEN 'true'
        ELSE 'false' 
    END AS IsDayInDateToday,

    CASE 
        WHEN eh.DayEndDate IS NULL OR eh.DayEndDate = 0 THEN 'false' 
        ELSE 'true' 
    END AS IsDayEndDatePresent,

    ISNULL(h.sVoucherNo, '') AS sVoucherNo,
    h.iHeaderId,

    ISNULL(abs(ci.fQiss), 0) AS fQiss,
    ISNULL(ci.fQrec, 0) AS fQrec,

    ISNULL(i.iProduct, 0) AS iProduct,
    ISNULL(i.fQuantity, 0) AS fQuantity,

    ISNULL(bsd.mInput2, 0) AS openQty,
	d.iBodyId,
    d.iInvTag,
    p.sName AS itemName,
     u.sCode AS unit,
    up.ItemType AS ItemType,
    w.sName warehouse,
    h.iDate docDate,
	eh.DayInDate,
	d.iFaTag divisionId,
	t.iTag6 branchId,
	isnull(t.iTag3062,0) reasonId
FROM tCore_Header_0 h
JOIN tCore_HeaderData8006_0 eh ON eh.iHeaderId = h.iHeaderId
JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
JOIN tCore_Indta_0 i ON i.iBodyId = d.iBodyId
join tCore_Data_Tags_0 t on t.iBodyId = d.iBodyId
JOIN tCore_IndtaBodyScreenData_0 bsd ON bsd.iBodyId = d.iBodyId
join mCore_Product p on p.iMasterId = i.iProduct
left join muCore_Product up on up.iMasterId = i.iProduct
left join muCore_Product_Units pu on pu.iMasterId = i.iProduct
left join mCore_Units u on u.iMasterId = pu.iDefaultBaseUnit
join mCore_Warehouse w on w.iMasterId = d.iInvTag

LEFT JOIN vCore_ibals_0 ci ON ci.iProduct = i.iProduct AND ci.iInvTag = d.iInvTag AND ci.iDate = h.iDate

WHERE h.iVoucherType = 8006 AND h.iHeaderId = ${parsedPOSSalesPreferences?.iHeaderId};
`,
          },
        ],
      },
    );
    var stockDataResponseByBatch: any[] = [];
    var dayInDataResponseByBatch: any[] = [];

    if (
      dayInDataResponse &&
      dayInDataResponse?.data &&
      dayInDataResponse?.result === 1 &&
      dayInDataResponse?.data?.[0]?.Table &&
      dayInDataResponse?.data?.[0]?.Table?.length > 0
    ) {
      dayInDataResponseByBatch = dayInDataResponse?.data?.[0]?.Table;
      setStockDayINData(stockDataResponseByBatch);
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
    MAX(up.ItemType) AS ItemType,
    MAX(w.sName) AS warehouse,
    MAX(ISNULL(abs(ci.fQiss), 0)) AS fQiss,
    MAX(ISNULL(ci.fQrec, 0)) AS fQrec
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
join mCore_Warehouse w on w.iMasterId = d.iInvTag
LEFT JOIN vCore_ibals_0 ci ON ci.iProduct = i.iProduct AND ci.iInvTag = d.iInvTag AND ci.iDate = ${parsedPOSSalesPreferences?.intDayInDate}

WHERE
    --i.iProduct = 16935 AND 
    d.iInvTag = ${dayInDataResponseByBatch?.[0]?.iInvTag}
    AND h.iDate <= ${parsedPOSSalesPreferences?.intDayInDate}
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
        stockDataResponseByBatch = stockDataResponse?.data?.[0]?.Table;

        // Create a map for quick lookup from dayInDataResponseByBatch
        const dayInMap = new Map<number, any>();
        dayInDataResponseByBatch.forEach(item => {
          dayInMap.set(item.iProduct, item);
        });

        // Step 1: Merge matching and stock-only items
        const mergedData = stockDataResponseByBatch.map(stockItem => {
          const dayInItem = dayInMap.get(stockItem.iProduct);
          return {
            ...dayInItem,
            ...stockItem, // stockItem takes precedence
          };
        });

        // Step 2: Add remaining unmatched items from dayInDataResponseByBatch
        const stockProductIds = new Set(
          stockDataResponseByBatch.map(item => item.iProduct),
        );
        const unmatchedDayInItems = dayInDataResponseByBatch.filter(
          item => !stockProductIds.has(item.iProduct),
        );

        // Final combined result
        const finalMergedData = [...mergedData, ...unmatchedDayInItems];

        setStockDayINData(finalMergedData);
      }
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

    const dayInBody: any[] = [];

    var stockConfirmDoc: any;
    // const storedFocusSessoin: any = await AsyncStorage.getItem('focusSessoin');

    for (let item of stockDayINData) {
      const batchQty = Number(item?.BatchQty || 0);
      const openAccept = Number(item?.openAccept || 0);

      const baseData = {
        TransactionId: item?.iBodyId || 0,
        'Outlet StockLoss Reasons__Id': item?.reasonId || 0,
        Item__Id: item?.iProduct,
        Unit__Code: item?.unit,
        // 'Opening for the day': item?.openQty,
        'Closing for the day': batchQty,
        // 'Opening Accepted by User': openAccept,
        'Issues for the day': item?.fQiss || 0,
        'Receipts for the day': item?.fQrec || 0,
      };

      // Add all to main Day IN
      dayInBody.push(baseData);
    }

    const headerData = {
      DocNo: stockDayINData?.[0]?.sVoucherNo,
      Date: stockDayINData?.[0]?.docDate,
      Segment__Code: 'SR AFRO',
      'Division Master__Id': stockDayINData?.[0]?.divisionId,
      Branch__Id: stockDayINData?.[0]?.branchId,
      Warehouse__Id: stockDayINData?.[0]?.iInvTag,
      sNarration: '',
      // DayInDate: stockDayINData?.[0]?.DayInDate,
      DayEndDate: dateToInt(new Date()),
      HeaderId: stockDayINData?.[0]?.iHeaderId,
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
      //

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

      // navigation.navigate('TabStack');
      const isDayInToday =
        POSSaleDateInEndResponse?.IsDayInDateToday === 'true';
      // Success for all
      if (!isDayInToday) {
        navigation.navigate('DayInStockPage');
        Alert.alert(
          'Success',
          `Stock Confirmation During Day End Successful: \n Doc No: ${stockConfirmDoc}`,
        );
      } else {
        // if day in and day end already done for previous days
        alert(
          'Day In and Day End have already been entered for today. No further action is allowed.',
        );
        // return;
      }
    } catch (error: any) {
      Alert.alert('Failed', error.message || 'Stock Confirmation failed');
    }
  };

  const handleRefresh = async () => {
    await getPreferencesData();
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
              onPress={
                () => handleLogout()
                // Alert.alert('Confirm', 'Are you sure you want to logout?', [
                //   {
                //     text: 'No',
                //     style: 'cancel',
                //     // onPress: () => {
                //     //   setSessionValid(true);
                //     // },
                //   },
                //   {
                //     text: 'Yes',
                //     onPress: async () => {
                //       handleLogout();
                //     },
                //   },
                // ])
              } //onPress={() => handleBackPage('Cart')}
            >
              <View style={{alignItems: 'center', marginRight: 15}}>
                <FontAwesomeIcon icon={faSignOut} size={18} color="white" />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 12,
                    textAlign: 'center',
                    width: 50,
                  }}>
                  Cancel/Log Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              marginRight: 'auto',
              marginLeft: 8,
              fontWeight: 'bold',
            }}>
            Stock Confirmation During Day End
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
                value={stockDayINData?.[0]?.warehouse || ''}
                keyboardType="phone-pad"
                editable={false}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={[styles.buttonText, {marginRight: 5}]}>
                Post Day End
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
                  Received Qty
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 130, color: 'white'},
                  ]}>
                  Issued Qty
                </Text>
                <Text
                  style={[
                    styles.receivedItemText,
                    styles.headerText,
                    styles.cell,
                    {width: 130, color: 'white'},
                  ]}>
                  Closing Stock
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
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {
                              width: 250,
                              borderLeftWidth: 1,
                              borderColor: '#ccc',
                            },
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
                          {item?.openQty}
                        </Text>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 130, textAlign: 'right'},
                          ]}>
                          {item?.fQrec}
                        </Text>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 130, textAlign: 'right'},
                          ]}>
                          {item?.fQiss}
                        </Text>
                        <Text
                          style={[
                            styles.receivedItemText,
                            styles.cell,
                            {width: 130, textAlign: 'right'},
                          ]}>
                          {item.BatchQty}
                        </Text>
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

export default DayEndStockPage;
