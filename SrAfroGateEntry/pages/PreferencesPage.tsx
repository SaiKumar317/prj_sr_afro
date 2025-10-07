/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */

import * as React from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import {ValueType} from 'react-native-dropdown-picker';
import SelectModal from '../constants/SelectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import renderLoadingView from '../constants/LoadingView';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSave, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import FloatingLabelInput from '../constants/FloatingLabelInput';

type PreferencesPageProps = {
  onData: (data: any) => void;
  masterResponse: string;
  gridDataresponse: any;
  reloadPage: any;
};
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let productsArray = [{label: '', value: 0}];

const screenHeight = Dimensions.get('window').height;

const PreferencesPage: React.FC<PreferencesPageProps> = ({
  onData,
  masterResponse,
  gridDataresponse,
  reloadPage,
}) => {
  const [preferenceHeaderData, setPreferenceHeaderData] =
    React.useState<any>(null);
  const [companyBranchOptions, setCompanyBranchOptions] =
    React.useState<any>(null);
  // const [reloadKey, setReloadKey] = React.useState(0);

  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);
  const [docNo, setDocNo] = React.useState('');
  const [narration, setNarration] = React.useState('');
  const [docDate, setDocDate] = React.useState(new Date());
  const [selectedCompany, setselectedCompany] = React.useState<any>(null);
  const [selectedBranch, setselectedBranch] = React.useState<any>(null);
  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);
  const [CompBranch, setCompBranch] = React.useState<any>(null);
  const [selectedDivision, setselectedDivision] = React.useState<any>(null);

  React.useEffect(() => {
    setDocNo('');
    setNarration('');
    setDocDate(new Date());
  }, [masterResponse]);
  // React.useEffect(() => {}, [gridDataresponse]);
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
        if (savedPreferences) {
          setselectedCompany(
            response && response?.ErrMsg
              ? null
              : {
                  iMasterId: savedPreferences?.Company_Id,
                  label: savedPreferences?.Company_Name,
                  value: savedPreferences?.Company_Code,
                },
          );
          setselectedBranch(
            response && response?.ErrMsg
              ? null
              : {
                  iMasterId: savedPreferences?.Branch_Id,
                  label: savedPreferences?.Branch_Name,
                  value: savedPreferences?.Branch_Code,
                },
          );
          setCompanyBranchOptions(
            response && response?.ErrMsg
              ? null
              : [
                  {
                    iMasterId: savedPreferences?.Company_Branch_Id,
                    label: savedPreferences?.Company_Branch_Name,
                    value: savedPreferences?.Company_Branch_Code,
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
                },
          );
          setselectedDivision(
            response && response?.ErrMsg
              ? null
              : {
                  iMasterId: savedPreferences?.Division_Id,
                  label: savedPreferences?.Division_Name,
                  value: savedPreferences?.Division_Code,
                },
          );
          onData({
            selectedCompany:
              response && response?.ErrMsg
                ? null
                : {
                    iMasterId: savedPreferences?.Company_Id,
                    label: savedPreferences?.Company_Name,
                    value: savedPreferences?.Company_Code,
                  },
            selectedBranch:
              response && response?.ErrMsg
                ? null
                : {
                    iMasterId: savedPreferences?.Branch_Id,
                    label: savedPreferences?.Branch_Name,
                    value: savedPreferences?.Branch_Code,
                  },
            selectedCompBranch:
              response && response?.ErrMsg
                ? null
                : {
                    iMasterId: savedPreferences?.Company_Branch_Id,
                    label: savedPreferences?.Company_Branch_Name,
                    value: savedPreferences?.Company_Branch_Code,
                  },
            selectedDivision:
              response && response?.ErrMsg
                ? null
                : {
                    iMasterId: savedPreferences?.Division_Id,
                    label: savedPreferences?.Division_Name,
                    value: savedPreferences?.Division_Code,
                  },
            showDropDown,
            openDropdown,
          });
        }
      } catch (error) {
        console.error('Error fetching preferenceHeaderData', error);
      }
    };

    fetchPreferenceHeaderData();
  }, []);

  React.useEffect(() => {
    // Your logic here to reload the page, if needed
    // setIsLoading(false);
    setselectedCompany(null);
    setselectedBranch(null);
    setSelectedCompBranch(null);
    setselectedDivision(null);
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
    console.log('storedHostname', storedHostname, hostnameNoPort);
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
      selectedCompany,
      selectedBranch,
      selectedCompBranch,
      selectedDivision,
      showDropDown: true,
      openDropdown: '',
    });
  };

  //   const dataSet = [
  //     {id: '1', title: 'Alpha'},
  //     {id: '2', title: 'Beta'},
  //     {id: '3', title: 'Gamma'},
  //   ];

  const data = [
    {key: '1', value: 'Mobiles', disabled: true},
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '4', value: 'Computers', disabled: true},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
  ];

  const handleSelectedCompany = (data: any) => {
    console.log('selectedCompany', data);
    setselectedCompany(data);
    // setcolourId(data.value);
    // setselectedCompany(date.label);
    if (data?.value && selectedBranch?.value) {
      const filteredCompanyBranchData =
        preferenceHeaderData?.companyBranchData?.filter(
          (item: {branchId: any; companyId: any}) =>
            item?.companyId === data?.iMasterId &&
            item?.branchId === selectedBranch?.iMasterId,
        );
      console.log('filteredCompanyBranchData', filteredCompanyBranchData[0]);
      setCompBranch(`${selectedCompany?.value}-${data?.value}`);
      //   setPreferenceHeaderData((prevState: any) => ({
      //     ...prevState,
      //     companyBranchData: filteredCompanyBranchData,
      //   }));
      setCompanyBranchOptions(
        filteredCompanyBranchData?.length > 0
          ? filteredCompanyBranchData
          : productsArray,
      );
      setSelectedCompBranch(
        filteredCompanyBranchData?.length > 0
          ? filteredCompanyBranchData[0]
          : null,
      );
      onData({
        selectedCompany: data,
        selectedBranch,
        selectedCompBranch:
          filteredCompanyBranchData?.length > 0
            ? filteredCompanyBranchData[0]
            : null,
        selectedDivision,
        showDropDown,
        openDropdown,
      });
    } else {
      setSelectedCompBranch(null);
      onData({
        selectedCompany: data,
        selectedBranch,
        selectedCompBranch,
        selectedDivision,
        showDropDown,
        openDropdown,
      });
    }
    return reloadPage;
  };

  const handleSelectedBranch = (data: any) => {
    console.log('selectedBranch', data);
    setselectedBranch(data);
    if (selectedCompany?.value && data?.value) {
      const filteredCompanyBranchData =
        preferenceHeaderData?.companyBranchData?.filter(
          (item: {branchId: any; companyId: any}) =>
            item?.companyId === selectedCompany?.iMasterId &&
            item?.branchId === data?.iMasterId,
        );
      console.log(
        'filteredCompanyBranchData',
        filteredCompanyBranchData[0],
        filteredCompanyBranchData.length,
      );
      setCompBranch(`${selectedCompany?.value}-${data?.value}`);
      //   setPreferenceHeaderData((prevState: any) => ({
      //     ...prevState,
      //     companyBranchData: filteredCompanyBranchData,
      //   }));
      setCompanyBranchOptions(
        filteredCompanyBranchData?.length > 0
          ? filteredCompanyBranchData
          : productsArray,
      );

      //   console.log(preferenceHeaderData);
      setSelectedCompBranch(
        filteredCompanyBranchData?.length > 0
          ? filteredCompanyBranchData[0]
          : null,
      );
      onData({
        selectedCompany,
        selectedBranch: data,
        selectedCompBranch:
          filteredCompanyBranchData?.length > 0
            ? filteredCompanyBranchData[0]
            : null,
        selectedDivision,
        showDropDown,
        openDropdown,
      });
    } else {
      setSelectedCompBranch(null);

      onData({
        selectedCompany,
        selectedBranch: data,
        selectedCompBranch,
        selectedDivision,
        showDropDown,
        openDropdown,
      });
    }
  };
  const handleSelectedCompBranch = (data: any) => {
    console.log('selectedCompBranch', data);
    setSelectedCompBranch(data);
    onData({
      selectedCompany,
      selectedBranch,
      selectedCompBranch: data,
      selectedDivision,
      showDropDown,
      openDropdown,
    });
  };
  const handleSelectedDivision = (data: any) => {
    console.log('selectedDivision', data);
    setselectedDivision(data);
    onData({
      selectedCompany,
      selectedBranch,
      selectedCompBranch,
      selectedDivision: data,
      showDropDown,
      openDropdown,
    });
  };
  const handlePreferenceSave = () => {
    console.log('PreferenceSave Clicked');
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
                label="Segment"
                onData={(data: any) => handleSelectedCompany(data)}
                value={selectedCompany?.label || null}
                items={
                  (preferenceHeaderData?.companyData &&
                    preferenceHeaderData?.companyData?.length > 0 &&
                    preferenceHeaderData?.companyData) ||
                  productsArray
                }
              />
              <SelectModal
                label="Branch"
                onData={(data: any) => handleSelectedBranch(data)}
                value={selectedBranch?.label || null}
                items={
                  (preferenceHeaderData?.branchData &&
                    preferenceHeaderData?.branchData?.length > 0 &&
                    preferenceHeaderData?.branchData) ||
                  productsArray
                }
              />
              {/* <FloatingLabelInput
                label="Division Master"
                value={CompBranch}
                // onChangeText={handleVehicleNoChange}
                kbType="default"
              /> */}
              <SelectModal
                label="Division Master"
                onData={(data: any) => handleSelectedCompBranch(data)}
                value={selectedCompBranch?.label || null}
                items={companyBranchOptions || productsArray}
              />
              {/* <SelectModal
                label="Division"
                onData={(data: any) => handleSelectedDivision(data)}
                value={selectedDivision?.label || null}
                items={
                  (preferenceHeaderData?.divisionData &&
                    preferenceHeaderData?.divisionData?.length > 0 &&
                    preferenceHeaderData?.divisionData) ||
                  productsArray
                }
              /> */}
            </View>
          </TouchableWithoutFeedback>
          {/* <TouchableOpacity
            onPress={handlePreferenceSave}
            style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
            <FontAwesomeIcon icon={faSave} size={20} color="white" />
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    </>
  );
};
// const styles = StyleSheet.create({
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     marginRight: 5,
//   },
//   button: {
//     // position: 'absolute',
//     // bottom: 10,
//     left: 0,
//     right: 0,
//     margin: 6,
//     backgroundColor: '#0d4257',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//     alignItems: 'center',
//     flexDirection: 'row', // Align text and icon horizontally
//     justifyContent: 'center', // Align text and icon horizontally
//   },
// });

export default PreferencesPage;
