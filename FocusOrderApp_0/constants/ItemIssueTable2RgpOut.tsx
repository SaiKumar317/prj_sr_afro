/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import DropDownPicker, {ValueType} from 'react-native-dropdown-picker';
import {SelectList} from 'react-native-dropdown-search-list';
import TableSelect from './TableSelect';
import TableSelectModal from './TableSelectModalRGP';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTrashCan} from '@fortawesome/free-solid-svg-icons';
import TableSelectModal2 from './TableSelectModal2';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getSession from './getSession';

const data = [
  {key: '1', value: 'Mobiles', disabled: true},
  {key: '2', value: 'Appliances'},
  {key: '3', value: 'Cameras'},
  {key: '4', value: 'Computers', disabled: true},
  {key: '5', value: 'Vegetables'},
  {key: '6', value: 'Diary Products'},
  {key: '7', value: 'Drinks'},
];
let productsArray = [{label: '', value: 0}];
// Declare the `alert` function to resolve TypeScript error
declare function alert(message?: any): void;
const initialSelectedValues: {
  ItemName: any;
  ItemId: any;
  Quantity: string;
  isRowSelected: boolean;
  isCheckBoxDisable: boolean;
}[] = [
  {
    ItemName: '',
    ItemId: '',
    Quantity: '',
    isRowSelected: false,
    isCheckBoxDisable: true,
    // Add more objects if needed
  },
];

type ItemIssueTableProps = {
  onData: (data: any) => void;
  gridDataresponse: any;
  clearTable: any;
};

const screenHeight = Dimensions.get('window').height;

const ItemIssueTable: React.FC<ItemIssueTableProps> = ({
  onData,
  gridDataresponse,
  clearTable,
}) => {
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  // Sample data for dropdown
  const lineNames = [
    {label: 'Line 1', value: 'line1'},
    {label: 'Line 2', value: 'line2'},
    {label: 'Line 3', value: 'line3'},
  ];

  // States for selected values of dropdowns and text inputs
  const [selectedValues, setSelectedValues] = useState<any>(gridDataresponse);
  const [itemOptions, setItemOptions] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);
  const [selectedCompany, setselectedCompany] = React.useState<
    ValueType | null | undefined
  >(null);

  // useEffect(() => {
  //   const fetchcall = async () => {
  //     const gridDataresponse: any = await apiCall('/gridData', []);

  //     const loadData = onData({});
  //     console.log('gridDataresponse', gridDataresponse);
  //     setSelectedValues(
  //       gridDataresponse && gridDataresponse?.ErrMsg
  //         ? initialSelectedValues
  //         : gridDataresponse,
  //     );
  //   };
  //   fetchcall();
  // }, []); // Empty dependency array ensures this effect runs only once on mount
  const fetchDataFromApi = async (url: any, requestData: any) => {
    try {
      var SessionId;
      try {
        SessionId = await getSession();
        console.log('sessionIdResponse', SessionId);
        // SessionId = sessionIdResponse?.data?.[0]?.fSessionId;
      } catch (error) {
        console.error('getSession', error);
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          fSessionId: SessionId || '',
        },
        body: JSON.stringify(requestData),
      });
      console.log('response', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const apiData = await response.json();
      console.log(`JsonData - ${url}`, apiData);

      if (apiData.result === 1) {
        // console.log('JsonData', data);
        // alert(data.data[0].fSessionId);
        // setApiData(data);
        return apiData;
      } else {
        alert(apiData.message);
        // setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('There was a problem with the fetch request:', error);
      alert(error);
      //   setIsLoading(false);
    }
  };
  React.useEffect(() => {
    async function getSessionId() {
      var storedHostname = await AsyncStorage.getItem('hostname');
      const itemResponse = await fetchDataFromApi(
        `http://${storedHostname}/focus8API/utility/executesqlquery`,
        {
          data: [
            {
              Query:
                'select sName [label], iMasterId [value] from mCore_Product where iStatus <> 5 and iMasterId <> 0 and bGroup = 0',
            },
          ],
        },
      );
      if (
        itemResponse &&
        itemResponse?.data &&
        itemResponse?.result === 1 &&
        itemResponse?.data?.[0]?.Table &&
        itemResponse?.data?.[0]?.Table?.length > 0
      ) {
        setItemOptions(itemResponse?.data?.[0]?.Table);
      }
    }
    getSessionId();
  }, []);
  // React.useEffect(() => {
  //   setSelectedValues(gridDataresponse);
  // }, [gridDataresponse]);
  React.useEffect(() => {
    setSelectedValues(gridDataresponse);
  }, [clearTable, gridDataresponse]);

  async function apiCall(url: any, sCodeArray: any) {
    // setIsLoading(true);
    onData({
      isLoading: true,
    });
    const storedHostname: any = await AsyncStorage.getItem('hostname');
    const hostnameNoPort = storedHostname.split(':')[0];
    const storedCompanyCode = await AsyncStorage.getItem('companyCode');

    const Options: any = {
      origin: '*',
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sCodeArray: sCodeArray,
        companyCode: `${storedCompanyCode}`,
      }),
    };
    var apiResponse;
    try {
      await fetch(`http://${hostnameNoPort}:7013${url}`, Options)
        .then(response => response.json())
        .then(jsonData => {
          console.log(
            `http://${hostnameNoPort}:7013${url} => jsonData: `,
            jsonData,
          );
          apiResponse = jsonData;
          if (typeof apiResponse !== 'undefined' && 'ErrMsg' in apiResponse) {
            console.log('Error:', apiResponse.ErrMsg);
            alert('Internal Server Error');
            onData({
              isLoading: false,
            });
            // continueM();
            // Handle the error here
          } else {
            onData({
              isLoading: false,
            });
          }
        });
    } catch (error) {
      console.log(
        `Error at running: http://${hostnameNoPort}:7013${url} => ${error}`,
      );
      alert('Internal Server Error');
      onData({
        isLoading: false,
      });
      // continueM();
    }
    onData({
      isLoading: false,
    });
    return apiResponse;
  }

  const handleselectedItem = (selectedData: any, row: any) => {
    console.log('selectedCompany', selectedData);
    const updatedSelectedValues = [...selectedValues];

    updatedSelectedValues[row] = {
      isRowSelected: false,
      ItemName: selectedData.label,
      ItemId: selectedData.value,
      Quantity: updatedSelectedValues[row].Quantity,
    };

    const nonSelectedIndex = updatedSelectedValues.findIndex(
      item => item.ItemName === null,
    );

    if (nonSelectedIndex === -1) {
      updatedSelectedValues.push({
        ItemName: null,
        ItemId: null,
        Quantity: '1',
        isRowSelected: false,
      });
    }

    setSelectedValues(updatedSelectedValues);
    handleBlur(updatedSelectedValues);
    // setselectedCompany(date.label);
  };
  const handleCheckBoxChange = (row: any) => {
    // console.log('selectedCompany', selectedData);
    const updatedSelectedValues = [...selectedValues];

    updatedSelectedValues[row] = {
      sVoucherNo: updatedSelectedValues[row].sVoucherNo,
      AccountId: updatedSelectedValues[row].AccountId,
      AccountName: updatedSelectedValues[row].AccountName,
      Balance: updatedSelectedValues[row].Balance,
      ItemId: updatedSelectedValues[row].ItemId,
      Item: updatedSelectedValues[row].Item,
      UnitId: updatedSelectedValues[row].UnitId,
      Unit: updatedSelectedValues[row].Unit,
      OrdQty: updatedSelectedValues[row].OrdQty,
      invoiceQty: updatedSelectedValues[row].invoiceQty,
      isRowSelected: !updatedSelectedValues[row].isRowSelected,
    };

    // const nonSelectedIndex = updatedSelectedValues.findIndex(
    //   item => item.lineName === null,
    // );

    // if (nonSelectedIndex === -1) {
    //   updatedSelectedValues.push({
    //     lineName: null,
    //     femaleQty: '',
    //     invoiceQty: '',
    //     isRowSelected: updatedSelectedValues[row].isRowSelected,
    //   });
    // }
    const filteredSelectedValues = updatedSelectedValues.filter(
      item => item.isRowSelected,
    );
    onData({filteredSelectedValues});
    setSelectedValues(updatedSelectedValues);
    // setselectedCompany(date.label);
  };
  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(
      openDropdown === dropdownName ? null : (dropdownName as string),
    );
    onData({
      openDropdown: openDropdown,
    });
  };
  console.log('selectedValues', selectedValues);

  const validateDecimalInput = (value: any) => {
    console.log(value);
    let isValid = true;

    for (let i = 0; i < value.length; i++) {
      const char = value.charAt(i);

      // Allow digits and a single decimal point
      if (!/[\d.]/.test(char)) {
        isValid = false;
        break;
      }

      // Ensure only one decimal point
      if (char === '.' && value.indexOf('.') !== i) {
        isValid = false;
        break;
      }
    }
    return isValid;
  };
  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };

  const handleFemaleQtyChange = (text: string, row: number) => {
    const validRate = validateDecimalInput(text);
    const updatedSelectedValues = [...selectedValues];

    if (!validRate) {
      showToast('Please enter a valid Female Qty.');
      //   setRate('');
      updatedSelectedValues[row] = {
        lineName: updatedSelectedValues[row].lineName,
        femaleQty: '',
        invoiceQty: updatedSelectedValues[row].invoiceQty,
        isRowSelected: updatedSelectedValues[row].isRowSelected,
      };
      setSelectedValues(updatedSelectedValues);
      return;
    } else {
      updatedSelectedValues[row] = {
        lineName: updatedSelectedValues[row].lineName,
        femaleQty: text,
        invoiceQty: updatedSelectedValues[row].invoiceQty,
        isRowSelected: updatedSelectedValues[row].isRowSelected,
      };
      setSelectedValues(updatedSelectedValues);
      //   setRate(text);
      return;
    }
  };
  const handleBlur = (updatedSelectedValues: any[]) => {
    const filteredItems = updatedSelectedValues.filter(
      item => item.ItemName !== null,
    );
    onData({filteredItems});
  };
  const handleQuantityBlur = (row: number) => {
    const updatedSelectedValues = [...selectedValues];
    if (
      updatedSelectedValues[row]?.Quantity === '' ||
      updatedSelectedValues[row]?.Quantity === '0'
    ) {
      updatedSelectedValues[row] = {
        ItemName: updatedSelectedValues[row].ItemName,
        ItemId: updatedSelectedValues[row].ItemId,
        Quantity: '1',
        isRowSelected: updatedSelectedValues[row].isRowSelected,
      };
    }
    setSelectedValues(updatedSelectedValues);
    handleBlur(updatedSelectedValues);
  };
  const handleQuantityChange = (text: string, row: number) => {
    const validRate = validateDecimalInput(text);
    const updatedSelectedValues = [...selectedValues];
    if (!validRate) {
      showToast('Please enter a valid Quantity.');
      //   setRate('');
      updatedSelectedValues[row] = {
        ItemName: updatedSelectedValues[row].ItemName,
        ItemId: updatedSelectedValues[row].ItemId,
        Quantity: '1',
        isRowSelected: updatedSelectedValues[row].isRowSelected,
      };
      setSelectedValues(updatedSelectedValues);
      handleBlur(updatedSelectedValues);

      return;
    } else {
      updatedSelectedValues[row] = {
        ItemName: updatedSelectedValues[row].ItemName,
        ItemId: updatedSelectedValues[row].ItemId,
        Quantity: text?.replace(/^0+/, '1'),
        isRowSelected: updatedSelectedValues[row].isRowSelected,
      };
      setSelectedValues(updatedSelectedValues);
      //   setRate(text);
      handleBlur(updatedSelectedValues);

      return;
    }
  };

  const handleDeleteRow = (index: number) => {
    const updatedTableData = [...selectedValues];
    console.log(
      index + 1 !== updatedTableData.length,
      index,
      updatedTableData.length,
    );
    if (
      index + 1 !== updatedTableData.length &&
      updatedTableData.length !== 1
    ) {
      updatedTableData.splice(index, 1);
      setSelectedValues(updatedTableData);
      handleBlur(updatedTableData);
    }
    // onData({esTabledata: [...updatedTableData]});
    // setTableData(updatedTableData);
    // setEditRowIndex(null);
    // setrowEditNo(null);
    // setistableEdit(false);
    console.log('handleDeleteRow');
  };

  const renderToastMsg = () => (
    <View
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        zIndex: 5004,
      }}>
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10,
          marginRight: 120,
        }}>
        <Text style={{color: 'white', textAlign: 'right'}}>{toastMessage}</Text>
      </View>
    </View>
  );
  return (
    <ScrollView horizontal={true} style={{flex: 1}}>
      {toastVisible && renderToastMsg()}

      <View style={[styles.container]}>
        {/* Table Header */}
        <View style={[styles.tableHeader]}>
          {/* <Text
            style={[
              // styles.headerCell,
              styles.headerCellSno,
              styles.header,
              styles.columnData,
            ]}
          /> */}
          <Text
            style={[styles.headerCellSno, styles.header, styles.columnData]}>
            S.No
          </Text>
          <Text
            style={[styles.headerCellSelect, styles.header, styles.columnData]}>
            Item Name
          </Text>
          {/* <Text
            style={[styles.headerCellSelect, styles.header, styles.columnData]}>
            Pending Voucher No
          </Text>
          <Text
            style={[styles.headerCellSelect, styles.header, styles.columnData]}>
            Item Name
          </Text>
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            UOM
          </Text>
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            Order Qty
          </Text>
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            Pending Qty
          </Text> */}
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            Quantity
          </Text>
          {/* <Text
            style={[
              styles.headerCellSelect2,
              styles.header,
              styles.columnData,
            ]}>
            Vendor/Customer Name
          </Text> */}
        </View>
        {/* Table Rows */}
        {/* <ScrollView style={{maxHeight: 300, flex: 1}}> */}
        <View style={{}}>
          {selectedValues?.map((item: any, row: number) => (
            <View
              key={`row${row}`}
              style={[
                styles.tableRow,
                row % 2 === 0 ? styles.evenRow : styles.oddRow,
                selectedValues[row]?.isRowSelected ? styles.selectedRow : null,

                {
                  // zIndex: openDropdown === `Companytest${row}` ? 20 : 1 - row,
                },
              ]}>
              {/* <View style={[styles.cellSNo, styles.columnData]}>
                <CheckBox
                  disabled={
                    item?.isCheckBoxDisable ? item?.isCheckBoxDisable : false
                  }
                  value={selectedValues[row].isRowSelected}
                  onValueChange={() => handleCheckBoxChange(row)}
                  tintColors={{true: '#0d4257', false: 'black'}} // Custom colors for checked and unchecked states
                  // onCheckColor="#ffffff" // Color of the check mark
                  // onTintColor="#007AFF" // Color of the box when checked
                  // onFillColor="#0d4257" // Color of the box when checked
                  // tintColor="#8e8e93" // Color of the box when unchecked
                />
              </View> */}
              <View style={[styles.cellSNo, styles.columnData]}>
                {true && (
                  <>
                    {row < selectedValues.length - 1 && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleDeleteRow(row)}
                          style={styles.deleteButton}>
                          <View style={{marginRight: 3}}>
                            <FontAwesomeIcon
                              icon={faTrashCan}
                              size={16}
                              color="#505757"
                            />
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}

                <Text style={styles.rowSno}>{row + 1}</Text>
              </View>
              <View style={[styles.dropdownContainer, styles.columnData]}>
                <TableSelectModal
                  label="Item Name"
                  onData={selectedData => handleselectedItem(selectedData, row)}
                  value={item.ItemName || null}
                  items={itemOptions || productsArray}

                  // zIndexValue={23 - row * 2}
                  // isDropDownShow={showDropDown}
                  // isOpen={openDropdown === `Companytest${row}`} // Pass whether this dropdown is open
                  // onToggle={() => handleDropdownToggle(`Companytest${row}`)} // Pass callback to handle opening and closing
                  // items={itemsArray}
                />
              </View>
              {/* <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.dropdownContainer, styles.columnData]}>
                {item.sVoucherNo || ''}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.dropdownContainer, styles.columnData]}>
                {item.Item || ''}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.cell, styles.columnData]}>
                {item.Unit || ''}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.cell, styles.columnData]}>
                {item.OrdQty || ''}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.cell, styles.columnData]}>
                {item.Balance || ''}
              </Text> */}
              <TextInput
                placeholder="Quantity"
                placeholderTextColor="#888"
                style={[styles.input, styles.columnData]}
                onChangeText={text => handleQuantityChange(text, row)}
                onBlur={() => handleQuantityBlur(row)}
                value={item.Quantity || 1}
                keyboardType="numeric"
              />
              {/* <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.dropdownContainer2, styles.columnData]}>
                {item.AccountName || ''}
              </Text> */}
            </View>
          ))}
        </View>
        {/* </ScrollView> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f0f0f0',
  },
  selectedRow: {
    backgroundColor: '#e8f5e6',
  },
  deleteButton: {
    // Define styles for the delete button here
    // marginTop: 2,
    // flex: 1,
  },
  columnData: {marginRight: 1.5},
  container: {
    // flex: 1,
    padding: 5,
    backgroundColor: '#ebf6fa',
    borderRadius: 8,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // maxHeight: screenHeight * 0.7,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    // marginBottom: 5,
    // paddingBottom: 5,
    color: 'black',
    backgroundColor: '#bfeeff',
    // position: 'relative',
    // top: 0,
    // left: 0,
    // zIndex: 1000,
  },
  stickyHeader: {
    // position: 'absolute',
    // top: 300,
    // zIndex: 11,
    // elevation: 11, // for Android
    // backgroundColor: '#fff', // add background color to avoid content overlap
    // width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    // marginBottom: 5,
    paddingTop: 2,
    paddingBottom: 2,

    // max-height: 50vh;
    //  /* margin-left: 10px; */
    //  width: max-content;
    //  overflow-x: auto;
    //  max-width: 95vw;
    // zIndex: 1,
  },
  headerCell: {
    width: 100,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    // padding: 5,

    lineHeight: 40,

    // borderRadius: 5,
    paddingHorizontal: 10,
  },
  headerCellSelect: {
    width: 250,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 0,
    // padding: 5,
    lineHeight: 40,
  },
  headerCellSelect2: {
    width: 180,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    // padding: 5,
    lineHeight: 40,
  },
  headerCellSno: {
    width: 45,
    flex: 1,
    textAlign: 'center',
    lineHeight: 40,
    fontWeight: 'bold',
    // padding: 5,
  },
  cell: {
    // width: 'auto',
    width: 100,
    flex: 1, // Adjusts cell width dynamically
    textAlign: 'center',
    lineHeight: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 2,

    color: 'black',
  },
  cellSNo: {
    width: 45,
    // flex: 1, // Adjusts cell width dynamically
    lineHeight: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    // textAlign: 'center',
    // alignItems: 'center',
  },
  header: {
    fontWeight: 'bold',
    color: 'black',
    borderRightWidth: 1,
    borderColor: '#606363',
  },
  rowSno: {
    fontWeight: 'bold',
    color: 'black',
  },
  dropdownContainer: {
    width: 250,
    flex: 1,
    textAlign: 'center',
    // fontWeight: 'bold',
    paddingHorizontal: 0,
    // padding: 5,
    height: 40,
    lineHeight: 40,
    color: 'black',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ccc',
    // marginBottom: 0,
  },
  dropdownContainer2: {
    width: 180,
    flex: 1,
    textAlign: 'center',
    // fontWeight: 'bold',
    paddingHorizontal: 10,
    // padding: 5,
    lineHeight: 40,
    color: 'black',
    borderWidth: 1,
    borderRadius: 2,

    borderColor: '#ccc',
  },
  dropdown: {
    backgroundColor: '#daf0df',
    borderWidth: 0,
    minHeight: 40,
  },
  dropDownStyle: {
    maxHeight: 200, // Set maxHeight to fit cell height
    width: 'auto', // Set width to fit cell width
  },
  input: {
    // flex: 1,
    color: 'black',
    height: 42,
    borderWidth: 1,
    borderColor: '#a8a7a7',
    borderRadius: 3,
    paddingHorizontal: 10,
    textAlign: 'right',
    // lineHeight: 40,
    width: 100, // Adjust input width dynamically
  },
});

export default ItemIssueTable;
