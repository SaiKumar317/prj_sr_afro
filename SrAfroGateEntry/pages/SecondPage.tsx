/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import FloatingLabelInput from '../constants/FloatingLabelInput';
import FloatingLabelSingleSelect from '../constants/FloatingLabelSingleSelect';
import {ValueType} from 'react-native-dropdown-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEdit, faPlus, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import getSession from '../constants/getSession';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare function alert(message?: any): void;

type SecondPageProps = {
  onData: (data: any) => void;
  masterResponse: string;
};

let productsArray = [
  {label: 'test1', value: '1'},
  {label: 'sample1', value: '2'},
  {label: 'logintest070', value: '3'},
  {label: 'sample2', value: '4'},
  {label: 'Test1', value: '5'},
];

const windowHeight = Dimensions.get('window').height;
let sessionID: any;

const SecondPage: React.FC<SecondPageProps> = ({onData, masterResponse}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  const [showDropDown, setshowDropDown] = React.useState(false);
  const [UOM, setUOM] = React.useState('');
  const [TransType, setTransType] = React.useState('');
  const [AgeInWeeks, setAgeInWeeks] = React.useState('');
  const [AvailableQty, setAvailableQty] = React.useState('');
  const [TotalIssueQty, setTotalIssueQty] = React.useState('');
  const [IssueQtyBird, setIssueQtyBird] = React.useState('');
  const [StdIssueQty, setStdIssueQty] = React.useState('');
  const [VaccinatedBirds, setVaccinatedBirds] = React.useState('');
  const [Remarks, setRemarks] = React.useState('');

  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [rate, setRate] = React.useState('');
  const [istableEdit, setistableEdit] = React.useState(false);
  const [rowEditNo, setrowEditNo] = React.useState<any>(null);
  const [editRowIndex, setEditRowIndex] = React.useState<number | null>(null);
  const [selectedItemType, setselectedItemType] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedItemName, setselectedItemName] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedFlockNo, setselectedFlockNo] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedBirdGender, setselectedBirdGender] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedLineName, setselectedLineName] = React.useState<
    ValueType | null | undefined
  >(null);
  const [selectedItemTypeLabel, setselectedItemTypeLabel] = React.useState<
    ValueType | null | undefined
  >(null);
  const [tableData, setTableData] = React.useState<any[]>([]);
  const [itemsArray, setItemsArray] = React.useState<
    {label: any; value: any}[]
  >([]);
  React.useEffect(() => {
    setRate('');

    setselectedItemType('');
    setTableData([]);
  }, [masterResponse]);
  React.useEffect(() => {
    // Function to call API
    let itemsresponseArray;
    const fetchData = async () => {
      try {
        const response = await apiCall('/getItems', []);
        // Do something with the response if needed
        itemsresponseArray = ((response as unknown as any[]) || []).map(
          item => ({
            label: item.sName,
            value: item.iMasterId.toString(),
          }),
        );
        setItemsArray(itemsresponseArray);
        console.log(
          ((response as unknown as any[]) || []).map(item => ({
            label: item.sName,
            value: item.iMasterId.toString(),
          })),
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors if needed
      }
    };

    // Call the function when the component mounts
    fetchData();
    const getSessionAndLog = async () => {
      sessionID = await getSession();
      console.log('sessionID', sessionID);
    };
    getSessionAndLog();
    console.log('sessionID', sessionID);
  }, []);

  const showToast = (message: React.SetStateAction<string>) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000); // Hide the toast after 3 seconds
  };
  const apiCall = async (url: string, sCodeArray: never[]) => {
    const storedCompanyCode = await AsyncStorage.getItem('companyCode');
    const storedHostname = await AsyncStorage.getItem('hostname');
    console.log('storedHostname', storedHostname);
    const serverUrl = `http://${storedHostname.split(':')[0]}:7015`;
    const Options = {
      origin: '*',
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        fSessionId: sessionID,
      },
      body: JSON.stringify({
        sCodeArray: `${JSON.stringify(sCodeArray)}`,
        companyCode: storedCompanyCode,
      }),
    };
    var apiResponse;
    // checking for Vouchers in Weekly Web Portal Receipt Screen
    // let errorDocNoArray = [
    //   "\nImported Excel has existing Vouchers with, Document No's :\n=============================================================\n",
    // ];
    try {
      await fetch(`${serverUrl}${url}`, Options)
        .then(response => response.json())
        .then(jsonData => {
          console.log(`${serverUrl}${url} => jsonData: `, jsonData);
          apiResponse = jsonData;
        });
    } catch (error) {
      console.log(`Error at running: ${serverUrl}${url} => ${error}`);
      alert('Internal Server Error');
    }
    return apiResponse;
  };

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
  const handleQuantityChange = (text: string) => {
    const validQuantity = validateDecimalInput(text);

    if (!validQuantity) {
      showToast('Please enter a valid Quantity.');
      // alert('Please enter a valid Quantity.');
      // Optionally, you can clear the input or handle it in another way
      // this.setState({selectedLRAmount: ''});
      setQuantity('');
      return;
    } else {
      // this.setState({selectedLRAmount: value});
      setQuantity(text);
      onData({rate, quantity: text, selectedItemType});
      return;
    }
  };

  const handleRateChange = (text: string) => {
    const validRate = validateDecimalInput(text);

    if (!validRate) {
      showToast('Please enter a valid Rate.');
      // alert('Please enter a valid Rate.');
      // Optionally, you can clear the input or handle it in another way
      // this.setState({selectedLRAmount: ''});
      setRate('');
      return;
    } else {
      // this.setState({selectedLRAmount: value});
      setRate(text);
      onData({rate: text, quantity, selectedItemType});
      return;
    }
  };

  const handleTransTypeChange = (text: string) => {
    setTransType(text);
    onData({
      TransType: text,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleAgeInWeeksChange = (text: string) => {
    setAgeInWeeks(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks: text,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleSelectedFlockNo = (data: any) => {
    setselectedFlockNo(data.value);
    onData({
      TransType,
      selectedFlockNo: data.label,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleUOMChange = (text: string) => {
    setUOM(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM: text,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleAvailableQtyChange = (text: string) => {
    setAvailableQty(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty: text,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleTotalIssueQtyChange = (text: string) => {
    setTotalIssueQty(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty: text,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleIssueQtyBirdChange = (text: string) => {
    setIssueQtyBird(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird: text,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleStdIssueQtyChange = (text: string) => {
    setStdIssueQty(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty: text,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleVaccinatedBirdsChange = (text: string) => {
    setVaccinatedBirds(text);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds: text,
      Remarks,
      selectedItemType,
    });
  };
  const handleRemarksChange = (text: string) => {
    setRemarks(text);
    onData({
      selectedItemType,
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks: text,
    });
  };
  const handleSelectedItemType = (data: any) => {
    console.log('selectedItemType', data);
    setselectedItemType(data.value);
    setselectedItemTypeLabel(data.label);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType: data.label,
    });
  };
  const handleSelectedItemName = (data: any) => {
    console.log('selectedItemName', data);
    setselectedItemName(data.value);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName: data.label,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleSelectedBirdGender = (data: any) => {
    console.log('selectedBirdGender', data);
    setselectedBirdGender(data.value);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender: data.label,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleSelectedLineName = (data: any) => {
    console.log('selectedLineName', data);
    setselectedLineName(data.value);
    onData({
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName: data.label,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    });
  };
  const handleAddToTable = () => {
    const newData = {
      TransType,
      selectedFlockNo,
      AgeInWeeks,
      selectedItemName,
      UOM,
      selectedBirdGender,
      selectedLineName,
      AvailableQty,
      TotalIssueQty,
      IssueQtyBird,
      StdIssueQty,
      VaccinatedBirds,
      Remarks,
      selectedItemType,
    };
    const invalidValues = Object.entries(newData)
      .filter(([key, value]) => {
        return value === '' || value === null || value === undefined;
      })
      .map(([key, value]) => key);
    if (invalidValues.length === 0) {
      console.log('All values are valid.');
      setTableData([...tableData, newData]);
      onData({esTabledata: [...tableData, newData]});
      setselectedItemType(null);
      setRate('');
      setEditRowIndex(null);
      setrowEditNo(null);
    } else {
      console.log('Invalid values:', invalidValues);
      alert(
        `Please select following feilds:\n${invalidValues
          .filter(item => item !== 'selectedItemTypeLabel')
          .join(', ')}`,
      );
      return;
    }
    console.log('newData', newData);
  };
  const handleRowLongPress = (index: React.SetStateAction<number | null>) => {
    setEditRowIndex(index);
    setrowEditNo(null);
    setistableEdit(false);
  };
  // Function to edit a row in the table
  const handleEditRow = (index: number) => {
    const rowData = tableData[index];
    setselectedItemType(rowData.item);
    setselectedItemTypeLabel(rowData.selectedItemType);
    setistableEdit(true);
    setrowEditNo(index);
    setEditRowIndex(null);
    // Remove the edited row from the table
    // const updatedTableData = tableData.filter((_, i) => i !== index);
    // setTableData(updatedTableData);
  };
  const handleEditTable = () => {
    const newData = {
      item: selectedItemType,
      rate,
      selectedItemTypeLabel,
    };
    console.log('editRow', newData);
    const invalidValues = Object.entries(newData)
      .filter(([key, value]) => {
        return value === '' || value === null || value === undefined;
      })
      .map(([key, value]) => key);
    if (invalidValues.length === 0) {
      console.log('All values are valid.');
      const newTableData = [...tableData];
      newTableData[rowEditNo] = newData;
      setTableData(newTableData);
      onData({esTabledata: [...newTableData]});
      setselectedItemType(null);
      setRate('');
      setEditRowIndex(null);
      setrowEditNo(null);
      setistableEdit(false);
    } else {
      console.log('Invalid values:', invalidValues);
      alert(
        `Please select following feilds:\n${invalidValues
          .filter(item => item !== 'selectedItemLabel')
          .join(', ')}`,
      );
      return;
    }
  };
  const handleDeleteRow = (index: number) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    onData({esTabledata: [...updatedTableData]});
    setTableData(updatedTableData);
    setEditRowIndex(null);
    setrowEditNo(null);
    setistableEdit(false);
  };

  const [clicks, setClicks] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (index: number) => {
    setClicks(prevClicks => prevClicks + 1);

    if (clicks === 0) {
      timerRef.current = setTimeout(() => {
        if (clicks === 1) {
          // Single click action
          // For example, you can select the row
        }
        setClicks(0);
      }, 300); // Change the duration according to your preference
    } else {
      clearTimeout(timerRef.current);
      // Double click action
      handleEditRow(index);
      setClicks(0);
    }
  };
  const handlePressOutside = () => {
    console.log('outSidePressed');
    setshowDropDown(!showDropDown);
    setOpenDropdown(null);
  };
  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(
      openDropdown === dropdownName ? null : (dropdownName as string),
    );
  };
  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, padding: 16}}>
          {toastVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                alignItems: 'center',
                zIndex: 5004,
              }}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}>
                <Text style={{color: 'white'}}>{toastMessage}</Text>
              </View>
            </View>
          )}
          <View style={{flex: 1}}>
            <ScrollView>
              <FloatingLabelSingleSelect
                label="Item Type"
                onData={handleSelectedItemType}
                value={selectedItemType}
                items={productsArray}
                zIndexValue={13}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === 'Item Type'}
                onToggle={() => handleDropdownToggle('Item Type')}
                // items={itemsArray}
              />
              <FloatingLabelInput
                label="Trans Type"
                onChangeText={handleTransTypeChange}
                value={TransType}
              />
              <FloatingLabelSingleSelect
                label="Flock No"
                onData={handleSelectedFlockNo}
                value={selectedFlockNo}
                items={productsArray}
                zIndexValue={11}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === 'Flock No'}
                onToggle={() => handleDropdownToggle('Flock No')}
                // items={itemsArray}
              />

              <FloatingLabelInput
                label="Age in weeks"
                onChangeText={handleAgeInWeeksChange}
                value={AgeInWeeks}
              />
              <FloatingLabelSingleSelect
                label="Item Name"
                onData={handleSelectedItemName}
                value={selectedItemName}
                items={productsArray}
                zIndexValue={9}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === 'Item Name'}
                onToggle={() => handleDropdownToggle('Item Name')}
                // items={itemsArray}
              />

              <FloatingLabelInput
                label="UOM"
                onChangeText={handleUOMChange}
                value={UOM}
              />
              <FloatingLabelSingleSelect
                label="Bird Gender"
                onData={handleSelectedBirdGender}
                value={selectedBirdGender}
                items={productsArray}
                zIndexValue={7}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === 'Bird Gender'}
                onToggle={() => handleDropdownToggle('Bird Gender')}
                // items={itemsArray}
              />
              <FloatingLabelSingleSelect
                label="Line Name"
                onData={handleSelectedLineName}
                value={selectedLineName}
                items={productsArray}
                zIndexValue={5}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === 'Line Name'}
                onToggle={() => handleDropdownToggle('Line Name')}
                // items={itemsArray}
              />
              <FloatingLabelInput
                label="Available Qty"
                onChangeText={handleAvailableQtyChange}
                value={AvailableQty}
              />
              <FloatingLabelInput
                label="Total Issue Qty"
                onChangeText={handleTotalIssueQtyChange}
                value={TotalIssueQty}
              />
              <FloatingLabelInput
                label="Issue Qty/Bird"
                onChangeText={handleIssueQtyBirdChange}
                value={IssueQtyBird}
              />
              <FloatingLabelInput
                label="Std Issue Qty"
                onChangeText={handleStdIssueQtyChange}
                value={StdIssueQty}
              />
              <FloatingLabelInput
                label="No. of Vaccinated Birds"
                onChangeText={handleVaccinatedBirdsChange}
                value={VaccinatedBirds}
              />
              <FloatingLabelInput
                label="Remarks"
                onChangeText={handleRemarksChange}
                value={Remarks}
              />
              {/* <FloatingLabelInput
                label="Gross"
                // onChangeText={handleRateChange}
                value={
                  !isNaN(parseFloat(rate)) && !isNaN(parseFloat(quantity))
                    ? String(parseFloat(rate) * parseFloat(quantity))
                    : '0'
                }
              /> */}
            </ScrollView>
            {!istableEdit && (
              <TouchableOpacity
                onPress={handleAddToTable}
                style={styles.buttonContainer}>
                <FontAwesomeIcon icon={faPlus} size={25} color="black" />
              </TouchableOpacity>
            )}
            {istableEdit && (
              <TouchableOpacity
                onPress={handleEditTable}
                style={styles.buttonContainer}>
                <FontAwesomeIcon icon={faEdit} size={25} color="black" />
              </TouchableOpacity>
            )}

            <ScrollView horizontal>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerText, styles.table_s_no]}>
                    S.No.
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Item Type
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Trans Type
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Flock No
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Age in weeks
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Item Name
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    UOM
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Bird Gender
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Line Name
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Available Qty
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Total Issue Qty
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Issue Qty/Bird
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Std Issue Qty
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    No. of Vaccinated Birds
                  </Text>
                  <Text style={[styles.headerText, styles.columnHeader]}>
                    Remarks
                  </Text>
                </View>
                <FlatList
                  data={tableData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableOpacity
                      onLongPress={() => handleRowLongPress(index)}
                      onPress={() => handleClick(index)}>
                      <View
                        style={[
                          styles.tableRow,
                          rowEditNo === index && styles.selectedRowEdit,
                        ]}>
                        <Text style={[styles.tableItem, styles.table_s_no]}>
                          {editRowIndex === index && (
                            <>
                              <TouchableOpacity
                                onPress={() => handleDeleteRow(index)}
                                style={styles.deleteButton}>
                                <View style={{marginRight: 6}}>
                                  <FontAwesomeIcon
                                    icon={faTrashCan}
                                    size={20}
                                    color="#505757"
                                  />
                                </View>
                              </TouchableOpacity>
                            </>
                          )}
                          {index + 1}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.selectedItemType}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.TransType}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.selectedFlockNo}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.AgeInWeeks}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.selectedItemName}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.UOM}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.selectedBirdGender}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.selectedLineName}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.AvailableQty}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.TotalIssueQty}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.IssueQtyBird}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.StdIssueQty}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.VaccinatedBirds}
                        </Text>
                        <Text style={[styles.tableItem, styles.columnValue]}>
                          {item.Remarks}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    // Define styles for the delete button here
    // marginRight: 2,
  },
  selectedRowEdit: {
    backgroundColor: '#939696',
    color: '#000000',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  table_s_no: {
    width: 50,
    textAlign: 'right',
    marginRight: 5,
    fontWeight: 'bold',
    color: 'black',
  },
  tableContainer: {
    height: windowHeight * 0.22,
    borderTopWidth: 1,
    borderTopColor: 'black',
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#007bff', // for example
    padding: 6,
    borderRadius: 5,
  },
  columnHeader: {
    width: 100, // Adjust width according to your preference
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black',
  },
  columnValue: {
    width: 100, // Adjust width according to your preference
    textAlign: 'center',
    color: 'black',
  },

  label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: '#000',
  },
  picker: {
    height: 50,
    width: 150,
  },
  tableHeader: {
    color: '#000000',
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    color: '#000000',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableItem: {
    textAlign: 'center',
    color: 'black',
  },
});

export default SecondPage;
