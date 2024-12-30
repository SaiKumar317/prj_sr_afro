import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection, createCustomersTable, insertCustomers } from './SQLiteService';

export const syncCustomers = async () => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const storedFocusSession = await AsyncStorage.getItem('focusSessoin');

    if (!storedHostname || !storedFocusSession) {
      throw new Error('Missing hostname or session information');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 5 seconds timeout

    const response = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': storedFocusSession,
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT iMasterId as accountId, sName as accountName, sCode as accountCode 
                 FROM mCore_Account 
                 WHERE iAccountType = 5 AND iStatus = 0 AND bGroup = 0`,
        }],
      }),
       signal: controller.signal, // Attach the abort signal
    });
clearTimeout(timeoutId); // Clear the timeout if the request completes in time

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.result === 1 && data.data?.[0]?.Table) {
      const db = await getDBConnection();
      await createCustomersTable(db);
      await insertCustomers(db, data.data[0].Table);

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} customers`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync customers');
    }

  } catch (error:any) {
    console.error('Error syncing customers:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync customers',
      error,
    };
  }
};
