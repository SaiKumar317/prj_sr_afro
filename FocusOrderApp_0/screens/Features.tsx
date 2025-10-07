import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ScrollView,
  BackHandler,
  Platform,
  Linking,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faClock,
  faWeight,
  faEgg,
  faTrash,
  faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDBConnection} from '../services/SQLiteService';

const focus_rt_black = require('../assets/images/focus_rt_black.png');
declare function alert(message?: any): void;
let storedHostname;
type FeaturesProps = {
  onData: (data: any) => void;
  reloadCategory: any;
  navigation: any;
};
const screenHeight = Dimensions.get('window').height;
const Features: React.FC<FeaturesProps> = ({
  onData,
  reloadCategory,
  navigation,
}) => {
  const [isSessionValid, setSessionValid] = useState(false); // Renamed from `isSessionValied` to `isSessionValid`
  const [SessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [category, setCategory] = useState<any[]>([]);
  const [categoryImages, setCategoryImages] = useState<{[key: string]: string}>(
    {},
  );
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>(
    {},
  );

  const handleCategory = async (CategoryId: any, CategoryName: any) => {
    console.log('handleCategory pressed'); // Add this log statement
    await AsyncStorage.removeItem('selectedCategory');
    await AsyncStorage.setItem(
      'selectedCategory',
      JSON.stringify({CategoryName, CategoryId}),
    );
    navigation.navigate('CategoryItems', {CategoryId});
    // onData({
    //   Features: 'Category',
    // });
  };

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  useEffect(() => {
    // Fetch data from AsyncStorage when component mounts
    retrieveData();
  }, []); // Empty dependency array to run the effect only once

  useEffect(() => {
    const getLoggedInUser = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (isSessionValid) {
        showToast(`Successfully Logged in as ${storedUsername}`);
      } else {
        if (storedUsername) {
          showToast(`${storedUsername} User Logged Out`);
        } else {
          showToast('User Logged Out');
        }
      }
    };
    getLoggedInUser();
  }, [isSessionValid]);

  const handleExit = () => {
    // Show an Alert dialog for confirmation
    if (Platform.OS === 'android') {
      BackHandler.exitApp(); // Exit the app on Android
    } else {
      Linking.openURL('app-settings:'); // Open app settings on iOS
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const clearSessionData = async () => {
    try {
      // Display alert to confirm clearing session data
      Alert.alert('Confirm', 'Are you sure you want to logout?', [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            // Clear session data if confirmed
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('password');
            // await AsyncStorage.removeItem('hostname');
            // await AsyncStorage.removeItem('companyCode');
            setSessionValid(false);
            setSessionId(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  const clearData = async () => {
    try {
      // Clear data from AsyncStorage
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      // await AsyncStorage.removeItem('hostname');
      // await AsyncStorage.removeItem('companyCode');
      // Reset component state
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const retrieveData = async () => {
    try {
      setIsLoading(true);
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');
      storedHostname = await AsyncStorage.getItem('hostname');
      const storedCompanyCode = await AsyncStorage.getItem('companyCode');

      if (
        storedUsername !== null &&
        storedPassword !== null &&
        storedHostname !== null &&
        storedCompanyCode !== null
      ) {
        console.log(
          storedHostname,
          storedUsername,
          storedPassword,
          storedCompanyCode,
        );
        // const url = `${storedHostname}/focus8API/Login`;
        // const raw = {
        //   data: [
        //     {
        //       Password: `${storedPassword}`,
        //       UserName: `${storedUsername}`,
        //       CompanyCode: `${storedCompanyCode}`,
        //     },
        //   ],
        // };
        // const fSessionId = await fetchDataFromApi(url, raw);
        // console.log('retrieveData', fSessionId);
        const storedFocusSessoin: any = await AsyncStorage.getItem(
          'focusSessoin',
        );
        if (storedFocusSessoin !== undefined) {
          setSessionValid(true);
          setSessionId(storedFocusSessoin);
          await getCategories();
        } else {
          clearData();
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };
  async function getCategories() {
    try {
      const db = await getDBConnection();
      const [results] = await db.executeSql(
        `SELECT 
          CategoryId,
          CategoryName,
          CategoryCode
          --,CategoryImage
        FROM Categories
        Where MobilePOS = 'Yes' and CategoryId != 0`,
      );

      if (results.rows.length > 0) {
        const categories = [];
        for (let i = 0; i < results.rows.length; i++) {
          categories.push(results.rows.item(i));
          // getting images individually
          try {
            const [imageResult] = await db.executeSql(
              `SELECT CategoryImage FROM Categories WHERE CategoryId = ?`,
              [results.rows.item(i).CategoryId],
            );
            if (imageResult.rows.length > 0) {
              if (imageResult.rows.item(0)?.CategoryImage) {
                categories[i].CategoryImage =
                  imageResult.rows.item(0).CategoryImage;
              }
            }
          } catch (error) {
            console.error('Error fetching category image:', error);
          }
        }
        setCategory(categories);

        // Set images directly from database
        const imageMap: {[key: string]: string} = {};
        categories.forEach(cat => {
          if (cat.CategoryId && cat.CategoryImage) {
            imageMap[cat.CategoryId] = cat?.CategoryImage;
          }
        });
        setCategoryImages(imageMap);
      }
    } catch (error) {
      console.error('Error fetching categories from local db:', error);
    }
  }
  useEffect(() => {
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const initializeCategories = async () => {
      try {
        setIsLoading(true);
        await getCategories();
      } catch (error) {
        console.error('Error initializing categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCategories();
  }, [reloadCategory]); // Dependencies array remains empty

  const onDataFromLoginPage = (data: any): any => {
    setSessionValid(data.isSessionValid);
    setSessionId(data.SessionId);
    return isLoading;
  };

  const handleLogout = () => {
    clearSessionData();
    // Additional logout logic, such as navigating to the login screen
  };
  // const navigation = useNavigation(); // Get the navigation object using useNavigation hook
  // const menuItems = [
  //   {
  //     title: 'Purchase',
  //     icon: faClock,
  //     imageSource: purchase_in,
  //     onPress: handleGateInPurchase,
  //   },
  //   {
  //     title: 'Sale',
  //     imageSource: sale_in,
  //     icon: faWeight,
  //     onPress: handleGateInSale,
  //   },
  // ];

  const menuItems = category
    .sort((a: any, b: any) => {
      // Move items with CategoryId of 0 ("Others") to the end
      if (a.CategoryId === 0) {
        return 1;
      }
      if (b.CategoryId === 0) {
        return -1;
      }
      return 0;
    })
    .map((item: any) => ({
      ...item,
      onPress: () => handleCategory(item?.CategoryId, item?.CategoryName),
    }));

  const screenHeight = Dimensions.get('window').height;

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={item.onPress}
      activeOpacity={0.8}>
      {loadingImages[item.CategoryId] ? (
        <View style={[styles.backgroundImage, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#51c7d6" />
        </View>
      ) : (
        <ImageBackground
          source={
            categoryImages[item.CategoryId]
              ? {
                  uri: `data:image/jpeg;base64,${
                    categoryImages[item.CategoryId]
                  }`,
                }
              : focus_rt_black
          }
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}>
          <View style={styles.itemContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {item?.CategoryId == 0 ? 'Others' : item.CategoryName}
              </Text>
            </View>
          </View>
        </ImageBackground>
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.menuDropDown}>
        <FlatList
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.flatListContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuDropDown: {
    flex: 1,
    backgroundColor: 'white', // Lighter background
    minHeight: screenHeight,
    padding: 12,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    color: '#333',
    // overflow: 'scroll',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    padding: 8,
    marginTop: 40,

    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // paddingRight: 10,
  },
  container: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    // height: screenHeight,
  },
  menuContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    // height: 50,
    padding: 10,
    marginTop: 10,
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#daedf5',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    borderWidth: 0.4,
    borderColor: '#0f6cbd',
    margin: 4,
    width: Dimensions.get('window').width / 2 - 24,
    height: 160,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    borderRadius: 15,
    opacity: 0.9,
    resizeMode: 'contain',
  },
  loadingContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end', // Align content to bottom
    alignItems: 'center',
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
  },
  titleContainer: {
    width: '100%',
    padding: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
    color: '#e0e0e0',
    textAlign: 'center',
    fontWeight: '500',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
});

export default Features;
