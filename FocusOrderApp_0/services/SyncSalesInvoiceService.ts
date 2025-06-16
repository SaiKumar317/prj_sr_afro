import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDBConnection,
  createPricesTable,
  insertPrices,
  createSalesInvoicePendingTable,
  insertSalesInvoicesPending,
  createSalesInvoiceDetailsTable,
  insertSalesInvoiceDetails,
} from '../services/SQLiteService';

export const syncSalesInvoicesPending = async () => {
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
              Query: `
select *
from(
select h.sVoucherNo, h.iHeaderId,
        CASE 
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0
            AND ISNULL(SUM(vl.Base), 0) > ISNULL(SUM(vl.Balance), 0) THEN 'Partial Consumed'
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0 THEN 'Pending'
ELSE '' END [LinkStatus],d.iFaTag [companyBranchId],tag.iTag6 [branchId]
    FROM tCore_Header_0 h
        --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
        JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
        join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
        JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
        LEFT JOIN vCore_AllLinks219023107_0 vl ON vl.iRefId = d.iTransactionId
    WHERE h.iVoucherType=3342 AND
        (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0
        and bClosed<>1 and d.iFaTag=${parsedPOSSalesPreferences?.compBranchId} and tag.iTag6=${parsedPOSSalesPreferences?.Branch}
    GROUP BY 
h.iHeaderId,h.iDate, h.sVoucherNo,d.iFaTag, tag.iTag6 ) a
where a.[LinkStatus]<>''

order by iHeaderId;


select distinct h.sVoucherNo, h.iHeaderId, d.iBodyId, abs(ind.fQuantity) [orderQty], ind.iProduct, vl.Balance,ind.mRate
,indb.mInput0 [discountP] ,indb.mInput1 [discountAmt], indb.mInput3 [vat], indb.mInput4 [excise],b.iBatchId, b.sBatchNo, b.iExpiryDate
,d.iFaTag [companyBranchId],tag.iTag6 [branchId],hd.POSCustomerMobileNumber, hd.POSCustomerName, h.iDate [invoiceDate], b.iMfDate
FROM tCore_Header_0 h
    --JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
    JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
    JOIN tCore_Batch_0 b ON b.iBodyId = d.iBodyId
    JOIN tCore_HeaderData3342_0 hd ON hd.iHeaderId = h.iHeaderId        
    join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
    JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
    JOIN tCore_IndtaBodyScreenData_0 indb ON indb.iBodyId = d.iBodyId
    LEFT JOIN vCore_AllLinks219023107_0 vl ON vl.iRefId = d.iTransactionId
WHERE h.iVoucherType=3342 AND
    (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0
    and bClosed<>1 and d.iFaTag=${parsedPOSSalesPreferences?.compBranchId} and tag.iTag6=${parsedPOSSalesPreferences?.Branch}
order by h.iHeaderId desc, iBodyId;`,
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
      await createSalesInvoicePendingTable(db); // Create the SalesInvoicePending table
      await insertSalesInvoicesPending(db, data.data[0].Table); // Insert the SalesInvoicePending data
      await createSalesInvoiceDetailsTable(db); // Create the SalesInvoiceDetails table
      await insertSalesInvoiceDetails(db, data.data[0].Table1); // Insert the SalesInvoiceDetails data

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} Sales Invoice`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync Sales Invoice');
    }
  } catch (error: any) {
    console.error('Error syncing SalesInvoicePending:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync Sales Invoice',
      error,
    };
  }
};
