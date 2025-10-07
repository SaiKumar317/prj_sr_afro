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
import FloatingLabelDate from '../constants/FloatingLabelDate';
import FloatingLabelSingleSelect from '../constants/FloatingLabelSingleSelect';
import {ValueType} from 'react-native-dropdown-picker';
import LabelAndInput from '../constants/LabelAndInput';

import LabelAndDateInput from '../constants/LabelAndDate';
import LabelAndSelect from '../constants/LabelAndSelect';
import ItemIssueTable from '../constants/ItemIssueTable';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import {
  SelectList,
  MultipleSelectList,
} from 'react-native-dropdown-search-list';
import PickerSelect from '../constants/PickerSelect';
import DropdownComponent from '../constants/ElementDropDown';
import Dropdown from '../constants/DropDownSearch';
import ItemIssueTable2 from '../constants/ItemIssueTable2';
import TableSelectModal from '../constants/TableSelectModal';
import CameraScreen from '../screens/CameraScreen';
import SelectModal from '../constants/SelectModal';
import MultiSelectModal from '../constants/MultiSelectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import renderLoadingView from '../constants/LoadingView';

type FirstPageProps = {
  onData: (data: any) => void;
  masterResponse: string;
  gridDataresponse: any;
  reloadPage: any;
};
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let productsArray = [{label: '', value: 0}];

const screenHeight = Dimensions.get('window').height;

const FirstPage: React.FC<FirstPageProps> = ({
  onData,
  masterResponse,
  gridDataresponse,
  reloadPage,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [clearMultiSelect, setClearMultiSelect] = React.useState(false);

  const [gateInHeaderData, setGateInHeaderData] = React.useState<any>(null);
  const [gridData, setgridData] = React.useState<any>([]);
  const [selectedValues, setSelectedValues] = React.useState<any>(null);
  const [selectedPendingVochNo, setSelectedPendingVochNo] = React.useState<any>(
    [],
  );
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
  const [capturedImage1, setcapturedImage1] = React.useState(null);
  const [colourId, setcolourId] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);
  const [docNo, setDocNo] = React.useState('');
  const [vehicleNo, setVehicleNo] = React.useState('');
  const [narration, setNarration] = React.useState('');
  const [femaleBirdStock, setFemaleBirdStock] = React.useState('');
  const [maleBirdStock, setMaleBirdStock] = React.useState('');
  const [docDate, setDocDate] = React.useState(new Date());
  const [selectedCompany, setselectedCompany] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedBranch, setselectedBranch] = React.useState<any>([]);
  const [selectedDivision, setselectedDivision] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedBirdStage, setselectedBirdStage] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedWarehouse, setselectedWarehouse] = React.useState<
    ValueType | null | undefined
  >(null);
  const [name, setName] = React.useState('');
  React.useEffect(() => {
    setDocNo('');
    setNarration('');
    setDocDate(new Date());
  }, [masterResponse]);
  // React.useEffect(() => {}, [gridDataresponse]);
  React.useEffect(() => {
    const fetchGateInHeaderData = async () => {
      try {
        const response: any = await apiCall('/gateInHeaderData', []);

        console.log('gateInHeaderDataResponse', response);
        setGateInHeaderData(response);
      } catch (error) {
        console.error('Error fetching gateInHeaderData', error);
      }
    };

    fetchGateInHeaderData();
  }, []);
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
    setselectedBranch([]);
    setVehicleNo('');
    setSelectedVoucher(null);
    setSelectedPendingVochNo([]);
    setcapturedImage1(null);
    setClearMultiSelect(true);
    onData({});
  }, [reloadPage]);

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

  const handleVehicleNoChange = (text: string) => {
    const vehicleNoText = text;
    setVehicleNo(vehicleNoText);
    onData({
      selectedBranch,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo: vehicleNoText,
      capturedImage1,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
  };
  const handleFemaleBirdStockChange = (text: string) => {
    setFemaleBirdStock(text);
    onData({
      docNo,
      narration: text,
      docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
  };
  const handleMaleBirdStockChange = (text: string) => {
    setMaleBirdStock(text);
    onData({
      docNo,
      narration: text,
      docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
  };

  const handleDateChange = (date: Date) => {
    setDocDate(date);
  };
  const handleselectedCompany = (date: any) => {
    console.log('selectedCompany', date);
    setselectedCompany(date.value);
  };
  const handleselectedDivision = (data: any) => {
    console.log('selectedDivision', data);
    setselectedDivision(data.value);
  };
  const handleselectedBranch = (data: any) => {
    console.log('selectedBranch', data);
    setselectedBranch(data);
    onData({
      selectedBranch: data,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      capturedImage1,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
  };
  const handleselectedBirdStage = (data: any) => {
    console.log('selectedBirdStage', data);
    setselectedBirdStage(data.value);
  };
  const handleselectedWarehouse = (data: any) => {
    console.log('selectedWarehouse', data);
    setselectedWarehouse(data.value);
  };
  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
    onData({
      selectedBranch: data,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      capturedImage1,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown: true,
      openDropdown: '',
    });
  };
  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(
      openDropdown === dropdownName ? null : (dropdownName as string),
    );
    onData({
      docNo,
      narration,
      docDate,
      showDropDown: true,
      openDropdown: openDropdown,
    });
  };
  const handleNameChange = (text: React.SetStateAction<string>) =>
    setName(text);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const dataSet = [
    {id: '1', title: 'Alpha'},
    {id: '2', title: 'Beta'},
    {id: '3', title: 'Gamma'},
  ];

  const onSelectItem = (item: any) => {
    setSelectedItem(item);
  };
  const [selected, setSelected] = React.useState('');

  const data = [
    {key: '1', value: 'Mobiles', disabled: true},
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '4', value: 'Computers', disabled: true},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
  ];
  const [selectedOption, setSelectedOption] = React.useState('');

  const options = ['Option 1', 'Option 2', 'Option 3'];
  const handleOptionSelected = (option: React.SetStateAction<string>) => {
    setSelectedOption(option);
  };
  const handleDataFromItemIssue = async (data: any) => {
    // setgridData(gridDataresponse);
    console.log('dataFrom ItemIssueTable', data);
    // console.log('gridDataresponse', gridDataresponse);
    onData({});
    // onData({
    //   docNo,
    //   narration,
    //   docDate,
    //   showDropDown: true,
    //   openDropdown: data.openDropdown,
    // });
    // return gridDataresponse;
  };
  const handleSelectedPendingVochNo = (data: any) => {
    console.log('SelectedPendingVochNo', data);
    setSelectedPendingVochNo(data);
    setcolourId(data.value);
    // setselectedCompany(date.label);
    onData({
      selectedBranch,
      selectedVoucher,
      selectedPendingVochNo: data,
      vehicleNo,
      capturedImage1,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
    return reloadKey;
  };
  const handleSelectedVoucher = (data: any) => {
    console.log('selectedVoucher', data);
    setSelectedVoucher(data);
    // setcolourId(data.value);
    // setselectedCompany(date.label);
    onData({
      selectedBranch,
      selectedVoucher: data,
      selectedPendingVochNo,
      vehicleNo,
      capturedImage1,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
    return reloadKey;
  };
  const handleCapturedImage1 = (data: any) => {
    console.log('CapturedImage1', data.capturedImage);
    setcapturedImage1(data.capturedImage);
    onData({
      selectedBranch,
      selectedVoucher,
      selectedPendingVochNo,
      vehicleNo,
      capturedImage1: data.capturedImage,
      // docNo,
      // narration: text,
      // docDate: dateToInt(docDate),
      showDropDown,
      openDropdown,
    });
    return reloadKey;
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
              {/* <View style={{marginBottom: 30, flex: 1}}> */}
              <MultiSelectModal
                label="Branch"
                onData={(data: any) => handleselectedBranch(data)}
                value={selectedBranch}
                items={gateInHeaderData?.branchData || productsArray}
                clearMultiSelect={reloadPage}
              />
              {/* </View> */}
              <FloatingLabelInput
                label="Vehicle No."
                value={vehicleNo}
                onChangeText={handleVehicleNoChange}
                kbType="default"
              />

              <SelectModal
                label="Voucher Name"
                onData={(data: any) => handleSelectedVoucher(data)}
                value={selectedVoucher?.label || null}
                items={gateInHeaderData?.voucherNameData || productsArray}
              />
              <MultiSelectModal
                label="Pending Voucher No."
                onData={(data: any) => handleSelectedPendingVochNo(data)}
                value={selectedPendingVochNo}
                items={gateInHeaderData?.voucherNoData || productsArray}
                clearMultiSelect={reloadPage}
              />
              <CameraScreen
                label="Upload Image"
                onData={(data: any) => handleCapturedImage1(data)}
                reloadKey={reloadPage}
              />
              {/* <ItemIssueTable /> */}
            </View>
          </TouchableWithoutFeedback>
          {/* <View style={{flex: 1}}>
          <ItemIssueTable onData={handleDataFromItemIssue} />
        </View> */}
          <View style={{flex: 1}}>
            <ItemIssueTable2
              onData={handleDataFromItemIssue}
              gridDataresponse={gridDataresponse}
            />
          </View>
          {/* <ItemIssueTable /> */}
        </View>
      </SafeAreaView>
    </>
  );
};

export default FirstPage;
