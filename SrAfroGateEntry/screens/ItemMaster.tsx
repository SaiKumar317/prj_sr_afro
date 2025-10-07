/* eslint-disable react-native/no-inline-styles */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Provider as PaperProvider} from 'react-native-paper';
import FirstPage from '../pages/FirstPage';
import SecondPage from '../pages/SecondPage';
import ThreeDotMenu from '../menuBar/ThreeDotMenu';
import {TouchableOpacity, View, Text, ScrollView} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowLeft, faSave} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';

declare function alert(message?: any): void;
const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();
type TabStackProps = {
  onDataFromFirstPage: (data: any) => void;
  onDataFromSecondPage: (data: any) => void;
};

type SecondPageData = {
  esTabledata: {item: string; quantity: string; rate: string}[];
  // Add any other properties you expect from SecondPage here
};

let masterResponse = '';
let storedHostname;
function TabStack({onDataFromFirstPage, onDataFromSecondPage}: TabStackProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#27873a',
        },
        tabBarLabelStyle: {
          textAlign: 'center',
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIndicatorStyle: {
          borderBottomColor: '#07182b',
          borderBottomWidth: 2,
        },
      }}>
      <Tab.Screen name="Header" options={{tabBarLabel: 'Header'}}>
        {() => (
          <FirstPage
            onData={onDataFromFirstPage}
            masterResponse={masterResponse}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Item Issue" options={{tabBarLabel: 'Item Issue'}}>
        {() => (
          <SecondPage
            onData={onDataFromSecondPage}
            masterResponse={masterResponse}
          />
        )}
      </Tab.Screen>
      {/* <Tab.Screen name="Settings" options={{tabBarLabel: 'Settings'}}>
        {() => <SettingsScreen />}
      </Tab.Screen> */}
    </Tab.Navigator>
  );
}

function ItemMaster({
  SessionId,
  handleBackPage,
}: {
  SessionId: any;
  handleBackPage: () => void;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);
  const [dataFromFirstPage, setDataFromFirstPage] = useState({
    showDropDown: true,
    openDropdown: '',
  });
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

  const handleDataFromFirstPage = (data: React.SetStateAction<null>) => {
    setDataFromFirstPage(data);
    console.log('setDataFromFirstPage', data);
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
        // alert(
        //   `${postingFailedMsg}${postingFailedHeaderMsg}, ${postingFailedBodyMsg}`,
        // );
        alert('Posting Failed');
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
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#228f2a',
            padding: 5,
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={handleBackPage}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize: 18, marginRight: 'auto'}}>
            Daily Entries
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={handleSaveButtonPressed}>
              <View style={{alignItems: 'center', marginRight: 10}}>
                <FontAwesomeIcon icon={faSave} size={23} color="black" />
                <Text
                  style={{color: 'black', fontSize: 10, textAlign: 'center'}}>
                  save
                </Text>
              </View>
            </TouchableOpacity>
            <ThreeDotMenu
              onSave={handleSaveButtonPressed}
              onCancel={() => console.log('Cancel button pressed')}
            />
          </View>
        </View>
        <ScrollView
          scrollEnabled={
            dataFromFirstPage.openDropdown === null ? false : true
          }>
          <FirstPage
            onData={handleDataFromFirstPage}
            masterResponse={masterResponse}
          />
        </ScrollView>
      </PaperProvider>
    </>
  );
}

export default ItemMaster;
