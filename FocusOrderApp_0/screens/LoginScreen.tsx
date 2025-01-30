/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TextStyle,
  ScrollView,
  BackHandler,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  faUser,
  faKey,
  faGlobe,
  faBuilding,
  faSignInAlt,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import renderLoadingView from '../constants/LoadingView';
import SelectModal from '../constants/SelectModal';
import FloatingLabelInput from '../constants/FloatingLabelInput';

// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
// let isSessionValid: any;
let SessionId: any;
type LoginPageProps = {
  onData: (data: any) => any;
};

let productsArray = [{label: '', value: 0}];

const LoginScreen: React.FC<LoginPageProps> = ({onData}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hostname, setHostname] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [fCompanyList, setFCompanyList] = useState<any>(productsArray);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSessionValid, setisSessionValid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHostname = await AsyncStorage.getItem('hostname');
        const storedCompanyCode = await AsyncStorage.getItem('companyCode');
        const storedCompanyId = await AsyncStorage.getItem('companyId');
        const storedCompanyName = await AsyncStorage.getItem('companyName');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');

        console.log(storedHostname, storedCompanyCode);
        if (storedHostname && storedCompanyCode) {
          setHostname(storedHostname);
          // setCompanyCode(storedCompanyCode);
          setSelectedCompany({
            label: storedCompanyName,
            value: storedCompanyCode,
            companyId: storedCompanyId,
          });
          if (!storedUsername && !storedPassword) {
            handleCompanyList();
          }
        }
        if (
          storedUsername !== null &&
          storedPassword !== null &&
          storedHostname !== null &&
          storedCompanyCode !== null
        ) {
          setIsLoading(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
    const appDAta = onData({
      isSessionValid: isSessionValid,
      SessionId: SessionId,
    });
    console.log('appDAta->LoginPage', appDAta);
    setIsLoading(appDAta);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const handleSessionId = async () => {
    try {
      // Storing data in AsyncStorage
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('hostname', hostname);
      await AsyncStorage.setItem('companyCode', selectedCompany.value);
      await AsyncStorage.setItem('companyId', selectedCompany.companyId);
      await AsyncStorage.setItem('companyName', selectedCompany.label);
      onData({isSessionValid: true, SessionId: SessionId});
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const getFSessionId = async () => {
    console.log(hostname, username, password, selectedCompany?.value);
    const dataArray = [];

    if (!hostname) {
      dataArray.push('hostname');
    }

    if (!username) {
      dataArray.push('username');
    }

    if (!password) {
      dataArray.push('password');
    }

    if (selectedCompany === null) {
      dataArray.push('Company');
    }
    console.log(dataArray);
    if (dataArray.length === 0) {
      setIsLoading(true);
      const url = `${hostname}/focus8API/Login`;
      const raw = {
        data: [
          {
            Password: `${password}`,
            UserName: `${username}`,
            CompanyCode: `${selectedCompany?.value}`,
          },
        ],
      };
      const fSessionId = await fetchDataFromApi(url, raw);

      console.log('isfSessionId undefined', fSessionId === undefined);
      if (
        fSessionId !== null &&
        fSessionId !== undefined &&
        fSessionId.data &&
        fSessionId.data[0] &&
        fSessionId.data[0].fSessionId
      ) {
        setisSessionValid(true);
        SessionId = fSessionId.data[0].fSessionId;
        await AsyncStorage.setItem(
          'focusSessoin',
          fSessionId.data[0].fSessionId,
        );
        await handleSessionId();
        setIsLoading(false);
        return;
      } else {
        setIsLoading(false);
      }
    } else {
      alert(`Please provide login credentials:\n${dataArray.join(', ')}`);
    }
  };
  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      console.log('response', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data?.result === 1) {
        console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data?.message);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      setIsLoading(false);
    }
  };
  const fetchCompanyDataFromApi = async (url: any, timeout = 15000) => {
    const controller = new AbortController();
    const {signal} = controller;

    const fetchWithTimeout = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Request timed out'));
      }, timeout);

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          signal,
        },
      })
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    try {
      setIsLoading(true);

      const response: any = await fetchWithTimeout;

      if (!response.ok) {
        setIsLoading(false);
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.result === 1) {
        console.log('JsonData', data);
        setIsLoading(false);
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

  const screenHeight = Dimensions.get('window').height;
  const handleSelectedCompany = (data: any) => {
    console.log('selectedCompany', data);
    if (data && data?.value) {
      setSelectedCompany(data);
    } else {
      setSelectedCompany(null);
    }
  };

  const handleCompanyList = async () => {
    // Logic for when TextInput loses focus
    const storedHostname = await AsyncStorage.getItem('hostname');
    console.log(
      'handleCompanyListLogout',
      `${storedHostname}/focus8API/List/Company`,
    );

    const companyDetails = await fetchCompanyDataFromApi(
      `${storedHostname}/focus8API/List/Company`,
    );
    console.log('companyDetails', companyDetails);
    if (storedHostname && storedHostname.trim() !== '') {
      if (companyDetails?.data && companyDetails?.result === 1) {
        const companyList = companyDetails?.data?.map(
          (item: {CompanyName: any; CompanyCode: any; CompanyId: any}) => ({
            label: `${item?.CompanyName} [${item?.CompanyCode}]`,
            value: `${item?.CompanyCode}`,
            companyId: `${item?.CompanyId}`,
          }),
        );
        setFCompanyList(companyList);
      } else {
        setFCompanyList(productsArray);
        setSelectedCompany(null);
      }
    } else {
      setFCompanyList(productsArray);
      setSelectedCompany(null);
    }
    // You can add additional logic here
  };
  const handleFocus = () => setIsFocused(true);
  const handleBlur = async () => {
    setIsFocused(false);
    // Logic for when TextInput loses focus
    console.log('Input lost focus', `${hostname}/focus8API/List/Company`);
    if (hostname && hostname.trim() !== '') {
      const companyDetails = await fetchCompanyDataFromApi(
        `${hostname}/focus8API/List/Company`,
      );
      console.log('companyDetails', companyDetails);
      if (companyDetails?.data && companyDetails?.result === 1) {
        const companyList = companyDetails?.data?.map(
          (item: {CompanyName: any; CompanyCode: any; CompanyId: any}) => ({
            label: `${item?.CompanyName} [${item?.CompanyCode}]`,
            value: `${item?.CompanyCode}`,
            companyId: `${item?.CompanyId}`,
          }),
        );
        setFCompanyList(companyList);
      } else {
        setFCompanyList(productsArray);
        setSelectedCompany(null);
      }
    } else {
      setFCompanyList(productsArray);
      setSelectedCompany(null);
    }
    // You can add additional logic here
  };

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

    return () => {
      console.log('Component unmounted, removing back handler');
      if (backHandler) {
        backHandler.remove();
      }
    };
  }, []);

  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: 14,
    fontSize: 12,
    color: isFocused ? '#0f6cbd' : 'black',
    zIndex: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 4,
    fontWeight: 'bold',
    borderWidth: isFocused ? 0.3 : 0.3,
    borderColor: isFocused ? '#0f6cbd' : 'black',
  };
  return (
    <>
      <ScrollView>
        <View style={[styles.container, {height: screenHeight * 1}]}>
          {isLoading && renderLoadingView()}
          <View style={[styles.imageContainer, {height: screenHeight * 0.23}]}>
            <Image
              source={require('../assets/images/focus.png')} // Change the path to your PNG image
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <View style={{marginTop: 100}}>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faGlobe}
                size={20}
                color="black"
                style={styles.icon}
              />
              <View style={{flex: 1}}>
                <View style={{paddingTop: 18}}>
                  <Animated.Text style={labelStyle}>{'Hostname'}</Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderWidth: isFocused ? 1 : 0.4,
                        borderColor: isFocused ? '#0f6cbd' : 'black',
                      },
                    ]}
                    placeholder="Hostname"
                    placeholderTextColor={'#7d7a7a'}
                    autoCapitalize="none"
                    value={hostname}
                    onChangeText={setHostname}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faUser}
                size={20}
                color="black"
                style={styles.icon}
              />
              {/* <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={'#7d7a7a'}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
            /> */}
              <View style={{flex: 1}}>
                <FloatingLabelInput
                  label="Username"
                  value={username}
                  onChangeText={text => setUsername(text.replace(/^\s+/, ''))}
                  kbType="default"
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faKey}
                size={20}
                color="black"
                style={styles.icon}
              />
              {/* <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={'#7d7a7a'}
              autoCapitalize="none"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            /> */}
              <View style={{flex: 1}}>
                <FloatingLabelInput
                  label="Password"
                  value={password}
                  onChangeText={text => setPassword(text.trim())}
                  kbType="default"
                  editable={!isLoading}
                  autoCapitalize="none"
                  secureTextEntry={true}
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <FontAwesomeIcon
                icon={faBuilding}
                size={20}
                color="black"
                style={styles.icon}
              />
              <View style={{flex: 1}}>
                <SelectModal
                  label="Company"
                  onData={(data: any) => handleSelectedCompany(data)}
                  value={selectedCompany?.label || null}
                  items={
                    (fCompanyList &&
                      fCompanyList?.length > 0 &&
                      fCompanyList) ||
                    productsArray
                  }
                />
              </View>
              {/* <TextInput
              style={styles.input}
              placeholder="Company Code"
              placeholderTextColor={'#7d7a7a'}
              autoCapitalize="none"
              value={companyCode}
              onChangeText={setCompanyCode}
              editable={!isLoading}
            /> */}
            </View>
          </View>
          <TouchableOpacity
            onPress={getFSessionId}
            style={styles.button}
            disabled={isLoading}>
            <Text style={styles.buttonText}>Login</Text>
            <FontAwesomeIcon icon={faSignInAlt} size={20} color="white" />
          </TouchableOpacity>
          <View
            style={[styles.focusimageContainer, {height: screenHeight * 0.1}]}>
            <Text style={{fontSize: 10, color: '#a19aa0'}}>
              Powered by Focus Softnet Pvt Ltd
            </Text>
            <View style={{alignItems: 'center', marginTop: 5}}>
              <Image
                source={require('../assets/images/focus_rt.png')} // Change the path to your PNG image
                style={styles.focusimage}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f5f7',
  },
  // inputContainerCC: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   width: '100%',
  // },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    marginRight: 10,
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    // color: 'black',
    // flex: 1,
    // height: 40,
    // borderColor: 'gray',
    // borderWidth: 1,
    // borderRadius: 8,
    // marginBottom: 20,
    // paddingHorizontal: 10,
    borderRadius: 8,

    // borderBottomWidth: 1,
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    // borderRightWidth: 1,
    // borderColor: '#ccc',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
    // marginTop: 6, // Adjust the top margin as needed
    color: 'black',
    backgroundColor: '#daedf5',
    marginBottom: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 50,
    borderWidth: 0.4,
    borderColor: 'black',
  },
  button: {
    backgroundColor: '#0f6cbd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // Align text and icon horizontally
    // Add any additional styles or override default styles here
  },
  disabledButton: {
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    marginRight: 5,
    fontWeight: 'bold',
    // Add any additional styles or override default styles here
  },
  image: {
    width: 320, // Adjust width as needed
    height: 200, // Adjust height as needed
    marginTop: 40,
    marginBottom: 5,
    borderRadius: 15,
  },
  focusimage: {
    width: 35, // Adjust width as needed
    height: 35, // Adjust height as needed
    // marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  focusimageContainer: {
    marginTop: 40,
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoginScreen;
