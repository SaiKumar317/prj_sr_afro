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
import ItemIssueTable from '../constants/ItemIssueTable2RgpOut';

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

const RGPOutPage: React.FC<GateInPurchasePageProps> = ({
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
  const [vendorNameOptions, setVendorNameOptions] = React.useState<any>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] =
    React.useState<any>(null);
  const [selectedEntryTypeName, setSelectedEntryTypeName] =
    React.useState<any>(null);
  const [selectedItems, setSelectedItems] = React.useState<any>(null);
  const [selectedVendorName, setSelectedVendorName] = React.useState<any>(null);
  const [preferenceHeaderData, setPreferenceHeaderData] =
    React.useState<any>(null);
  const [selectedDivision, setselectedDivision] = React.useState<any>(null);

  const [vendorContact, setVendorContact] = React.useState<any>(null);
  const [estimateDays, setEstimateDays] = React.useState<any>(null);
  const [estimateDate, setEstimateDate] = React.useState<any>(null);
  const [toPlace, setToPlace] = React.useState<any>(null);
  const [purpose, setPurpose] = React.useState<any>(null);
  const [vehicleNo, setVehicleNo] = React.useState<any>(null);
  const [narration, setNarration] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());
  const [gridDataresponse, setGridDataresponse] = React.useState(
    initialSelectedValues,
  );
  const [isClearTable, setIsClearTable] = React.useState(true);

  React.useEffect(() => {
    const fetchPreferenceHeaderData = async () => {
      try {
        var logedinUser = await AsyncStorage.getItem('username');
        const response: any = await apiCall('/preferenceHeaderData', {
          username: logedinUser,
        });

        console.log('preferenceHeaderDataResponse', response);
        setPreferenceHeaderData(response && response?.ErrMsg ? null : response);
        let savedPreferences =
          response && response?.ErrMsg
            ? null
            : response?.savedPreferencesData[0] ?? null;
        console.log('savedPreferences', savedPreferences);
      } catch (error) {
        console.error('Error fetching preferenceHeaderData', error);
      }
    };

    fetchPreferenceHeaderData();
  }, []);

  // React.useEffect(() => {
  //   // setDocNo('');
  //   // setNarration('');
  // }, [masterResponse]);

  React.useEffect(() => {
    fetchPreferenceHeaderData();
    async function getSessionId() {
      var storedHostname = await AsyncStorage.getItem('hostname');
      const accounttResponse = await fetchDataFromApi(
        `${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query:
                'select sName [label], iMasterId [value] from mCore_Account where iAccountType in (6,7) and iStatus <> 5 and iMasterId <>0 and bGroup = 0',
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
        setVendorNameOptions(accounttResponse?.data?.[0]?.Table);
      }
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
          // selectedEntryTypeName,
          // selectedVendorName,
          // vendorContact,
          // estimateDate,
          // estimateDays,
          // narration,
          // selectedDepartmentName,
          // vehicleNo,
          // toPlace,
          // selectedItems,
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
    setSelectedEntryTypeName(null);
    setSelectedVendorName(null);
    setVendorContact(null);
    setEmployeeName(null);
    setSelectedDepartmentName(null);
    setVehicleNo(null);
    setToPlace(null);
    setEstimateDate(null);
    setEstimateDays(null);
    setcapturedImage1(null);
    setNarration(null);
    setSelectedItems(null);
    setGridDataresponse(initialSelectedValues);
    setIsClearTable(prevState => !prevState);
    setCurrentTime(getCurrentTime());
    setClearMultiSelect(true);
    fetchPreferenceHeaderData();
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
            `${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url}=> jsonData: `,
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
      selectedEntryTypeName,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      employeeName,
      selectedDepartmentName,
      vehicleNo,
      toPlace,
      estimateDate,
      estimateDays,
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
      selectedDepartmentName,
      selectedEntryTypeName,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      vehicleNo,
      toPlace,
      narration,
      capturedImage1: data.capturedImage,
      currentTime,
      selectedItems,
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
  const handleEntryTypeChange = async (data: any) => {
    console.log('handleEntryTypeChange', data);

    setSelectedEntryTypeName(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedDepartmentName,
      selectedEntryTypeName: data,
      toPlace,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleVendorNameChange = async (data: any) => {
    console.log('handleVendorNameChange', data);

    setSelectedVendorName(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      toPlace,
      selectedVendorName: data,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleSelectedDivision = (data: any) => {
    console.log('selectedDivision', data);
    setselectedDivision(data);
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      toPlace,
      selectedVendorName,
      selectedDivision: data,
      vendorContact,
      estimateDays,
      estimateDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleVendorContactChange = async (data: any) => {
    console.log('handleVendorContactChange', data);
    const numericText = data.replace(/[^0-9]/g, '');

    setVendorContact(numericText);
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      selectedVendorName,
      selectedDivision,
      vendorContact: numericText,
      toPlace,
      estimateDays,
      estimateDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleEstimateDaysChange = async (data: any) => {
    console.log('handleEstimateDaysChange', data);
    const numericText = data.replace(/[^0-9]/g, '');

    const intText = parseInt(numericText, 10);
    console.log('intText', intText, typeof intText, !isNaN(intText));
    setEstimateDays(numericText);
    var futureDate;
    if (!isNaN(intText)) {
      const currentDate = new Date();
      futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + intText);
      setEstimateDate(futureDate.toDateString());
    } else {
      setEstimateDate(null);
    }
    onData({
      selectedCompBranch,
      employeeName,
      toPlace,
      selectedEntryTypeName,
      selectedVendorName,
      vendorContact,
      estimateDays: numericText,
      estimateDate: futureDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };
  const handleToPlaceChange = (data: any) => {
    setToPlace(data.trimStart());
    onData({
      selectedCompBranch,
      employeeName,
      selectedEntryTypeName,
      toPlace: data.trimStart(),
      selectedVendorName,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      vehicleNo,
      narration,
      capturedImage1,
      selectedItems,
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
      selectedEntryTypeName,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      selectedDepartmentName,
      vehicleNo: data.trimStart(),
      toPlace,
      narration,
      estimateDays,
      estimateDate,
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
      selectedVendorName,
      selectedDivision,
      vendorContact,
      selectedDepartmentName,
      vehicleNo,
      narration: data.trimStart(),
      toPlace,
      estimateDays,
      estimateDate,
      capturedImage1,
      currentTime,
      selectedItems,
      showDropDown,
      openDropdown,
    });
  };

  function handleBarCode(data: any): void {
    // throw new Error('Function not implemented.');
    setEmployeeName(data?.employeeResponse);
    onData({
      selectedCompBranch,
      selectedEntryTypeName,
      toPlace,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      employeeName: data?.employeeResponse,
      vehicleNo,
      narration,
      capturedImage1,
      currentTime,
      selectedItems,
      selectedDepartmentName,
      showDropDown,
      openDropdown,
    });
  }

  function handleDataFromItemIssue(data: any): void {
    console.log('handleDataFromItemIssue', data?.filteredItems);
    // throw new Error('Function not implemented.');
    setSelectedItems(data?.filteredItems);
    onData({
      selectedCompBranch,
      selectedEntryTypeName,
      toPlace,
      selectedVendorName,
      selectedDivision,
      vendorContact,
      estimateDays,
      estimateDate,
      employeeName,
      vehicleNo,
      narration,
      capturedImage1,
      currentTime,
      selectedItems: data?.filteredItems,
      selectedDepartmentName,
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
              <SelectModal
                label="Type"
                onData={(data: any) => handleEntryTypeChange(data)}
                value={selectedEntryTypeName?.label || null}
                items={entryTypeArray}
              />
              <FloatingLabelInput
                label="To Place"
                value={toPlace}
                onChangeText={handleToPlaceChange}
                kbType="default"
                // autoCapitalize="characters"
              />
              <SelectModal
                label="Vendor Name"
                onData={(data: any) => handleVendorNameChange(data)}
                value={selectedVendorName?.label || null}
                items={vendorNameOptions || productsArray}
              />
              <SelectModal
                label="Sub Division"
                onData={(data: any) => handleSelectedDivision(data)}
                value={selectedDivision?.label || null}
                items={
                  (preferenceHeaderData?.divisionData &&
                    preferenceHeaderData?.divisionData?.length > 0 &&
                    preferenceHeaderData?.divisionData) ||
                  productsArray
                }
              />
              <FloatingLabelInput
                label="Vendor Contact No"
                value={vendorContact}
                onChangeText={handleVendorContactChange}
                keyboardType="numeric"
                maxLength={10}
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Estimate Days"
                value={estimateDays}
                onChangeText={handleEstimateDaysChange}
                keyboardType="numeric"

                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Estimated Return Date"
                value={estimateDate}
                // onChangeText={handleToPlaceChange}
                keyboardType="Default"
                editable={false}
                // autoCapitalize="characters"
              />
              <View
                style={{
                  // marginBottom: barCodeValue === '' ? 30 : 30,
                  marginTop: barCodeValue === '' ? 25 : 25,
                }}>
                <BarcodeScan
                  label="Responsible Person"
                  onData={(data: any) => handleBarCode(data)}
                  reloadKey={reloadPage}
                />
              </View>
              <FloatingLabelInput
                label="Employee Name"
                value={employeeName?.employeeName}
                // onChangeText={handleEmployeeNameChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />
              {/* <SelectModal
                label="Department Name"
                onData={(data: any) => handleDepartmentNameChange(data)}
                value={selectedDepartmentName?.label || null}
                items={departmentNameOptions || productsArray}
              /> */}
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

              {/* <FloatingLabelInput
                label="Purpose"
                value={purpose}
                onChangeText={handlePurposeChange}
                kbType="default"
                // autoCapitalize="characters"
              /> */}

              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />

              {/* <FloatingLabelInput
                label="Out Time"
                value={currentTime}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                editable={false}
                autoCapitalize="characters"
              /> */}
            </View>
          </TouchableWithoutFeedback>
          <View style={{flex: 1}}>
            <ItemIssueTable
              onData={handleDataFromItemIssue}
              gridDataresponse={gridDataresponse}
              clearTable={isClearTable}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default RGPOutPage;
