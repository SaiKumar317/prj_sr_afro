import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection, createPricesTable, insertPrices } from '../services/SQLiteService';

export const syncPrices = async () => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const storedFocusSession = await AsyncStorage.getItem('focusSessoin');

    if (!storedHostname || !storedFocusSession) {
      throw new Error('Missing hostname or session information');
    }
 const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    const response = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': storedFocusSession,
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT 
                    p.iMasterId ProductId, 
                    p.sName ProductName,
                    p.sCode ProductCode,
                    ISNULL((SELECT TOP 1 CAST(fVal0 AS VARCHAR) + ',' + CAST(iTagId AS VARCHAR) + ',' + CAST(fVal1 AS VARCHAR) + ','+ CAST(fVal2 AS VARCHAR) + ','+ CAST(fVal3 AS VARCHAR) + ','+ CAST(fVal4 AS VARCHAR) + ',' + CONVERT(VARCHAR, dbo.IntToDate(spb.iEndDate), 103)  
                            FROM mCore_SellingPriceBookDetails spb 
                            JOIN mCore_SellingPriceBookHeader sph ON spb.iPriceBookId = sph.iPriceBookId
                            WHERE spb.iProductId = p.iMasterId 
                            AND sph.bActive = 1 
                            AND sph.bMarkDeleted = 0 
                            AND dbo.DateToInt(GETDATE()) BETWEEN spb.iStartDate 
                            AND CASE WHEN spb.iEndDate = 0 THEN dbo.DateToInt(GETDATE()) 
                            ELSE spb.iEndDate END
                            ORDER BY CASE WHEN spb.iEndDate = 0 THEN dbo.DateToInt(GETDATE()) 
                            ELSE spb.iEndDate END DESC), 0) AS sellerPB
                  FROM mCore_Product p 
                  JOIN muCore_Product mp ON mp.iMasterId = p.iMasterId
                  WHERE iStatus = 0 AND bGroup = 0 AND p.iMasterId <> 0`,
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
      await createPricesTable(db);  // Create the Prices table
      await insertPrices(db, data.data[0].Table);  // Insert the price data

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} prices`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync prices');
    }

  } catch (error: any) {
    console.error('Error syncing prices:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync prices',
      error,
    };
  }
};

