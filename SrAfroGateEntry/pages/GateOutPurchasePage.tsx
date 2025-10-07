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

import GateOutPurchaseTable from '../constants/gateOutPurchaseTable';
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
  iTag3001: any;
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
    iTag3001: '',
    isRowSelected: false,
    isCheckBoxDisable: true,
    // Add more objects if needed
  },
];
const screenHeight = Dimensions.get('window').height;

const GateOutPurchasePage: React.FC<GateInPurchasePageProps> = ({
  onData,
  masterResponse,
  // gridDataresponse,
  reloadPage,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clearMultiSelect, setClearMultiSelect] = React.useState(false);
  const [purchaseMrnNo, setPurchaseMrnNo] = React.useState<any>(null);
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

  const [vehicleNo, setVehicleNo] = React.useState('');

  const [companyBranchOptions, setCompanyBranchOptions] =
    React.useState<any>(null);
  const [gateInPendingV, setGateInPendingV] = React.useState<any>(null);
  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);
  const [gateINVouchers, setGateINVouchers] = React.useState<any>(null);
  const [gateINVehicles, setGateINVehicles] = React.useState<any>(null);
  const [selectedGateIn, setSelectedGateIn] = React.useState<any>(null);
  const [postingDate, setPostingDate] = React.useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = React.useState<any>(null);
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
          // selectedGateIn,
          // selectedVehicle,
          // purchaseMrnNo,
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
  const fetchGateInHeaderData = async () => {
    console.log('preferenceSelected', preferenceSelected);
    try {
      const response: any = await apiCall('/gateOutHeaderData', {
        purchaseSalesTag: 1,
        companyBranchTag: preferenceSelected?.iMasterId,
        divisionTag: preferenceSelected?.divisionId,
      });

      console.log('gateInHeaderDataResponse', response);
      setGateInHeaderData(response && response?.ErrMsg ? null : response);
      const headerDataOut = response && response?.ErrMsg ? null : response;
      if (
        headerDataOut?.voucherNameData &&
        headerDataOut?.voucherNameData?.length > 0
      ) {
        const gateINVouchers = headerDataOut?.voucherNameData?.map(
          (item: {sVoucherNo: any}) => ({
            label: item?.sVoucherNo,
            value: item?.sVoucherNo,
          }),
        );
        console.log('gateINVouchers', gateINVouchers);
        setGateINVouchers(
          (gateINVouchers && gateINVouchers?.length > 0 && gateINVouchers) ||
            productsArray,
        );
        const gateINVehicles = headerDataOut?.voucherNameData?.map(
          (item: {VehicleNo: any; sVoucherNo: any}) => ({
            label: item?.VehicleNo,
            value: item?.sVoucherNo,
          }),
        );
        console.log(
          'gateINVehicles',
          gateINVehicles,
          gateINVehicles && gateINVehicles?.length > 0,
        );
        setGateINVehicles(
          (gateINVehicles && gateINVehicles?.length > 0 && gateINVehicles) ||
            productsArray,
        );
      }
      if (
        response &&
        typeof response !== 'undefined' &&
        !('ErrMsg' in response) &&
        response?.voucherNameData?.length === 0
      ) {
        alert(`There are no Vouchers for ${preferenceSelected?.label}`);
      }
    } catch (error) {
      console.error('Error fetching gateOutHeaderData', error);
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

    setSelectedGateIn(null);
    setSelectedVehicle(null);
    setPurchaseMrnNo(null);
    setcapturedImage1(null);
    setPostingDate(new Date());
    setClearMultiSelect(true);
    setGridDataresponse(initialSelectedValues);
    setSelectedGridData([]);
    fetchPreferenceHeaderData();
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
    console.log('OptionsApicall', Options);
    var apiResponse;
    try {
      await fetch(
        `${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url}`,
        Options,
      )
        .then(response => response?.json())
        .then(jsonData => {
          console.log(
            `${storedHostname}/prj_sr_afro_gate_entry/prj_sr_afro_Server${url} => jsonData: `,
            jsonData,
          );
          apiResponse = jsonData;
          if (typeof apiResponse !== 'undefined' && 'ErrMsg' in apiResponse) {
            console.log('Error:', apiResponse?.ErrMsg);
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
      selectedGateIn,
      selectedVehicle,
      purchaseMrnNo,
      postingDate,
      capturedImage1,
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
      selectedGateIn,
      selectedVehicle,
      purchaseMrnNo,
      postingDate,
      capturedImage1,
      showDropDown,
      openDropdown,
    });
  };

  const handleCapturedImage1 = (data: any) => {
    console.log('CapturedImage1', data.capturedImage);
    setcapturedImage1(data.capturedImage);
    onData({
      selectedCompBranch,
      selectedGateIn,
      selectedVehicle,
      purchaseMrnNo,
      postingDate,
      capturedImage1: data.capturedImage,
      gridDataresponse:
        !gridDataresponse[0]?.isCheckBoxDisable && gridDataresponse,
      showDropDown,
      openDropdown,
    });
    return reloadPage;
  };

  const handleSelectedGateIn = async (data: any) => {
    console.log('selectedGateIN', data);
    console.log('gateInHeaderData', gateInHeaderData);

    setSelectedGateIn(data);
    const vehicleSelect = gateInHeaderData?.voucherNameData?.filter(
      (item: {sVoucherNo: any}) => item?.sVoucherNo === data?.value,
    );
    console.log('vehicleSelect', vehicleSelect);
    setSelectedVehicle({
      label: vehicleSelect[0]?.VehicleNo,
      value: vehicleSelect[0]?.sVoucherNo,
    });
    setGridDataresponse(initialSelectedValues);
    setPurchaseMrnNo(null);
    setSelectedGridData([]);
    if (data && data?.value) {
      const gridDataresponse: any = await apiCall('/gridDataPurchaseOut', {
        voucherAbbr: 'RMMRN',
        purchaseSalesTag: 1,
        companyBranchTag: selectedCompBranch?.iMasterId,
        divisionTag: selectedCompBranch?.divisionId,
        selectedVoucher: data?.value,
        // iLinkPathId: gateInPendingV?.iLinkPathIdData?.[0]?.iLinkPathId,
      });
      setGridDataresponse(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? initialSelectedValues
          : gridDataresponse?.gridDataArray,
      );
      setPurchaseMrnNo(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? null
          : gridDataresponse?.mrnNo,
      );
      setSelectedGridData([]);
      onData({
        selectedCompBranch,
        selectedGateIn: data,
        selectedVehicle: {
          label: vehicleSelect[0]?.VehicleNo,
          value: vehicleSelect[0]?.sVoucherNo,
        },
        capturedImage1,
        postingDate,
        purchaseMrnNo:
          gridDataresponse && gridDataresponse?.ErrMsg
            ? null
            : gridDataresponse?.mrnNo,
        gridDataresponse:
          gridDataresponse && gridDataresponse?.ErrMsg
            ? null
            : gridDataresponse?.gridDataArray,
        showDropDown,
        openDropdown,
      });
    }
  };
  const handlePostingDate = async (value: any) => {
    const postingDate = value?.currentDate;
    setPostingDate(postingDate);
    onData({
      selectedCompBranch,
      selectedGateIn,
      selectedVehicle,
      purchaseMrnNo,
      postingDate: postingDate,
      capturedImage1,
      gridDataresponse:
        !gridDataresponse[0]?.isCheckBoxDisable && gridDataresponse,
      showDropDown,
      openDropdown,
    });
  };
  const handleSelectedVehicle = async (data: any) => {
    console.log('selectedVehicle', data);

    setSelectedVehicle(data);

    console.log('gateInSelect', {
      label: data?.value,
      value: data?.value,
    });
    setSelectedGateIn({
      label: data?.value,
      value: data?.value,
    });
    setGridDataresponse(initialSelectedValues);
    setPurchaseMrnNo(null);
    setSelectedGridData([]);
    if (data && data?.value) {
      const gridDataresponse: any = await apiCall('/gridDataPurchaseOut', {
        voucherAbbr: 'RMMRN',
        purchaseSalesTag: 1,
        companyBranchTag: selectedCompBranch?.iMasterId,
        divisionTag: selectedCompBranch?.divisionId,
        selectedVoucher: data?.value,
        // iLinkPathId: gateInPendingV?.iLinkPathIdData?.[0]?.iLinkPathId,
      });
      setGridDataresponse(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? initialSelectedValues
          : gridDataresponse?.gridDataArray,
      );
      setPurchaseMrnNo(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? null
          : gridDataresponse?.mrnNo,
      );
      setSelectedGridData([]);
    }
    onData({
      selectedCompBranch,
      selectedGateIn: {
        label: data?.value,
        value: data?.value,
      },
      selectedVehicle: data,
      capturedImage1,
      postingDate,
      purchaseMrnNo:
        gridDataresponse && gridDataresponse?.ErrMsg
          ? null
          : gridDataresponse?.mrnNo,
      gridDataresponse:
        gridDataresponse && gridDataresponse?.ErrMsg
          ? null
          : gridDataresponse?.gridDataArray,
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
                label="Gate Entry In No"
                onData={(data: any) => handleSelectedGateIn(data)}
                value={selectedGateIn?.label || null}
                items={gateINVouchers || productsArray}
              />
              <FloatingLabelDate
                label="Posting Date"
                value={postingDate}
                onData={data => handlePostingDate(data)}
                reloadKey={reloadPage}
              />
              <SelectModal
                label="Vehicle No"
                onData={(data: any) => handleSelectedVehicle(data)}
                value={selectedVehicle?.label || null}
                items={gateINVehicles || productsArray}
              />
              <FloatingLabelInput
                label="MRN No"
                value={purchaseMrnNo}
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
            </View>
          </TouchableWithoutFeedback>

          {!gridDataresponse?.[0]?.isCheckBoxDisable && (
            <View style={{flex: 1}}>
              <GateOutPurchaseTable
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

export default GateOutPurchasePage;
