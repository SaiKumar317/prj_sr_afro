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

// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
// let isSessionValid: any;
let SessionId: any;
type LoginPageProps = {
  onData: (data: any) => any;
};

const LoginScreen: React.FC<LoginPageProps> = ({onData}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hostname, setHostname] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setisSessionValid] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHostname = await AsyncStorage.getItem('hostname');
        const storedCompanyCode = await AsyncStorage.getItem('companyCode');
        console.log(storedHostname, storedCompanyCode);
        if (storedHostname && storedCompanyCode) {
          setHostname(storedHostname);
          setCompanyCode(storedCompanyCode);
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
      await AsyncStorage.setItem('companyCode', companyCode);
      onData({isSessionValid: true, SessionId: SessionId});
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const getFSessionId = async () => {
    console.log(hostname, username, password, companyCode);
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

    if (!companyCode) {
      dataArray.push('companyCode');
    }
    console.log(dataArray);
    if (dataArray.length === 0) {
      setIsLoading(true);
      const url = `http://${hostname}/focus8API/Login`;
      const raw = {
        data: [
          {
            Password: `${password}`,
            UserName: `${username}`,
            CompanyCode: `${companyCode}`,
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
        setIsLoading(false);

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
    } catch (error: any) {
      console.error('There was a problem with the fetch request:', error);
      // alert(error);
      alert(error.message);
      setIsLoading(false);
    }
  };
  const screenHeight = Dimensions.get('window').height;
  return (
    <>
      <View style={styles.container}>
        {isLoading && renderLoadingView()}
        <View style={[styles.imageContainer, {height: screenHeight * 0.3}]}>
          <Image
            source={require('../assets/images/focus.png')} // Change the path to your PNG image
            style={styles.image}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faGlobe}
            size={20}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Hostname"
            autoCapitalize="none"
            value={hostname}
            onChangeText={setHostname}
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faUser}
            size={20}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faKey}
            size={20}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputContainer}>
          <FontAwesomeIcon
            icon={faBuilding}
            size={20}
            color="black"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Code"
            autoCapitalize="none"
            value={companyCode}
            onChangeText={setCompanyCode}
            editable={!isLoading}
          />
        </View>
        <TouchableOpacity
          onPress={getFSessionId}
          style={styles.button}
          disabled={isLoading}>
          <Text style={styles.buttonText}>Login</Text>
          <FontAwesomeIcon icon={faSignInAlt} size={20} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#42a5f5',
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
    fontSize: 16,
    marginRight: 5,
    // Add any additional styles or override default styles here
  },
  image: {
    // width: 200, // Adjust width as needed
    // height: 200, // Adjust height as needed
    marginTop: 10,
    marginBottom: 10,
  },
  imageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default LoginScreen;
