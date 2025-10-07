import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deletePostedExpenseRequestFromLocalTable,
  getAllExpense,
} from '../services/OrdersServices';
import {Alert, Platform} from 'react-native';

import RNFS from 'react-native-fs'; // Import react-native-fs library
import {getDBConnection} from '../services/SQLiteService';

function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
}

async function getSyncExpense() {
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
    // Fetch all Expense orders
    const allExpenseRequest = await getAllExpense();
    console.log('allExpenseRequest', allExpenseRequest);

    let storedHostname = await AsyncStorage.getItem('hostname');
    const ExpenseRequestUrl = `${storedHostname}/focus8api/Transactions/4102/`;

    let allSuccess = true; // Flag to track overall success
    let partialSuccess = false; // Flag to track if there was partial success
    const failedOrders = []; // Array to track failed sales orders along with their response
    const successOrders = [];
    // Iterate through all sales orders and send each one to the API
    const db = await getDBConnection();
    for (const order of allExpenseRequest) {
      const parsedExpenseRequestdata = JSON.parse(order.ExpenseRequestData);
      const ExpenseRequestRes = await fetchDataFromApi(
        ExpenseRequestUrl,
        parsedExpenseRequestdata,
      );

      if (ExpenseRequestRes?.result == 1) {
        console.log(
          `Order placed successfully: ${ExpenseRequestRes?.data?.[0]?.VoucherNo}`,
        );
        // Remove the order from the local table after successful placement
        await deletePostedExpenseRequestFromLocalTable(order.id); // Assuming order.id is the identifier for the order
        successOrders.push({
          ExpenseRequestdata: parsedExpenseRequestdata, // Store the order data that success
          response: ExpenseRequestRes, // Store the response for the success order
        });
      } else {
        if (ExpenseRequestRes?.message === 'Request timed out') {
          Alert.alert(
            'Failed', // Title of the alert
            `Mobile POS Expense failed: ${ExpenseRequestRes?.message || ''}`,
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          );
          break;
        } else {
          console.log(
            `Failed to place Mobile POS Expense: ${
              ExpenseRequestRes?.message || ''
            }`,
          );
          allSuccess = false; // Mark as partial success
          partialSuccess = true; // Set flag for partial success
          failedOrders.push({
            ExpenseRequestdata: JSON.stringify(parsedExpenseRequestdata), // Store the order data that failed
            response: ExpenseRequestRes, // Store the response for the failed order
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
    let logContent = ` Mobile POS Expense Sync Log - ${getISTTime()}\n\n`;

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
    var logFilePath = `${logsDirectory}/expense_log_${sanitizeFileName(
      getISTTime(),
    )}.txt`; // Updated path for the log file in Logs

    if (allSuccess && failedOrders?.length == 0) {
      logFilePath = `${logsDirectory}/expense_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent += 'All Mobile POS Expense have been placed successfully.\n\n';
      successOrders.forEach((successOrder, index) => {
        // const orderDetails = successOrder.ExpenseRequestdata; // Extract the Body of the order
        const responseDetails = JSON.stringify(
          successOrder.response?.data?.[0]?.VoucherNo,
        ); // Extract the response details

        logContent += `Order ${
          index + 1
        } Success:\nMobile POS Expense: ${responseDetails}\n\n`;
        //   logContent += '========================\n';
      });
    } else if (
      partialSuccess &&
      failedOrders?.length == allExpenseRequest?.length
    ) {
      logFilePath = `${logsDirectory}/failed_expense_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent += 'All Mobile POS Expense failed to be placed.\n\n';
      failedOrders.forEach((failedOrder, index) => {
        const orderDetails = failedOrder.ExpenseRequestdata; // Extract the Body of the order
        const responseDetails = JSON.stringify(failedOrder.response); // Extract the response details
        logContent += `Order ${
          index + 1
        } Failed:\nMobile POS Expense Details: ${orderDetails}\nResponse: ${responseDetails}\n\n`;
        logContent += '========================\n';
      });
    } else {
      logFilePath = `${logsDirectory}/partial_success_expense_log_${sanitizeFileName(
        getISTTime(),
      )}.txt`;
      logContent +=
        'Some Mobile POS Expense were placed successfully, others failed.\n\n';
      logContent += 'Mobile POS Expense have been placed successfully.\n\n';
      successOrders.forEach((successOrder, index) => {
        // const orderDetails = successOrder.ExpenseRequestdata; // Extract the Body of the order
        const responseDetails = JSON.stringify(
          successOrder.response?.data?.[0]?.VoucherNo,
        ); // Extract the response details

        logContent += `Order ${
          index + 1
        } Success:\nDocument No: ${responseDetails}\n\n\n`;
      });
      logContent += '========================\n';
      logContent += 'Mobile POS Expense failed to be placed.\n\n';
      failedOrders.forEach((failedOrder, index) => {
        const orderDetails = JSON.stringify(failedOrder.ExpenseRequestdata); // Extract the Body of the order
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

      // Show appropriate alert
      if (allSuccess) {
        Alert.alert(
          'Success',
          'All Mobile POS Expense have been placed successfully.',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
      } else if (
        partialSuccess &&
        failedOrders?.length == allExpenseRequest?.length
      ) {
        // If all orders failed, display a message saying "All orders failed"
        Alert.alert(
          'Failed',
          `All Mobile POS Expense failed to be placed. Please try again later.\nCheck the logs in the path ${logFilePath} for details.`,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
      } else {
        Alert.alert(
          'Partial Success',
          `Some Mobile POS Expense were placed successfully, others failed.\n\nPlease check the logs in the path ${logFilePath} for details.`,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        );
      }
    } catch (error) {
      console.error('Error writing log to file:', error);
      Alert.alert('Error', 'Failed to save the log file.');
    }
  } catch (error) {
    console.log('getSyncExpense', error);
  }
}

export default getSyncExpense;
