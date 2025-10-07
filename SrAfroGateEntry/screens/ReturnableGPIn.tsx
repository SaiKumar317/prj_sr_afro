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
// import GateInPurchasePage from '../pages/GateInPurchasePage';

import RGPInPage from '../pages/RGPInPage';

declare function alert(message?: any): void;

let masterResponse = '';
let storedHostname: string | null;

function ReturnableGPIn({
  SessionId,
  handleBackPage,
}: {
  SessionId: any;
  handleBackPage: () => void;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);
  const [gateInPurchasePage, setGateInPurchasePage] = useState<any>({
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

  const handleGateInPurchasePage = (data: React.SetStateAction<any>) => {
    setGateInPurchasePage(data);
    setIsLoading(data?.isLoading);
    console.log('setRGPInPage', data);
    if (data?.isbackPressed === true) {
      handleBackPage();
    }
  };

  const handleSaveButtonPressed = async () => {
    try {
      setIsLoading(true);
      console.log('Data from RGPInPage:', gateInPurchasePage);
      let gateEntryInRequest = '';
      let gateEntryInUrl = '';
      console.log(
        'object',
        gateInPurchasePage &&
          gateInPurchasePage !== null &&
          typeof gateInPurchasePage === 'object' &&
          gateInPurchasePage?.purchaseMrnNo &&
          gateInPurchasePage?.selectedGateIn &&
          gateInPurchasePage?.selectedVehicle &&
          gateInPurchasePage?.capturedImage1 &&
          gateInPurchasePage?.gridDataresponse?.length > 0,
      );
      const {
        selectedCompBranch,
        selectedEntryTypeName,
        personName,
        selectedRgpOut,
        employeeName,
        vehicleNo,
        narration,
        capturedImage1,
        currentTime,
        selectedItems,
      } = gateInPurchasePage;
      // const emptyQuantityCount = selectedItems.filter(
      //   (item: {Quantity: any}) => item.Quantity === '',
      // ).length;
      if (
        gateInPurchasePage &&
        gateInPurchasePage !== null &&
        typeof gateInPurchasePage === 'object' &&
        // selectedEntryTypeName &&
        personName &&
        selectedRgpOut &&
        capturedImage1 &&
        selectedItems?.length > 0
      ) {
        storedHostname = await AsyncStorage.getItem('hostname');
        // alert('Posting....');

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
            gateEntryInUrl = `${storedHostname}/focus8api/Transactions/7961/`;
            const bodyData = [];
            for (let x in selectedItems) {
              bodyData.push({
                Item__Id: selectedItems?.[x]?.ItemId,
                Quantity: selectedItems?.[x]?.Quantity,
                'L-RGP - Out': selectedItems?.[x]?.iTransactionId,
              });
            }
            gateEntryInRequest = JSON.stringify({
              data: [
                {
                  Body: bodyData,
                  Header: {
                    Date: dateToInt(new Date()),
                    // Company__Id: selectedCompBranch?.companyId,
                    Segment__Id: selectedCompBranch?.companyId,
                    'Sub Division__Id': selectedRgpOut?.iTag3001,
                    // Division__Id: selectedRgpOut?.iTag3001,
                    // Branch__Id: selectedCompBranch?.branchId,
                    Location__Id: selectedCompBranch?.branchId,
                    'Division Master__Id': selectedCompBranch?.iMasterId,
                    InTime: getIntDate?.data[0]?.Table[0]?.Time,
                    VendorName__Id: selectedItems?.[0]?.VendorNameId,
                    Employee__Code: personName?.value,
                    VehicleNo: vehicleNo || '',
                    EntryType: selectedEntryTypeName?.value,
                    sNarration: narration || '',
                    Image1: {
                      FileName: `rgp_in${dateToInt(new Date())}_${
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
            Alert.alert(
              'Success',
              `Posted Successfully\nVoucherNo:${itemMaster?.data?.[0]?.VoucherNo}`,
              [
                {
                  text: 'Ok',
                  style: 'cancel',
                },
              ],
            );
            // alert(
            //   `Posted Successfully\nVoucherNo:${itemMaster?.data[0]?.VoucherNo} `,
            // );
            masterResponse = itemMaster.data[0].VoucherNo;
            setGateInPurchasePage(null);
            setIsLoading(false);
            reloadPage();
            return;
          } else {
            setIsLoading(false);
          }
        } else {
          // alert('Please enter Invoice Qty for selected Pending Voucher No.');
          setIsLoading(false);
        }

        setIsLoading(false);
        return;
      } else {
        console.error('Invalid RGPInPage:', gateInPurchasePage);
        const postingFailedMsg = [];
        // if (!selectedEntryTypeName) {
        //   postingFailedMsg.push('Type');
        // }
        if (!selectedRgpOut) {
          postingFailedMsg.push('RGP Out No');
        }
        if (!personName) {
          postingFailedMsg.push('Person Name');
        }
        if (!capturedImage1) {
          postingFailedMsg.push('Image');
        }

        if (postingFailedMsg.length === 0) {
          setIsLoading(false);
          if (selectedItems?.length <= 0 || selectedItems === null) {
            alert('Please select atlest one Item');
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
  //   console.log('gateInPurchasePage', gateInPurchasePage);
  //   const onLoadAlert = [];
  //   if (
  //     !gateInPurchasePage?.selectedBranch ||
  //     gateInPurchasePage?.selectedBranch.length === 0
  //   ) {
  //     onLoadAlert.push('Branch');
  //   }
  //   if (!gateInPurchasePage?.vehicleNo || gateInPurchasePage?.vehicleNo === '') {
  //     onLoadAlert.push('Vehicle No.');
  //   }
  //   if (!gateInPurchasePage?.selectedVoucher) {
  //     onLoadAlert.push('Voucher Name');
  //   }
  //   if (
  //     !gateInPurchasePage?.selectedPendingVochNo ||
  //     gateInPurchasePage?.selectedPendingVochNo.length === 0
  //   ) {
  //     onLoadAlert.push('Pending Voucher No.');
  //   }
  //   if (!gateInPurchasePage?.capturedImage1) {
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
            RGP IN
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
          <RGPInPage
            onData={handleGateInPurchasePage}
            masterResponse={masterResponse}
            // gridDataresponse={selectedValues}
            reloadPage={reloadKey}
          />
        </ScrollView>
      </PaperProvider>
    </>
  );
}

export default ReturnableGPIn;
