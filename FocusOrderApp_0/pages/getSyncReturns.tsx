import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deletePostedOrderFromLocalTable,
  deletePostedSalesReturnFromLocalTable,
  getAllSalesOrders,
  getAllSalesReturns,
} from '../services/OrdersServices';
import {Alert, Platform} from 'react-native';
import {deleteAllCartData} from '../services/CartService';
import RNFS from 'react-native-fs'; // Import react-native-fs library
import {
  clearConsumedQtyLocal,
  clearConsumedReturnQtyLocal,
  getDBConnection,
  getStockData,
  updateConsumedQtyLocal,
} from '../services/SQLiteService';
import {syncStock} from '../services/SyncStock';

function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
}

async function getSyncReturns() {
  async function fetchDataFromApi(url: any, requestData: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 5 seconds timeout

    const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: storedFocusSessoin || '',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal, // Attach the abort signal
      });
      clearTimeout(timeoutId); // Clear the timeout if the request completes in time

      if (!response.ok) {
        return {message: 'Response not OK'}; // Return object with failure message
      }

      const data = await response.json();
      return data; // Return object with success status and data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Fetch request timed out:', error);
        return {message: 'Request timed out'}; // Return object with timeout message
      } else {
        console.error('There was a problem with the fetch request:', error);
        return {message: 'Fetch request failed'}; // Return object with error message
      }
    } finally {
    }
  }
  try {
    // Fetch all sales orders
    const allSalesReturns = await getAllSalesReturns();
    console.log('allSalesReturns', allSalesReturns);

    let storedHostname = await AsyncStorage.getItem('hostname');
    const salesReturnUrl = `${storedHostname}/focus8api/Transactions/1795/`;

    let allSuccess = true; // Flag to track overall success
    let partialSuccess = false; // Flag to track if there was partial success
    const failedOrders = []; // Array to track failed sales orders along with their response
    const successOrders = [];
    // Iterate through all sales orders and send each one to the API
    const db = await getDBConnection();
    for (const order of allSalesReturns) {
      const parsedSalesReturnData = JSON.parse(order.salesReturndata);
      const salesReturnsRes = await fetchDataFromApi(
        salesReturnUrl,
        parsedSalesReturnData,
      );

      if (salesReturnsRes?.result == 1) {
        console.log(
          `Order placed successfully: ${salesReturnsRes?.data?.[0]?.VoucherNo}`,
        );
        const salesReceiptBody = JSON.parse(order.salesReturnReceiptdata);
        // const consumedQty = JSON.parse(order.consumedQtydata);
        const salesReceiptUrl = `${storedHostname}/focus8api/Transactions/4872/`;
        salesReceiptBody.data[0].Header.MobilePOSSaleNumber = `${salesReturnsRes?.data?.[0]?.VoucherNo}`;
        console.log('salesReceiptBody', salesReceiptBody);
        const salesReceiptRes = await fetchDataFromApi(
          salesReceiptUrl,
          salesReceiptBody,
        );
        if (salesReceiptRes?.result == 1) {
          console.log(salesReceiptRes);
          await clearConsumedReturnQtyLocal(
            db,
            parsedSalesReturnData?.data?.[0]?.Body,
          )
            .then(() => {
              console.log(
                `ConsumedReturnQty updated successfully for ${parsedSalesReturnData?.data?.[0]?.Body?.length} records.`,
              );
            })
            .catch(error => {
              console.error('Error updating ConsumedReturnQty:', error);
            });

          // Remove the order from the local table after successful placement
          await deletePostedSalesReturnFromLocalTable(order.id); // Assuming order.id is the identifier for the order
          successOrders.push({
            salesReturndata: parsedSalesReturnData, // Store the order data that success
            response: salesReturnsRes, // Store the response for the success order
            salesReturnReceiptdata: JSON.parse(order.salesReturnReceiptdata), // Store the salesReceipt that success
            salesReceipResponse: salesReceiptRes, // Store the response for the success salesReceipt
          });
        } else {
          const storedFocusSessoin = await AsyncStorage.getItem('focusSessoin');
          const response = await fetch(
            `${storedHostname}/focus8api/Transactions/1795/${salesReturnsRes?.data?.[0]?.VoucherNo}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                fSessionId: storedFocusSessoin || '',
              },
            },
          );

          const data = await response?.json();
          console.log(
            `${storedHostname}/focus8api/Transactions/1795/${salesReturnsRes?.data?.[0]?.VoucherNo}`,
            data,
          );
          allSuccess = false; // Mark as partial success
          partialSuccess = true; // Set flag for partial success
          failedOrders.push({
            salesReturndata: JSON.stringify(parsedSalesReturnData), // Store the order data that failed
            response: data, // Store the response for the failed order
          });
        }

        // // Remove the order from the local table after successful placement
        // await deletePostedOrderFromLocalTable(order.id); // Assuming order.id is the identifier for the order
      } else {
        if (salesReturnsRes?.message === 'Request timed out') {
          Alert.alert(
            'Failed', // Title of the alert
            `Order placement failed: ${salesReturnsRes?.message || ''}`,
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          );
          break;
        } else {
          console.log(
            `Failed to place order: ${salesReturnsRes?.message || ''}`,
          );
          allSuccess = false; // Mark as partial success
          partialSuccess = true; // Set flag for partial success
          failedOrders.push({
            salesReturndata: JSON.stringify(parsedSalesReturnData), // Store the order data that failed
            response: salesReturnsRes, // Store the response for the failed order
          });
        }
      }
    }
    // Function to format current time to IST
    function getISTTime() {
      const date = new Date();
      const istOffset = 5.5 * 60; // IST is UTC +5:30 (in minutes)
      const localOffset = date.getTimezoneOffset(); // Local timezone offset in minutes
      const istDate = new Date(
        date.getTime() + (istOffset + localOffset) * 60000,
      ); // Adjust for IST
      return istDate.toLocaleString(); // Convert to localized string (Indian date and time)
    }
    // Function to sanitize the file name
    const sanitizeFileName = (name: string) => {
      return name
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/,/g, '')
        .replace(/\s+/g, '_');
    };

    // Prepare the log content
    let logContent = ` Mobile POS Sales Return Sync Log - ${getISTTime()}\n\n`;

    // Define the directory for logs
    const logsDirectory = `${RNFS.DownloadDirectoryPath}/Logs`;
    // const sourcePath = `${RNFS.DocumentDirectoryPath}/LocalDatabase_050.db`;
    // const databaseDirectory = `${RNFS.DownloadDirectoryPath}/Database`;
    // await RNFS.copyFile(sourcePath, databaseDirectory);

    // Create the Logs directory if it doesn't exist
    await RNFS.mkdir(logsDirectory).catch(error => {
      console.error('Error creating logs directory:', error);
    });

    // Save the log to the Logs directory
    var logFilePath = `${logsDirectory}/sales_return_log_${sanitizeFileName(
      getISTTime(),
    )}.txt`; // Updated path for the log file in Logs

    if (allSuccess && failedOrders?.length == 0) {
      logFilePath = `${logsDirectory}/sales_return_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent +=
        'All Mobile POS Sales Return have been placed successfully.\n\n';
      successOrders.forEach((successOrder, index) => {
        // const orderDetails = successOrder.salesReturndata; // Extract the Body of the order
        const responseDetails = JSON.stringify(
          successOrder.response?.data?.[0]?.VoucherNo,
        ); // Extract the response details
        const salesReceipResponseDetails = JSON.stringify(
          successOrder.salesReceipResponse?.data?.[0]?.VoucherNo,
        ); // Extract the salesReceipt ResponseDetails
        logContent += `Order ${
          index + 1
        } Success:\nMobile POS Sales Return: ${responseDetails}\nMobile POS Sale Return Payment: ${salesReceipResponseDetails}\n\n`;
        //   logContent += '========================\n';
      });
    } else if (
      partialSuccess &&
      failedOrders?.length == allSalesReturns?.length
    ) {
      logFilePath = `${logsDirectory}/failed_sales_return_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent += 'All Mobile POS Sales Return failed to be placed.\n\n';
      failedOrders.forEach((failedOrder, index) => {
        const orderDetails = failedOrder.salesReturndata; // Extract the Body of the order
        const responseDetails = JSON.stringify(failedOrder.response); // Extract the response details
        logContent += `Order ${
          index + 1
        } Failed:\nMobile POS Sales Return Details: ${orderDetails}\nResponse: ${responseDetails}\n\n`;
        logContent += '========================\n';
      });
    } else {
      logFilePath = `${logsDirectory}/partial_success_sales_return_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent +=
        'Some Mobile POS Sales Return were placed successfully, others failed.\n\n';
      logContent +=
        'Mobile POS Sales Return have been placed successfully.\n\n';
      successOrders.forEach((successOrder, index) => {
        // const orderDetails = successOrder.salesReturndata; // Extract the Body of the order
        const responseDetails = JSON.stringify(
          successOrder.response?.data?.[0]?.VoucherNo,
        ); // Extract the response details
        const salesReceipResponseDetails = JSON.stringify(
          successOrder.salesReceipResponse?.data?.[0]?.VoucherNo,
        ); // Extract the salesReceipt ResponseDetails
        logContent += `Order ${
          index + 1
        } Success:\nDocument No: ${responseDetails}\nMobile POS Sale Return Payment: ${salesReceipResponseDetails}\n\n`;
      });
      logContent += '========================\n';
      logContent += 'Mobile POS Sales Return failed to be placed.\n\n';
      failedOrders.forEach((failedOrder, index) => {
        const orderDetails = JSON.stringify(failedOrder.salesReturndata); // Extract the Body of the order
        const responseDetails = JSON.stringify(failedOrder.response); // Extract the response details
        logContent += `Order ${
          index + 1
        } Failed:\nOrder Details: ${orderDetails}\nResponse: ${responseDetails}\n\n`;
      });
      logContent += '========================\n';
    }

    try {
      await RNFS.writeFile(logFilePath, logContent, 'utf8'); // Write the log content to the file
      console.log('Log file created at: ' + logFilePath);

      // Optionally, you can provide the user with a way to share or open the file.
      // Alert.alert(
      //   'Log Saved',
      //   `The log has been saved to your Downloads/Logs folder. You can access it at: ${logFilePath}`,
      //   [
      //     {
      //       text: 'OK',
      //       onPress: () => console.log('Log file created at:', logFilePath),
      //     },
      //   ],
      // );
      // Show appropriate alert
      if (allSuccess) {
        Alert.alert('Success', 'All orders have been placed successfully.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
      } else if (
        partialSuccess &&
        failedOrders?.length == allSalesReturns?.length
      ) {
        // If all orders failed, display a message saying "All orders failed"
        Alert.alert(
          'Failed',
          `All orders failed to be placed. Please try again later.\nCheck the logs in the path ${logFilePath} for details.`,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
      } else {
        //   const failedOrderDetails = failedOrders
        //     .map((failedOrder, index) => {
        //       const orderDetails = JSON.stringify(failedOrder.salesReturndata.Body); // Extract the Body of the order
        //       const responseDetails = JSON.stringify(failedOrder.response); // Extract the response details
        //       return `Order ${
        //         index + 1
        //       } Failed:\nOrder Details: ${orderDetails}\nResponse: ${responseDetails}`;
        //     })
        //     .join('\n\n');

        Alert.alert(
          'Partial Success',
          `Some orders were placed successfully, others failed.\n\nPlease check the logs in the path ${logFilePath} for details.`,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
      }
    } catch (error) {
      console.error('Error writing log to file:', error);
      Alert.alert('Error', 'Failed to save the log file.');
    }
  } catch (error) {
    console.log('getSyncRetunrs', error);
  }
}

export default getSyncReturns;
