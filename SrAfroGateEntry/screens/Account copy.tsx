/* eslint-disable react-native/no-inline-styles */

// SettingsScreen.js
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';

type AccountProps = {
  onData: (data: any) => void;
};
function Account({
  SessionId,
  handleLogout,
  onData,
}: {
  SessionId: any;
  handleLogout: () => void;
  onData: (data: any) => void;
}) {
  const [hostname, setHostname] = useState('');
  const [username, setUsername] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHostname = await AsyncStorage.getItem('hostname');
        const storedCompanyCode = await AsyncStorage.getItem('companyCode');
        const storedusername = await AsyncStorage.getItem('username');
        console.log(storedHostname, storedCompanyCode);
        if (storedHostname && storedCompanyCode && storedusername) {
          setHostname(storedHostname);
          setCompanyCode(storedCompanyCode);
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
      {/* <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.text}>Account Screen</Text>
      </View> */}
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Hostname:</Text>
        <Text style={styles.detailText}>{hostname}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.detailText}>{username}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Company Code:</Text>
        <Text style={styles.detailText}>{companyCode}</Text>
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
    backgroundColor: '#ccf0ce',
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
    bottom: 10,
    left: 0,
    right: 0,
    margin: 6,
    backgroundColor: '#38753b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row', // Align text and icon horizontally
    justifyContent: 'center', // Align text and icon horizontally
  },
});

export default Account;
