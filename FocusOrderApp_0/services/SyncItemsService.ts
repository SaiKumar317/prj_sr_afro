import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection, recreateProductsTable } from './SQLiteService';

export const syncItems = async () => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const storedFocusSession = await AsyncStorage.getItem('focusSessoin');

    if (!storedHostname || !storedFocusSession) {
      throw new Error('Missing hostname or session information');
    }

      // Fetch currency data once for all products
    const currencyData = await getCurrencyData();

    if (!currencyData) {
      throw new Error('Invalid sessionId (or) Request timed out');
    }

    // First sync categories
    const categoryResponse = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': storedFocusSession,
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT 
                   iMasterId as CategoryId, 
                   sName as CategoryName, 
                   sCode as CategoryCode 
                 FROM mPos_Category 
                 WHERE iStatus = 0 AND bGroup = 0`,
        }],
      }),
    });

    const categoryData = await categoryResponse.json();

    if (categoryData.result === 1 && categoryData.data?.[0]?.Table) {
      const db = await getDBConnection();

      // Create Categories table
      await db.executeSql(
        `CREATE TABLE IF NOT EXISTS Categories (
          CategoryId INTEGER PRIMARY KEY,
          CategoryName TEXT,
          CategoryCode TEXT,
          CategoryImage TEXT
        );`
      );

      // Insert categories
      await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
        categoryData.data[0].Table.forEach((category: { CategoryId: any; CategoryName: any; CategoryCode: any; }) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO Categories (CategoryId, CategoryName, CategoryCode) 
             VALUES (?, ?, ?);`,
            [category.CategoryId, category.CategoryName, category.CategoryCode]
          );
        });
      });

      // Fetch and store category images
      for (const category of categoryData.data[0].Table) {
        await loadImageForCategory(db, category.CategoryId);
      }

      // Now sync products
      const productResponse = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'fSessionId': storedFocusSession,
        },
        body: JSON.stringify({
          data: [{
            Query: ` SELECT 
					mp.iCategory as CategoryId,
					mc.sName as CategoryName,
                    p.iMasterId ProductId, 
                    p.sName ProductName,
                    p.sCode ProductCode,
                    ISNULL((SELECT TOP 1 fVal0 
                            FROM mCore_SellingPriceBookDetails spb 
                            JOIN mCore_SellingPriceBookHeader sph ON spb.iPriceBookId = sph.iPriceBookId
                            WHERE spb.iProductId = p.iMasterId 
                            AND sph.bActive = 1 
                            AND sph.bMarkDeleted = 0 
                            AND dbo.DateToInt(GETDATE()) BETWEEN spb.iStartDate 
                            AND CASE WHEN spb.iEndDate = 0 THEN dbo.DateToInt(GETDATE()) 
                            ELSE spb.iEndDate END
                            ORDER BY CASE WHEN spb.iEndDate = 0 THEN dbo.DateToInt(GETDATE()) 
                            ELSE spb.iEndDate END DESC), 0) AS Rate
                  FROM mCore_Product p 
                  JOIN muCore_Product mp ON mp.iMasterId = p.iMasterId
				  JOIN mPos_Category mc on mc.iMasterId = mp.iCategory
                  WHERE p.iStatus = 0 AND p.bGroup = 0 AND p.iMasterId <> 0`,
          }],
        }),
      });

      const productData = await productResponse.json();

      if (productData.result === 1 && productData.data?.[0]?.Table) {
        // Create Products table
        await resetProductsTable();
        // await db.executeSql(
        //   `CREATE TABLE IF NOT EXISTS Products (
        //     ProductId INTEGER PRIMARY KEY,
        //     CategoryId INTEGER,
        //     CategoryName TEXT,
        //     ProductName TEXT,
        //     ProductCode TEXT,
        //     Rate REAL,
        //     ProductImage TEXT,
        //     CurrencyId INTEGER,
        //     CurrencyCode TEXT,
        //     FOREIGN KEY (CategoryId) REFERENCES Categories (CategoryId)
        //   );`
        // );

        // Insert products
        await db.transaction((tx: { executeSql: (arg0: string, arg1: any[]) => void; }) => {
          productData.data[0].Table.forEach((product: {
            CategoryName: any; ProductId: any; CategoryId: any; ProductName: any; ProductCode: any; Rate: any;
}) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO Products (
                ProductId, CategoryId, CategoryName, ProductName, ProductCode, Rate, CurrencyId, CurrencyCode
              ) VALUES (?, ?, ?, ?, ?, ?,?,?);`,
              [
                product.ProductId,
                product.CategoryId,
                product.CategoryName,
                product.ProductName,
                product.ProductCode,
                product.Rate,
                currencyData.CurrencyId,
                currencyData.CurrencyCode,
              ]
            );
          });
        });

        // Fetch and store product images
        for (const product of productData.data[0].Table) {
          await loadImageForProduct(db, product.ProductId);
        }
      }

      return {
        success: true,
        message: `Successfully synced ${categoryData.data[0].Table.length} categories and ${productData.data[0].Table.length} products`,
      };
    }

  } catch (error) {
    console.error('Error syncing items:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync items',
      error,
    };
  }
};

const getCurrencyData = async () => {
  try {
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 5 seconds timeout

    const storedHostname = await AsyncStorage.getItem('hostname');
    const response = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': await AsyncStorage.getItem('focusSessoin'),
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT 
            c.iCurrencyId AS CurrencyId, 
            c.sCode AS CurrencyCode
          FROM tCore_Company_Details cd
          JOIN muCore_Country muc ON cd.iCountryId = muc.iMasterId
          JOIN mCore_Currency c ON c.iCurrencyId = muc.iCurrency`,
        }],
      }),
       signal: controller.signal, // Attach the abort signal
    });
  clearTimeout(timeoutId); // Clear the timeout if the request completes in time

    const data = await response.json();

    if (data.result === 1 && data.data?.[0]?.Table?.length > 0) {
      return {
        CurrencyId: data.data[0].Table[0].CurrencyId,
        CurrencyCode: data.data[0].Table[0].CurrencyCode,
      };
    }

    return null;

  } catch (error) {
    console.error('Error fetching currency data:', error);
    return null;
  }
};

const loadImageForCategory = async (db: SQLite.SQLiteDatabase, categoryId: number) => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const response = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': await AsyncStorage.getItem('focusSessoin'),
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT Image as CategoryImage
                 FROM mCore_CCategory muc
                 JOIN muPos_Category mup ON mup.iMasterId = muc.iMasterId
                 WHERE mup.iMasterId = ${categoryId}`,
        }],
      }),
    });

    const data = await response.json();
    if (data.result === 1 && data.data?.[0]?.Table?.[0]?.CategoryImage) {
      await db.executeSql(
        'UPDATE Categories SET CategoryImage = ? WHERE CategoryId = ?',
        [data.data[0].Table[0].CategoryImage, categoryId]
      );
    }
  } catch (error) {
    console.error(`Error loading image for category ${categoryId}:`, error);
  }
};

const loadImageForProduct = async (db: SQLite.SQLiteDatabase, productId: number) => {
  try {
    const storedHostname = await AsyncStorage.getItem('hostname');
    const response = await fetch(`${storedHostname}/focus8API/utility/executesqlquery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'fSessionId': await AsyncStorage.getItem('focusSessoin'),
      },
      body: JSON.stringify({
        data: [{
          Query: `SELECT pImage as ProductImage 
                 FROM mCore_Product p 
                 JOIN muCore_Product mp ON mp.iMasterId = p.iMasterId
                 WHERE p.iMasterId = ${productId}`,
        }],
      }),
    });

    const data = await response.json();
    if (data.result === 1 && data.data?.[0]?.Table?.[0]?.ProductImage) {
      await db.executeSql(
        'UPDATE Products SET ProductImage = ? WHERE ProductId = ?',
        [data.data[0].Table[0].ProductImage, productId]
      );
    }
  } catch (error) {
    console.error(`Error loading image for product ${productId}:`, error);
  }
};

// Example function to reset the Products table
const resetProductsTable = async () => {
  const db = await getDBConnection();
  await recreateProductsTable(db);
  console.log('Products table has been reset.');
};

// Call the function

