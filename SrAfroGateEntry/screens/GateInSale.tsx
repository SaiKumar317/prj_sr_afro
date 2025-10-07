/* eslint-disable react-native/no-inline-styles */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';

import {Provider as PaperProvider} from 'react-native-paper';

import {TouchableOpacity, View, Text, ScrollView, Alert} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faArrowsRotate,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';
import GateInSalePage from '../pages/GateInSalePage';

declare function alert(message?: any): void;

let masterResponse = '';
let storedHostname: string | null;

function GateInSale({
  SessionId,
  handleBackPage,
}: {
  SessionId: any;
  handleBackPage: () => void;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);
  const [gateInSalePage, setGateInSalePage] = useState<any>({
    showDropDown: true,
    openDropdown: '',
  });
  //   const [SessionId, setSessionId] = useState(SessionId);
  const [isLoading, setIsLoading] = useState(false);
  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };

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
  async function apiCall(url: any, sCodeArray: any) {
    // setIsLoading(true);
    setIsLoading(true);
    const storedHostnameIP = await AsyncStorage.getItem('hostname');
    const storedCompanyCode = await AsyncStorage.getItem('companyCode');

    const Options: any = {
      origin: '*',
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sCodeArray: sCodeArray,
        companyCode: `${storedCompanyCode}`,
      }),
    };
    var apiResponse;
    try {
      await fetch(`${storedHostnameIP}:7013${url}`, Options)
        .then(response => response.json())
        .then(jsonData => {
          console.log(`${storedHostnameIP}:7013${url} => jsonData: `, jsonData);
          apiResponse = jsonData;
          if (typeof apiResponse !== 'undefined' && 'ErrMsg' in apiResponse) {
            console.log('Error:', apiResponse.ErrMsg);
            alert('Internal Server Error');
            setIsLoading(false);
            // continueM();
            // Handle the error here
          } else {
            setIsLoading(false);
          }
        });
    } catch (error) {
      console.log(
        `Error at running: ${storedHostnameIP}:7013${url} => ${error}`,
      );
      alert('Internal Server Error');
      setIsLoading(false);
      // continueM();
    }
    setIsLoading(false);
    return apiResponse;
  }

  const handleGateInSalePage = (data: React.SetStateAction<any>) => {
    setGateInSalePage(data);
    setIsLoading(data?.isLoading);
    console.log('setGateInSalePage', data);
    if (data?.isbackPressed === true) {
      handleBackPage();
    }
  };

  const handleSaveButtonPressed = async () => {
    try {
      setIsLoading(true);
      console.log(
        'Data from GateInSalePage:',
        gateInSalePage?.selectedGridData,
      );
      let gateEntryInRequest = '';
      let gateEntryInUrl = '';
      console.log(
        'object',
        gateInSalePage &&
          gateInSalePage !== null &&
          typeof gateInSalePage === 'object' &&
          gateInSalePage?.selectedGridData &&
          gateInSalePage?.selectedGridData !== null &&
          gateInSalePage?.selectedGridData?.length > 0 &&
          gateInSalePage?.vehicleNo &&
          gateInSalePage?.capturedImage1,
        gateInSalePage?.postingDate,
        gateInSalePage?.selectedGridData?.length > 0,
      );
      if (
        gateInSalePage &&
        gateInSalePage !== null &&
        typeof gateInSalePage === 'object' &&
        gateInSalePage?.selectedGridData &&
        gateInSalePage?.selectedGridData !== null &&
        gateInSalePage?.selectedGridData?.length > 0 &&
        gateInSalePage?.vehicleNo &&
        gateInSalePage?.postingDate &&
        gateInSalePage?.capturedImage1
      ) {
        const {
          selectedCompBranch,
          selectedVoucher,
          selectedPendingVochNo,
          vehicleNo,
          capturedImage1,
          postingDate,
          selectedGridData,
        } = gateInSalePage;

        storedHostname = await AsyncStorage.getItem('hostname');
        // alert('Posting....');
        var invoiceQtyValues = selectedGridData.map(
          (item: {invoiceQty: any}) => item.invoiceQty,
        );

        const containsInvalidinvoiceQty = invoiceQtyValues.some(
          (value: string | undefined) =>
            value === undefined || value === '' || value === '0',
        );

        console.log(
          'invoiceQtyValues',
          invoiceQtyValues,
          containsInvalidinvoiceQty,
        );
        if (storedHostname) {
          const now = new Date();
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');

          console.log(`Current time: ${hours}:${minutes}:${seconds}`);
          const getIntDate = await fetchDataFromApi(
            `${storedHostname}/focus8API/utility/executesqlquery`,
            {
              data: [
                {
                  Query: `select dbo.fCore_TimeToInt('${hours}:${minutes}:${seconds}') as Time`,
                },
              ],
            },
          );
          console.log('getIntDate', getIntDate?.data?.[0]?.Table?.[0]?.Time);
          if (
            getIntDate &&
            getIntDate?.data &&
            getIntDate?.result === 1 &&
            getIntDate?.data?.[0]?.Table &&
            getIntDate?.data?.[0]?.Table?.[0]?.Time
          ) {
            gateEntryInUrl = `${storedHostname}/focus8api/Transactions/7940/`;
            const bodyData = [];
            for (let x in gateInSalePage?.selectedGridData) {
              bodyData.push({
                Item__Id: gateInSalePage?.selectedGridData[x]?.ItemId,
                Unit__Id: gateInSalePage?.selectedGridData[x]?.UnitId,
                // 'Order Qty': {
                //   Input: gateInSalePage?.selectedGridData[x]?.OrdQty,
                //   FieldName: 'Order Qty',
                //   FieldId: 104,
                //   Value: gateInSalePage?.selectedGridData[x]?.OrdQty,
                // },
                // 'Invoice Qty': {
                //   Input: gateInSalePage?.selectedGridData[x]?.invoiceQty,
                //   FieldName: 'Invoice Qty',
                //   FieldId: 105,
                //   Value: gateInSalePage?.selectedGridData[x]?.invoiceQty,
                // },
                'Quantity in KGS': {
                  Input: gateInSalePage?.selectedGridData[x]?.qtyKgs,
                  FieldName: 'Quantity in KGS',
                  FieldId: 1169,
                  Value: gateInSalePage?.selectedGridData[x]?.qtyKgs,
                },
                Quantity: gateInSalePage?.selectedGridData[x]?.invoiceQty,
                Vendor_CustomerName__Id:
                  gateInSalePage?.selectedGridData[x]?.AccountId,
                PO_SO_STR_STONo:
                  gateInSalePage?.selectedGridData[x]?.sVoucherNo,
              });
            }
            gateEntryInRequest = JSON.stringify({
              data: [
                {
                  Body: bodyData,
                  Header: {
                    Date: dateToInt(postingDate),
                    // Company__Id: selectedCompBranch?.companyId,
                    Segment__Id: selectedCompBranch?.companyId,

                    'Sub Division__Id': selectedPendingVochNo?.[0]?.divisionId,
                    // Division__Id: selectedPendingVochNo?.[0]?.divisionId,
                    // Division__Id: gateInSalePage?.selectedGridData[0]?.iTag3001,
                    // Branch__Id: selectedCompBranch?.branchId,
                    Location__Id: selectedCompBranch?.branchId,
                    'Division Master__Id': selectedCompBranch?.iMasterId,
                    'Transaction Type__Id': 2, //fixed
                    // WorkflowDocNo: '2',
                    GateEntryTime: getIntDate?.data[0]?.Table[0]?.Time,
                    VehicleNo: vehicleNo,
                    WBERequired: selectedVoucher?.WBRequired,
                    Image1: {
                      FileName: `sale_in${dateToInt(new Date())}_${
                        getIntDate?.data[0]?.Table[0]?.Time
                      }.jpg`,
                      FileData: `${capturedImage1}`,
                    },
                  },
                },
              ],
            });
          }
          console.log('gateEntryInRequest', gateEntryInRequest);
          const itemMaster = await fetchDataFromApi(
            gateEntryInUrl,
            gateEntryInRequest,
          );
          console.log('itemMasterResponse', itemMaster.result);
          if (itemMaster.result === 1) {
            // alert('Posted Successfully');
            Alert.alert(
              'Success',
              `Posted Successfully\nVoucherNo:${itemMaster?.data[0]?.VoucherNo}`,
              [
                {
                  text: 'Ok',
                  style: 'cancel',
                },
              ],
            );
            masterResponse = itemMaster.data[0].VoucherNo;
            setGateInSalePage(null);
            setIsLoading(false);
            reloadPage();
            return;
          } else {
            setIsLoading(false);
          }
        } else {
          // alert('Please enter Invoice Qty for selected Pending Voucher No.');
          alert('Posting Failed');
          setIsLoading(false);
        }

        setIsLoading(false);
        return;
      } else {
        const {
          selectedVoucher,
          selectedPendingVochNo,
          vehicleNo,
          capturedImage1,
          postingDate,
        } = gateInSalePage;
        console.error('Invalid gateInSalePage:', gateInSalePage);
        const postingFailedMsg = [];
        if (!selectedVoucher) {
          postingFailedMsg.push('Voucher Name');
        }
        if (!selectedPendingVochNo || selectedPendingVochNo.length === 0) {
          postingFailedMsg.push('Pending Voucher No.');
        }
        if (!postingDate || postingDate === '') {
          postingFailedMsg.push('Posting Date');
        }
        if (!vehicleNo || vehicleNo === '') {
          postingFailedMsg.push('Vehicle No.');
        }

        if (!capturedImage1) {
          postingFailedMsg.push('Image');
        }
        if (postingFailedMsg.length === 0) {
          setIsLoading(false);
          if (
            gateInSalePage?.selectedGridData &&
            gateInSalePage?.selectedGridData?.length === 0
          ) {
            alert('Please select atleast one Pending Voucher No');
          }

          return;
        } else {
          alert(`Please select the following:\n${postingFailedMsg.join(', ')}`);
          // alert('Posting Failed');
          setIsLoading(false);
        }

        return;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  // const handleLoadButtonPressed = async () => {
  //   console.log('gateInSalePage', gateInSalePage);
  //   const onLoadAlert = [];
  //   if (
  //     !gateInSalePage?.selectedBranch ||
  //     gateInSalePage?.selectedBranch.length === 0
  //   ) {
  //     onLoadAlert.push('Branch');
  //   }
  //   if (!gateInSalePage?.vehicleNo || gateInSalePage?.vehicleNo === '') {
  //     onLoadAlert.push('Vehicle No.');
  //   }
  //   if (!gateInSalePage?.selectedVoucher) {
  //     onLoadAlert.push('Voucher Name');
  //   }
  //   if (
  //     !gateInSalePage?.selectedPendingVochNo ||
  //     gateInSalePage?.selectedPendingVochNo.length === 0
  //   ) {
  //     onLoadAlert.push('Pending Voucher No.');
  //   }
  //   if (!gateInSalePage?.capturedImage1) {
  //     onLoadAlert.push('Image');
  //   }
  //   if (onLoadAlert.length === 0) {
  //     const gridDataresponse: any = await apiCall('/gridData', []);

  //     console.log('gridDataresponse', gridDataresponse);

  //     setSelectedValues(
  //       gridDataresponse && gridDataresponse?.ErrMsg
  //         ? initialSelectedValues
  //         : gridDataresponse,
  //     );

  //     return;
  //   } else {
  //     alert(`Please select the following:\n${onLoadAlert.join(', ')}`);
  //   }
  // };
  const handleRefreshButtonPressed = async () => {
    // alert('Refresh button is pressed');

    try {
      // Display alert to confirm clearing session data
      Alert.alert('Confirm', 'Are you sure you want to Refresh?', [
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
            // setSelectedValues(initialSelectedValues);
            reloadPage();
          },
        },
      ]);
    } catch (error) {
      console.error('Error reloading the page:', error);
    }
  };

  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: SessionId || '',
        },
        body: JSON.stringify(requestData),
      });
      console.log('response', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(`JsonData - ${url}`, data);

      if (data.result === 1) {
        // console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data.message);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <PaperProvider>
        {isLoading && renderLoadingView()}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#0d4257',
            padding: 5,
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={handleBackPage}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize: 18, marginRight: 'auto'}}>
            GATE ENTRY IN SALE
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* <TouchableOpacity onPress={handleLoadButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 20}}>
                <FontAwesomeIcon icon={faListCheck} size={23} color="white" />
                <Text
                  style={{color: 'white', fontSize: 10, textAlign: 'center'}}>
                  Load
                </Text>
              </View>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={handleRefreshButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 22}}>
                <FontAwesomeIcon
                  icon={faArrowsRotate}
                  size={23}
                  color="white"
                />
                <Text
                  style={{color: 'white', fontSize: 10, textAlign: 'center'}}>
                  Refresh
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 15}}>
                <FontAwesomeIcon icon={faSave} size={23} color="white" />
                <Text
                  style={{color: 'white', fontSize: 10, textAlign: 'center'}}>
                  Save
                </Text>
              </View>
            </TouchableOpacity>
            {/* <ThreeDotMenu
              onSave={handleSaveButtonPressed}
              onCancel={() => console.log('Cancel button pressed')}
            /> */}
          </View>
        </View>
        <ScrollView>
          <GateInSalePage
            onData={handleGateInSalePage}
            masterResponse={masterResponse}
            // gridDataresponse={selectedValues}
            reloadPage={reloadKey}
          />
        </ScrollView>
      </PaperProvider>
    </>
  );
}

export default GateInSale;
