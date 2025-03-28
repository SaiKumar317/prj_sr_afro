/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  BackHandler,
  DrawerLayoutAndroid,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

import {Provider as PaperProvider} from 'react-native-paper';
import ThreeDotMenu from '../menuBar/ThreeDotMenu';
import {TouchableOpacity, View, Text} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faListAlt,
  faHome,
  faSave,
  faSignOutAlt,
  faUser,
  faCartShopping,
  faBars,
  faShoppingBag,
  faMoneyBillWave,
  faUsers,
  faBoxes,
  faTags,
  faCartFlatbedSuitcase,
  faRoute,
  faCubesStacked,
  faRightLeft,
  faCartArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';
import Features from './Features';
import Account from './AccountDetails';
import Cart from './Cart';
import {syncCustomers} from '../services/SyncCustomersService';
import {syncItems} from '../services/SyncItemsService';
import {syncPrices} from '../services/SyncPricesService';
import {
  getSalesOrderCount,
  getSalesReturnCount,
} from '../services/OrdersServices';
import getSyncOrders from '../pages/getSyncOrders';
import CategoryItems from './CategoryItems';
import PreferencesPage from '../pages/PreferencesPage';
import {syncStock} from '../services/SyncStock';
import {useNavigationState} from '@react-navigation/native';
import SalesReturnsPage from '../pages/SalesReturnsPage';
import getSyncReturns from '../pages/getSyncReturns';

declare function alert(message?: any): void;
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
type TabStackProps = {
  onDataFromFeatures: (data: any) => void;
  onDataFromCart: (data: any) => void;
  backPageClicked: any;
  reloadCategory: any;
  navigation: any;
  drawerRef: React.RefObject<DrawerLayoutAndroid>;
};

type SecondPageData = {
  esTabledata: {item: string; quantity: string; rate: string}[];
  // Add any other properties you expect from SecondPage here
};

let masterResponse = '';
let storedHostname;
function TabStack({
  onDataFromFeatures,
  onDataFromCart,

  backPageClicked,
  drawerRef,
  reloadCategory,
  navigation,
}: TabStackProps) {
  useEffect(() => {
    if (reloadCategory) {
      // Logic to reload the categories page goes here
      // Example: Fetching new data or updating the component state
      console.log('Reloading Categories...');
      navigation.navigate('Item Type');
    }
  }, [reloadCategory]);
  return (
    <Tab.Navigator
      initialRouteName={backPageClicked?.Features}
      screenOptions={({}) => ({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              const drawer = drawerRef.current;
              if (drawer) {
                drawer.openDrawer();
              }
            }}
            style={{marginLeft: 15}}>
            <FontAwesomeIcon icon={faBars} size={27} color="white" />
          </TouchableOpacity>
        ),
        headerTitleAlign: 'center',
        headerTitleStyle: {fontWeight: 'bold', fontSize: 25},

        tabBarActiveTintColor: '#0f6cbd',
        tabBarInactiveTintColor: '#565956',
        tabBarLabelStyle: {
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarActiveBackgroundColor: 'white',
        tabBarInactiveBackgroundColor: '#CECECE',
        headerStyle: {backgroundColor: '#0f6cbd'},
        headerTintColor: 'white',
      })}>
      <Tab.Screen
        name="Item Type"
        options={{
          tabBarLabel: 'Item Type',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faListAlt} size={size} color={color} />
          ),
        }}>
        {() => (
          <Features
            onData={onDataFromFeatures}
            reloadCategory={reloadCategory}
            navigation={navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Cart"
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({color, size}) => (
            <FontAwesomeIcon icon={faCartShopping} size={size} color={color} />
          ),
        }}>
        {({route}) => (
          <Cart
            SessionId={undefined}
            handleLogout={function (): void {
              throw new Error('Function not implemented.');
            }}
            onData={onDataFromCart}
            reloadCategory={reloadCategory}
            route={route}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainTabs({
  SessionId,
  handleLogout,
  handleBackPage,
  onData,
  backPageClicked,
}: {
  SessionId: any;
  handleLogout: () => void;
  handleBackPage: (data: any) => void;
  onData: (data: any) => void;
  backPageClicked: any;
  navigation: any;
}) {
  console.log(SessionId);
  const mainNavigation: any = useNavigation();

  // This will log the current screen's name
  const [reloadKey, setReloadKey] = useState(false);
  const [dataFromFeatures, setDataFromFeatures] = useState(null);
  const [dataFromFirstPage, setDataFromFirstPage] = useState(null);
  const [dataFromSecondPage, setDataFromSecondPage] =
    useState<SecondPageData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [reloadCategory, setReloadCategory] = useState(false);

  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };

  // const navigation = useNavigation();
  const handleDataFromFeatures = (data: React.SetStateAction<any>) => {
    setDataFromFeatures(data);
    console.log(data.Features);
    onData({Features: data.Features});
  };
  const handleDataFromCart = (data: React.SetStateAction<any>) => {
    // setDataFromFeatures(data);
    // console.log(data.Features);
    // onData({Features: data.Features});
    setIsLoading(data?.isLoading);
    if (data?.isreload) {
      setReloadKey(prev => !prev);
    }
  };

  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSessoin || '',
        },
        body: JSON.stringify(requestData),
      });
      console.log('response', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('JsonData', data);

      if (data.result === 1) {
        console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return data;
      } else {
        alert(data.message);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
    }
  };

  const fetchAndStoreCurrencyDetails = async () => {
    try {
      storedHostname = await AsyncStorage.getItem('hostname');
      const response = await fetchDataFromApi(
        `${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query: `select muc.iCurrency,c.sCode from tCore_Company_Details cd 
                      join muCore_Country muc on cd.iCountryId=muc.iMasterId
                      join mCore_Currency c on c.iCurrencyId=muc.iCurrency`,
            },
          ],
        },
      );

      if (response?.data?.[0]?.Table?.[0]) {
        const currencyDetails = response.data[0].Table[0];
        await AsyncStorage.setItem(
          'currencyDetails',
          JSON.stringify(currencyDetails),
        );
        console.log('Currency details stored successfully:', currencyDetails);
      }
    } catch (error) {
      console.error('Error fetching currency details:', error);
    }
  };

  // Add drawer reference
  const drawerRef = React.useRef<DrawerLayoutAndroid>(null);

  // Add navigation view for drawer
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedCompanyName = await AsyncStorage.getItem('companyName');

        if (storedUsername) {
          setUsername(storedUsername);
        }
        if (storedCompanyName) {
          setCompanyName(storedCompanyName);
        }
      } catch (error) {
        console.error('Error getting user details from storage:', error);
      }
    };

    getUserDetails();
  }, []);

  const [orderCount, setOrderCount] = useState(0);
  const [returnCount, setReturnCount] = useState(0);

  const [selectedScreen, setSelectedScreen] = useState('TabStack');

  // Fetch the order count when the component mounts
  useEffect(() => {
    const fetchOrderCount = async () => {
      const count = await getSalesOrderCount();
      const returnOrdersCount = await getSalesReturnCount();
      setOrderCount(count);
      setReturnCount(returnOrdersCount);
    };

    fetchOrderCount();
  }, [reloadKey]);

  const currentScreen =
    mainNavigation.getState()?.routes[mainNavigation.getState()?.index]?.name;
  console.log('currentScreenNav', currentScreen);
  useEffect(() => {
    if (currentScreen !== selectedScreen) {
      setSelectedScreen(currentScreen);
    }
    // else if (currentScreen === undefined) {
    //   setSelectedScreen('TabStack');
    // }
  }, [currentScreen, mainNavigation, reloadKey, selectedScreen]);

  const navigationView = () => (
    <View style={styles.drawer}>
      <ScrollView>
        <View style={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <View style={styles.headerRow}>
              <Image
                source={require('../assets/images/focus_rt.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.companyName}>{companyName}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.drawerItem,
              selectedScreen === 'TabStack'
                ? {backgroundColor: 'white'}
                : {backgroundColor: 'white'},
            ]}
            onPress={() => {
              drawerRef.current?.closeDrawer();
              setReloadCategory(prevState => !prevState); // Toggle the state to trigger a reload
              mainNavigation.navigate('TabStack'); // Navigate to the desired screen
              setSelectedScreen('TabStack');
              const currentScreen =
                mainNavigation.getState()?.routes[
                  mainNavigation.getState()?.index
                ]?.name;

              if (currentScreen !== selectedScreen) {
                console.log('currentScreen', currentScreen);
                // setSelectedScreen(currentScreen);
              }
              setReloadKey(prev => !prev);
            }}>
            <View style={styles.menuItem}>
              <FontAwesomeIcon icon={faShoppingBag} size={25} color="#0f6cbd" />
              <Text style={styles.menuItemText}>Orders</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.drawerItem,
              selectedScreen === 'SalesReturnsPage'
                ? {backgroundColor: 'white'}
                : {backgroundColor: 'white'},
            ]}
            onPress={() => {
              setReloadKey(prev => !prev);
              drawerRef.current?.closeDrawer();
              mainNavigation.navigate('SalesReturnsPage'); // Navigate to the desired screen
              const currentScreen =
                mainNavigation.getState()?.routes[
                  mainNavigation.getState()?.index
                ]?.name;

              setSelectedScreen('SalesReturnsPage');
              if (currentScreen !== selectedScreen) {
                console.log('currentScreen', currentScreen);
              }
            }}>
            <View style={styles.menuItem}>
              {/* Return */}
              <FontAwesomeIcon icon={faRightLeft} size={25} color="#0f6cbd" />
              <Text style={styles.menuItemText}>Sales Return</Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            mainNavigation.navigate('CategoryItems'); // Navigate to the desired screen
          }}>
          <View style={styles.menuItem}>
            <FontAwesomeIcon icon={faMoneyBillWave} size={20} color="#0f6cbd" />
            <Text style={styles.menuItemText}>Collections</Text>
          </View>
        </TouchableOpacity> */}
          {/* 
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={async () => {
            drawerRef.current?.closeDrawer();
            setIsLoading(true);
            try {
              const result = await syncCustomers();
              alert(result.message);
              setReloadCategory(prevState => !prevState);
            } catch (error: any) {
              alert('Failed to sync customers: ' + error.message);
            } finally {
              setIsLoading(false);
            }
          }}>
          <View style={styles.menuItem}>
            <FontAwesomeIcon icon={faUsers} size={20} color="#0f6cbd" />
            <Text style={styles.menuItemText}>Sync Customers</Text>
          </View>
        </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={async () => {
              drawerRef.current?.closeDrawer();
              setIsLoading(true);
              try {
                const result: any = await syncItems();
                alert(result.message);
                setReloadCategory(prevState => !prevState);
              } catch (error: any) {
                alert('Failed to sync items: ' + error.message);
              } finally {
                setIsLoading(false);
              }
            }}>
            <View style={styles.menuItem}>
              <FontAwesomeIcon icon={faBoxes} size={25} color="#0f6cbd" />
              <Text style={styles.menuItemText}>Sync Items</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={async () => {
              drawerRef.current?.closeDrawer();
              setIsLoading(true);
              try {
                const result: any = await syncStock();
                alert(result.message);
                setReloadCategory(prevState => !prevState);
              } catch (error: any) {
                alert('Failed to sync items: ' + error.message);
              } finally {
                setIsLoading(false);
              }
            }}>
            <View style={styles.menuItem}>
              <FontAwesomeIcon
                icon={faCubesStacked}
                size={25}
                color="#0f6cbd"
              />
              <Text style={styles.menuItemText}>Sync Available Stock</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={async () => {
              drawerRef.current?.closeDrawer();
              setIsLoading(true);
              try {
                const result = await syncPrices();
                alert(result.message);
                setReloadCategory(prevState => !prevState);
              } catch (error: any) {
                alert('Failed to sync Prices: ' + error.message);
              } finally {
                setIsLoading(false);
              }
            }}>
            <View style={styles.menuItem}>
              <FontAwesomeIcon icon={faTags} size={25} color="#0f6cbd" />
              <Text style={styles.menuItemText}>Sync Prices</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={
              orderCount > 0
                ? async () => {
                    drawerRef.current?.closeDrawer();
                    setIsLoading(true);
                    try {
                      await getSyncOrders(); // Call getSyncOrders
                      setReloadCategory(prevState => !prevState); // Toggle the state to trigger a reload
                      setReloadKey(prev => !prev); // Set the value of reloadKey
                      console.log('Sync Orders pressed');
                    } catch (error) {
                      console.error('Error syncing orders:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                : () => {
                    drawerRef.current?.closeDrawer();
                    alert('No orders to sync'); // Show alert if orderCount is 0
                  }
            } // Show alert if orderCount is 0
            // disabled={orderCount === 0} // Disable the button if orderCount is 0
          >
            <View style={styles.menuItem}>
              <FontAwesomeIcon
                icon={faCartFlatbedSuitcase}
                size={25}
                color="#0f6cbd"
              />
              <Text style={styles.menuItemText}>
                Sync Orders
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCount}</Text>
                </View>
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={
              returnCount > 0
                ? async () => {
                    drawerRef.current?.closeDrawer();
                    setIsLoading(true);
                    try {
                      await getSyncReturns(); // Call getSyncReturns
                      // setReloadCategory(prevState => !prevState); // Toggle the state to trigger a reload
                      setReloadKey(prev => !prev); // Set the value of reloadKey
                      console.log('Sync Orders pressed');
                    } catch (error) {
                      console.error('Error syncing orders:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                : () => {
                    drawerRef.current?.closeDrawer();
                    alert('No orders to sync'); // Show alert if orderCount is 0
                  }
            } // Show alert if orderCount is 0
            // disabled={orderCount === 0} // Disable the button if orderCount is 0
          >
            <View style={styles.menuItem}>
              <FontAwesomeIcon
                icon={faCartArrowDown}
                size={25}
                color="#0f6cbd"
              />
              <Text style={styles.menuItemText}>
                Sync Sales Return
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{returnCount}</Text>
                </View>
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View>
        <View style={[styles.focusimageContainer]}>
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

        {/* Logout button at bottom */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            drawerRef.current?.closeDrawer();
            handleLogout();
          }}>
          <View style={styles.menuItem}>
            <FontAwesomeIcon icon={faSignOutAlt} size={20} color="#dc3545" />
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Modify the return statement to wrap everything in the drawer
  return (
    <PaperProvider>
      {isLoading && renderLoadingView()}
      {/* <NavigationContainer> */}
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={navigationView}
        drawerLockMode={isLoading ? 'locked-closed' : 'unlocked'}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: {backgroundColor: '#4f81ab'},
            headerTintColor: 'white',
            headerTitleStyle: {fontWeight: 'bold'},
          }}>
          <Stack.Screen
            name="PreferencesPage"
            children={props => (
              <PreferencesPage
                SessionId={undefined}
                handleBackPage={handleBackPage}
                {...props} // Pass any additional props if needed
              />
            )}
          />
          <Stack.Screen name="TabStack">
            {props => (
              <TabStack
                {...props}
                onDataFromFeatures={handleDataFromFeatures}
                onDataFromCart={handleDataFromCart}
                backPageClicked={backPageClicked}
                drawerRef={drawerRef}
                reloadCategory={reloadCategory}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="CategoryItems"
            children={props => (
              <CategoryItems
                SessionId={SessionId}
                handleBackPage={handleBackPage}
                {...props} // Pass any additional props if needed
              />
            )}
          />
          <Stack.Screen
            name="SalesReturnsPage"
            children={props => (
              <SalesReturnsPage
                onData={function (data: any): void {
                  console.log('SalesReturnsPage', data);
                  setReloadKey(prev => !prev);
                }}
                // handleBackPage={handleBackPage}
                drawerRef={drawerRef}
                {...props} // Pass any additional props if needed
              />
            )}
          />
        </Stack.Navigator>
      </DrawerLayoutAndroid>
      {/* </NavigationContainer> */}
    </PaperProvider>
  );
}

// Add styles at the bottom of the file
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 10,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  drawer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,

    justifyContent: 'space-between',
  },
  drawerContent: {
    flex: 1,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  drawerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  focusimageContainer: {
    marginBottom: 10,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusimage: {
    width: 35, // Adjust width as needed
    height: 35, // Adjust height as needed
    // marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#dc3545',
  },
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    width: 40, // Reduced size to fit beside text
    height: 40,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f6cbd',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default MainTabs;
