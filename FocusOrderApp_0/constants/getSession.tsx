import AsyncStorage from '@react-native-async-storage/async-storage';

let storedHostname;
declare function alert(message?: any): void;

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

const getSession = async () => {
  try {
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
      const url = `http://${storedHostname}/focus8API/Login`;
      const raw = {
        data: [
          {
            Password: `${storedPassword}`,
            UserName: `${storedUsername}`,
            CompanyCode: `${storedCompanyCode}`,
          },
        ],
      };
      const fSessionId = await fetchDataFromApi(url, raw);
      console.log(fSessionId);
      if (fSessionId !== undefined) {
        console.log(
          'sessionIDfrom function',
          fSessionId?.data?.[0]?.fSessionId,
        );
        return fSessionId?.data?.[0]?.fSessionId;
      } else {
        clearData();
      }
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
};

const fetchDataFromApi = async (url: any, requestData: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    console.log('response', response);
    if (!response?.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data?.result === 1) {
      console.log('JsonData', data);
      // alert(data.data[0].fSessionId);
      // setApiData(data);
      return data;
    } else {
      alert(data?.message);
      return;
    }
  } catch (error) {
    console.error('There was a problem with the fetch request:', error);
    alert(error);
  }
};

export default getSession;
