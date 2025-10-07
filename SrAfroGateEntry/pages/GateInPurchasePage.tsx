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

import ItemIssueTable2 from '../constants/ItemIssueTable2';
// import TableSelectModal from '../constants/TableSelectModal';
import CameraScreen from '../screens/CameraScreen';
import SelectModal from '../constants/SelectModal';
import MultiSelectModal from '../constants/MultiSelectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import renderLoadingView from '../constants/LoadingView';
import FloatingLabelDate from '../constants/FloatingLabelDate';

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

const GateInPurchasePage: React.FC<GateInPurchasePageProps> = ({
  onData,
  masterResponse,
  // gridDataresponse,
  reloadPage,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clearMultiSelect, setClearMultiSelect] = React.useState(false);
  const [gridDataresponse, setGridDataresponse] = React.useState<any>(
    initialSelectedValues,
  );
  const [selectedGridData, setSelectedGridData] = React.useState<any>([]);
  const [gateInHeaderData, setGateInHeaderData] = React.useState<any>(null);

  const [selectedPendingVochNo, setSelectedPendingVochNo] = React.useState<any>(
    [],
  );
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  // const [reloadKey, setReloadKey] = React.useState(0);

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);

  const [postingDate, setPostingDate] = React.useState(new Date());

  const [vehicleNo, setVehicleNo] = React.useState('');

  const [companyBranchOptions, setCompanyBranchOptions] =
    React.useState<any>(null);
  const [gateInPendingV, setGateInPendingV] = React.useState<any>(null);
  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);
  // React.useEffect(() => {
  //   // setDocNo('');
  //   // setNarration('');
  // }, [masterResponse]);

  React.useEffect(() => {
    var preferenceSelected: {
      iMasterId: any;
      label: any;
      value: any;
      companyId: any;
      branchId: any;
      divisionId: any;
    } | null;
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
            fetchGateInHeaderData();
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

            showDropDown,
            openDropdown,
            // selectedVoucher,
            // selectedPendingVochNo,
            // vehicleNo,
            // capturedImage1,
            postingDate,
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

    fetchPreferenceHeaderData();

    const fetchGateInHeaderData = async () => {
      console.log('preferenceSelected', preferenceSelected);
      try {
        const response: any = await apiCall('/gateInHeaderData', {
          purchaseSalesTag: 1,
          companyBranchTag: preferenceSelected?.iMasterId,
          divisionTag: preferenceSelected?.divisionId,
        });

        console.log('gateInHeaderDataResponse', response);
        setGateInHeaderData(response && response?.ErrMsg ? null : response);
        if (
          response &&
          typeof response !== 'undefined' &&
          !('ErrMsg' in response) &&
          response?.voucherNameData?.length === 0
        ) {
          alert(`There are no Vouchers for ${preferenceSelected?.label}`);
        }
      } catch (error) {
        console.error('Error fetching gateInHeaderData', error);
      }
    };
  }, []);
  //   React.useEffect(() => {

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

    setSelectedVoucher(null);
    setSelectedPendingVochNo([]);
    setGateInPendingV(null);
    setVehicleNo('');
    setPostingDate(new Date());
    setcapturedImage1(null);
    setClearMultiSelect(prevState => !prevState);
    setGridDataresponse(initialSelectedValues);
    setSelectedGridData([]);
    onData({});
  }, [reloadPage]);
  React.useEffect(() => {
    setSelectedPendingVochNo([]);
  }, [clearMultiSelect]);

  async function apiCall(url: any, sCodeArray: any) {
    // setIsLoading(true);
    onData({
      isLoading: true,
    });
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

  const handlePostingDate = (value: any) => {
    const postingDate = value?.currentDate;
    setPostingDate(postingDate);
    onData({
      selectedCompBranch,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      postingDate: postingDate,
      capturedImage1,
      selectedGridData,
      showDropDown,
      openDropdown,
    });
  };
  const handleVehicleNoChange = (text: string) => {
    const vehicleNoText = text;
    setVehicleNo(vehicleNoText);
    onData({
      selectedCompBranch,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo: vehicleNoText,
      postingDate,
      capturedImage1,
      selectedGridData,
      showDropDown,
      openDropdown,
    });
  };

  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
    onData({
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      postingDate,
      capturedImage1,
      selectedCompBranch,
      selectedGridData,
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

  const handleDataFromItemIssue = async (data: any) => {
    console.log('dataFrom ItemIssueTable', data?.filteredSelectedValues);
    setSelectedGridData(data?.filteredSelectedValues);
    onData({
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      postingDate,
      capturedImage1,
      selectedCompBranch,
      selectedGridData: data?.filteredSelectedValues,
      showDropDown,
      openDropdown,
    });
  };
  const handleSelectedPendingVochNo = async (data: any) => {
    console.log('SelectedPendingVochNo', data);
    setSelectedPendingVochNo(data);
    // setcolourId(data.value);
    // setselectedCompany(date.label);
    const pendingVochNo = data
      ?.map((item: {label: any}) => `'${item?.label}'`)
      .join(', ');
    console.log('pendingVochNoString', pendingVochNo);
    setGridDataresponse(initialSelectedValues);
    setSelectedGridData([]);
    if (data && data?.length > 0 && pendingVochNo) {
      const gridDataresponse: any = await apiCall('/gridData', {
        pendingVochNo,
        purchaseSalesTag: 1,
        companyBranchTag: selectedCompBranch?.iMasterId,
        selectedVoucherType: selectedVoucher?.value,
        iLinkPathId: gateInPendingV?.iLinkPathIdData[0].iLinkPathId,
      });
      setGridDataresponse(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? initialSelectedValues
          : gridDataresponse,
      );
      setSelectedGridData([]);
    }
    onData({
      selectedVoucher,
      selectedPendingVochNo: data,
      vehicleNo,
      postingDate,
      capturedImage1,
      selectedCompBranch,
      selectedGridData,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };
  const handleSelectedVoucher = async (data: any) => {
    console.log('selectedVoucher', data);
    setSelectedVoucher(data);

    const gateInPendingV: any = await apiCall('/gateInPendingV', {
      purchaseSalesTag: 1,
      companyBranchTag: selectedCompBranch?.iMasterId,
      selectedVoucherType: data?.value,
    });

    console.log('gateInPendingVResponse', gateInPendingV);
    setClearMultiSelect(prevState => !prevState);
    setGridDataresponse(initialSelectedValues);
    setGateInPendingV(
      gateInPendingV && gateInPendingV?.ErrMsg ? null : gateInPendingV,
    );
    if (
      gateInPendingV &&
      typeof gateInPendingV !== 'undefined' &&
      !('ErrMsg' in gateInPendingV) &&
      gateInPendingV?.voucherNoData?.length === 0
    ) {
      alert(`There are no Pending Vouchers for ${data.label}`);
    }
    console.log('setSelectedPendingVochNo', selectedPendingVochNo);
    onData({
      selectedVoucher: data,
      selectedPendingVochNo,
      vehicleNo,
      postingDate,
      capturedImage1,
      selectedCompBranch,
      selectedGridData,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };
  const handleCapturedImage1 = (data: any) => {
    console.log('CapturedImage1', data.capturedImage);
    setcapturedImage1(data.capturedImage);
    onData({
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      postingDate,
      capturedImage1: data.capturedImage,
      selectedCompBranch,
      selectedGridData,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };

  const handleSelectedCompBranch = (data: any) => {
    console.log('selectedCompBranch', data);
    setSelectedCompBranch(data);
    onData({
      selectedCompBranch: data,
      showDropDown,
      openDropdown,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      postingDate,
      capturedImage1,
      selectedGridData,
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
                label="Division Master"
                onData={(data: any) => handleSelectedCompBranch(data)}
                value={selectedCompBranch?.label || null}
                items={companyBranchOptions || productsArray}
              />
              <SelectModal
                label="Voucher Name"
                onData={(data: any) => handleSelectedVoucher(data)}
                value={selectedVoucher?.label || null}
                items={
                  (gateInHeaderData?.voucherNameData &&
                    gateInHeaderData?.voucherNameData?.length > 0 &&
                    gateInHeaderData?.voucherNameData) ||
                  productsArray
                }
              />
              <MultiSelectModal
                label="Pending Voucher No."
                onData={(data: any) => handleSelectedPendingVochNo(data)}
                value={selectedPendingVochNo}
                items={
                  (gateInPendingV?.voucherNoData &&
                    gateInPendingV?.voucherNoData?.length > 0 &&
                    gateInPendingV?.voucherNoData) ||
                  productsArray
                }
                clearMultiSelect={clearMultiSelect}
              />
              <FloatingLabelDate
                label="Posting Date"
                value={postingDate}
                onData={data => handlePostingDate(data)}
                reloadKey={reloadPage}
              />
              <FloatingLabelInput
                label="Vehicle No."
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
              {/* <ItemIssueTable /> */}
            </View>
          </TouchableWithoutFeedback>

          {!gridDataresponse[0]?.isCheckBoxDisable && (
            <View style={{flex: 1}}>
              <ItemIssueTable2
                onData={handleDataFromItemIssue}
                gridDataresponse={gridDataresponse}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default GateInPurchasePage;
