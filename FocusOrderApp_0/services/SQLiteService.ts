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
    Rate REAL,
    compBranchId INTEGER,
    endDate DATE,  
    discountP REAL, 
    discountAmt REAL, 
    vat REAL, 
    excise REAL
  );`;

  await db.executeSql(query);
};

export const insertPrices = async (db: SQLite.SQLiteDatabase, prices: any[]) => {
  const insertQuery = `INSERT OR REPLACE INTO Prices (
    ProductId, 
    ProductName, 
    ProductCode,
    Rate,
    compBranchId,
    endDate,
    discountP,
    discountAmt,
    vat,
    excise
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    prices.forEach(price => {
      const { ProductId, ProductName, ProductCode, sellerPB } = price;
      // console.log("sellerPB", sellerPB, price);

      // Split the sellerPB string by commas to create an array
      const sellerPBArray = sellerPB.split(',');

      // Map the array values to appropriate types
      const parsedSellerPB = {
        rate: !sellerPBArray?.[0] ? null : parseFloat(sellerPBArray[0]),        // 0 -> null or Float
        compBranchId: !sellerPBArray?.[1] ? null : parseInt(sellerPBArray[1]),  // 0 -> null or Integer
        discountP: !sellerPBArray?.[2] ? 0 : parseFloat(sellerPBArray[2]),   // 0 -> 0 or Float
        discountAmt: !sellerPBArray?.[3] ? 0 : parseFloat(sellerPBArray[3]), // 0 -> 0 or Float
        vat: !sellerPBArray?.[4] ? 0 : parseFloat(sellerPBArray[4]),         // 0 -> 0 or Float
        excise: !sellerPBArray?.[5] ? 0 : parseFloat(sellerPBArray[5]),      // 0 -> 0 or Float
        endDate: !sellerPBArray?.[6] ? null : new Date(sellerPBArray[6].split('/').reverse().join('-')).toISOString(), // 0 -> null or Date
      };

      // Insert each price item into the database
      tx.executeSql(
        insertQuery,
        [
          ProductId,
          ProductName,
          ProductCode,
          parsedSellerPB.rate,
          parsedSellerPB.compBranchId,
          parsedSellerPB.endDate,
          parsedSellerPB.discountP,
          parsedSellerPB.discountAmt,
          parsedSellerPB.vat,
          parsedSellerPB.excise,
        ]
      );
    });
  });
};

export const createSalesInvoicePendingTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS SalesInvoicePending (
    HeaderId INTEGER PRIMARY KEY,
    sVoucherNo TEXT,
    LinkStatus TEXT,
    companyBranchId INTEGER,
    branchId INTEGER
  );`;

  await db.executeSql(query);
};


export const insertSalesInvoicesPending = async (db: SQLite.SQLiteDatabase, data: any[]) => {
  const insertQuery = `INSERT OR REPLACE INTO SalesInvoicePending (
    HeaderId, 
    sVoucherNo, 
    LinkStatus,
    companyBranchId,
    branchId
  ) VALUES (?, ?, ?, ?, ?);`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    data.forEach(doc => {
      const {iHeaderId,sVoucherNo,LinkStatus,companyBranchId, branchId } = doc;
      // Insert each SalesInvoicePending item into the database
      tx.executeSql(insertQuery, [iHeaderId, sVoucherNo, LinkStatus, companyBranchId, branchId]);
    });
  });
};

export const getSalesInvoicesPending = async () => {
  try {
  const db = await getDBConnection();  // Open the database connection
   var storedPOSSalePreferenceData: any = await AsyncStorage.getItem(
          'POSSalePreferenceData',
        );
        var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);
  const selectQuery = `SELECT distinct s.HeaderId [value], s.sVoucherNo [label], s.companyBranchId, s.branchId  
  FROM SalesInvoicePending s
  JOIN SalesInvoiceDetails d ON s.HeaderId = d.HeaderId
  where s.companyBranchId =${parsedPOSSalesPreferences?.compBranchId} 
  and  s.branchId=${parsedPOSSalesPreferences?.Branch} 
  and (COALESCE(d.Balance, 0) - COALESCE(d.LocalReturn, 0)) > 0
  Order by s.HeaderId desc;`;  // Select all records from the SalesInvoicePending table

  const [results] = await db.executeSql(selectQuery);  // Execute the SQL query and get the results
  const salesInvoicesPending = [];  // Initialize an empty array to store the results
  for (let i = 0; i < results.rows.length; i++) {
    salesInvoicesPending.push(results.rows.item(i));  // Push each record into the array
  }
  console.log("salesInvoicesPending",salesInvoicesPending);
    return salesInvoicesPending;  // Return the array of Sales Invoices Pending
    } catch (error){
    console.log("error", error);
    return [
    {label: '', value: 0},
  ];
    }

};

export const createSalesInvoiceDetailsTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS SalesInvoiceDetails (
    BodyId INTEGER PRIMARY KEY,  -- iBodyId is now the primary key
    HeaderId INTEGER,
    sVoucherNo TEXT,
    orderQty REAL,
    Product INTEGER,
    Balance REAL,
    mRate REAL,
    LocalReturn REAL,
    discountP REAL,
    discountAmt REAL,
    vat REAL,
    excise REAL,
    BatchId INTEGER,
    BatchNo TEXT,
    ExpiryDate TEXT,
    companyBranchId INTEGER,
    branchId INTEGER,
    POSCustomerMobileNumber TEXT,
    POSCustomerName TEXT,
    invoiceDate INTEGER,
    iMfDate INTEGER
  );`;

  await db.executeSql(query);
};
export const insertSalesInvoiceDetails = async (db: SQLite.SQLiteDatabase, data: any[]) => {
  const insertQuery = `INSERT OR REPLACE INTO SalesInvoiceDetails (
    BodyId, 
    HeaderId, 
    sVoucherNo, 
    orderQty,
    Product,
    Balance,
    mRate,
    discountP,
    discountAmt,
    vat,
    excise,
    BatchId,
    BatchNo,
    ExpiryDate,
    companyBranchId,
    branchId,
    POSCustomerMobileNumber,
    POSCustomerName,
    invoiceDate,
    iMfDate,
    LocalReturn
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?);`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[], arg2: (tx: { executeSql: (arg0: string, arg1: any[]) => void; }, result: { rows: { length: number; item: (arg0: number) => { (): any; new(): any; LocalReturn: any; }; }; }) => void, arg3: (error: any) => void) => void; }) => {
    for (const doc of data) {
      const {
        iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
        vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
        POSCustomerName, invoiceDate, iMfDate
      } = doc;

      // Check if the record with the same iBodyId exists
      tx.executeSql(
        `SELECT LocalReturn FROM SalesInvoiceDetails WHERE BodyId = ?`,
        [iBodyId],
        (tx: { executeSql: (arg0: string, arg1: any[]) => void; }, result: { rows: { length: number; item: (arg0: number) => { (): any; new(): any; LocalReturn: any; }; }; }) => {
          if (result.rows.length > 0) {
            // If the record exists, keep the existing LocalReturn value
            const existingLocalReturn = result.rows.item(0).LocalReturn;

            // Perform the INSERT OR REPLACE while keeping the LocalReturn unchanged
            tx.executeSql(
              insertQuery,
              [
                iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
                vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
                POSCustomerName, invoiceDate, iMfDate, existingLocalReturn // Keep the existing LocalReturn value
              ]
            );
          } else {
            // If the record doesn't exist, proceed with the insert (including LocalReturn)
            tx.executeSql(
              insertQuery,
              [
                iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
                vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
                POSCustomerName, invoiceDate, iMfDate, 0 // Insert with a default LocalReturn value (0)
              ]
            );
          }
        },
        (error) => {
          console.error('Error executing SELECT query:', error);
        }
      );
    }
  });
};


// export const insertSalesInvoiceDetails = async (db: SQLite.SQLiteDatabase, data: any[]) => {
//   const insertQuery = `INSERT OR REPLACE INTO SalesInvoiceDetails (
//     BodyId, 
//     HeaderId, 
//     sVoucherNo, 
//     orderQty,
//     Product,
//     Balance,
//     mRate,
//     discountP,
//     discountAmt,
//     vat,
//     excise,
//     BatchId,
//     BatchNo,
//     ExpiryDate,
//     companyBranchId,
//     branchId,
//     POSCustomerMobileNumber,
//     POSCustomerName,
//     invoiceDate,
//     iMfDate,
//     LocalReturn
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?);`;
  
//   try {
    
//     // Use db.transaction() to handle batch operations
//     await db.transaction(async (tx: { executeSql: (arg0: string, arg1: any[], arg2: { (_: any, result: { rows: any[] | PromiseLike<any[]>; }): void; (): void; (): void; }, arg3: { (_: any, error: any): void; (_: any, error: any): void; (_: any, error: any): void; }) => void; }) => {
//       for (const doc of data) {
//         const {
//           iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
//           vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
//           POSCustomerName, invoiceDate, iMfDate
//         } = doc;
  
//         // Check if the record with the same iBodyId exists
//         const [result] = await new Promise<any[]>((resolve, reject) => {
//           tx.executeSql(
//             `SELECT LocalReturn FROM SalesInvoiceDetails WHERE BodyId = ?`,
//             [iBodyId],
//             () => resolve(result?.rows),
//             (_: any, error: any) => reject(error)
//           );
//         });
  
//         if (result.length > 0) {
//           // If the record exists, keep the existing LocalReturn value
//           const existingLocalReturn = result.item(0).LocalReturn;
  
//           // Perform the INSERT OR REPLACE while keeping the LocalReturn unchanged
//           await new Promise<void>((resolve, reject) => {
//             tx.executeSql(
//               insertQuery,
//               [
//                 iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
//                 vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
//                 POSCustomerName, invoiceDate, iMfDate, existingLocalReturn // Keep the existing LocalReturn value
//               ],
//               () => resolve(),
//               (_: any, error: any) => reject(error)
//             );
//           });
//         } else {
//           // If the record doesn't exist, proceed with the insert (including LocalReturn)
//           try {
            
//             await new Promise<void>((resolve, reject) => {
//               tx.executeSql(
//                 insertQuery,
//                 [
//                   iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance, mRate, discountP, discountAmt,
//                   vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber,
//                   POSCustomerName, invoiceDate, iMfDate, 0, // Insert with the new LocalReturn value
//                 ],
//                 () => resolve(),
//                 (_: any, error: any) => reject(error)
//               );
//             });
//           } catch (error) {
//     console.log("insertSalesInvoiceDetailsError", error);
//   }
//         }
//       }
//     });
//   } catch (error) {
//     console.log("insertSalesInvoiceDetailsError", error);
//   }


//   // await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
//   //   data.forEach(doc => {
//   //     const { iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance,mRate, discountP, discountAmt, vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId,branchId, POSCustomerMobileNumber, POSCustomerName, invoiceDate, iMfDate } = doc;
//   //     // Insert each SalesInvoiceDetail item into the database
//   //     tx.executeSql(insertQuery, [
//   //       iBodyId, iHeaderId, sVoucherNo, orderQty, iProduct, Balance,mRate, discountP, discountAmt, vat, excise, iBatchId, sBatchNo, iExpiryDate, companyBranchId, branchId, POSCustomerMobileNumber, POSCustomerName, invoiceDate, iMfDate,
//   //     ]);
//   //   });
//   // });
// };
export const updateSalesInvoiceQty = async (db: SQLite.SQLiteDatabase, data: any[]) => {
  const insertQuery = `
       UPDATE SalesInvoiceDetails
    SET 
      Balance =  COALESCE(Balance, 0) - ?  
    WHERE BodyId = ?;`;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    data.forEach(doc => {
      const { Quantity, bodyId } = doc;
      // console.log("inputQty", Quantity, bodyId);
      tx.executeSql(insertQuery, [
      Quantity, bodyId,
      ]);
    });
  });
};
// export const updateSalesInvoiceNo = async (db: SQLite.SQLiteDatabase, data: any[]) => {
//   const insertQuery = `
//        UPDATE SalesInvoicePending
//     SET 
//       LinkStatus =  'Closed'  
//     WHERE BodyId = ?;`;

//   await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
//     data.forEach(doc => {
//       const {inputQty, iBodyId} = doc;
//       tx.executeSql(insertQuery, [
//       inputQty, iBodyId,
//       ]);
//     });
//   });
// };

export const getSalesInvoiceDetails = async (headerId: number) => {
  const db = await getDBConnection();  // Open the database connection
  var storedPOSSalePreferenceData: any = await AsyncStorage.getItem('POSSalePreferenceData');
  var parsedPOSSalesPreferences = JSON.parse(storedPOSSalePreferenceData);

  // SQL query to select records from SalesInvoiceDetails with additional filter for Balance - LocalReturn > 0
  // and joining the Products table to fetch ProductImage, ProductName, and ProductCode
  const selectQuery = `SELECT 
                        sid.BodyId, 
                        sid.HeaderId, 
                        sid.sVoucherNo, 
                        sid.orderQty, 
                        sid.Product, 
                        sid.Balance, 
                        sid.mRate, 
                        sid.LocalReturn, 
                        sid.discountP, 
                        sid.discountAmt, 
                        sid.vat, 
                        sid.excise, 
                        sid.BatchId, 
                        sid.BatchNo, 
                        sid.ExpiryDate,
                        sid.POSCustomerMobileNumber,
                        sid.POSCustomerName,
                        sid.invoiceDate,
                        sid.iMfDate,
                        p.ProductImage,
                        p.ProductName,
                        p.ProductCode,
                        p.CurrencyId,
                        p.CurrencyCode,
                        0 inputQty
                       FROM SalesInvoiceDetails sid
                       JOIN Products p ON sid.Product = p.ProductId  -- Join with the Products table on ProductId
                       WHERE sid.companyBranchId = ${parsedPOSSalesPreferences?.compBranchId} 
                         AND sid.branchId = ${parsedPOSSalesPreferences?.Branch} 
                         AND sid.HeaderId = ${headerId}  -- Filter based on provided HeaderId
                         AND (COALESCE(sid.Balance, 0) - COALESCE(sid.LocalReturn, 0)) > 0  -- Handle NULL values
                       ORDER BY sid.BodyId;`;

  const [results] = await db.executeSql(selectQuery);  // Execute the SQL query and get the results
  const salesInvoiceDetails = [];  // Initialize an empty array to store the results

  // Loop through the result set and push each row to the array
  for (let i = 0; i < results.rows.length; i++) {
    salesInvoiceDetails.push(results.rows.item(i));  // Push each record into the array
  }

  // console.log("salesInvoiceDetails", salesInvoiceDetails);  // Log the results for debugging
  return salesInvoiceDetails;  // Return the array of Sales Invoice Details
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
  // await dropTable(db, 'Products'); // Drop the existing Products table
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

// Create Stock table for available stock
export const createStockTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS Stock (
    sBatchNo TEXT,
    iBatchId INTEGER,
    iExpiryDate DATE,
    iExpiryDateId INTEGER,
    BatchQty REAL,
    ConsumedQty REAL,
    ConsumedQtyLocal REAL,
    iProduct INTEGER,
    iInvTag INTEGER,
    CONSTRAINT unique_batch UNIQUE (iBatchId)  -- Unique constraint on iBatchId
  );`;

  await db.executeSql(query);
};

// Insert data into Stock table
export const insertStockData = async (db: SQLite.SQLiteDatabase, stockData: any[]) => {
  const insertQuery = `INSERT INTO Stock (
    sBatchNo, 
    iBatchId, 
    iExpiryDate,
    iExpiryDateId,
    BatchQty,
    ConsumedQty,
    iProduct,
    iInvTag
) 
VALUES (?, ?, ?, ?, ?, ? , ?, ?)
ON CONFLICT(iBatchId) DO UPDATE SET
    sBatchNo = excluded.sBatchNo,
    iExpiryDate = excluded.iExpiryDate,
    iExpiryDateId = excluded.iExpiryDateId,
    BatchQty = excluded.BatchQty,
    ConsumedQty = excluded.ConsumedQty,
    iProduct = EXCLUDED.iProduct,
    iInvTag = excluded.iInvTag;`;
  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    stockData.forEach(stock => {
      const { sBatchNo, iBatchId, iExpiryDate, iExpiryDateId, BatchQty, iProduct, iInvTag } = stock;
      let ieDate = new Date(iExpiryDate.split('/').reverse().join('-')).toISOString();
      tx.executeSql(insertQuery, [sBatchNo, iBatchId, ieDate, iExpiryDateId, BatchQty, 0, iProduct, iInvTag]);
    });
  });
};

// Get Stock data based on iProduct, iInvTag, and iExpiryDate
export const getStockData = async (db: SQLite.SQLiteDatabase, iProduct: number, iInvTag: number, iExpiryDate: string) => {
  const selectQuery = `
    SELECT 
      sBatchNo, 
      iBatchId, 
      iExpiryDate,
      iExpiryDateId,
      BatchQty, 
      iProduct, 
      iInvTag
    FROM Stock
    WHERE iProduct = ? AND iInvTag = ? AND iExpiryDate >= CURRENT_DATE
    ORDER BY iBatchId;
  `;

  return new Promise<any[]>((resolve, reject) => {
    db.transaction((tx: { executeSql: (query: string, params: any[], callback: (tx: any, results: any) => void) => void; }) => {
      tx.executeSql(selectQuery, [iProduct, iInvTag], (tx, results) => {
        const rows = results.rows.raw(); // Converts result rows into an array of objects
        resolve(rows);
      }, (error: any) => {
        reject(error); // Handle any errors
      });
    });
  });
};

// // Only update ConsumedQty for existing rows based on iBatchId
// export const updateConsumedQty = async (db: SQLite.SQLiteDatabase, stockData: any[]) => {
//   const updateQuery = `
//     UPDATE Stock
//     SET 
//       ConsumedQty = ConsumedQty + ?  -- Only update ConsumedQty (add the new value to the existing value)
//     WHERE iBatchId = ?;  -- Update only the row with the matching iBatchId
//   `;

//   await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
//     stockData.forEach(stock => {
//       const { ConsumedQty, iBatchId } = stock;
//       tx.executeSql(updateQuery, [ConsumedQty, iBatchId]);  // Add the new ConsumedQty to the existing one
//     });
//   });
// };

// Update ConsumedQty for each record based on BatchId and Qty dynamically
export const updateConsumedQty = async (db: { transaction: (arg0: (tx: any) => void) => any; }, stockData: any[]) => {
  const updateQuery = `
    UPDATE Stock
    SET 
      ConsumedQty =  COALESCE(ConsumedQty, 0) + ?  -- Only update ConsumedQty (add the new value to the existing value)
    WHERE iBatchId = ?;  -- Update only the row with the matching iBatchId
  `;

  await db.transaction((tx) => {
    // Loop through each record in stockData and execute the update query
    stockData.forEach(stock => {
      const { Qty, BatchId } = stock;
      // Execute the SQL statement for each item in stockData
      // Ensure Qty is treated as an integer or float (depending on your table schema)
      const qtyValue = parseInt(Qty) || 0;  // In case Qty is null or undefined, default to 0
      console.log(`Updating BatchId: ${BatchId}, Adding Qty: ${qtyValue}`);
      tx.executeSql(updateQuery, [qtyValue, BatchId],(tx: any, result: { rowsAffected: any; }) => {
        // Log the number of rows affected by this update
        console.log(`Rows affected for BatchId ${BatchId}: ${result.rowsAffected}`);
      },(tx: any, error: any) => {
        // Handle any SQL errors
        console.error("Error updating Stock table:", error);
      });
    });
  });
};
// // Only update ConsumedQtyLocal for existing rows based on iBatchId
// export const updateConsumedQty = async (db: SQLite.SQLiteDatabase, stockData: any[]) => {
//   const updateQuery = `
//     UPDATE Stock
//     SET 
//       ConsumedQty = ConsumedQty + ?  -- Only update ConsumedQty (add the new value to the existing value)
//     WHERE iBatchId = ?;  -- Update only the row with the matching iBatchId
//   `;

//   await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
//     stockData.forEach(stock => {
//       const { ConsumedQty, iBatchId } = stock;
//       tx.executeSql(updateQuery, [ConsumedQty, iBatchId]);  // Add the new ConsumedQty to the existing one
//     });
//   });
// };

// Update ConsumedQty for each record based on BatchId and Qty dynamically
export const updateConsumedQtyLocal = async (db: { transaction: (arg0: (tx: any) => void) => any; }, stockData: any[]) => {
  const updateQuery = `
    UPDATE Stock
    SET 
      ConsumedQtyLocal =  COALESCE(ConsumedQtyLocal, 0) + ?  -- Only update ConsumedQtyLocal (add the new value to the existing value)
    WHERE iBatchId = ?;  -- Update only the row with the matching iBatchId
  `;

  await db.transaction((tx) => {
    // Loop through each record in stockData and execute the update query
    stockData.forEach(stock => {
      const { Qty, BatchId } = stock;
      // Execute the SQL statement for each item in stockData
      // Ensure Qty is treated as an integer or float (depending on your table schema)
      const qtyValue = parseInt(Qty) || 0;  // In case Qty is null or undefined, default to 0
      console.log(`Updating BatchId: ${BatchId}, Adding Qty: ${qtyValue}`);
      tx.executeSql(updateQuery, [qtyValue, BatchId],(tx: any, result: { rowsAffected: any; }) => {
        // Log the number of rows affected by this update
        console.log(`Rows affected for BatchId ${BatchId}: ${result.rowsAffected}`);
      },(tx: any, error: any) => {
        // Handle any SQL errors
        console.error("Error updating Stock table:", error);
      });
    });
  });
};
export const updateConsumedReturnQtyLocal = async (db: SQLite.SQLiteDatabase, data: any[]) => {
const updateQuery = `
    UPDATE SalesInvoiceDetails
    SET 
      LocalReturn =  COALESCE(LocalReturn, 0) + ?  
    WHERE BodyId = ?;  
  `;

  await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
    data.forEach(doc => {
      const { Quantity, bodyId } = doc;
      // console.log("inputQty", Quantity, bodyId);
      tx.executeSql(updateQuery, [
      Quantity, bodyId,
      ]);
    });
  });
};
export const clearConsumedQtyLocal = async (db: { transaction: (arg0: (tx: any) => void) => any; }, stockData: any[]) => {
  const updateQuery = `
    UPDATE Stock
    SET
      ConsumedQty =  COALESCE(ConsumedQty, 0) + ?,
      ConsumedQtyLocal =  COALESCE(ConsumedQtyLocal, 0) - ?  -- Only update ConsumedQtyLocal (add the new value to the existing value)
    WHERE iBatchId = ?;  -- Update only the row with the matching iBatchId
  `;

  await db.transaction((tx) => {
    // Loop through each record in stockData and execute the update query
    stockData.forEach(stock => {
      const { Qty, BatchId } = stock;
      // Execute the SQL statement for each item in stockData
      // Ensure Qty is treated as an integer or float (depending on your table schema)
      const qtyValue = parseInt(Qty) || 0;  // In case Qty is null or undefined, default to 0
      console.log(`Updating BatchId: ${BatchId}, Adding Qty: ${qtyValue}`);
      tx.executeSql(updateQuery, [qtyValue, qtyValue, BatchId],(tx: any, result: { rowsAffected: any; }) => {
        // Log the number of rows affected by this update
        console.log(`Rows affected for BatchId ${BatchId}: ${result.rowsAffected}`);
      },(tx: any, error: any) => {
        // Handle any SQL errors
        console.error("Error updating Stock table:", error);
      });
    });
  });
};
export const clearConsumedReturnQtyLocal = async (db: { transaction: (arg0: (tx: any) => void) => any; }, returnData: any[]) => {
  const updateQuery = `
   UPDATE SalesInvoiceDetails
    SET 
      LocalReturn =  COALESCE(LocalReturn, 0) - ?,
      Balance =  COALESCE(Balance, 0) - ?  
    WHERE BodyId = ?;
  `;

  await db.transaction((tx) => {
    // Loop through each record in SalesInvoiceDetails and execute the update query
    returnData.forEach(bodyData => {
      const { Quantity} = bodyData;
 
      const bodyId = bodyData?.['L-Mobile POS Sales Invoice']?.BaseTransactionId;
      const qtyValue = parseInt(Quantity) || 0;  // In case Qty is null or undefined, default to 0
      console.log(`Updating bodyId: ${bodyId}, Adding Qty: ${qtyValue}`);
      tx.executeSql(updateQuery, [qtyValue, qtyValue, bodyId],(tx: any, result: { rowsAffected: any; }) => {
        // Log the number of rows affected by this update
        console.log(`Rows affected for bodyId ${bodyId}: ${result.rowsAffected}`);
      },(tx: any, error: any) => {
        // Handle any SQL errors
        console.error("Error updating SalesInvoiceDetails:", error);
      });
    });
  });
};



