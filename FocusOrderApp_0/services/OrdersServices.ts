import { getDBConnection } from './SQLiteService';

export const insertSalesOrder = async (salesOrderData: any, salesReceiptBody:any,consumedQty: any[]) => {
  const db = await getDBConnection();
  try {
    await db.executeSql(
      'INSERT INTO SalesOrders (salessInvoicedata, salesReceiptdata,consumedQtydata) VALUES (?, ?, ?)',
      [JSON.stringify(salesOrderData), JSON.stringify(salesReceiptBody),JSON.stringify(consumedQty)], // Assuming you want to store the entire response as a JSON string
    );
    console.log('Sales order saved to local database.');
  } catch (error) {
    console.error('Error saving sales order to local database:', error);
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
