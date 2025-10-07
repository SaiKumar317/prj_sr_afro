/* eslint-disable react-native/no-inline-styles */
// SettingsScreen.js
import {faSignOutAlt, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
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
  //   handleLogout,
  handleBackPage,
}: {
  //   SessionId: any;
  //   handleLogout: () => void;
  handleBackPage: () => any;
  //   onData: (data: any) => void;
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
        console.log(storedHostname, storedcompanyName);
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
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPage}>
          <FontAwesomeIcon icon={faArrowLeft} size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Account Details</Text>
      </View>
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
      {/* <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
        <FontAwesomeIcon icon={faSignOutAlt} size={20} color="white" />
      </TouchableOpacity> */}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 18,
    color: '#222',
  },
  detailContainer: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    margin: 20,
    backgroundColor: '#007acc',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  focusimageContainer: {
    position: 'absolute',
    bottom: 10,
    marginTop: 40,
    padding: 10,
    alignItems: 'center',
  },
  focusimage: {
    width: 40,
    height: 40,
  },
  headerContainer: {
    backgroundColor: '#007acc',
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    position: 'relative',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
});

export default Account;
