/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import ImageResizer from 'react-native-image-resizer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {ImageResizeMode} from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Buffer} from 'buffer';
import {faImage} from '@fortawesome/free-solid-svg-icons';

interface CameraScreenProps {
  label: string;
  value?: any;
  // items: any;
  onData: (data: any) => void;
  reloadKey: any;
}
const CameraScreen: React.FC<CameraScreenProps> = ({
  onData,
  label,
  value,
  // items,
  reloadKey,
}) => {
  const [fileUri, setFileUri] = useState('');
  // const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Your logic here to reload the page, if needed
    // const CameraScreenOndata = onData({capturedImage: null});
    // console.log('CameraScreen', CameraScreenOndata);
    setFileUri('');
  }, [reloadKey]);

  //   const chooseImage = () => {
  //     let options = {
  //       title: 'Select Image',
  //       storageOptions: {
  //         skipBackup: true,
  //         path: 'images',
  //       },
  //     };
  //     launchImageLibrary(options, response => {
  //       console.log('Response = ', response);
  //       if (response.didCancel) {
  //         console.log('User cancelled image picker');
  //       } else {
  //         console.log('response', JSON.stringify(response));
  //         setFileUri(response.assets[0].uri);
  //       }
  //     });
  //   };

  // Function to convert image to base64
  const convertImageToBase64 = async (
    imageUri: string | URL | Request | undefined,
  ) => {
    if (!imageUri) {
      console.error('Image URI is undefined');
      return null;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };
  function removeBase64Prefix(base64String: any) {
    // Check if the string starts with the prefix
    if (base64String.startsWith('data:image/jpeg;base64,')) {
      // Remove the prefix
      return base64String.slice('data:image/jpeg;base64,'.length);
    } else {
      // If the prefix is not found, return the original string
      return base64String;
    }
  }

  const resizeImage = async (fileUris: string) => {
    const imageInfo = await ImageResizer.createResizedImage(
      fileUris,
      800, // Set the maximum width to resize the image
      600, // Set the maximum height to resize the image
      'JPEG', // Image format after resizing
      80, // Image quality after resizing
      0, // Rotation angle (0 degrees by default)
    );

    return imageInfo.uri;
  };
  // Function to convert binary data to hexadecimal string
  const binaryToHex = binaryData => {
    return Array.from(binaryData)
      .map(byte => ('0' + (byte & 0xff).toString(16)).slice(-2))
      .join('');
  };

  // Function to convert image to binary data
  // Function to convert image to binary data
  const convertImageToBinary = async imageUri => {
    try {
      // Read the image file
      const binaryData = await RNFS.readFile(imageUri, 'base64');

      // Convert binary data to hexadecimal string
      const hexString = binaryToHex(Buffer.from(binaryData, 'base64'));
      console.log('hexString', hexString);
      return hexString;
    } catch (error) {
      console.error('Error converting image to hexadecimal:', error);
      throw error;
    }
  };

  const launchCameraHandler = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      quality: 0.1,
      cameraType: 'back',
    };
    launchCamera(options, async response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else {
        console.log('response', JSON.stringify(response));
        console.log('response', response);
        if (response.assets && response.assets.length > 0) {
          const {uri} = response.assets[0];
          const binaryData = await convertImageToBinary(uri);
          const fileUriCaptured = response.assets[0]?.uri; // Using optional chaining
          if (fileUriCaptured) {
            setFileUri(fileUriCaptured);
            // Resize the image to reduce its size without cropping
            const resizedImageUri = await resizeImage(fileUriCaptured);
            const base64Image = await convertImageToBase64(
              resizedImageUri || null,
            );

            // onData({ capturedImage: response.assets[0].uri });
            // console.log('base64Image', base64Image);
            onData({capturedImage: removeBase64Prefix(base64Image)});
            // onData({capturedImage: base64Image});
          } else {
            console.log('File URI is undefined');
          }
        } else {
          console.log('No assets found in the response');
        }
      }
    });
  };

  const renderFileUri = () => {
    if (fileUri) {
      return (
        <View style={{flex: 1}}>
          <Image
            source={{uri: fileUri}}
            resizeMode="contain"
            style={styles.images}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: 330,
          }}>
          <Text style={{textAlign: 'center', color: '#888'}}>
            Click on {label}
          </Text>
          {/* <Image
            source={require('../assets/images/mugdha.png')}
            //   source={{
            //     uri: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
            //   }}
            style={styles.images}
          /> */}
        </View>
      );
    }
  };

  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: true ? 10 : value ? 10 : 10,
    fontSize: 12,
    color: false ? 'blue' : '#888',
    zIndex: 1,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <View style={styles.body}>
          {/* <Text style={{textAlign: 'center', fontSize: 20, paddingBottom: 10}}>
            Pick Images from Camera & Gallery
          </Text> */}
          <View style={styles.ImageSections}>
            <View>{renderFileUri()}</View>
          </View>

          <View style={styles.btnParentSection}>
            {/* <TouchableOpacity onPress={chooseImage} style={styles.btnSection}>
              <Text style={styles.btnText}>Choose File</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={launchCameraHandler}
              style={styles.btnSection}>
              <Text style={styles.btnText}>{label}</Text>
              <FontAwesomeIcon icon={faImage} size={20} color="#0d4257" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },

  body: {
    // backgroundColor: '#cadfe8',
    backgroundColor: '#daedf5',
    paddingLeft: 10,
    paddingRight: 10,
    // paddingTop: 10,
    // paddingBottom: 1,
    // margin: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
    // backgroundColor: 'white',
    alignItems: 'center',
    // justifyContent: 'center',
    // borderColor: 'black',
    // borderWidth: 1,
    // height: Dimensions.get('screen').height - 20,
    // width: Dimensions.get('screen').width,
  },
  ImageSections: {
    display: 'flex',
    flexDirection: 'row',
    // paddingHorizontal: 8,
    // paddingVertical: 3,
    // justifyContent: 'center',
  },
  images: {
    width: 300,
    flex: 1,
    height: 150,
    borderRadius: 20,
    marginTop: 10,
    // flex: 1,
    // borderColor: 'black',
    // borderWidth: 1,
    // marginHorizontal: 3,
  },
  btnParentSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  btnSection: {
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // width: 225,
    // height: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#DCDCDC',
    alignItems: 'center',
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Align text and icon horizontally
    borderRadius: 3,
    marginBottom: 10,
  },
  btnText: {
    textAlign: 'center',
    color: '#0d4257',
    // color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default CameraScreen;
