import React, {useState, useRef} from 'react';
import {View, Button, PermissionsAndroid, Linking, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera'; // or any other camera library
import {Picker} from '@react-native-picker/picker'; // Updated import statement for Picker

const CameraBarCode = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const cameraRef = useRef(null);

  const handleBarcodeScan = ({data}) => {
    setBarcodeData(data);
  };
  const handleImageCapture = async () => {
    if (cameraRef.current) {
      const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      console.log(permission);
      const permissionStatus = await PermissionsAndroid.check(permission);
      console.log(permissionStatus);
      if (true) {
        // The permission is denied, handle it accordingly
        const settingsPrompt =
          'Camera permission is required. Please enable it in Settings.';
        Alert.alert(
          'Permission Required',
          settingsPrompt,
          [
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } else {
        // The permission is granted, proceed with image capture
        const options = {quality: 0.5, base64: true};
        const data = await cameraRef.current.takePictureAsync(options);
        console.log('handleImageCapture clicked');
        setImageData(data.uri);
      }
    }
  };

  //   const handleImageCapture = async () => {
  //     if (cameraRef.current) {
  //       const options = {quality: 0.5, base64: true};
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //         {
  //           title: 'Camera Permission',
  //           message: 'This app needs access to your camera.',
  //           buttonNeutral: 'Ask Me Later',
  //           buttonNegative: 'Cancel',
  //           buttonPositive: 'OK',
  //         },
  //       );
  //       console.log('granted', granted);
  //       const cTEST = await cameraRef.current;
  //       console.log(`cTEST`, cTEST);
  //       const data = await cameraRef.current.takePictureAsync(options);
  //       console.log('handleImageCapture clicked');
  //       setImageData(data.uri);
  //     }
  //   };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log('handleSubmit clicked');
  };

  return (
    <View>
      <RNCamera
        ref={cameraRef}
        // onBarCodeRead={handleBarcodeScan} // This line handles barcode scanning
        // Add camera props and event handlers as needed
      />
      <Button title="Capture Image" onPress={handleImageCapture} />
      <Button title="Submit" onPress={handleSubmit} />
      <Picker
        selectedValue={selectedOption}
        onValueChange={(itemValue: any) => setSelectedOption(itemValue)}>
        <Picker.Item label="Option 1" value="option1" />
        <Picker.Item label="Option 2" value="option2" />
        {/* Add more options as needed */}
      </Picker>
    </View>
  );
};

export default CameraBarCode;
