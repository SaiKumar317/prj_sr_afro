import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDBConnection} from './SQLiteService';

export const insertSalesOrder = async (
  salesOrderData: any,
  salesReceiptBody: any,
  consumedQty: any[],
  categoryItems: any,
) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO SalesOrders (salessInvoicedata, salesReceiptdata,consumedQtydata,categoryItems) VALUES (?, ?, ?, ?)',
      [
        salesOrderData,
        JSON.stringify(salesReceiptBody),
        JSON.stringify(consumedQty),
        JSON.stringify(categoryItems),
      ], // Assuming you want to store the entire response as a JSON string
    );
    console.log('Sales order saved to local database.');
  } catch (error) {
    console.error('Error saving sales order to local database:', error);
  }
};

export const insertSalesReturn = async (
  salesReturnData: any,
  salesReturnReceiptBody: any,
) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO SalesReturn (salesReturndata, salesReturnReceiptdata) VALUES (?, ?)',
      [salesReturnData, JSON.stringify(salesReturnReceiptBody)], // Assuming you want to store the entire response as a JSON string
    );
    console.log('Sales Return saved to local database.');
  } catch (error) {
    console.error('Error saving sales Return to local database:', error);
  }
};

export const insertMaterialRequest = async (MaterialRequestdata: any) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO MaterialRequest (MaterialRequestdata) VALUES (?)',
      [MaterialRequestdata], // Assuming you want to store the entire response as a JSON string
    );
    console.log('MaterialRequest saved to local database.');
  } catch (error) {
    console.error('Error saving MaterialRequest to local database:', error);
  }
};
export const insertExpense = async (ExpenseRequest: any) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO Expense (ExpenseRequestData) VALUES (?)',
      [ExpenseRequest], // Assuming you want to store the entire response as a JSON string
    );
    console.log('Expense saved to local database.');
  } catch (error) {
    console.error('Error saving Expense to local database:', error);
  }
};

export const createMaterialRequestTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS MaterialRequest (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      MaterialRequestdata TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.executeSql(query);
    console.log('MaterialRequest table created successfully.');
  } catch (error) {
    console.error('Error creating MaterialRequest table:', error);
  }
};
export const createExpenseTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS Expense (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ExpenseRequestData TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.executeSql(query);
    console.log('ExpenseRequest table created successfully.');
  } catch (error) {
    console.error('Error creating ExpenseRequest table:', error);
  }
};

export const createSalesOrdersTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS SalesOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salessInvoicedata TEXT NOT NULL,
      salesReceiptdata TEXT NOT NULL,
      consumedQtydata TEXT NOT NULL,
      categoryItems TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.executeSql(query);
    console.log('SalesOrders table created successfully.');
  } catch (error) {
    console.error('Error creating SalesOrders table:', error);
  }
};
export const createSalesReturnTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS SalesReturn (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salesReturndata TEXT NOT NULL,
      salesReturnReceiptdata TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.executeSql(query);
    console.log('SalesReturn table created successfully.');
  } catch (error) {
    console.error('Error creating SalesReturn table:', error);
  }
};
export const createExpenseAccTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS ExpenseAccount (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountName TEXT NOT NULL,
      accountId INTEGER NOT NULL UNIQUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.executeSql(query);
    console.log('SalesReturn table created successfully.');
  } catch (error) {
    console.error('Error creating SalesReturn table:', error);
  }
};
export const insertExpenseAcc = async (db: any, expenseAccData: any[]) => {
  const insertQuery =
    'INSERT INTO ExpenseAccount (accountName, accountId) VALUES (?, ?) ON CONFLICT(accountId) DO UPDATE SET accountName=excluded.accountName';

  try {
    for (const item of expenseAccData) {
      await db.executeSql(insertQuery, [item.label, item.value]);
    }
    console.log('ExpenseAccount data inserted successfully.');
  } catch (error) {
    console.error('Error inserting ExpenseAccount data:', error);
  }
};

export const getSalesOrderCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM SalesOrders',
    );
    return results.rows.item(0).count; // Return the count of orders
  } catch (error) {
    console.error('Error fetching sales order count:', error);
    return 0; // Return 0 in case of error
  }
};
export const getSalesReturnCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM SalesReturn',
    );
    return results.rows.item(0).count; // Return the count of orders
  } catch (error) {
    console.error('Error fetching sales Return count:', error);
    return 0; // Return 0 in case of error
  }
};
export const getMaterialRequestCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM MaterialRequest',
    );
    return results.rows.item(0).count; // Return the count of orders
  } catch (error) {
    console.error('Error fetching sales Return count:', error);
    return 0; // Return 0 in case of error
  }
};
export const getExpenseCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql(
      'SELECT COUNT(*) as count FROM Expense',
    );
    return results.rows.item(0).count; // Return the count of orders
  } catch (error) {
    console.error('Error fetching sales Return count:', error);
    return 0; // Return 0 in case of error
  }
};

export const getAllSalesOrders = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT * FROM SalesOrders');
    const salesOrders = [];
    for (let i = 0; i < results.rows.length; i++) {
      salesOrders.push(results.rows.item(i));
    }
    return salesOrders; // Return the array of sales orders
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return []; // Return an empty array in case of error
  }
};
export const getAllSalesReturns = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT * FROM SalesReturn');
    const salesReturns = [];
    for (let i = 0; i < results.rows.length; i++) {
      salesReturns.push(results.rows.item(i));
    }
    return salesReturns; // Return the array of sales orders
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return []; // Return an empty array in case of error
  }
};
export const getAllMaterialRequest = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT * FROM MaterialRequest');
    const materialRequests = [];
    for (let i = 0; i < results.rows.length; i++) {
      materialRequests.push(results.rows.item(i));
    }
    return materialRequests; // Return the array of materialRequests
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return []; // Return an empty array in case of error
  }
};
export const getAllExpense = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT * FROM Expense');
    const ExpenseRequests = [];
    for (let i = 0; i < results.rows.length; i++) {
      ExpenseRequests.push(results.rows.item(i));
    }
    return ExpenseRequests; // Return the array of ExpenseRequests
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return []; // Return an empty array in case of error
  }
};

export const deletePostedOrderFromLocalTable = async (orderId: number) => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DELETE FROM SalesOrders WHERE id = ?', [orderId]);
    console.log(`Order with ID ${orderId} deleted from local database.`);
  } catch (error) {
    console.error('Error deleting order from local database:', error);
  }
};
export const deletePostedSalesReturnFromLocalTable = async (
  orderId: number,
) => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DELETE FROM SalesReturn WHERE id = ?', [orderId]);
    console.log(`Order with ID ${orderId} deleted from local database.`);
  } catch (error) {
    console.error('Error deleting order from local database:', error);
  }
};
export const deletePostedMaterialRequestFromLocalTable = async (
  orderId: number,
) => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DELETE FROM MaterialRequest WHERE id = ?', [orderId]);
    console.log(`Order with ID ${orderId} deleted from local database.`);
  } catch (error) {
    console.error('Error deleting order from local database:', error);
  }
};
export const deletePostedExpenseRequestFromLocalTable = async (
  orderId: number,
) => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DELETE FROM Expense WHERE id = ?', [orderId]);
    console.log(`Order with ID ${orderId} deleted from local database.`);
  } catch (error) {
    console.error('Error deleting order from local database:', error);
  }
};

// for receipts validations\

export const createVoucherTransactionTable = async () => {
  const db = await getDBConnection();
  const query = `
    CREATE TABLE IF NOT EXISTS VoucherTransaction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sVoucherNo TEXT,
      iHeaderId INTEGER,
      TransactionID TEXT NOT NULL,
      PaymentType INTEGER NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(TransactionID) -- or use (sVoucherNo, iHeaderId, TransactionID) if you want composite uniqueness
    );
  `;

  try {
    await db.executeSql(query);
    console.log('VoucherTransaction table created successfully.');
  } catch (error) {
    console.error('Error creating VoucherTransaction table:', error);
  }
};
export const insertVoucherTransactions = async (
  db: any,
  transactionData: any[],
) => {
  const insertQuery = `
    INSERT INTO VoucherTransaction (sVoucherNo, iHeaderId, TransactionID, PaymentType)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(TransactionID) DO UPDATE SET
      sVoucherNo = excluded.sVoucherNo,
      iHeaderId = excluded.iHeaderId,
      PaymentType = excluded.PaymentType
  `;

  try {
    for (const item of transactionData) {
      await db.executeSql(insertQuery, [
        item.sVoucherNo,
        item.iHeaderId,
        item.TransactionID,
        item.PaymentType,
      ]);
    }
    console.log('VoucherTransaction data inserted successfully.');
  } catch (error) {
    console.error('Error inserting VoucherTransaction data:', error);
  }
};
export const getAllVoucherTransactions = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT * FROM VoucherTransaction');
    const voucherTransactions = [];
    for (let i = 0; i < results.rows.length; i++) {
      voucherTransactions.push(results.rows.item(i));
    }
    return voucherTransactions;
  } catch (error) {
    console.error('Error fetching voucher transactions:', error);
    return [];
  }
};

export const syncVoucherTransactions = async () => {
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
select h.sVoucherNo,h.iHeaderId, eb.TransactionID, eb.PaymentType from tCore_Header_0 h
	join tCore_Data_0 d on d.iHeaderId = h.iHeaderId
	join tCore_Data4101_0 eb on eb.iBodyId = d.iBodyId
	where h.iVoucherType = 4101 AND eb.TransactionID IS NOT NULL and eb.PaymentType <> 0;`,
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
      // await deleteAllVoucherTransactions(); // Drop the existing VoucherTransaction table
      await createVoucherTransactionTable(); // Create the VoucherTransaction table
      await insertVoucherTransactions(db, data.data[0].Table); // Insert the VoucherTransaction data

      return {
        success: true,
        message: `Successfully synced ${data.data[0].Table.length} Voucher Transactions`,
        data: data.data[0].Table,
      };
    } else {
      throw new Error(data.message || 'Failed to sync Voucher Transactions');
    }
  } catch (error: any) {
    console.error('Error syncing Voucher Transactions:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync Voucher Transactions',
      error,
    };
  }
};

// drop VoucherTransaction for testing
export const deleteAllVoucherTransactions = async () => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DROP TABLE IF EXISTS VoucherTransaction');
    console.log('VoucherTransaction table dropped successfully.');
  } catch (error) {
    console.error('Error dropping VoucherTransaction table:', error);
  }
};
