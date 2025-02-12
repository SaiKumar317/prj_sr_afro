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
  BackHandler,
  TextInput,
} from 'react-native';
import {RNCamera as Camera} from 'react-native-camera';
import {
  faB,
  faBarcode,
  faBolt,
  faCircleXmark,
  faLightbulbSlash,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getSession from './getSession';
import renderLoadingView from './LoadingView';
const qr_scanner = require('../assets/images/qr_scanner.png');

interface BarcodeScanProps {
  label: string;
  onData: (data: any) => void;
  reloadKey: any;
  value: any;
}
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
let storedHostname;

const BarcodeScan: React.FC<BarcodeScanProps> = ({
  onData,
  label,
  reloadKey,
  value,
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [openBarcode, setOpenBarcode] = useState(false);
  const [barCodeValue, setBarCodeValue] = useState('');
  const [itemData, setItemData] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [scannedItem, setScannedItem] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [barCodeText, setBarCodeText] = useState('');

  const cameraRef = useRef(null);

  useEffect(() => {
    setBarCodeValue('');
    setItemData(null);
    setScannedItem('');
    setBarCodeText('');
  }, [reloadKey]);

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
        onData;
        return data;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      setIsLoading(false);
      // onData({isLoading: false});
    } finally {
      setIsLoading(false);
      // onData({isLoading: false});
    }
  };

  const onBarCodeRead = async (e: {
    type: string;
    data: React.SetStateAction<string>;
  }) => {
    showToast(`Barcode value is ${e.data}, Barcode type is ${e.type}`);
    setOpenBarcode(false);
    setBarCodeValue(e.data);
    setBarCodeText(e.data);
    // setItemData(itemResponse?.data?.[0]?.Table?.[0]);
    const handleBarCode = onData({
      barCodeValue: e.data,
      inputType: 'scan',
      // itemResponse: itemResponse?.data?.[0]?.Table?.[0],
    });
    console.log('handleBarCode', handleBarCode);
    setScannedItem(handleBarCode);
    // const barcodeType = e.type;
    // if (e.type === 'QR_CODE') {
    //     if (true) {
    //       console.log('isValiedbarCodeValue', e.data);
    //       storedHostname = await AsyncStorage.getItem('hostname');
    //       const itemQuery = `select top 1 sBarcode
    // from muCore_Product_Classification_Details pcd
    // where sBarcode = '${e.data}';
    // select top 1
    //     sCode sBarcode
    // from mCore_Product p
    // where
    // sCode = '${e.data}'`;
    //       const itemResponse = await fetchDataFromApi(
    //         `${storedHostname}/focus8API/utility/executesqlquery`,
    //         {
    //           data: [
    //             {
    //               Query: itemQuery,
    //             },
    //           ],
    //         },
    //       );
    //       if (
    //         itemResponse &&
    //         itemResponse?.data &&
    //         itemResponse?.result === 1 &&
    //         itemResponse?.data?.[0]?.Table &&
    //         itemResponse?.data?.[0]?.Table?.length > 0
    //       ) {
    //         setOpenBarcode(false);
    //         setBarCodeValue(e.data);
    //         setBarCodeText(e.data);
    //         setItemData(itemResponse?.data?.[0]?.Table?.[0]);
    //         const handleBarCode = onData({
    //           barCodeValue: e.data,
    //           itemResponse: itemResponse?.data?.[0]?.Table?.[0],
    //         });
    //         console.log('handleBarCode', handleBarCode);
    //         setScannedItem(handleBarCode);
    //       } else if (
    //         itemResponse &&
    //         itemResponse?.data &&
    //         itemResponse?.result === 1 &&
    //         itemResponse?.data?.[0]?.Table1 &&
    //         itemResponse?.data?.[0]?.Table1?.length > 0
    //       ) {
    //         setOpenBarcode(false);
    //         setBarCodeValue(e.data);
    //         setBarCodeText(e.data);
    //         setItemData(itemResponse?.data?.[0]?.Table1?.[0]);
    //         const handleBarCode = onData({
    //           barCodeValue: e.data,
    //           itemResponse: itemResponse?.data?.[0]?.Table1?.[0],
    //         });
    //         console.log('handleBarCode', handleBarCode);
    //         setScannedItem(handleBarCode);
    //       } else {
    //         if (itemResponse?.message) {
    //           showToast(itemResponse?.message);
    //         } else {
    //           showToast('Scan valied BARCODE');
    //         }
    //       }
    //     } else {
    //       // showToast('Scan valied BARCODE type');
    //     }
  };

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  const onChangeText = async (e: string) => {
    console.log(e);
    console.log('isValiedbarCodeValue', e);
    setOpenBarcode(false);
    setBarCodeValue(e);

    const handleBarCode = onData({
      barCodeValue: e,
      inputType:'search',
    });
    console.log('handleBarCode2', handleBarCode);
    setScannedItem(handleBarCode);

    //     storedHostname = await AsyncStorage.getItem('hostname');
    //     const itemQuery = `select top 1 sBarcode
    // from muCore_Product_Classification_Details pcd
    // where sBarcode = '${e}';
    // select top 1
    //     sCode sBarcode
    // from mCore_Product p
    // where
    // sCode = '${e}'`;
    //     const itemResponse = await fetchDataFromApi(
    //       `${storedHostname}/focus8API/utility/executesqlquery`,
    //       {
    //         data: [
    //           {
    //             Query: itemQuery,
    //           },
    //         ],
    //       },
    //     );
    //     if (
    //       itemResponse &&
    //       itemResponse?.data &&
    //       itemResponse?.result === 1 &&
    //       itemResponse?.data?.[0]?.Table &&
    //       itemResponse?.data?.[0]?.Table?.length > 0
    //     ) {
    //       setOpenBarcode(false);
    //       setBarCodeValue(e);
    //       setItemData(itemResponse?.data?.[0]?.Table?.[0]);
    //       const handleBarCode = onData({
    //         barCodeValue: e,
    //         itemResponse: itemResponse?.data?.[0]?.Table?.[0],
    //       });
    //       console.log(
    //         'handleBarCode2',
    //         handleBarCode,
    //         itemResponse?.data?.[0]?.Table?.length > 0,
    //       );
    //       setScannedItem(handleBarCode);
    //     } else if (
    //       itemResponse &&
    //       itemResponse?.data &&
    //       itemResponse?.result === 1 &&
    //       itemResponse?.data?.[0]?.Table1 &&
    //       itemResponse?.data?.[0]?.Table1?.length > 0
    //     ) {
    //       setOpenBarcode(false);
    //       setBarCodeValue(e);
    //       setItemData(itemResponse?.data?.[0]?.Table1?.[0]);
    //       const handleBarCode = onData({
    //         barCodeValue: e,
    //         itemResponse: itemResponse?.data?.[0]?.Table1?.[0],
    //       });
    //       console.log(
    //         'handleBarCode2',
    //         handleBarCode,
    //         itemResponse?.data?.[0]?.Table1?.length > 0,
    //       );
    //       setScannedItem(handleBarCode);
    //     } else {
    //       if (itemResponse?.message) {
    //         showToast(itemResponse?.message);
    //         onData({});
    //       } else {
    //         showToast('Enter valied BARCODE');
    //         onData({});
    //       }
    //     }
  };
  const handleTourch = () => {
    setTorchOn(prevState => !prevState);
  };

  const handleBarCode = () => {
    setOpenBarcode(true);
    onData({
      barCodeValue: '',
      inputType: 'search',
    });
    setBarCodeText('');
  };
  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: -6,
    fontSize: 12,
    color: isFocused ? '#0f6cbd' : 'black',
    zIndex: 20,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  };
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <>
      <View style={styles.labelContainer}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <View style={{flex: 1}}>
          {/* {barCodeValue === '' || !scannedItem ? ( */}

          <TextInput
            // {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={barCodeText}
            placeholder={isFocused ? '' : label}
            placeholderTextColor="#8e918e"
            onChangeText={e => {
              setBarCodeText(e);
              onChangeText(e);
            }}
            style={{
              borderRadius: 8,
              // borderBottomWidth: 1,
              // borderTopWidth: 1,
              // borderLeftWidth: 1,
              // borderRightWidth: 1,
              // borderColor: '#ccc',
              fontSize: 16,
              fontWeight:'500',
              padding: 8,
              // marginTop: 6, // Adjust the top margin as needed
              color: 'black',
              backgroundColor: '#daedf5',
              // marginBottom: 20,
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              // elevation: 5,
              height: 50,
              // width: 300,
              // flex: 1,
              borderWidth: isFocused ? 1 : 0.4,
              borderColor: isFocused ? '#0f6cbd' : 'black',
            }}
          />
          {/* //   <Text style={styles.watermark}>{label}</Text>
          // ) : (
          //   <Text style={styles.label}>{scannedItem}</Text>
          )
          // } */}
        </View>
        <TouchableOpacity onPress={handleBarCode}>
          <View style={styles.iconContainer}>
            <FontAwesomeIcon icon={faBarcode} size={50} color="#0f6cbd" />
            {/* <Image
              source={qr_scanner} // Change the path to your PNG image
              style={styles.image}
            /> */}
          </View>
        </TouchableOpacity>
      </View>
      <Modal visible={openBarcode} animationType="slide">
        {isLoading && renderLoadingView()}
        <View style={styles.modalContainer}>
          <View
            style={[styles.iconContainer, {alignSelf: 'flex-end', padding: 5}]}>
            <TouchableOpacity
              style={{backgroundColor: 'black'}}
              onPress={() => setOpenBarcode(false)}>
              <FontAwesomeIcon icon={faCircleXmark} size={40} color="#fff" />
            </TouchableOpacity>
          </View>
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
              <Text style={styles.overlayText}>BARCODE SCANNER</Text>
            </View>
          </Camera>
          <View style={styles.bottomOverlay}>
            <TouchableOpacity onPress={handleTourch}>
              <Text style={styles.torchText}>
                {/* torch button styles */}
                <>{torchOn ? 'Turn off torch' : 'Turn on torch'}</>
                {torchOn ? (
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faBolt} size={30} color="#757778" />
                  </View>
                ) : (
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faBolt} size={30} color="#0f6cbd" />
                  </View>
                )}
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
    height: 'auto',
    padding: 8,
    borderRadius: 6,
    color: 'black',
    backgroundColor: '#daedf5',
    marginBottom: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {backgroundColor: 'black', marginLeft: 5},
  modalContainer: {
    height: 200,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
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
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker background with transparency
    // backgroundColor: '#0f6cbd',
    flexDirection: 'row', // To align text and icon in a row

    borderTopLeftRadius: 20, // Rounded corners for the bottom overlay
    borderTopRightRadius: 20, // Rounded corners for the bottom overlay
  },
  torchText: {
    color: '#fff', // White text color
    fontSize: 20, // Increased font size for better readability
    // marginRight: 15, // Increased spacing between text and icon
    fontWeight: 'bold', // Slightly lighter font weight for a modern look
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  icon: {
    fontSize: 30, // Larger icon size for better visibility
    color: '#fff', // Ensures the icon stands out with a white color
  },
});

// const styles = StyleSheet.create({
//   watermark: {
//     fontSize: 16,
//     color: '#888',
//   },
//   labelContainer: {
//     fontSize: 16,

//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: 'auto',
//     padding: 8,
//     // borderWidth: 1,
//     // borderColor: '#ccc',
//     borderRadius: 6,
//     color: 'black',
//     backgroundColor: '#daedf5',
//     marginBottom: 20,
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     // height: 50,
//   },
//   label: {
//     fontSize: 16,
//     color: '#333',
//   },
//   iconContainer: {backgroundColor: 'black'},
//   modalContainer: {
//     height: 200,
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'black',
//   },
//   preview: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   overlay: {
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//     padding: 13,
//     borderRadius: 5,
//     marginBottom: 80,
//   },
//   overlayText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   bottomOverlay: {
//     position: 'absolute',
//     width: '100%',
//     bottom: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   torchText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   image: {
//     // width: 200, // Adjust width as needed
//     // height: 200, // Adjust height as needed
//     // marginTop: 10,
//     // marginBottom: 10,
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//   },
// });

export default BarcodeScan;
