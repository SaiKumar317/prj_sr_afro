import { getDBConnection } from './SQLiteService';

export const insertSalesOrder = async (salesOrderData: any, salesReceiptBody:any,consumedQty: any[],categoryItems:any) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO SalesOrders (salessInvoicedata, salesReceiptdata,consumedQtydata,categoryItems) VALUES (?, ?, ?, ?)',
      [salesOrderData, JSON.stringify(salesReceiptBody),JSON.stringify(consumedQty), JSON.stringify(categoryItems)], // Assuming you want to store the entire response as a JSON string
    );
    console.log('Sales order saved to local database.');
  } catch (error) {
    console.error('Error saving sales order to local database:', error);
  }
};
export const insertSalesReturn = async (salesReturnData: any, salesReturnReceiptBody:any) => {
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

export const getSalesOrderCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT COUNT(*) as count FROM SalesOrders');
    return results.rows.item(0).count; // Return the count of orders
  } catch (error) {
    console.error('Error fetching sales order count:', error);
    return 0; // Return 0 in case of error
  }
};
export const getSalesReturnCount = async () => {
  const db = await getDBConnection();
  try {
    const [results] = await db.executeSql('SELECT COUNT(*) as count FROM SalesReturn');
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

export const deletePostedOrderFromLocalTable = async (orderId: number) => {
  const db = await getDBConnection();
  try {
    await db.executeSql('DELETE FROM SalesOrders WHERE id = ?', [orderId]);
    console.log(`Order with ID ${orderId} deleted from local database.`);
  } catch (error) {
    console.error('Error deleting order from local database:', error);
  }
};
