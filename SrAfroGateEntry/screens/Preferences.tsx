/* eslint-disable react-native/no-inline-styles */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';

import {Provider as PaperProvider} from 'react-native-paper';

import ThreeDotMenu from '../menuBar/ThreeDotMenu';
import {
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faArrowsRotate,
  faL,
  faListCheck,
  faSave,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';
import PreferencesPage from '../pages/PreferencesPage';

declare function alert(message?: any): void;
const initialSelectedValues: {
  sVoucherNo: string;
  AccountName: string;
  Balance: any;
  Item: any;
  Unit: any;
  OrdQty: any;
  invoiceQty: string;
  isRowSelected: boolean;
  isCheckBoxDisable: boolean;
}[] = [
  {
    sVoucherNo: '',
    AccountName: '',
    Balance: '',
    Item: '',
    Unit: '',
    OrdQty: '',
    invoiceQty: '',
    isRowSelected: false,
    isCheckBoxDisable: true,
    // Add more objects if needed
  },
];

type SecondPageData = {
  esTabledata: {item: string; quantity: string; rate: string}[];
  // Add any other properties you expect from SecondPage here
};

let masterResponse = '';
let storedHostname: string | null;

function Preferences({
  SessionId,
  handleBackPage,
}: {
  SessionId: any;
  handleBackPage: () => void;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);
  const [dataFromPreferencesPage, setDataFromPreferencesPage] = useState<any>({
    showDropDown: true,
    openDropdown: '',
  });
  const [dataFromSecondPage, setDataFromSecondPage] =
    useState<SecondPageData | null>(null);
  //   const [SessionId, setSessionId] = useState(SessionId);
  const [isLoading, setIsLoading] = useState(false);
  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };
  const [selectedValues, setSelectedValues] = useState<any>(
    initialSelectedValues,
  );
  useEffect(() => {
    // Your logic here to reload the page, if needed
  }, [reloadKey]);

  async function apiCall(url: any, sCodeArray: any) {
    // setIsLoading(true);
    setIsLoading(true);
    const storedHostname: any = await AsyncStorage.getItem('hostname');
    const hostnameNoProtocol = storedHostname.split(':')[0];
    const hostnameNoPort = storedHostname.split(':')[1];
    console.log('hostnameNoPort', hostnameNoPort);
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
      await fetch(
        `${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url}`,
        Options,
      )
        .then(response => response.json())
        .then(jsonData => {
          console.log(
            `${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url} => jsonData: `,
            jsonData,
          );
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
        `Error at running: ${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url} => ${error}`,
      );
      alert('Internal Server Error');
      setIsLoading(false);
      // continueM();
    }
    setIsLoading(false);
    return apiResponse;
  }

  const handleDataFromPreferencesPage = (data: React.SetStateAction<any>) => {
    setDataFromPreferencesPage(data);
    setIsLoading(data.isLoading);
    console.log('setDataFromPreferencesPage', data);
  };

  const handleSaveButtonPressed = async () => {
    try {
      setIsLoading(true);
      // Here you can use dataFromPreferencesPage and dataFromSecondPage as needed
      // console.log('Data from FirstPage:', dataFromPreferencesPage);
      console.log('Data from SecondPage:', dataFromSecondPage);
      // let requestData = '';
      // let url = '';
      let masterResquest = '';
      let masterUrl = '';
      if (
        dataFromSecondPage !== null &&
        typeof dataFromSecondPage === 'object' &&
        dataFromPreferencesPage !== null &&
        typeof dataFromPreferencesPage === 'object'
      ) {
        const {docDate, docNo, narration} = dataFromPreferencesPage;
        const {esTabledata} = dataFromSecondPage;
        const esBody = esTabledata.map(item => {
          const gross = parseFloat(item.quantity) * parseFloat(item.rate);
          return {
            Item__Id: item.item,
            Quantity: item.quantity,
            Rate: item.rate,
            Gross: gross.toFixed(2), // Assuming you want to round to 2 decimal places
          };
        });
        console.log('esBody', esBody);
        storedHostname = await AsyncStorage.getItem('hostname');

        if (storedHostname) {
          masterUrl = `${storedHostname}/focus8api/Transactions/2048/`;
          masterResquest = JSON.stringify({
            data: [
              {
                Body: esBody,
                Header: {
                  DocNo: docNo,
                  Date: docDate,
                  sNarration: narration,
                },
              },
            ],
          });
        }
        const itemMaster = await fetchDataFromApi(masterUrl, masterResquest);
        console.log('itemMasterResponse', itemMaster.result);
        if (itemMaster.result === 1) {
          alert('Posted Successfully');
          masterResponse = itemMaster.data[0].VoucherNo;
          setDataFromSecondPage(null);
          setDataFromPreferencesPage(null);
          setIsLoading(false);
          reloadPage();
          return;
        }
        setIsLoading(false);
        return;
      } else {
        console.error(
          'Invalid dataFromPreferencesPage:',
          dataFromPreferencesPage,
        );
        let postingFailedMsg = 'Please select Vaild\n';
        let postingFailedHeaderMsg = '';
        let postingFailedBodyMsg = '';
        if (
          dataFromPreferencesPage === null &&
          typeof dataFromPreferencesPage === 'object'
        ) {
          postingFailedHeaderMsg = 'Header Feilds';
        }
        if (
          dataFromSecondPage === null &&
          typeof dataFromSecondPage === 'object'
        ) {
          postingFailedBodyMsg = 'Body Feilds';
        }
        // alert(
        //   `${postingFailedMsg}${postingFailedHeaderMsg}, ${postingFailedBodyMsg}`,
        // );
        alert('Posting Failed');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const handleLoadButtonPressed = async () => {
    console.log('dataFromPreferencesPage', dataFromPreferencesPage);
    const onLoadAlert = [];
    if (
      !dataFromPreferencesPage?.selectedBranch ||
      dataFromPreferencesPage?.selectedBranch.length === 0
    ) {
      onLoadAlert.push('Branch');
    }
    if (
      !dataFromPreferencesPage?.vehicleNo ||
      dataFromPreferencesPage?.vehicleNo === ''
    ) {
      onLoadAlert.push('Vehicle No.');
    }
    if (!dataFromPreferencesPage?.selectedVoucher) {
      onLoadAlert.push('Voucher Name');
    }
    if (
      !dataFromPreferencesPage?.selectedPendingVochNo ||
      dataFromPreferencesPage?.selectedPendingVochNo.length === 0
    ) {
      onLoadAlert.push('Pending Voucher No.');
    }
    if (!dataFromPreferencesPage?.capturedImage1) {
      onLoadAlert.push('Image');
    }
    if (onLoadAlert.length === 0) {
      const gridDataresponse: any = await apiCall('/gridData', []);

      console.log('gridDataresponse', gridDataresponse);

      setSelectedValues(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? initialSelectedValues
          : gridDataresponse,
      );

      return;
    } else {
      alert(`Please select the following:\n${onLoadAlert.join(', ')}`);
    }
  };
  const handleRefreshButtonPressed = async () => {
    // alert('Refresh button is pressed');
    setSelectedValues(initialSelectedValues);
    reloadPage();
  };
  const handlePreferenceSave = async () => {
    console.log('PreferenceSave Clicked');
    console.log('dataFromPreferencesPage', dataFromPreferencesPage);
    const onLoadAlert = [];
    if (!dataFromPreferencesPage?.selectedCompany) {
      onLoadAlert.push('Company');
    }
    if (!dataFromPreferencesPage?.selectedBranch) {
      onLoadAlert.push('Branch');
    }
    if (!dataFromPreferencesPage?.selectedCompBranch) {
      onLoadAlert.push('Company-Branch');
    }
    // if (!dataFromPreferencesPage?.selectedDivision) {
    //   onLoadAlert.push('Division');
    // }
    if (onLoadAlert.length === 0) {
      console.log('dataFromPreferencesPage', dataFromPreferencesPage);

      const extPreferenceTableREQ = {
        username: await AsyncStorage.getItem('username'),
        CompanyId: dataFromPreferencesPage?.selectedCompany?.iMasterId,
        BranchId: dataFromPreferencesPage?.selectedBranch?.iMasterId,
        CompanyBranchId: dataFromPreferencesPage?.selectedCompBranch?.iMasterId,
        DivisionId: dataFromPreferencesPage?.selectedDivision?.iMasterId,
        CompanyName: dataFromPreferencesPage?.selectedCompany?.label,
        BranchName: dataFromPreferencesPage?.selectedBranch?.label,
        CompanyBranchName: dataFromPreferencesPage?.selectedCompBranch?.label,
        DivisionName: dataFromPreferencesPage?.selectedDivision?.label,
        CompanyCode: dataFromPreferencesPage?.selectedCompany?.value,
        BranchCode: dataFromPreferencesPage?.selectedBranch?.value,
        CompanyBranchCode: dataFromPreferencesPage?.selectedCompBranch?.value,
        DivisionCode: dataFromPreferencesPage?.selectedDivision?.value,
      };
      console.log('extPreferenceTableREQ', extPreferenceTableREQ);

      const extPreferenceTableresponse: any = await apiCall(
        '/extPreferenceTable',
        extPreferenceTableREQ,
      );

      console.log('extPreferenceTableresponse', extPreferenceTableresponse);
      if (extPreferenceTableresponse && extPreferenceTableresponse?.ErrMsg) {
        setIsLoading(false);
        alert('Internal Server Error');
      } else {
        setIsLoading(false);
        alert('Preferences Saved Successfully');
      }

      setSelectedValues(
        extPreferenceTableresponse && extPreferenceTableresponse?.ErrMsg
          ? initialSelectedValues
          : extPreferenceTableresponse,
      );

      return;
    } else {
      setIsLoading(false);
      alert(`Please select the following:\n${onLoadAlert.join(', ')}`);
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
      console.log('JsonData', data);

      if (data.result === 1) {
        console.log('JsonData', data);
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
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              marginRight: 'auto',
              padding: 10,
            }}>
            Preferences
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
            {/* <TouchableOpacity onPress={handleSaveButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 20}}>
                <FontAwesomeIcon icon={faSave} size={23} color="white" />
                <Text
                  style={{color: 'white', fontSize: 10, textAlign: 'center'}}>
                  Save
                </Text>
              </View>
            </TouchableOpacity> */}
            {/* <TouchableOpacity onPress={handleRefreshButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 10}}>
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
            </TouchableOpacity> */}
            {/* <ThreeDotMenu
              onSave={handleSaveButtonPressed}
              onCancel={() => console.log('Cancel button pressed')}
            /> */}
          </View>
        </View>
        <ScrollView
          scrollEnabled={
            dataFromPreferencesPage.openDropdown === null ? false : true
          }>
          <PreferencesPage
            onData={handleDataFromPreferencesPage}
            masterResponse={masterResponse}
            gridDataresponse={selectedValues}
            reloadPage={reloadKey}
          />
          <TouchableOpacity
            onPress={handlePreferenceSave}
            style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
            <FontAwesomeIcon icon={faSave} size={20} color="white" />
          </TouchableOpacity>
        </ScrollView>
      </PaperProvider>
    </>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  button: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    margin: 6,
    backgroundColor: '#0d4257',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Align text and icon horizontally
  },
});

export default Preferences;
