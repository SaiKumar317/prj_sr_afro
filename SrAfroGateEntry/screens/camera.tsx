import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useNavigation} from '@react-navigation/native';
import FlashModeService from '../utils/FlashModeService';
import CameraService from '../utils/CameraService';
import useCamera from '../hooks/useCamera';
import useCallbackRef from '../hooks/useCallbackRef';
// import styles from './styles.ts';

const flashModeService = new FlashModeService();
const cameraService = new CameraService();

const Camera = () => {
  const navigation = useNavigation();
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const {ref, callbackRef} = useCallbackRef();
  const {
    seconds,
    recording,
    takePicture,
    startRecordingVideo,
    stopRecordingVideo,
  } = useCamera(ref);

  const onTorchPress = () => {
    setFlashMode(flashModeService.getNewFlashMode(flashMode));
  };

  const changeCameraType = () => {
    setCameraType(cameraService.getNewCameraType(cameraType));
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNCamera
        ratio={'16:9'}
        ref={callbackRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        captureAudio={true}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack}>
            {/* <Image
              source={require('../assets/close.png')}
              style={styles.closeIcon}
            /> */}
            <Text>X</Text>
          </TouchableOpacity>
          {recording && (
            <View style={styles.timer}>
              <Text style={styles.timerText}>Time remaining</Text>
              <View style={styles.timeContainer}>
                <View style={styles.dot} />
                <Text style={styles.timerText}>00:{seconds}</Text>
              </View>
            </View>
          )}
          {cameraService.isBackCamera(cameraType) && (
            <TouchableOpacity onPress={onTorchPress}>
              {/* <Image
                source={require('../assets/torch.png')}
                style={styles.torchIcon}
              /> */}
              <Text>torch</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            onPress={takePicture}
            onLongPress={startRecordingVideo}
            onPressOut={stopRecordingVideo}
            style={[
              styles.captureButton,
              recording ? styles.captureButtonInProgress : null,
            ]}
          />
          <TouchableOpacity onPress={changeCameraType} disabled={recording}>
            {/* <Image
              source={require('../assets/switch-camera.png')}
              style={styles.switchCameraIcon}
            /> */}
            <Text>SwitchCamera</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hold for video, tap for photo</Text>
        </View>
      </RNCamera>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    marginLeft: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: 'red',
    borderRadius: 3,
    marginRight: 5,
  },
  torchIcon: {
    width: 24,
    height: 24,
  },
  captureContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButtonInProgress: {
    backgroundColor: 'red',
  },
  switchCameraIcon: {
    width: 24,
    height: 24,
    marginTop: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Camera;
