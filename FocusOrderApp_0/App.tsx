/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import LoginScreen from './screens/LoginScreen';
import {Alert, Text, View} from 'react-native';
import renderLoadingView from './constants/LoadingView';
import MainTabs from './screens/MainTabs';
import {BackHandler} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

declare function alert(message?: any): void;

let storedHostname;
function App() {
  const [isSessionValid, setSessionValid] = useState(false); // Renamed from `isSessionValied` to `isSessionValid`
  const [SessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [dataFromMainTabs, setonDataFromMainTabs] = useState({
    Features: '',
  });
  const [backPage, setBackPage] = useState(false);
  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  useEffect(() => {
    // Fetch data from AsyncStorage when component mounts
    retrieveData();
  }, []); // Empty dependency array to run the effect only once

  useEffect(() => {
    const getLoggedInUser = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      console.log('isSessionValid', isSessionValid);
      if (isSessionValid) {
        // showToast(`Successfully Logged in as ${storedUsername}`);
      } else {
        if (storedUsername) {
          // showToast(`${storedUsername} User Logged Out`);
        } else {
          // showToast('User Logged Out');
        }
      }
    };
    getLoggedInUser();
  }, [isSessionValid]);
  const clearSessionData = async () => {
    try {
      // Display alert to confirm clearing session data
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
            // Clear session data if confirmed
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('password');
            await AsyncStorage.removeItem('POSSalePreferenceData');
            storedHostname = await AsyncStorage.getItem('hostname');
            await fetchDataFromApi(`${storedHostname}/focus8API/Logout`, '');
            // await AsyncStorage.removeItem('focusSessoin');

            // await AsyncStorage.removeItem('hostname');
            // await AsyncStorage.removeItem('companyCode');
            setSessionValid(false);
            setSessionId(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  const clearData = async () => {
    try {
      // Clear data from AsyncStorage
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      // await AsyncStorage.removeItem('hostname');
      // await AsyncStorage.removeItem('companyCode');
      // Reset component state
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const retrieveData = async () => {
    try {
      setIsLoading(true);
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');
      storedHostname = await AsyncStorage.getItem('hostname');
      const storedCompanyCode = await AsyncStorage.getItem('companyCode');
      // const storedCompanyId = await AsyncStorage.getItem('companyId');
      // const storedCompanyName = await AsyncStorage.getItem('companyName');

      if (
        storedUsername !== null &&
        storedPassword !== null &&
        storedHostname !== null &&
        storedCompanyCode !== null
      ) {
        console.log(
          storedHostname,
          storedUsername,
          storedPassword,
          storedCompanyCode,
        );
        const url = `${storedHostname}/focus8API/Login`;
        const raw = {
          data: [
            {
              Password: `${storedPassword}`,
              UserName: `${storedUsername}`,
              CompanyCode: `${storedCompanyCode}`,
            },
          ],
        };

        setSessionValid(true);
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error retrieving data:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
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
  const onDataFromLoginPage = (data: any): any => {
    console.log('onDataFromLoginPage', data);
    setSessionValid(data.isSessionValid || false);
    setSessionId(data.SessionId || null);
    return isLoading;
  };
  const onDataFromMainTabs = (data: any): any => {
    console.log(data);
    setonDataFromMainTabs(data);
    console.log('onDataFromMainTabs', data);
    if (data && data.Features && data.Features !== '') {
      setBackPage(false);
    }
    return backPage;
  };

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  const handleLogout = async () => {
    try {
      // Clear session data
      await clearSessionData();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  console.log('dataFromMainTabs', dataFromMainTabs);
  return (
    <>
      <>{isLoading && renderLoadingView()}</>
      {!isSessionValid ? (
        <LoginScreen onData={onDataFromLoginPage} />
      ) : (
        <>
          {isSessionValid && (
            <NavigationContainer>
              <MainTabs
                onData={onDataFromMainTabs}
                SessionId={SessionId}
                handleLogout={handleLogout}
                // backPageClicked={backPage}
                backPageClicked={dataFromMainTabs}
              />
            </NavigationContainer>
          )}
          {toastVisible && (
            <View
              style={{
                position: 'absolute',
                top: 50,
                width: '100%',
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}>
                <Text style={{color: 'white'}}>{toastMessage}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </>
  );
}

export default App;
