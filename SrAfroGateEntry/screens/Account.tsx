/* eslint-disable react-native/no-inline-styles */
// SettingsScreen.js
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

const screenHeight = Dimensions.get('window').height;
function Account({
  handleLogout,
}: {
  SessionId: any;
  handleLogout: () => void;
  onData: (data: any) => void;
}) {
  const [hostname, setHostname] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setcompanyName] = useState('');
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHostname = await AsyncStorage.getItem('hostname');
        const storedcompanyName = await AsyncStorage.getItem('companyName');
        const storedusername = await AsyncStorage.getItem('username');
        console.log(
          'Account',
          storedHostname,
          storedcompanyName,
          storedusername,
        );
        if (storedHostname && storedcompanyName && storedusername) {
          setHostname(storedHostname);
          setcompanyName(storedcompanyName);
          setUsername(storedusername);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []); // Empty dependency array ensures this effect runs only once on mount
  return (
    <>
      <ScrollView>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Hostname:</Text>
          <Text style={styles.detailText}>{hostname}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.detailText}>{username}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Company Name:</Text>
          <Text style={styles.detailText}>{companyName}</Text>
        </View>
      </ScrollView>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
        <FontAwesomeIcon icon={faSignOutAlt} size={20} color="white" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#666',
  },
  detailText: {
    fontSize: 17,
    // marginBottom: 10,
    color: '#333',
  },
  detailContainer: {
    // marginBottom: 1,
    backgroundColor: '#cadfe8',
    padding: 10,
    margin: 20,
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  button: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    margin: 20,
    backgroundColor: '#0d4257',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Align text and icon horizontally
  },
  focusimageContainer: {
    position: 'absolute',
    bottom: 10,
    marginTop: 40,
    padding: 10,
    // flex: 1,
    // justifyContent: 'center',
  },
  focusimage: {
    width: 35, // Adjust width as needed
    height: 35, // Adjust height as needed
    // marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Account;
