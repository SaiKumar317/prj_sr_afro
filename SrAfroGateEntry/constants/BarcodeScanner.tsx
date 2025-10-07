/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextStyle,
  Animated,
  Alert,
  Image,
} from 'react-native';
import {RNCamera as Camera} from 'react-native-camera';
import {
  faBarcode,
  faBolt,
  faCircleXmark,
  faLightbulbSlash,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getSession from './getSession';
const qr_scanner = require('../assets/images/qr_scanner.png');

interface BarcodeScanProps {
  label: string;
  onData: (data: any) => void;
  reloadKey: any;
}
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let storedHostname;

const BarcodeScan: React.FC<BarcodeScanProps> = ({
  onData,
  label,
  reloadKey,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [openBarcode, setOpenBarcode] = useState(false);
  const [barCodeValue, setBarCodeValue] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const cameraRef = useRef(null);

  useEffect(() => {
    setBarCodeValue('');
    setEmployeeData(null);
  }, [reloadKey]);

  const apiCall = async (url: any, sCodeArray: any) => {
    var sessionId;
    const getSessionAndLog = async () => {
      sessionId = await getSession();
      console.log('fsessionID | apiCall', sessionId);
    };
    getSessionAndLog();
    const storedCompanyCode = await AsyncStorage.getItem('companyCode');
    storedHostname = await AsyncStorage.getItem('hostname');
    const ipAddressWithoutPort = storedHostname?.split(':') ?? [];
    const Options = {
      origin: '*',
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        fSessionId: sessionId ?? '',
      },
      body: JSON.stringify({
        sCodeArray: `${JSON.stringify(sCodeArray)}`,
        companyCode: `${storedCompanyCode}`,
      }),
    };
    var apiResponse;
    const serverUrl = `http://${ipAddressWithoutPort[0]}:7013/${url}`;
    try {
      await fetch(serverUrl, Options)
        .then(response => response.json())
        .then(jsonData => {
          console.log(`${serverUrl} => jsonData: `, jsonData);
          apiResponse = jsonData;
        });
    } catch (error) {
      console.log(`Error at running: ${serverUrl} => ${error}`);
      showToast('Internal Server Error');
      // setIsLoading(false);
      return;
    }
    // setIsLoading(false);
    return apiResponse;
  };
  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      var SessionId;
      try {
        SessionId = await getSession();
        console.log('sessionIdResponse', SessionId);
        // SessionId = sessionIdResponse?.data?.[0]?.fSessionId;
      } catch (error) {
        console.error('getSession', error);
      }
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
      console.log(`JsonData - ${url}`, data);

      if (data.result === 1) {
        // console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data.message);
        // setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      // setIsLoading(false);
    }
  };

  const onBarCodeRead = async (e: {
    type: string;
    data: React.SetStateAction<string>;
  }) => {
    // Alert.alert('Barcode value is' + e.data, 'Barcode type is' + e.type);

    // const barcodeType = e.type;
    if (e.type === 'QR_CODE') {
      console.log('isValiedbarCodeValue', e.data);
      storedHostname = await AsyncStorage.getItem('hostname');
      const employeeQuery = `select iMasterId [employeeId], sName [employeeName], sCode [employeeCode] from mPay_Employee where sCode = '${e.data}' and iStatus <> 5 and iMasterId > 0`;
      const employeeResponse = await fetchDataFromApi(
        `${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query: employeeQuery,
            },
          ],
        },
      );
      if (
        employeeResponse &&
        employeeResponse?.data &&
        employeeResponse?.result === 1 &&
        employeeResponse?.data?.[0]?.Table &&
        employeeResponse?.data?.[0]?.Table?.length > 0
      ) {
        setOpenBarcode(false);
        setBarCodeValue(e.data);
        setEmployeeData(employeeResponse?.data?.[0]?.Table?.[0]);
        onData({
          barCodeValue: e.data,
          employeeResponse: employeeResponse?.data?.[0]?.Table?.[0],
        });
      } else {
        showToast('Scan valied QR_CODE');
      }
    } else {
      showToast('Scan valied QR CODE type, i.e., "QR_CODE"');
    }
  };

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  const handleTourch = () => {
    setTorchOn(prevState => !prevState);
  };

  const handleBarCode = () => {
    setOpenBarcode(true);
  };
  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: -6,
    fontSize: 12,
    color: '#888',
    zIndex: 20,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    fontWeight: 'bold',

    marginBottom: 5,
  };

  return (
    <>
      <View style={styles.labelContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <View style={{flex: 1}}>
          {barCodeValue === '' ? (
            <Text style={styles.watermark}>{label}</Text>
          ) : (
            <Text style={styles.label}>{barCodeValue}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleBarCode}>
          <View style={styles.iconContainer}>
            {/* <FontAwesomeIcon icon={faQrcode} size={40} color="black" /> */}
            <Image
              source={qr_scanner} // Change the path to your PNG image
              style={styles.image}
            />
          </View>
        </TouchableOpacity>
      </View>
      <Modal visible={openBarcode} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={{backgroundColor: '#454242'}}
            onPress={() => setOpenBarcode(false)}>
            <View
              style={[
                styles.iconContainer,
                {alignSelf: 'flex-end', padding: 5},
              ]}>
              <FontAwesomeIcon icon={faCircleXmark} size={40} color="#fff" />
            </View>
          </TouchableOpacity>
          <Camera
            style={styles.preview}
            flashMode={
              torchOn
                ? Camera.Constants.FlashMode.torch
                : Camera.Constants.FlashMode.off
            }
            onBarCodeRead={onBarCodeRead}
            ref={cameraRef}>
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>QRCODE SCANNER</Text>
            </View>
          </Camera>
          <View style={styles.bottomOverlay}>
            <TouchableOpacity onPress={handleTourch}>
              <Text style={styles.torchText}>
                {torchOn ? 'Turn off torch' : 'Turn on torch'}
                {/* {torchOn ? (
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon
                      icon={faLightbulbSlash}
                      size={40}
                      color="#757778"
                    />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faBolt} size={40} color="#757778" />
                  </View>
                )} */}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {toastVisible && (
          <View
            style={{
              position: 'absolute',
              top: 100,
              width: '100%',
              alignItems: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}>
              <Text style={{color: 'black', fontWeight: 'bold'}}>
                {toastMessage}
              </Text>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  watermark: {
    fontSize: 16,
    color: '#888',
  },
  labelContainer: {
    fontSize: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    padding: 8,
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 6,
    color: 'black',
    backgroundColor: '#daedf5',
    marginBottom: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // height: 50,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {},
  modalContainer: {
    height: 200,
    flex: 1,
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 13,
    borderRadius: 5,
    marginBottom: 80,
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomOverlay: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  torchText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    // width: 200, // Adjust width as needed
    // height: 200, // Adjust height as needed
    // marginTop: 10,
    // marginBottom: 10,
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});

export default BarcodeScan;
