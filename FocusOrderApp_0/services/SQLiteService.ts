import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

// const database_name = 'LocalDatabase.db';
const database_version = '1.0';
const database_displayname = 'SQLite Local Database';
const database_size = -1;

export const getDBConnection = async () => {
  try {

     // Retrieve company code from AsyncStorage
    const companyCode = await AsyncStorage.getItem('companyCode');

    if (!companyCode) {
      throw new Error('Company code is not set');
    }

    // Dynamically create the database name with the company code as a suffix
    const database_name = `LocalDatabase_${companyCode}.db`;
    const db = await SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size
    );
    console.log('Database opened successfully');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

export const createCustomersTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS Customers (
    accountId INTEGER PRIMARY KEY,
    accountName TEXT,
    accountCode TEXT
  );`;

  await db.executeSql(query);
};

export const insertCustomers = async (db: SQLite.SQLiteDatabase, customers: any[]) => {
  const insertQuery = 'INSERT OR REPLACE INTO Customers (accountId, accountName, accountCode) VALUES (?, ?, ?);';

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    customers.forEach(customer => {
      const { accountId, accountName, accountCode } = customer;
      tx.executeSql(insertQuery, [accountId, accountName, accountCode]);
    });
  });
};

export const createCategoriesTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS Categories (
    CategoryId INTEGER PRIMARY KEY,
    CategoryName TEXT,
    CategoryCode TEXT,
    CategoryImage TEXT
  );`;

  await db.executeSql(query);
};

export const insertCategories = async (db: SQLite.SQLiteDatabase, categories: any[]) => {
  const insertQuery = `INSERT OR REPLACE INTO Categories (
    CategoryId, 
    CategoryName, 
    CategoryCode
  ) VALUES (?, ?, ?);`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    categories.forEach(category => {
      const { CategoryId, CategoryName, CategoryCode } = category;
      tx.executeSql(insertQuery, [CategoryId, CategoryName, CategoryCode]);
    });
  });
};

export const createPricesTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS Prices (
    ProductId INTEGER PRIMARY KEY,
    ProductName TEXT,
    ProductCode TEXT,
    Rate REAL
  );`;

  await db.executeSql(query);
};

export const insertPrices = async (db: SQLite.SQLiteDatabase, prices: any[]) => {
  const insertQuery = `INSERT OR REPLACE INTO Prices (
    ProductId, 
    ProductName, 
    ProductCode,
    Rate
  ) VALUES (?, ?, ?, ?);`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    prices.forEach(price => {
      const { ProductId, ProductName, ProductCode, Rate } = price;
      tx.executeSql(insertQuery, [ProductId, ProductName, ProductCode, Rate]);
    });
  });
};


const executeTransaction = async (db: SQLite.SQLiteDatabase) => {
  try {
    await db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Cart (ProductId INTEGER PRIMARY KEY, Quantity INTEGER);'
      );
    });
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
};

export const dropTable = async (db: SQLite.SQLiteDatabase, tableName: string) => {
  const query = `DROP TABLE IF EXISTS ${tableName};`;
  await db.executeSql(query);
};

export const recreateProductsTable = async (db: SQLite.SQLiteDatabase) => {
  await dropTable(db, 'Products'); // Drop the existing Products table
  await createProductsTable(db);    // Create a new Products table
};

export const createProductsTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS Products (
    ProductId INTEGER PRIMARY KEY,
    CategoryId INTEGER,
    CategoryName TEXT,
    ProductName TEXT,
    ProductCode TEXT,
    Rate REAL,
    ProductImage TEXT,
    CurrencyId INTEGER,
    CurrencyCode TEXT,
    FOREIGN KEY (CategoryId) REFERENCES Categories (CategoryId)
  );`;

  await db.executeSql(query);
};
