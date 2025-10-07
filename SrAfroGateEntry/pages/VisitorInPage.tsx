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
import renderLoadingView from '../constants/LoadingView';

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

const VisitorInPage: React.FC<GateInPurchasePageProps> = ({
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
  const [visitorName, setVisitorName] = React.useState<any>(null);
  const [fromPlace, setFromPlace] = React.useState<any>(null);
  const [toMeet, setToMeet] = React.useState<any>(null);
  const [purpose, setPurpose] = React.useState<any>(null);
  const [vehicleNo, setVehicleNo] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime());
  const [inDate, setinDate] = React.useState(new Date().toDateString());

  // React.useEffect(() => {
  //   // setDocNo('');
  //   // setNarration('');
  // }, [masterResponse]);

  React.useEffect(() => {
    fetchPreferenceHeaderData();
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
          : response?.savedPreferencesData[0] ?? null;
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

          // visitorName,
          // fromPlace,
          // purpose,
          // vehicleNo,
          // capturedImage1,
          // inDate,
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
    console.log('reloadPageP', reloadPage);
    onData({});
    setVisitorName(null);
    setFromPlace(null);
    setToMeet(null);
    setPurpose(null);
    setVehicleNo(null);
    setcapturedImage1(null);
    setinDate(new Date().toDateString());
    setCurrentTime(getCurrentTime());
    setClearMultiSelect(true);
    fetchPreferenceHeaderData();
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
        `Error at running: ${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url}=> ${error}`,
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

  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
    onData({
      selectedCompBranch,
      visitorName,
      fromPlace,
      purpose,
      vehicleNo,
      capturedImage1,
      inDate,
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
      visitorName,
      fromPlace,
      toMeet,
      purpose,
      vehicleNo,
      capturedImage1: data.capturedImage,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };
  const handleVisitorNameChange = (data: any) => {
    console.log('handleVisitorNameChange', data);
    setVisitorName(data.trimStart());
    onData({
      selectedCompBranch,
      visitorName: data.trimStart(),
      fromPlace,
      toMeet,
      purpose,
      vehicleNo,
      capturedImage1,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleFromPlaceChange = (data: any) => {
    setFromPlace(data.trimStart());
    onData({
      selectedCompBranch,
      visitorName,
      fromPlace: data.trimStart(),
      toMeet,
      purpose,
      vehicleNo,
      capturedImage1,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleToMeetChange = (data: any) => {
    setToMeet(data.trimStart());
    onData({
      selectedCompBranch,
      visitorName,
      fromPlace,
      toMeet: data.trimStart(),
      purpose,
      vehicleNo,
      capturedImage1,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handlePurposeChange = (data: any) => {
    setPurpose(data.trimStart());
    onData({
      selectedCompBranch,
      visitorName,
      fromPlace,
      toMeet,
      purpose: data.trimStart(),
      vehicleNo,
      capturedImage1,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };
  const handleVehicleNoChange = (data: any) => {
    setVehicleNo(data.trimStart());
    onData({
      selectedCompBranch,
      visitorName,
      fromPlace,
      toMeet,
      purpose,
      vehicleNo: data.trimStart(),
      capturedImage1,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
  };

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
              <FloatingLabelInput
                label="Visitor Name"
                value={visitorName}
                onChangeText={handleVisitorNameChange}
                kbType="default"
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="From Place"
                value={fromPlace}
                onChangeText={handleFromPlaceChange}
                kbType="To Meet"
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="To Meet"
                value={toMeet}
                onChangeText={handleToMeetChange}
                kbType="To Meet"
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Purpose of Visit"
                value={purpose}
                onChangeText={handlePurposeChange}
                kbType="default"
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Vehicle No"
                value={vehicleNo}
                onChangeText={handleVehicleNoChange}
                kbType="default"
                autoCapitalize="characters"
              />

              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />
              <FloatingLabelInput
                label="In Date"
                value={inDate}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                editable={false}
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="In Time"
                value={currentTime}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                editable={false}
                // autoCapitalize="characters"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
    </>
  );
};

export default VisitorInPage;
