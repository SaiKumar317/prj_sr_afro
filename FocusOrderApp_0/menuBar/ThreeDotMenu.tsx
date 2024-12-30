import React, {useState} from 'react';
import {
  View,
  TouchableHighlight,
  BackHandler,
  Linking,
  Platform,
  Alert,
} from 'react-native'; // Import TouchableHighlight instead of TouchableOpacity
import {Menu} from 'react-native-paper';
import {faEllipsisVertical} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

interface ThreeDotsMenuProps {
  onSave: () => void;
  onCancel: () => void;
}

const ThreeDotMenu: React.FC<ThreeDotsMenuProps> = ({onSave}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleSave = () => {
    onSave(); // Call the onSave function
    closeMenu(); // Close the menu after saving
  };
  const handleExit = () => {
    // Show an Alert dialog for confirmation
    Alert.alert('Confirm Exit', 'Are you sure you want to exit the app?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Exit',
        onPress: () => {
          // Exit the app
          if (Platform.OS === 'android') {
            BackHandler.exitApp(); // Exit the app on Android
          } else {
            Linking.openURL('app-settings:'); // Open app settings on iOS
          }
        },
      },
    ]);
    closeMenu();
  };
  return (
    <View>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <TouchableHighlight onPress={openMenu}>
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              size={26}
              color="white"
            />
          </TouchableHighlight>
        }>
        <Menu.Item onPress={handleSave} title="Save" />
        <Menu.Item onPress={handleExit} title="Exit" />
      </Menu>
    </View>
  );
};

export default ThreeDotMenu;
