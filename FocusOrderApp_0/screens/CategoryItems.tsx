/* eslint-disable react-native/no-inline-styles */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';

import {Provider as PaperProvider} from 'react-native-paper';

import {TouchableOpacity, View, Text} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowLeft, faCartShopping} from '@fortawesome/free-solid-svg-icons';
import renderLoadingView from '../constants/LoadingView';
import CategoryItemsPage from '../pages/CategoryItemsPage';

let masterResponse = '';

function CategoryItems({
  SessionId,
  handleBackPage,
  navigation,
  route,
}: {
  SessionId: any;
  handleBackPage: (message: string) => void; // updated type
  navigation: any;
  route: any;
}) {
  console.log(SessionId);
  const [reloadKey, setReloadKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const reloadPage = () => {
    setReloadKey(reloadKey + 1);
  };
  useEffect(() => {
    getSelectedCategory();
  }, []);

  // Assuming you are using 'useState' to track parsedSelectedCategory
  const [parsedSelectedCategory, setParsedSelectedCategory] =
    useState<any>(null);

  async function getSelectedCategory() {
    try {
      const selectedCategory: any = await AsyncStorage.getItem(
        'selectedCategory',
      );
      const parsedCategory = selectedCategory
        ? JSON.parse(selectedCategory)
        : null;
      console.log('Fetched selectedCategory:', parsedCategory);
      setParsedSelectedCategory(parsedCategory); // Update the state
    } catch (error) {
      console.error('Error getting selectedCategory:', error);
    }
  }

  useEffect(() => {
    // Your logic here to reload the page, if needed
  }, [reloadKey]);
  const dateToInt = (date: {
    getDate: () => number;
    getMonth: () => number;
    getFullYear: () => number;
  }) => {
    return (
      date.getDate() + (date.getMonth() + 1) * 256 + date.getFullYear() * 65536
    );
  };

  const handleCategoryItemsPage = (data: React.SetStateAction<any>) => {
    setIsLoading(data?.isLoading);

    if (data?.isbackPressed === true) {
      handleBackPage('');
    }
  };

  return (
    <>
      <PaperProvider>
        {isLoading && renderLoadingView()}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#0f6cbd',
            padding: 5,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()} //onPress={() => handleBackPage('')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize: 18, marginRight: 'auto'}}>
            {parsedSelectedCategory?.CategoryName}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart', {refresh: true})} //onPress={() => handleBackPage('Cart')}
            >
              <View style={{alignItems: 'center', marginRight: 15}}>
                <FontAwesomeIcon
                  icon={faCartShopping}
                  size={23}
                  color="white"
                />
                <Text
                  style={{color: 'white', fontSize: 10, textAlign: 'center'}}>
                  Go To Cart
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <CategoryItemsPage
          onData={handleCategoryItemsPage}
          masterResponse={masterResponse}
          // gridDataresponse={selectedValues}
          reloadPage={reloadKey}
          selectedCategory={parsedSelectedCategory} // Pass the state directly
        />
      </PaperProvider>
    </>
  );
}

export default CategoryItems;
