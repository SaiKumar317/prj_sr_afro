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
import ItemIssueTable from '../constants/ItemIssueTable2RgpIn';

type GateInPurchasePageProps = {
  onData: (data: any) => void;
  masterResponse: string;
  // gridDataresponse: any;
  reloadPage: any;
};
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let productsArray = [{label: '', value: 0}];
let entryTypeArray = [
  {label: 'Service', value: 0},
  {label: 'Repaire', value: 1},
  {label: 'Job Works', value: 2},
];
const initialSelectedValues: {
  ItemName: any;
  ItemId: any;
  Quantity: any;
  isRowSelected: boolean;
  isCheckBoxDisable: boolean;
}[] = [
  {
    ItemName: '',
    ItemId: '',
    Quantity: '1',
    isRowSelected: false,
    isCheckBoxDisable: true,
    // Add more objects if needed
  },
];
const screenHeight = Dimensions.get('window').height;

const RGPInPage: React.FC<GateInPurchasePageProps> = ({
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
  const [employeeOptions, setEmployeeOptions] = React.useState<any>(null);
  const [rgpOutPendingOptions, setRgpOutPendingOptions] =
    React.useState<any>(null);
  const [selectedEntryTypeName, setSelectedEntryTypeName] =
    React.useState<any>(null);
  const [selectedItems, setSelectedItems] = React.useState<any>(null);
  const [selectedRgpOut, setSelectedRgpOut] = React.useState<any>(null);
  const [personName, setPersonName] = React.useState<any>(null);
  const [vehicleNo, setVehicleNo] = React.useState<any>(null);
  const [narration, setNarration] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());
  const [gridDataresponse, setGridDataresponse] = React.useState(
    initialSelectedValues,
  );
  const [isClearTable, setIsClearTable] = React.useState(true);

  // React.useEffect(() => {
  //   // setDocNo('');
  //   // setNarration('');
  // }, [masterResponse]);

  async function getPendingVouchers(preferenceSelected: {
    iMasterId: any;
    label?: any;
    value?: any;
    companyId?: any;
    branchId?: any;
    divisionId?: any;
  }) {
    var storedHostname = await AsyncStorage.getItem('hostname');
    const accounttResponse = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `select distinct  h.sVoucherNo [label], h.sVoucherNo [value], td.iTag3001,  eh.VendorName [VendorNameId], a.sName [VendorName],CASE 
        WHEN eh.EntryType = 0 THEN 'Service' 
        WHEN eh.EntryType = 1 THEN 'Repaire' 
        WHEN eh.EntryType = 2 THEN 'Job Works' 
        ELSE 'Other'
    END AS EntryTypeLabel, eh.EntryType [EntryTypeValue] from tCore_Header_0 h join tCore_Data_0 d on h.iHeaderId=d.iHeaderId join tCore_HeaderData7960_0 eh on eh.iHeaderId = d.iHeaderId join mCore_Account a on a.iMasterId = eh.VendorName join tCore_Data_Tags_0 td on td.iBodyId=d.iBodyId join vCore_Links521674521_0 vref on vref.iRefId=d.iBodyId where iVoucherType = 7960 and vref.iStatus <> 2 and iFaTag = ${preferenceSelected?.iMasterId}`,
          },
        ],
      },
    );
    if (
      accounttResponse &&
      accounttResponse?.data &&
      accounttResponse?.result === 1 &&
      accounttResponse?.data?.[0]?.Table &&
      accounttResponse?.data?.[0]?.Table?.length > 0
    ) {
      setRgpOutPendingOptions(accounttResponse?.data?.[0]?.Table);
    }
  }
  React.useEffect(() => {
    fetchPreferenceHeaderData();
    getEmployee();
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
          getPendingVouchers(preferenceSelected);
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
          // selectedEntryTypeName,
          // selectedRgpOut,
          // personName,
          // vehicleNo,
          // narration,
          // capturedImage1,
          // selectedItems,
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

  const getEmployee = async () => {
    var storedHostname = await AsyncStorage.getItem('hostname');
    const employeeResponse = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query:
              'select sName [label], sCode [value] from mPay_Employee where iStatus <>5 and iMasterId > 0',
          },
        ],
      },
    );
    if (
      employeeResponse &&
      employeeResponse?.data &&
      employeeResponse?.result === 1 &&
      employeeResponse?.data?.[0]?.Table &&
      employeeResponse?.data?.[0]?.Table?.length > 0
    ) {
      setEmployeeOptions(employeeResponse?.data?.[0]?.Table);
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
    setSelectedEntryTypeName(null);
    setSelectedRgpOut(null);
    setPersonName(null);
    setVehicleNo(null);
    setNarration(null);
    setcapturedImage1(null);
    setEmployeeName(null);
    setEmployeeOptions(null);
    setSelectedItems(null);
    setGridDataresponse(initialSelectedValues);
    setIsClearTable(prevState => !prevState);
    setCurrentTime(getCurrentTime());
    setClearMultiSelect(true);
    fetchPreferenceHeaderData();
    getEmployee();
    onData({});
  }, [reloadPage]);
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

  const fetchDataFromApi = async (url: any, requestData: any) => {
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

      if (data?.result === 1) {
        // console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data?.message);
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
      selectedEntryTypeName,
      selectedRgpOut,
      employeeName,
      vehicleNo,
      personName,
      narration,
      capturedImage1,
      currentTime,
      selectedItems,
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
      selectedRgpOut,
      selectedEntryTypeName,
      vehicleNo,
      personName,
      narration,
      capturedImage1: data.capturedImage,
      currentTime,
      selectedItems,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };

  const handleEntryTypeChange = async (data: any) => {
    console.log('handleEntryTypeChange', data);

    setSelectedEntryTypeName(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedRgpOut,
      selectedEntryTypeName: data,
      personName,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleRgpOutNoChange = async (data: any) => {
    console.log('handleRgpOutNoChange', data);

    setSelectedRgpOut(data);
    setSelectedEntryTypeName({
      label: data?.EntryTypeLabel,
      value: data?.EntryTypeValue,
    });

    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName: {
        label: data?.EntryTypeLabel,
        value: data?.EntryTypeValue,
      },
      personName,
      selectedRgpOut: data,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };

  const handlePersonNameChange = (data: any) => {
    setPersonName(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      personName: data,
      selectedRgpOut,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };

  const handleVehicleNoChange = (data: any) => {
    setVehicleNo(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      selectedRgpOut,
      vehicleNo: data.trimStart(),
      personName,
      narration,
      capturedImage1,
      currentTime,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleNarrationChange = (data: any) => {
    setNarration(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      selectedRgpOut,
      vehicleNo,
      narration: data.trimStart(),
      personName,
      capturedImage1,
      currentTime,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };

  function handleBarCode(data: any): void {
    throw new Error('Function not implemented.');
  }

  function handleDataFromItemIssue(data: any): void {
    console.log('handleDataFromItemIssue', data?.filteredItems);
    // throw new Error('Function not implemented.');
    setSelectedItems(data?.filteredItems);
    onData({
      selectedCompBranch,
      selectedEntryTypeName,
      personName,
      selectedRgpOut,
      employeeName,
      vehicleNo,
      narration,
      capturedImage1,
      currentTime,
      selectedItems: data?.filteredItems,
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
              {/* <SelectModal
                label="Type"
                onData={(data: any) => handleEntryTypeChange(data)}
                value={selectedEntryTypeName?.label || null}
                items={entryTypeArray}
              /> */}

              <SelectModal
                label="RGP Out No"
                onData={(data: any) => handleRgpOutNoChange(data)}
                value={selectedRgpOut?.label || null}
                items={rgpOutPendingOptions || productsArray}
              />
              <FloatingLabelInput
                label="Type"
                value={selectedEntryTypeName?.label}
                // onChangeText={handleEmployeeNameChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />
              <FloatingLabelInput
                label="Vendor Name"
                value={selectedRgpOut?.VendorName}
                // onChangeText={handleEmployeeNameChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />
              {/* <FloatingLabelInput
                label="Person Name"
                value={personName}
                onChangeText={handlePersonNameChange}
                kbType="default"
                // autoCapitalize="characters"
              /> */}
              <SelectModal
                label="Person Name"
                onData={(data: any) => handlePersonNameChange(data)}
                value={personName?.label || null}
                items={employeeOptions || productsArray}
              />

              <FloatingLabelInput
                label="Vehicle No"
                value={vehicleNo}
                onChangeText={handleVehicleNoChange}
                kbType="default"
                autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Narration"
                value={narration}
                onChangeText={handleNarrationChange}
                kbType="default"
                maxLength={300}
                // autoCapitalize="characters"
              />

              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />
            </View>
          </TouchableWithoutFeedback>
          {
            <View style={{flex: 1}}>
              <ItemIssueTable
                onData={handleDataFromItemIssue}
                gridDataresponse={gridDataresponse}
                selectedRgpOut={selectedRgpOut}
                clearTable={isClearTable}
              />
            </View>
          }
        </View>
      </SafeAreaView>
    </>
  );
};

export default RGPInPage;
