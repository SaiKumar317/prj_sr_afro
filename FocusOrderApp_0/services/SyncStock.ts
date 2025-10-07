import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDBConnection,
  createStockTable,
  insertStockData,
  dropTable,
} from '../services/SQLiteService';

export const syncStock = async () => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const storedFocusSession = await AsyncStorage.getItem('focusSessoin');
    var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
      'POSSalePreferenceData',
    );
    var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
    console.log(
      'storedPOSSalePreferenceData',
      parsedPOSSalesPreferences?.warehouseId,
    );
    if (!storedHostname || !storedFocusSession) {
      throw new Error('Missing hostname or session information');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    const batchQuery = `
select sBatchNo, iBatchId,iExpiryDate, iExpiryDateId,sum(Batch_Qty) BatchQty, iProduct,iInvTag, iMfDate from (
select i.iProduct, b.sBatchNo, b.iBatchId,convert(varchar,dbo.IntToDate(b.iExpiryDate),103) iExpiryDate,b.iExpiryDate iExpiryDateId, d.iInvTag,b.iMfDate,
sum(i.fQuantityInBase) Batch_Qty,MIN(iDate) VoucherDate from tCore_Header_0 h
join tCore_Data_0 d on d.iHeaderId = h.iHeaderId 
join tCore_Indta_0 i on i.iBodyId = d.iBodyId
join tCore_Batch_0 b on b.iBodyId = d.iBodyId 
where
--i.iProduct = {Item} and 
d.iInvTag = ${parsedPOSSalesPreferences?.warehouseId} and
h.iDate <= dbo.DateToInt(getdate())
and h.bUpdateStocks = 1 
and h.bSuspended = 0 and h.iAuth = 1 and d.bSuspendUpdateStocks = 0 
group by i.iProduct, b.sBatchNo, b.iBatchId , b.iExpiryDate,d.iInvTag, iMfDate
having sum(i.fQuantityInBase) <> 0 and  b.iExpiryDate>=dbo.DateToInt(GETDATE())
)a
group by sBatchNo, iBatchId ,iExpiryDate,iExpiryDateId, iProduct,iInvTag, iMfDate
HAVING SUM(a.Batch_Qty) > 0
order by iExpiryDate
`;
    let batchQuery1 = `SELECT
	MAX(b.sBatchNo) AS sBatchNo,       -- Pick a representative batch name per batch id
	b.iBatchId,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN CONVERT(varchar, dbo.IntToDate(MAX(b.iExpiryDate)), 103) 
        ELSE NULL 
    END AS iExpiryDate,
    CASE 
        WHEN SUM(i.fQuantityInBase) > 0 THEN MAX(b.iExpiryDate) 
        ELSE NULL 
    END AS iExpiryDateId,
    SUM(i.fQuantityInBase) AS BatchQty,
	  i.iProduct,
    d.iInvTag,
    MAX(b.iMfDate) AS iMfDate--,
    --MIN(h.iDate) AS VoucherDate,
    --MAX(h.sVoucherNo) AS sVoucherNo,
    --MAX(h.iVoucherType) AS iVoucherType,
    --MAX(d.iBodyId) AS iBodyId
FROM tCore_Header_0 h
JOIN tCore_Data_0 d   ON d.iHeaderId = h.iHeaderId 
JOIN tCore_Indta_0 i  ON i.iBodyId = d.iBodyId
JOIN tCore_Batch_0 b  ON b.iBodyId = d.iBodyId 
WHERE
    --i.iProduct = 16935 AND 
	d.iInvTag = ${parsedPOSSalesPreferences?.warehouseId}
    AND h.iDate <= dbo.DateToInt(GETDATE())
    AND h.bUpdateStocks = 1
    AND h.bSuspended = 0
    AND d.iAuthStatus < 2
    AND d.bSuspendUpdateStocks = 0 
GROUP BY
    i.iProduct,
    b.iBatchId,
    d.iInvTag
HAVING
    SUM(i.fQuantityInBase) <> 0
	order by iExpiryDate;`;
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
              Query: batchQuery1,
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

    if (data.result === 1 && data.data?.[0]?.Table) {
      const db = await getDBConnection();
      // await dropTable(db, 'Stock');
      await createStockTable(db); // Create the Stock table
      await insertStockData(db, data.data[0].Table); // Insert the stock data

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} stock items`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync stock');
    }
  } catch (error: any) {
    console.error('Error syncing stock:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync stock',
      error,
    };
  }
};
