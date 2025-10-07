/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */

import * as React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
} from 'react-native';
import FloatingLabelInput from '../constants/FloatingLabelInput';

// import TableSelectModal from '../constants/TableSelectModal';
import CameraScreen from '../screens/CameraScreen';
import SelectModal from '../constants/SelectModal';

import AsyncStorage from '@react-native-async-storage/async-storage';
import BarcodeScan from '../constants/BarcodeScanner';
import renderLoadingView from '../constants/LoadingView';
import getSession from '../constants/getSession';

type GateInPurchasePageProps = {
  onData: (data: any) => void;
  masterResponse: string;
  // gridDataresponse: any;
  reloadPage: any;
};
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let productsArray = [{label: '', value: 0}];
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
const screenHeight = Dimensions.get('window').height;

const StaffOutPage: React.FC<GateInPurchasePageProps> = ({
  onData,
  masterResponse,
  // gridDataresponse,
  reloadPage,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clearMultiSelect, setClearMultiSelect] = React.useState(false);

  // const [reloadKey, setReloadKey] = React.useState(0);

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);

  const [companyBranchOptions, setCompanyBranchOptions] =
    React.useState<any>(null);

  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);

  const getCurrentTime = () => {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [barCodeValue, setbarCodeValue] = React.useState<any>('');
  const [employeeName, setEmployeeName] = React.useState<any>(null);

  const [departmentNameOptions, setDepartmentNameOptions] =
    React.useState<any>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] =
    React.useState<any>(null);
  const [toPlace, setToPlace] = React.useState<any>(null);
  const [purpose, setPurpose] = React.useState<any>(null);
  const [vehicleNo, setVehicleNo] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());

  // React.useEffect(() => {
  //   // setDocNo('');
  //   // setNarration('');
  // }, [masterResponse]);

  React.useEffect(() => {
    fetchPreferenceHeaderData();
    async function getSessionId() {
      var storedHostname = await AsyncStorage.getItem('hostname');
      const coreDeptResponse = await fetchDataFromApiGet(
        `${storedHostname}/focus8api/list/Masters/Core__dept?fields=sName,sCode,iMasterId`,
      );
      const coreDeptOptons = coreDeptResponse?.data?.map(
        (item: {iMasterId: any; sName: any; sCode: any}) => ({
          label: item?.sName,
          value: item?.iMasterId,
          sCode: item?.sCode,
        }),
      );
      setDepartmentNameOptions(coreDeptOptons);
    }
    getSessionId();
  }, []);
  var preferenceSelected: {
    iMasterId: any;
    label: any;
    value: any;
    companyId: any;
    branchId: any;
    divisionId: any;
  } | null;

  //   React.useEffect(() => {
  const fetchPreferenceHeaderData = async () => {
    try {
      var logedinUser = await AsyncStorage.getItem('username');
      const response: any = await apiCall('/preferenceHeaderData', {
        username: logedinUser,
      });

      console.log('preferenceHeaderDataResponse', response);
      // setPreferenceHeaderData(response && response?.ErrMsg ? null : response);
      let savedPreferences =
        response && response?.ErrMsg
          ? null
          : response?.savedPreferencesData?.[0] ?? null;
      console.log('savedPreferences', savedPreferences);
      if (savedPreferences) {
        setCompanyBranchOptions(
          response && response?.ErrMsg
            ? null
            : [
                {
                  iMasterId: savedPreferences?.Company_Branch_Id,
                  label: savedPreferences?.Company_Branch_Name,
                  value: savedPreferences?.Company_Branch_Code,
                  companyId: savedPreferences?.Company_Id,
                  branchId: savedPreferences?.Branch_Id,
                  divisionId: savedPreferences?.Division_Id,
                },
              ],
        );

        setSelectedCompBranch(
          response && response?.ErrMsg
            ? null
            : {
                iMasterId: savedPreferences?.Company_Branch_Id,
                label: savedPreferences?.Company_Branch_Name,
                value: savedPreferences?.Company_Branch_Code,
                companyId: savedPreferences?.Company_Id,
                branchId: savedPreferences?.Branch_Id,
                divisionId: savedPreferences?.Division_Id,
              },
        );
        preferenceSelected =
          response && response?.ErrMsg
            ? null
            : {
                iMasterId: savedPreferences?.Company_Branch_Id,
                label: savedPreferences?.Company_Branch_Name,
                value: savedPreferences?.Company_Branch_Code,
                companyId: savedPreferences?.Company_Id,
                branchId: savedPreferences?.Branch_Id,
                divisionId: savedPreferences?.Division_Id,
              };
        if (preferenceSelected) {
          //   fetchGateInHeaderData();
        } else {
          alert('Please Update Division Master in Preference');
          onData({isbackPressed: true});
        }

        onData({
          selectedCompBranch:
            response && response?.ErrMsg
              ? null
              : {
                  iMasterId: savedPreferences?.Company_Branch_Id,
                  label: savedPreferences?.Company_Branch_Name,
                  value: savedPreferences?.Company_Branch_Code,
                  companyId: savedPreferences?.Company_Id,
                  branchId: savedPreferences?.Branch_Id,
                  divisionId: savedPreferences?.Division_Id,
                },

          // employeeName,
          // selectedDepartmentName,
          // vehicleNo,
          // toPlace,
          // purpose,
          // capturedImage1,
          // currentTime,
          showDropDown,
          openDropdown,
        });
      }
      if (savedPreferences === null) {
        alert('Please Update Division Master in Preference');
        onData({isbackPressed: true});
      }
    } catch (error) {
      console.error('Error fetching preferenceHeaderData', error);
    }
  };

  //   }, []);
  const dateToInt = (date: {
    getDate: () => number;
    getMonth: () => number;
    getFullYear: () => number;
  }) => {
    return (
      date.getDate() + (date.getMonth() + 1) * 256 + date.getFullYear() * 65536
    );
  };

  React.useEffect(() => {
    // Your logic here to reload the page, if needed
    // setIsLoading(false);

    setEmployeeName(null);
    setSelectedDepartmentName(null);
    setVehicleNo(null);
    setToPlace(null);
    setPurpose(null);
    setcapturedImage1(null);
    setCurrentTime(getCurrentTime());
    setClearMultiSelect(true);
    fetchPreferenceHeaderData();
    onData({});
  }, [reloadPage, masterResponse]);
  //   React.useEffect(() => {
  //     setSelectedPendingVochNo([]);
  //   }, [clearMultiSelect]);

  async function apiCall(url: any, sCodeArray: any) {
    // setIsLoading(true);
    onData({
      isLoading: true,
    });
    const storedHostname: any = await AsyncStorage.getItem('hostname');
    const hostnameNoProtocol = storedHostname.split(':')[0];
    const hostnameNoPort = storedHostname.split(':')[1];
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
            onData({
              isLoading: false,
            });
            // continueM();
            // Handle the error here
          } else {
            onData({
              isLoading: false,
            });
          }
        });
    } catch (error) {
      console.log(
        `Error at running: ${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url} => ${error}`,
      );
      alert('Internal Server Error');
      onData({
        isLoading: false,
      });
      // continueM();
    }
    onData({
      isLoading: false,
    });
    return apiResponse;
  }

  const fetchDataFromApiGet = async (url: any) => {
    try {
      var SessionId;
      try {
        SessionId = await getSession();
        console.log('sessionIdResponse', SessionId);
        // SessionId = sessionIdResponse?.data?.[0]?.fSessionId;
      } catch (error) {
        console.error('getSession', error);
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: SessionId || '',
        },
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

  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      purpose,
      capturedImage1,
      currentTime,
      showDropDown: true,
      openDropdown: '',
    });
  };

  const dataSet = [
    {id: '1', title: 'Alpha'},
    {id: '2', title: 'Beta'},
    {id: '3', title: 'Gamma'},
  ];

  const data = [
    {key: '1', value: 'Mobiles', disabled: true},
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '4', value: 'Computers', disabled: true},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
  ];

  const handleCapturedImage1 = (data: any) => {
    console.log('CapturedImage1', data.capturedImage);
    setcapturedImage1(data.capturedImage);
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      purpose,
      capturedImage1: data.capturedImage,
      currentTime,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };
  const handleEmployeeNameChange = (data: any) => {
    console.log('handleEmployeeNameChange', data);
    setEmployeeName(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName: data.trimStart(),
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      purpose,
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleDepartmentNameChange = async (data: any) => {
    console.log('handleDepartmentNameChange', data);

    setSelectedDepartmentName(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName: data,
      vehicleNo,
      toPlace,
      purpose,
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleToPlaceChange = (data: any) => {
    setToPlace(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      vehicleNo,
      toPlace: data.trimStart(),
      purpose,
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };

  const handlePurposeChange = (data: any) => {
    setPurpose(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      purpose: data.trimStart(),
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleVehicleNoChange = (data: any) => {
    setVehicleNo(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      vehicleNo: data.trimStart(),
      toPlace,
      purpose,
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };

  function handleBarCode(data: any): void {
    // throw new Error('Function not implemented.');
    setEmployeeName(data?.employeeResponse);
    onData({
      selectedCompBranch,
      employeeName: data?.employeeResponse,
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      purpose,
      capturedImage1,
      currentTime,
      showDropDown,
      openDropdown,
    });
  }

  return (
    <>
      {/* {isLoading && renderLoadingView()} */}
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: 'white',
            minHeight: screenHeight,
          }}>
          <TouchableWithoutFeedback onPress={handlePressOutside}>
            <View style={{marginBottom: 30}}>
              <View
                style={{
                  // marginBottom: barCodeValue === '' ? 30 : 30,
                  marginTop: barCodeValue === '' ? 35 : 35,
                }}>
                <BarcodeScan
                  label="Scan Employee QRcode"
                  onData={(data: any) => handleBarCode(data)}
                  reloadKey={reloadPage}
                />
              </View>
              <FloatingLabelInput
                label="Employee Name"
                value={employeeName?.employeeName}
                onChangeText={handleEmployeeNameChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />
              <SelectModal
                label="Department Name"
                onData={(data: any) => handleDepartmentNameChange(data)}
                value={selectedDepartmentName?.label || null}
                items={departmentNameOptions || productsArray}
              />
              <FloatingLabelInput
                label="Vehicle No"
                value={vehicleNo}
                onChangeText={handleVehicleNoChange}
                kbType="default"
                autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="To Place"
                value={toPlace}
                onChangeText={handleToPlaceChange}
                kbType="default"
                // autoCapitalize="characters"
              />

              <FloatingLabelInput
                label="Purpose"
                value={purpose}
                onChangeText={handlePurposeChange}
                kbType="default"
                // autoCapitalize="characters"
              />

              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />

              <FloatingLabelInput
                label="Out Time"
                value={currentTime}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                editable={false}
                autoCapitalize="characters"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
    </>
  );
};

export default StaffOutPage;
