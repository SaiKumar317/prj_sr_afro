import { getDBConnection } from './SQLiteService';

export const createCartTable = async () => {
  const db = await getDBConnection();
  const query = `CREATE TABLE IF NOT EXISTS Cart (
    ProductId INTEGER PRIMARY KEY,
    Quantity INTEGER
  );`;
  await db.executeSql(query);
};

export const addToCart = async (productId: number, quantity: number) => {
  const db = await getDBConnection();
  await db.executeSql(
    'INSERT OR REPLACE INTO Cart (ProductId, Quantity) VALUES (?, ?);',
    [productId, quantity]
  );
};

export const removeFromCart = async (productId: number) => {
  const db = await getDBConnection();
  await db.executeSql(
    'DELETE FROM Cart WHERE ProductId = ?;',
    [productId]
  );
};

export const getCartItems = async () => {
  const db = await getDBConnection();
  const [results] = await db.executeSql('SELECT * FROM Cart;');
  const cartItems = [];
  for (let i = 0; i < results.rows.length; i++) {
    cartItems.push(results.rows.item(i));
    }
    // console.log("getCartItems",cartItems);
  return cartItems;
};


// Function to delete all cart data from the specified tables
export const deleteAllCartData = async () => {
  try {
    const db = await getDBConnection();

    // Delete data from all required tables
    await db.executeSql('DELETE FROM Cart;');

    console.log('All cart data deleted from the table.');
  } catch (error) {
    console.error('Error deleting all cart data:', error);
  }
};
