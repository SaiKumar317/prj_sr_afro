/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useRef} from 'react';
import LoginScreen from './screens/LoginScreen';
import {Alert, Text, View} from 'react-native';
import renderLoadingView from './constants/LoadingView';
import MainTabs from './screens/MainTabs';
import ItemMaster from './screens/ItemMaster';
import GateInPurchase from './screens/GateInPurchase';
import GateInSale from './screens/GateInSale';
import GateOutPurchase from './screens/GateOutPurchase';
import GateOutSale from './screens/GateOutSale';
import ReturnableGPOut from './screens/ReturnableGPOut';
import ReturnableGPIn from './screens/ReturnableGPIn';
import StaffOut from './screens/StaffOut';
import StaffIn from './screens/StaffIn';
import VisitorsOut from './screens/VisitorsOut';
import VisitorsIn from './screens/VisitorsIn';
import Preferences from './screens/Preferences';
import {BackHandler} from 'react-native';

// import Orientation from 'react-native-orientation-locker';

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
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      retrieveData();
    }
  }, []);
  useEffect(() => {
    const getLoggedInUser = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      console.log('isSessionValid', isSessionValid);
      if (isSessionValid) {
        showToast(`Successfully Logged in as ${storedUsername}`);
      } else {
        if (storedUsername) {
          showToast(`${storedUsername} User Logged Out`);
        } else {
          showToast('User Logged Out');
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
            storedHostname = await AsyncStorage.getItem('hostname');
            await fetchDataFromApiLogout(
              `${storedHostname}/focus8API/Logout`,
              '',
            );
            // Clear session data if confirmed
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('password');
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
      const storedFocusSession = await AsyncStorage.getItem('focusSession');
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
          'retrieveData',
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
        await fetchDataFromApiLogout(`${storedHostname}/focus8API/Logout`, '');
        const fSessionId = await fetchDataFromApi(url, raw);
        console.log(fSessionId);
        if (fSessionId !== undefined) {
          // if (storedFocusSession !== null) {
          setSessionValid(true);
          // setSessionId(fSessionId.data[0].fSessionId);
          setSessionId(fSessionId.data[0].fSessionId);
          await AsyncStorage.setItem(
            'focusSession',
            fSessionId.data[0].fSessionId,
          );
        } else {
          clearData();
          setIsLoading(false);
        }
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
        setIsLoading(false);
        // onDataFromLoginPage;
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.result === 1) {
        console.log('JsonDataApp.js', data);
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

  const fetchDataFromApiLogout = async (url: any, requestData: any) => {
    try {
      const storedFocusSessoin = await AsyncStorage.getItem('focusSession');
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
        console.log('JsonDatalogout', data);
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

  const handleBackPage = () => {
    // clearSessionData();
    setonDataFromMainTabs({Features: ''});
    setBackPage(true);
    // Additional logout logic, such as navigating to the login screen
  };
  useEffect(() => {
    const backAction = () => {
      handleBackPage();
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

      // Notify all components of logout by resetting session-related state variables
      // setSessionValid(false);
      // setSessionId(null);
      // setonDataFromMainTabs({Features: ''}); // Reset any data associated with logged-in users

      // Additional logout logic, such as navigating to the login screen
      // If you're using navigation, you might navigate back to the login screen here
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLoad = () => {
    const fetchcall = async () => {
      const gridDataresponse: any = await apiCall('/gridData', []);

      const loadData = onData({});
      console.log('gridDataresponse', gridDataresponse);
      setSelectedValues(
        gridDataresponse && gridDataresponse?.ErrMsg
          ? initialSelectedValues
          : gridDataresponse,
      );
    };
    fetchcall();
  };

  return (
    <>
      <>{isLoading && renderLoadingView()}</>
      {!isSessionValid ? (
        <LoginScreen onData={onDataFromLoginPage} />
      ) : (
        <>
          {isSessionValid && dataFromMainTabs.Features === 'GateInPurchase' && (
            <GateInPurchase
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'GateInSale' && (
            <GateInSale SessionId={SessionId} handleBackPage={handleBackPage} />
          )}
          {isSessionValid &&
            dataFromMainTabs.Features === 'GateOutPurchase' && (
              <GateOutPurchase
                SessionId={SessionId}
                handleBackPage={handleBackPage}
              />
            )}
          {isSessionValid && dataFromMainTabs.Features === 'GateOutSale' && (
            <GateOutSale
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'RGPOut' && (
            <ReturnableGPOut
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'RGPIn' && (
            <ReturnableGPIn
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'StaffOut' && (
            <StaffOut SessionId={SessionId} handleBackPage={handleBackPage} />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'StaffIn' && (
            <StaffIn SessionId={SessionId} handleBackPage={handleBackPage} />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'VisitorsOut' && (
            <VisitorsOut
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'VisitorsIn' && (
            <VisitorsIn SessionId={SessionId} handleBackPage={handleBackPage} />
          )}
          {isSessionValid && dataFromMainTabs.Features === 'Preferences' && (
            <Preferences
              SessionId={SessionId}
              handleBackPage={handleBackPage}
            />
          )}
          {isSessionValid && dataFromMainTabs.Features === '' && (
            <MainTabs
              onData={onDataFromMainTabs}
              SessionId={SessionId}
              handleLogout={handleLogout}
              backPageClicked={backPage}
            />
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
