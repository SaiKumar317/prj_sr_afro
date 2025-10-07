/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {Provider as PaperProvider} from 'react-native-paper';
import ThreeDotMenu from '../menuBar/ThreeDotMenu';
import {TouchableOpacity, View, Text} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faListAlt,
  faHome,
  faSave,
  faSignOutAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';
import Dashboard from './Dashboard';
import Features from './Features';
import Account from './Account';

declare function alert(message?: any): void;
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
type TabStackProps = {
  onDataFromFeatures: (data: any) => void;
  onDataFromFirstPage: (data: any) => void;
  onDataFromAccount: (data: any) => void;
  handleLogoutAcc: () => void;
  backPageClicked: any;
};

type SecondPageData = {
  esTabledata: {item: string; quantity: string; rate: string}[];
  // Add any other properties you expect from SecondPage here
};

let masterResponse = '';
let storedHostname;
function TabStack({
  onDataFromFeatures,
  onDataFromAccount,
  handleLogoutAcc,
  backPageClicked,
}: TabStackProps) {
  return (
    <Tab.Navigator
      initialRouteName={backPageClicked ? 'Features' : 'Features'}
      screenOptions={{
        tabBarActiveTintColor: '#0d4257',
        tabBarInactiveTintColor: '#565956',

        tabBarLabelStyle: {
          textAlign: 'center',
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#cacfcb', // Change '#yourTabBackgroundColor' to the background color you desire
        },
        headerStyle: {backgroundColor: '#0d4257'},
        headerTintColor: 'white',
      }}>
      {/* <Tab.Screen
        name="Dashboard"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faHome} size={size} color={color} />
          ),
        }}>
        {() => <Dashboard />}
      </Tab.Screen> */}
      <Tab.Screen
        name="Features"
        options={{
          tabBarLabel: 'Features',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faListAlt} size={size} color={color} />
          ),
        }}>
        {() => <Features onData={onDataFromFeatures} />}
      </Tab.Screen>
      <Tab.Screen
        name="Account"
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faUser} size={size} color={color} />
          ),
        }}>
        {() => (
          <Account
            onData={onDataFromAccount}
            SessionId={undefined}
            handleLogout={handleLogoutAcc}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainTabs({
  SessionId,
  handleLogout,
  onData,
  backPageClicked,
}: {
  SessionId: any;
  handleLogout: () => void;
  onData: (data: any) => void;
  backPageClicked: any;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);
  const [dataFromFeatures, setDataFromFeatures] = useState(null);
  const [dataFromAccount, setDataFromAccount] = useState(null);
  const [dataFromFirstPage, setDataFromFirstPage] = useState(null);
  const [dataFromSecondPage, setDataFromSecondPage] =
    useState<SecondPageData | null>(null);
  //   const [SessionId, setSessionId] = useState(SessionId);
  const [isLoading, setIsLoading] = useState(false);
  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };
  useEffect(() => {
    // Your logic here to reload the page, if needed
  }, [reloadKey]);
  // const navigation = useNavigation();
  const handleDataFromFeatures = (data: React.SetStateAction<any>) => {
    setDataFromFeatures(data);
    console.log(data.Features);
    const featuresData: any = onData({Features: data.Features});
    // if (featuresData) {
    //   navigation.navigate('Features');
    // }
  };
  const handleDataFromAccount = () => {
    // setDataFromAccount(data);
    // console.log('DataFromAccount', data);
    // onData({Account: data, Features});
  };
  const handleDataFromFirstPage = (data: React.SetStateAction<null>) => {
    setDataFromFirstPage(data);
    console.log(data);
  };

  const handleDataFromSecondPage = (
    data: React.SetStateAction<SecondPageData | null>,
  ) => {
    setDataFromSecondPage(data);
    console.log(data);
  };

  const handleSaveButtonPressed = async () => {
    try {
      setIsLoading(true);
      // Here you can use dataFromFirstPage and dataFromSecondPage as needed
      // console.log('Data from FirstPage:', dataFromFirstPage);
      console.log('Data from SecondPage:', dataFromSecondPage);
      // let requestData = '';
      // let url = '';
      let masterResquest = '';
      let masterUrl = '';
      if (
        dataFromSecondPage !== null &&
        typeof dataFromSecondPage === 'object' &&
        dataFromFirstPage !== null &&
        typeof dataFromFirstPage === 'object'
      ) {
        const {docDate, docNo, narration} = dataFromFirstPage;
        const {esTabledata} = dataFromSecondPage;
        const esBody = esTabledata.map(item => {
          const gross = parseFloat(item.quantity) * parseFloat(item.rate);
          return {
            Item__Id: item.item,
            Quantity: item.quantity,
            Rate: item.rate,
            Gross: gross.toFixed(2), // Assuming you want to round to 2 decimal places
          };
        });
        console.log('esBody', esBody);
        storedHostname = await AsyncStorage.getItem('hostname');

        if (storedHostname) {
          masterUrl = `${storedHostname}/focus8api/Transactions/2048/`;
          masterResquest = JSON.stringify({
            data: [
              {
                Body: esBody,
                Header: {
                  DocNo: docNo,
                  Date: docDate,
                  sNarration: narration,
                },
              },
            ],
          });
        }
        const itemMaster = await fetchDataFromApi(masterUrl, masterResquest);
        console.log('itemMasterResponse', itemMaster.result);
        if (itemMaster.result === 1) {
          alert('Posted Successfully');
          masterResponse = itemMaster.data[0].VoucherNo;
          setDataFromSecondPage(null);
          setDataFromFirstPage(null);
          setIsLoading(false);
          reloadPage();
          return;
        }
        setIsLoading(false);
        return;
      } else {
        console.error('Invalid dataFromFirstPage:', dataFromFirstPage);
        let postingFailedMsg = 'Please select Vaild\n';
        let postingFailedHeaderMsg = '';
        let postingFailedBodyMsg = '';
        if (
          dataFromFirstPage === null &&
          typeof dataFromFirstPage === 'object'
        ) {
          postingFailedHeaderMsg = 'Header Feilds';
        }
        if (
          dataFromSecondPage === null &&
          typeof dataFromSecondPage === 'object'
        ) {
          postingFailedBodyMsg = 'Body Feilds';
        }
        alert(
          `${postingFailedMsg}${postingFailedHeaderMsg}, ${postingFailedBodyMsg}`,
        );
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
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
      console.log('JsonData', data);

      if (data.result === 1) {
        console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data.message);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
    }
  };

  return (
    <>
      <PaperProvider>
        {isLoading && renderLoadingView()}
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              headerStyle: {backgroundColor: '#4f81ab'},
              headerTintColor: 'white',
              headerTitleStyle: {fontWeight: 'bold'},
              headerRight: () => (
                <View style={{flexDirection: 'row'}}>
                  <TouchableOpacity onPress={handleSaveButtonPressed}>
                    <View style={{alignItems: 'center', marginRight: 10}}>
                      <FontAwesomeIcon icon={faSave} size={23} color="white" />
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 10,
                          textAlign: 'center',
                        }}>
                        save
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <ThreeDotMenu
                    onSave={handleSaveButtonPressed}
                    onCancel={() => console.log('Cancel button pressed')}
                  />
                </View>
              ),
              headerLeft: () => (
                <TouchableOpacity onPress={handleLogout}>
                  <View style={{alignItems: 'center', marginRight: 10}}>
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      size={20}
                      color="white"
                    />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        textAlign: 'center',
                      }}>
                      Logout
                    </Text>
                  </View>
                </TouchableOpacity>
              ),
            }}>
            <Stack.Screen
              name="TabStack"
              options={{title: 'Excesses in Stocks'}}>
              {props => (
                <TabStack
                  {...props}
                  onDataFromFeatures={handleDataFromFeatures}
                  onDataFromFirstPage={handleDataFromFirstPage}
                  onDataFromAccount={handleDataFromAccount}
                  handleLogoutAcc={handleLogout}
                  backPageClicked={backPageClicked}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </>
  );
}

export default MainTabs;
