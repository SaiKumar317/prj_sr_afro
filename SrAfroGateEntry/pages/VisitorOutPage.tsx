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

const VisitorOutPage: React.FC<GateInPurchasePageProps> = ({
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
  const [visitorNameOptions, setVisitorNameOptions] = React.useState<any>(null);
  const [selectedVisitorName, setSelectedVisitorName] =
    React.useState<any>(null);
  // const [visitorName, setVisitorName] = React.useState<any>(null);
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
            Query: `select 
distinct eh.VisitorName [label], eh.VisitorName [value], h.sVoucherNo,cb.sName, eh.VisitorName, eh.FromPlace, eh.ToMeet, eh.PurposeofVisit, eh.VehicleNo
from tCore_Header_0 h 
join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_HeaderData7987_0 eh on eh.iHeaderId = d.iHeaderId
join vCore_Links523444020_0 vref on vref.iRefId=d.iBodyId
join mCore_companybranch cb on cb.iMasterId = d.iFaTag
where iVoucherType = 7987 and vref.iStatus <> 2 and iFaTag =${preferenceSelected?.iMasterId}
order by eh.VisitorName`,
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
      setVisitorNameOptions(accounttResponse?.data?.[0]?.Table);
    }
  }

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
          // fetchvisitorPending();
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
  const fetchvisitorPending = async () => {
    console.log('preferenceSelected', preferenceSelected);
    try {
      const response: any = await apiCall('/visitorPending', {
        companyBranchTag: preferenceSelected?.iMasterId,
      });

      console.log('visitorPendingResponse', response);
      setVisitorNameOptions(response && response?.ErrMsg ? null : response);
      if (
        response &&
        typeof response !== 'undefined' &&
        !('ErrMsg' in response) &&
        response?.voucherNameData?.length === 0
      ) {
        alert(`There are no Vouchers for ${preferenceSelected?.label}`);
      }
    } catch (error) {
      console.error('Error fetching visitorPending', error);
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

    // setVisitorName(null);
    setSelectedVisitorName(null);
    setFromPlace(null);
    setToMeet(null);
    setPurpose(null);
    setVehicleNo(null);
    setcapturedImage1(null);
    setinDate(new Date().toDateString());
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

  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
    onData({
      selectedCompBranch,
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
    console.log('CapturedImage1', data?.capturedImage);
    setcapturedImage1(data?.capturedImage);
    onData({
      selectedCompBranch,
      selectedVisitorName,
      fromPlace,
      toMeet,
      purpose,
      vehicleNo,
      capturedImage1: data?.capturedImage,
      inDate,
      currentTime,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };
  const handleVisitorNameChange = (data: any) => {
    setSelectedVisitorName(data);
    setFromPlace(data?.FromPlace);
    setToMeet(data?.ToMeet);
    setPurpose(data?.PurposeofVisit);
    setVehicleNo(data?.VehicleNo);
    console.log('handleVisitorNameChange', data);
    onData({
      selectedCompBranch,
      selectedVisitorName: data,
      fromPlace: data?.FromPlace,
      toMeet: data?.ToMeet,
      purpose: data?.PurposeofVisit,
      vehicleNo: data?.VehicleNo,
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
              <SelectModal
                label="Visitor Name"
                onData={(data: any) => handleVisitorNameChange(data)}
                value={selectedVisitorName?.label || null}
                items={visitorNameOptions || productsArray}
              />

              <FloatingLabelInput
                label="From Place"
                value={fromPlace}
                // onChangeText={handleFromPlaceChange}
                kbType="To Meet"
                // autoCapitalize="characters"
                editable={false}
              />
              <FloatingLabelInput
                label="To Meet"
                value={toMeet}
                // onChangeText={handleToMeetChange}
                kbType="To Meet"
                // autoCapitalize="characters"
                editable={false}
              />
              <FloatingLabelInput
                label="Purpose of Visit"
                value={purpose}
                // onChangeText={handlePurposeChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />
              <FloatingLabelInput
                label="Vehicle No"
                value={vehicleNo}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                // autoCapitalize="characters"
                editable={false}
              />

              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />
              <FloatingLabelInput
                label="Out Date"
                value={inDate}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
                editable={false}
                // autoCapitalize="characters"
              />
              <FloatingLabelInput
                label="Out Time"
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

export default VisitorOutPage;
