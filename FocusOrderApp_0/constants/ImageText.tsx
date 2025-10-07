/* eslint-disable react-native/no-inline-styles */
import {
  faBarcode,
  faCamera,
  faCameraAlt,
  faImages,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';

type TextBlock = {
  text: string;
  bounding: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  blockText: string;
};
interface ImageTextProps {
  label: string;
  editable: boolean;
  onData: (data: any) => void;
  clearImageText: any;
  value: any;
}

const ImageText: React.FC<ImageTextProps> = ({
  onData,
  label,
  editable = true,
  clearImageText,
  value,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    onData({
      scannedText: '',
      valueText: '',
    });
  }, [clearImageText]);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      const cameraPermission = PermissionsAndroid.PERMISSIONS.CAMERA;
      const storagePermission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      try {
        const granted = await PermissionsAndroid.requestMultiple([
          cameraPermission,
          storagePermission,
        ]);

        const cameraGranted =
          granted[cameraPermission] === PermissionsAndroid.RESULTS.GRANTED;
        const storageGranted =
          granted[storagePermission] === PermissionsAndroid.RESULTS.GRANTED;

        if (!cameraGranted || !storageGranted) {
          Alert.alert(
            'Permission Denied',
            'Camera and storage permissions are required',
          );
          return false;
        }

        return true;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const handleImage = async (response: any) => {
    const uri = response?.assets?.[0]?.uri;
    if (uri) {
      setSelectedImage(uri);
      try {
        const blocks: TextBlock[] = await MlkitOcr.detectFromUri(uri);
        const textLines =
          blocks
            .map(block => block.text)
            .map(item => item?.match(/TID\s(\d+)/))
            .filter(Boolean)
            .map(match => match?.[1])?.[0] || '';
        setRecognizedText(textLines);
        const handleText = onData({
          scannedText: textLines,
          valueText: '',
        });
      } catch (err) {
        console.error('Text recognition error:', err);
        Alert.alert(
          'Text recognition Error',
          'Could not extract text from image.',
        );
      }
    }
  };

  const openCamera = async () => {
    setModalVisible(false);
    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission) return;

    launchCamera({mediaType: 'photo'}, handleImage);
  };

  const openGallery = async () => {
    setModalVisible(false);
    const hasPermission = await requestAndroidPermissions();
    if (!hasPermission) return;

    launchImageLibrary({mediaType: 'photo'}, handleImage);
  };
  const labelStyle: TextStyle = {
    borderRadius: 6,
    position: 'absolute',
    left: 4,
    top: -9,
    fontSize: 12,
    color: isFocused ? '#0f6cbd' : 'black',
    zIndex: 20,
    paddingRight: 4,
    paddingLeft: 4,
    backgroundColor: 'white',
    marginHorizontal: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    borderWidth: 0.3,
    borderColor: isFocused ? '#0f6cbd' : 'black',
  };
  const inputBackgroundColor = editable
    ? '#daedf5' // Editable but not focused and no value
    : '#e0e0e0'; // Non-editable, gray background

  return (
    <>
      <View
        style={[
          styles.labelContainer,
          {
            borderWidth: isFocused ? 1 : 0.4,
            borderColor: isFocused ? '#0f6cbd' : 'black',
          },
        ]}>
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <View style={{flex: 1}}>
          <TextInput
            // {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            placeholder={isFocused ? '' : label}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor="#8e918e"
            onChangeText={e => {
              onData({scannedText: '', valueText: e});
              setRecognizedText(e);
            }}
            editable={editable}
            style={{
              borderRadius: 8,
              fontSize: 17,
              fontWeight: '600',
              padding: 10,
              color: 'black',
              backgroundColor: inputBackgroundColor,
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              // elevation: 5,
              height: 'auto',
              borderWidth: isFocused ? 1 : 0.4,
              borderColor: isFocused ? '#0f6cbd' : 'black',
            }}
          />
        </View>
        <TouchableOpacity onPress={openCamera}>
          <View style={styles.barIconContainer}>
            <FontAwesomeIcon icon={faCamera} size={30} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={openGallery}>
          <View style={styles.barIconContainer}>
            <FontAwesomeIcon icon={faImages} size={30} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      {/* <View contentContainerStyle={styles.container}>
        <Text style={styles.header}>OCR Text Extractor</Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.button}>
          <Text style={styles.buttonText}>Get Image</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={openCamera} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openGallery}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {selectedImage && (
          <Image source={{uri: selectedImage}} style={styles.image} />
        )}

        {recognizedText.length > 0 && (
          <View style={styles.textContainer}>
            <Text style={styles.resultHeader}>Recognized Text:</Text>
            {recognizedText.map((line, index) => (
              <Text key={index} style={styles.resultText}>
                {line}
              </Text>
            ))}
          </View>
        )}
      </View> */}
    </>
  );
};

export default ImageText;

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
    // marginBottom: 20,
    marginVertical: 20,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {backgroundColor: 'black', marginLeft: 5},
  barIconContainer: {
    backgroundColor: '#0f6cbd',
    marginLeft: 5,
    width: 55,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  textContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  modalButton: {
    padding: 12,
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
