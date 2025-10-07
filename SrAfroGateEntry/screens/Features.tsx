/* eslint-disable react-native/no-inline-styles */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ScrollView,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faClock,
  faWeight,
  faEgg,
  faTrash,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const purchase_in = require('../assets/images/purchase_in.png');
const purchase_out = require('../assets/images/purchase_out.png');
const gate_in_inward = require('../assets/images/gate_in_inward.png');
const sale_in = require('../assets/images/sale_in.png');
const sale_out = require('../assets/images/sale_out.png');
const rgp_in = require('../assets/images/rgp_in.png');
const rgp_out = require('../assets/images/rgp_out.png');
const staff_in = require('../assets/images/staff_in.png');
const staff_out = require('../assets/images/staff_out.png');
const visitors_in = require('../assets/images/visitors_in.png');
const visitors_out = require('../assets/images/visitors_out.png');
const gate_in_outward = require('../assets/images/gate_in_outward.png');
const gate_out_outward = require('../assets/images/gate_out_outward.png');

declare function alert(message?: any): void;
let storedHostname;
type FeaturesProps = {
  onData: (data: any) => void;
};
const screenHeight = Dimensions.get('window').height;
const Features: React.FC<FeaturesProps> = ({onData}) => {
  const [gateInVisible, setGateInVisible] = useState(false);
  const [gateOutVisible, setGateOutVisible] = useState(false);
  const [rGatePassVisible, setRGatePassVisible] = useState(false);
  const [staffMovement, setStaffMovement] = useState(false);
  const [visitorMovement, setVisitorMovement] = useState(false);

  const [isSessionValid, setSessionValid] = useState(false); // Renamed from `isSessionValied` to `isSessionValid`
  const [SessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showItemMaster, setShowItemMaster] = useState(false); // State to control the visibility of ItemMaster screen

  const handleGateInPurchase = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'GateInPurchase',
    });
  };
  const handleGateOutPurchase = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'GateOutPurchase',
    });
  };
  const handleGateInSale = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'GateInSale',
    });
  };
  const handleGateOutSale = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'GateOutSale',
    });
  };
  const handleRGPOut = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'RGPOut',
    });
  };
  const handleRGPIn = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'RGPIn',
    });
  };
  const handleStaffOut = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'StaffOut',
    });
  };
  const handleStaffIn = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'StaffIn',
    });
  };
  const handleVisitorsOut = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'VisitorsOut',
    });
  };
  const handleVisitorsIn = async () => {
    console.log('Daily Entries pressed'); // Add this log statement
    setShowItemMaster(true); // Show the ItemMaster screen when Daily Entries is pressed
    onData({
      Features: 'VisitorsIn',
    });
  };

  const closeItemMaster = () => {
    setShowItemMaster(false); // Function to close the ItemMaster screen
  };

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

  const handleExit = () => {
    // Show an Alert dialog for confirmation
    if (Platform.OS === 'android') {
      BackHandler.exitApp(); // Exit the app on Android
    } else {
      Linking.openURL('app-settings:'); // Open app settings on iOS
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const clearSessionData = async () => {
    try {
      // Display alert to confirm clearing session data
      Alert.alert('Confirm', 'Are you sure you want to logout?', [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
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

  const fetchDataFromApiLogout = async (url: any, requestData: any) => {
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
        console.log('JsonDatalogoutFeatures', data);
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
  const retrieveData = async () => {
    try {
      setIsLoading(true);
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');
      storedHostname = await AsyncStorage.getItem('hostname');
      const storedCompanyCode = await AsyncStorage.getItem('companyCode');
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
        // await fetchDataFromApiLogout(`${storedHostname}/focus8API/Logout`, '');
        // const fSessionId = await fetchDataFromApi(url, raw);
        // console.log(fSessionId);
        // if (fSessionId !== undefined) {
        if (storedFocusSession !== null) {
          setSessionValid(true);
          // setSessionId(fSessionId.data[0].fSessionId);
        } else {
          clearData();
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error retrieving data:', error);
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
  const onDataFromLoginPage = (data: any): any => {
    setSessionValid(data.isSessionValid);
    setSessionId(data.SessionId);
    return isLoading;
  };

  const handleLogout = () => {
    clearSessionData();
    // Additional logout logic, such as navigating to the login screen
  };
  const navigation = useNavigation(); // Get the navigation object using useNavigation hook
  const menuItems = [
    {
      title: 'Purchase',
      icon: faClock,
      imageSource: purchase_in,
      onPress: handleGateInPurchase,
    },
    {
      title: 'Sale',
      imageSource: sale_in,
      icon: faWeight,
      onPress: handleGateInSale,
    },
  ];
  const menuItems2 = [
    {
      title: 'Purchase',
      imageSource: purchase_out,
      icon: faEgg,
      onPress: handleGateOutPurchase,
    },
    {
      title: 'Sale',
      imageSource: sale_out,
      icon: faTrash,
      onPress: handleGateOutSale,
    },
  ];
  const menuItemsRGP = [
    {
      title: 'RGP Out',
      imageSource: rgp_out,
      icon: faEgg,
      onPress: handleRGPOut,
    },
    {
      title: 'RGP In',
      imageSource: rgp_in,
      icon: faTrash,
      onPress: handleRGPIn,
    },
  ];
  const menuItemsStaffMovement = [
    {
      title: 'Out',
      imageSource: staff_out,
      icon: faEgg,
      onPress: handleStaffOut,
    },
    {
      title: 'In',
      imageSource: staff_in,
      icon: faTrash,
      onPress: handleStaffIn,
    },
  ];
  const menuItemsVisitorsMovement = [
    {
      title: 'In',
      imageSource: visitors_in,
      icon: faTrash,
      onPress: handleVisitorsIn,
    },
    {
      title: 'Out',
      imageSource: visitors_out,
      icon: faEgg,
      onPress: handleVisitorsOut,
    },
  ];
  const screenHeight = Dimensions.get('window').height;

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.item} onPress={item.onPress}>
      <View style={[styles.imageContainer]}>
        <Image
          source={item.imageSource} // Change the path to your PNG image
          style={styles.image}
        />
      </View>
      {/* <FontAwesomeIcon icon={item.icon} size={50} style={styles.icon} /> */}
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );
  const handleGateInMenu = () => {
    setGateInVisible(prevState => !prevState);
    setGateOutVisible(false);
    setRGatePassVisible(false);
    setStaffMovement(false);
    setVisitorMovement(false);
  };
  const handleGateOutMenu = () => {
    setGateInVisible(false);
    setGateOutVisible(prevState => !prevState);
    setRGatePassVisible(false);
    setStaffMovement(false);
    setVisitorMovement(false);
  };
  const handleRGatePassMenu = () => {
    setGateInVisible(false);
    setGateOutVisible(false);
    setRGatePassVisible(prevState => !prevState);
    setStaffMovement(false);
    setVisitorMovement(false);
  };
  const handleStaffMovement = () => {
    setGateInVisible(false);
    setGateOutVisible(false);
    setRGatePassVisible(false);
    setStaffMovement(prevState => !prevState);
    setVisitorMovement(false);
  };
  const handleVisitorMovement = () => {
    setGateInVisible(false);
    setGateOutVisible(false);
    setRGatePassVisible(false);
    setStaffMovement(false);
    setVisitorMovement(prevState => !prevState);
  };
  const handlePrefrerence = () => {
    setGateInVisible(false);
    setGateOutVisible(false);
    setRGatePassVisible(false);
    setStaffMovement(false);
    setVisitorMovement(false);
    onData({
      Features: 'Preferences',
    });
  };

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={handleGateInMenu}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Gate IN</Text>
            </View>
            <View style={{}}>
              <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
            </View>
          </TouchableOpacity>
          {gateInVisible && (
            <View style={styles.menuDropDown}>
              <FlatList
                data={menuItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
              />
            </View>
          )}
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={handleGateOutMenu}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Gate OUT</Text>
            </View>
            <View style={{}}>
              <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
            </View>
          </TouchableOpacity>
          {gateOutVisible && (
            <View style={styles.menuDropDown}>
              <FlatList
                data={menuItems2}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
              />
            </View>
          )}
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={handleRGatePassMenu}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Returnable Gate Pass</Text>
            </View>
            <View style={{}}>
              <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
            </View>
          </TouchableOpacity>
          {rGatePassVisible && (
            <View style={styles.menuDropDown}>
              <FlatList
                data={menuItemsRGP}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
              />
            </View>
          )}
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={handleStaffMovement}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Staff Movement</Text>
            </View>
            <View style={{}}>
              <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
            </View>
          </TouchableOpacity>
          {staffMovement && (
            <View style={styles.menuDropDown}>
              <FlatList
                data={menuItemsStaffMovement}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
              />
            </View>
          )}
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.labelContainer}
            onPress={handleVisitorMovement}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Visitor Movement</Text>
            </View>
            <View style={{}}>
              <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
            </View>
          </TouchableOpacity>
          {visitorMovement && (
            <View style={styles.menuDropDown}>
              <FlatList
                data={menuItemsVisitorsMovement}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
              />
            </View>
          )}
        </View>
        <View style={{marginBottom: 300}}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.labelContainer}
              onPress={handlePrefrerence}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Preference</Text>
              </View>
              <View style={{}}>
                <FontAwesomeIcon icon={faCaretDown} size={20} color="#757778" />
              </View>
            </TouchableOpacity>
            {/* {visitorMovement && (
          <View style={styles.menuDropDown}>
            <FlatList
              data={menuItems2}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
            />
          </View>
        )} */}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  menuDropDown: {
    backgroundColor: '#ccc',
    height: 200,
    padding: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
    // overflow: 'scroll',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    padding: 8,
    marginTop: 40,

    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // paddingRight: 10,
  },
  container: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    // height: screenHeight,
  },
  menuContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    // height: 50,
    padding: 10,
    marginTop: 10,
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: 'black',
  },
  icon: {
    marginBottom: 10,
    color: '#3a3d3b',
  },
  imageContainer: {
    // width: 50,
    // height: 50,
  },
  image: {
    // width: 200, // Adjust width as needed
    // height: 200, // Adjust height as needed
    // marginTop: 10,
    // marginBottom: 10,
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});

export default Features;
