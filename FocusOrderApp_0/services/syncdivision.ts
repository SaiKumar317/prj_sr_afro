import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDBConnection,
  createSubDivisionTable,
  createDivisionTable,
  insertSubDivision,
  insertDivision,
} from '../services/SQLiteService';

export const syncDivision = async () => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const storedFocusSession = await AsyncStorage.getItem('focusSessoin');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);

    if (!storedHostname || !storedFocusSession) {
      throw new Error('Missing hostname or session information');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    const response = await fetch(
      `${storedHostname}/focus8API/utility/executesqlquery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSession,
        },
        body: JSON.stringify({
          data: [
            {
              Query: `select sd.sName,sd.sCode  ,sd.iMasterId, usd.Division from mCore_division sd
join muCore_division usd on usd.iMasterId = sd.iMasterId
where sd.iMasterId != 0 and sd.iStatus <> 5 and sd.bGroup = 0;
select sName, sCode, iMasterId from mCore_companybranch
where iMasterId != 0 and iStatus <> 5;`,
            },
          ],
        }),
        signal: controller.signal, // Attach the abort signal
      },
    );
    clearTimeout(timeoutId); // Clear the timeout if the request completes in time

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.result === 1 && data.data?.[0]?.Table && data.data?.[0]?.Table1) {
      const db = await getDBConnection();
      await createSubDivisionTable(db); // Create the SubDivision table
      await insertSubDivision(db, data.data[0].Table); // Insert the SubDivision data
      await createDivisionTable(db); // Create the Division table
      await insertDivision(db, data.data[0].Table1); // Insert the Division data

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} Sub Division`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync SubDivision');
    }
  } catch (error: any) {
    console.error('Error syncing Sub Division:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync Sub Division',
      error,
    };
  }
};
