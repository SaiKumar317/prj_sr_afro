import {RNCamera} from 'react-native-camera';

class CameraService {
  isBackCamera = (cameraType: string) => {
    return cameraType === RNCamera.Constants.Type.back;
  };

  getNewCameraType = (cameraType: string) => {
    if (this.isBackCamera(cameraType)) {
      return RNCamera.Constants.Type.front;
    } else {
      return RNCamera.Constants.Type.back;
    }
  };
}

export default CameraService;
