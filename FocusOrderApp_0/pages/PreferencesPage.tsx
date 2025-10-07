/* eslint-disable react-native/no-inline-styles */
import {
  faArrowLeft,
  faCartShopping,
  faFloppyDisk,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect} from 'react';
import {TouchableOpacity, View, Image, StyleSheet, Alert} from 'react-native';
import {PaperProvider, Text} from 'react-native-paper';
import renderLoadingView from '../constants/LoadingView';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import SelectModal from '../constants/SelectModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare function alert(message?: any): void;

function PreferencesPage({
  SessionId,
  handleBackPage,
  handleLogout,
  navigation,
  route,
}: {
  SessionId: any;
  handleBackPage: (message: string) => void; // updated type
  handleLogout: () => void; // updated type
  navigation: any;
  route: any;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCompBranch, setSelectedCompBranch] = React.useState<any>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<any>(null);
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [compBranchList, setCompBranchList] = React.useState<any>([]);
  const [branchList, setBranchList] = React.useState<any>([]);
  const [pOSSalesPreferences, setPOSSalesPreferences] = React.useState<any>({});
  const [fatag, setFaTag] = React.useState<any>(null);

  useEffect(() => {
    getPreferencesData();
  }, []);

  async function getPreferencesData() {
    var storedHostname = await AsyncStorage.getItem('hostname');
    var storedUsername = await AsyncStorage.getItem('username');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);

    console.log(
      'storedUsername',
      storedUsername,
      storedUsername?.toUpperCase() !== 'SU',
    );
    const preferencesData = await fetchDataFromApi(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        data: [
          {
            Query: `select iMasterId, sName [label], sCode [value] from mCore_companybranch where iStatus<>5 and sName<>'' ${
              storedUsername?.toUpperCase() === 'SU'
                ? ''
                : `and iMasterId in 
(select um.iMasterId 
from  mSec_UserMasterRestriction um
join mSec_Users_Roles ur on um.iUserId=ur.iUserId
join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
where um.iUserId in (select iUserId from mSec_Users where sLoginName='${storedUsername}') and um.iMasterTypeId=3018) and iStatus<>1 and bGroup=0 order by sName`
            }; select iMasterId, sName [label], sCode [value] from mCore_Location where iStatus<>5 and sName<>'' ${
              storedUsername?.toUpperCase() === 'SU'
                ? ''
                : `and iMasterId in 
(select um.iMasterId 
from  mSec_UserMasterRestriction um
join mSec_Users_Roles ur on um.iUserId=ur.iUserId
join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
where um.iUserId in (select iUserId from mSec_Users where sLoginName='${storedUsername}') and um.iMasterTypeId=6) and iStatus<>1 and bGroup=0 order by sName;`
            }
            select sCaption FaTag, iMasterTypeId
from v_MasterDef
where imastertypeid in (select ivalue
from cCore_PreferenceVal_0
where ifieldid = 0 and icategory = 0);`, // updated query
          },
        ],
      },
    );
    if (
      preferencesData &&
      preferencesData?.data &&
      preferencesData?.result === 1 &&
      preferencesData?.data?.[0]?.Table &&
      preferencesData?.data?.[0]?.Table?.length > 0 &&
      preferencesData?.data?.[0]?.Table1 &&
      preferencesData?.data?.[0]?.Table1?.length > 0
    ) {
      setCompBranchList(preferencesData?.data?.[0]?.Table);
      setBranchList(preferencesData?.data?.[0]?.Table1);
      // store the fetched data in AsyncStorage
      AsyncStorage.setItem(
        'POSSalePreferenceTagData',
        JSON.stringify({
          FaTag: preferencesData?.data?.[0]?.Table2?.[0]?.FaTag,
          iMasterTypeId: preferencesData?.data?.[0]?.Table2?.[0]?.iMasterTypeId,
        }),
      );
      console.log(
        'POSSalePreferenceTagData',
        preferencesData?.data?.[0]?.Table2?.[0]?.FaTag,
        preferencesData?.data?.[0]?.Table2?.[0]?.iMasterTypeId,
      );
      setFaTag(preferencesData?.data?.[0]?.Table2?.[0]?.FaTag);
    }
    if (storedPOSSalePreferenceData) {
      // navigation.navigate('TabStack');
      // navigation.navigate('DayInStockPage');
      const today = getCurrentDateFormatted();
      const dayInDate = parsedPOSSalesPreferences?.DayInDate;
      const isDayEndPresent =
        parsedPOSSalesPreferences?.IsDayEndDatePresent === 'true';
      console.log('dayInDate, today', dayInDate, today, isDayEndPresent);
      const isDayInToday =
        parsedPOSSalesPreferences?.IsDayInDateToday === 'true';
      const is = parsedPOSSalesPreferences?.intDayInDate;
      console.log('isDayInToday', isDayInToday, is);
      console.log(
        'dayInDate on load, today',
        dayInDate,
        today,
        isDayEndPresent,
      );
      if (dayInDate === today) {
        if (isDayEndPresent) {
          alert(
            'Day In and Day End have already been entered for today. No further action is allowed.',
          );
        } else {
          navigation.navigate('TabStack');
        }
      } else {
        if (!isDayEndPresent) {
          // Navigate to DayEnd (add your logic here)
          navigation.navigate('DayEndStockPage'); // example placeholder
        } else {
          // DayEnd is present, but DayIn is not today — go to DayIn page
          if (!isDayInToday) {
            navigation.navigate('DayInStockPage');
          } else {
            // if day in and day end already done for previous days
            alert(
              'Day In and Day End have already been entered for today. No further action is allowed.',
            );
          }
        }
      }

      return;
    }
  }

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };
  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      // onData({isLoading: true});
      setIsLoading(true);
      const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');
      const response = await fetch(url, {
        method: requestData !== '' ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSessoin || '',
        },
        // body: JSON.stringify(requestData),
        // Conditionally add the body if the method is POST
        ...(requestData !== '' && {
          body: JSON.stringify(requestData), // Only include the body if method is POST
        }),
      });
      console.log('response', response);
      if (!response.ok) {
        setIsLoading(false);
        // onData({isLoading: false});
        // onDataFromLoginPage;
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.result === 1) {
        console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        // alert(data.message);
        showToast(data.message);
        setIsLoading(false);
        // onData;
        return data;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      setIsLoading(false);
      //   onData({isLoading: false});
    } finally {
      setIsLoading(false);
      //   onData({isLoading: false});
    }
  };

  const handleSelectedCompBranch = async (data: {value: any}) => {
    console.log('selectedCompBranch', data);
    if (data && data?.value) {
      setSelectedCompBranch(data);
    } else {
      setSelectedCompBranch(null);
    }
  };
  const handleSelectedBranch = async (data: {value: any}) => {
    console.log('selectedBranch', data);
    if (data && data?.value) {
      setSelectedBranch(data);
    } else {
      setSelectedBranch(null);
    }
  };

  const handleSubmit = async () => {
    // console.log('selectedCustBranch', selectedCustBranch);
    // showToast('Preferences saved successfully');
    if (selectedCompBranch && selectedBranch) {
      var storedHostname = await AsyncStorage.getItem('hostname');
      var storedUsername = await AsyncStorage.getItem('username');
      console.log(
        'storedUsername',
        storedUsername,
        storedUsername?.toUpperCase() !== 'SU',
      );
      const POSSalePreferenceData = await fetchDataFromApi(
        `${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query: `select top 1 h.sVoucherNo,d.iInvTag [warehouseId], d.iFaTag [compBranchId] , dd.CustomerAccount,
dd.SalesAccount,dd.CashAccount, dd.UPI_MPAccount,dd.MTNAccount,-- dd.ExpenseAccount,  
w.sName warhouseName
from tCore_Header_0 h 
join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_Data8002_0 dd on dd.iBodyId=d.iBodyId
join mCore_Warehouse w on w.iMasterId =d.iInvTag
where h.iVoucherType=8002 and d.iFaTag = ${selectedCompBranch?.iMasterId}
order by h.iDate desc;
select iLinkId [employeeId] from mSec_Users where sLoginName like '${storedUsername}' and  iUserType = 1 `,
            },
          ],
        },
      );
      if (
        POSSalePreferenceData &&
        POSSalePreferenceData?.data &&
        POSSalePreferenceData?.result === 1 &&
        POSSalePreferenceData?.data?.[0]?.Table &&
        POSSalePreferenceData?.data?.[0]?.Table?.length > 0 &&
        POSSalePreferenceData?.data?.[0]?.Table1 &&
        POSSalePreferenceData?.data?.[0]?.Table1?.length > 0
      ) {
        const POSSaleDateInEndData = await fetchDataFromApi(
          `${storedHostname}/focus8API/utility/executesqlquery`,
          {
            data: [
              {
                Query: `select top 1
    convert(nvarchar, dbo.IntToDate(eh.DayInDate), 105) AS DayInDate,
    convert(nvarchar, dbo.IntToDate(eh.DayEndDate), 105) AS DayEndDate,
    CASE 
        WHEN eh.DayInDate IS NOT NULL 
             AND CAST(dbo.IntToDate(eh.DayInDate) AS date) = CAST(GETDATE() AS date) THEN 'true'
        ELSE 'false' 
    END AS IsDayInDateToday,
    CASE 
        WHEN eh.DayEndDate IS NULL OR eh.DayEndDate = 0 THEN 'false' 
        ELSE 'true' 
    END AS IsDayEndDatePresent,
    h.sVoucherNo,
	h.iHeaderId,
  eh.DayInDate intDayInDate
from tCore_Header_0 h
join tCore_HeaderData8006_0 eh on eh.iHeaderId = h.iHeaderId
where h.iVoucherType = 8006
order by h.iDate desc,h.iHeaderId desc`,
              },
            ],
          },
        );
        var POSSaleDateInEndResponse = [];
        if (
          POSSaleDateInEndData &&
          POSSaleDateInEndData?.data &&
          POSSaleDateInEndData?.result === 1 &&
          POSSaleDateInEndData?.data?.[0]?.Table &&
          POSSaleDateInEndData?.data?.[0]?.Table?.length > 0
        ) {
          POSSaleDateInEndResponse =
            POSSaleDateInEndData?.data?.[0]?.Table?.[0];
        }
        AsyncStorage.setItem(
          'POSSalePreferenceData',
          JSON.stringify({
            ...POSSalePreferenceData?.data?.[0]?.Table?.[0],
            ...POSSalePreferenceData?.data?.[0]?.Table1?.[0],
            ...POSSaleDateInEndResponse,
            Branch: selectedBranch?.iMasterId,
          }),
        );
        console.log('POSSaleDateInEndResponse', {
          ...POSSalePreferenceData?.data?.[0]?.Table?.[0],
          ...POSSalePreferenceData?.data?.[0]?.Table1?.[0],
          ...POSSaleDateInEndResponse,
          Branch: selectedBranch?.iMasterId,
        });
        const today = getCurrentDateFormatted();
        const dayInDate = POSSaleDateInEndResponse?.DayInDate;
        const isDayEndPresent =
          POSSaleDateInEndResponse?.IsDayEndDatePresent === 'true';
        const isDayInToday =
          POSSaleDateInEndResponse?.IsDayInDateToday === 'true';
        const is = POSSaleDateInEndResponse?.intDayInDate;
        console.log('isDayInToday', isDayInToday, is);
        console.log(
          'dayInDate on submit, today',
          dayInDate,
          today,
          isDayEndPresent,
        );
        if (dayInDate === today) {
          if (isDayEndPresent) {
            alert(
              'Day In and Day End have already been entered for today. No further action is allowed.',
            );
          } else {
            navigation.navigate('TabStack');
          }
        } else {
          // if (!isDayEndPresent) {
          if (!isDayEndPresent) {
            // Navigate to DayEnd (add your logic here)
            navigation.navigate('DayEndStockPage'); // example placeholder
          } else {
            // DayEnd is present, but DayIn is not today — go to DayIn page
            if (!isDayInToday) {
              navigation.navigate('DayInStockPage');
            } else {
              // if day in and day end already done for previous days
              alert(
                'Day In and Day End have already been entered for today. No further action is allowed.',
              );
            }
          }
        }

        // navigation.navigate('TabStack');
      } else {
        showToast(
          `Mobile POS Sale Preference Mapping is not avilable for ${selectedCompBranch?.label} `,
        );
      }
    } else {
      showToast(`Please select ${fatag} and Branch`);
    }
  };
  function getCurrentDateFormatted() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  console.log(getCurrentDateFormatted()); // e.g., "29-09-2025"

  return (
    <>
      <PaperProvider>
        {isLoading && renderLoadingView()}
        {toastVisible && (
          <View style={styles.toastContainer}>
            <View style={styles.toast}>
              <View
                style={{
                  backgroundColor: 'white',
                  width: 33,
                  height: 33,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                <Image
                  source={require('../assets/images/focus_rt.png')}
                  style={styles.toastImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#0f6cbd',
            padding: 15,
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Confirm', 'Are you sure you want to logout?', [
                  {
                    text: 'No',
                    style: 'cancel',
                    // onPress: () => {
                    //   setSessionValid(true);
                    // },
                  },
                  {
                    text: 'Yes',
                    onPress: async () => {
                      handleLogout();
                    },
                  },
                ])
              } //onPress={() => handleBackPage('Cart')}
            >
              <View style={{alignItems: 'center', marginRight: 15}}>
                <FontAwesomeIcon icon={faSignOut} size={25} color="white" />
                <Text
                  style={{color: 'white', fontSize: 12, textAlign: 'center'}}>
                  Log Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              marginRight: 'auto',
              marginLeft: 10,
              fontWeight: 'bold',
            }}>
            Preferences
          </Text>
        </View>
        <View style={{flex: 1, padding: 15, marginTop: 20}}>
          <SelectModal
            label={fatag}
            onData={(data: any) => handleSelectedCompBranch(data)}
            value={selectedCompBranch?.label || null}
            items={compBranchList || []}
          />
          <SelectModal
            label="Branch"
            onData={(data: any) => handleSelectedBranch(data)}
            value={selectedBranch?.label || null}
            items={branchList || []}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={[styles.buttonText, {marginRight: 5}]}>Submit</Text>
          <FontAwesomeIcon icon={faFloppyDisk} size={20} color="white" />
        </TouchableOpacity>
      </PaperProvider>
    </>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0f6cbd',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastImage: {
    width: 25,
    height: 25,
    // marginRight: 10,
    marginTop: 5,
    borderRadius: 25,
  },
  toastText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default PreferencesPage;
