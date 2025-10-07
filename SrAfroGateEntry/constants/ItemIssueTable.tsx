/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, ScrollView} from 'react-native';
import DropDownPicker, {ValueType} from 'react-native-dropdown-picker';
import {SelectList} from 'react-native-dropdown-search-list';
import TableSelect from './TableSelect';

const data = [
  {key: '1', value: 'Mobiles', disabled: true},
  {key: '2', value: 'Appliances'},
  {key: '3', value: 'Cameras'},
  {key: '4', value: 'Computers', disabled: true},
  {key: '5', value: 'Vegetables'},
  {key: '6', value: 'Diary Products'},
  {key: '7', value: 'Drinks'},
];
let productsArray = [
  {label: 'test1', value: '1'},
  {label: 'sample1', value: '2'},
  {label: 'logintest070hkjhfdskjshfdlkjshdf', value: '3'},
  {label: 'sample2', value: '4'},
  {label: 'Test1', value: '5'},
];

type ItemIssueTableProps = {
  onData: (data: any) => void;
};

const ItemIssueTable: React.FC<ItemIssueTableProps> = ({onData}) => {
  // Sample data for dropdown
  const lineNames = [
    {label: 'Line 1', value: 'line1'},
    {label: 'Line 2', value: 'line2'},
    {label: 'Line 3', value: 'line3'},
  ];

  // States for selected values of dropdowns and text inputs
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string | null;
  }>({
    row1: {lineName: null, femaleQty: '', maleQty: ''},
    row2: {lineName: null, femaleQty: '', maleQty: ''},
    row3: {lineName: null, femaleQty: '', maleQty: ''},
    row4: {lineName: null, femaleQty: '', maleQty: ''},
    row5: {lineName: null, femaleQty: '', maleQty: ''},
  });
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [showDropDown, setshowDropDown] = React.useState(false);
  const [selectedCompany, setselectedCompany] = React.useState<
    ValueType | null | undefined
  >(null);
  const handleselectedCompany = (date: any) => {
    console.log('selectedCompany', date);
    setselectedCompany(date.value);
  };
  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(
      openDropdown === dropdownName ? null : (dropdownName as string),
    );
    onData({
      openDropdown: openDropdown,
    });
  };
  return (
    <ScrollView horizontal={true}>
      <View style={[styles.container]}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text
            style={[styles.headerCellSno, styles.header, styles.columnData]}>
            S.No
          </Text>
          <Text style={[styles.headerCellSelect, styles.header]}>
            Line Name
          </Text>
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            Female Qty
          </Text>
          <Text style={[styles.headerCell, styles.header, styles.columnData]}>
            Male Qty
          </Text>
        </View>
        {/* Table Rows */}

        {[1, 2, 3, 4, 5].map(row => (
          <View
            key={`row${row}`}
            style={[
              styles.tableRow,
              {zIndex: openDropdown === `Companytest${row}` ? 20 : 1 - row},
            ]}>
            <Text style={[styles.cellSNo, styles.columnData]}>{row}</Text>
            <View style={[styles.cell, styles.dropdownContainer]}>
              {/* <SelectList
                setSelected={(val: React.SetStateAction<string>) =>
                  setSelected(val)
                }
                search={true}
                data={data}
                save="value"
              /> */}
              <TableSelect
                label="Companytest"
                onData={handleselectedCompany}
                value={selectedCompany}
                items={productsArray}
                zIndexValue={23 - row * 2}
                isDropDownShow={showDropDown}
                isOpen={openDropdown === `Companytest${row}`} // Pass whether this dropdown is open
                onToggle={() => handleDropdownToggle(`Companytest${row}`)} // Pass callback to handle opening and closing
                // items={itemsArray}
              />
              {/* <DropDownPicker
                items={lineNames}
                // defaultValue={null}
                placeholder="Select Line Name"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                zIndex={1}
                // dropDownStyle={styles.dropDownStyle}
                onChangeItem={(item: {value: any}) =>
                  setSelectedValues(prevValues => ({
                    ...prevValues,
                    [`row${row}`]: {
                      ...prevValues[`row${row}`],
                      lineName: item.value,
                    },
                  }))
                }
              /> */}
            </View>
            <TextInput
              style={[styles.input, styles.columnData]}
              onChangeText={text =>
                setSelectedValues(prevValues => ({
                  ...prevValues,
                  [`row${row}`]: {...prevValues[`row${row}`], femaleQty: text},
                }))
              }
              value={selectedValues[`row${row}`].femaleQty || ''}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.columnData]}
              onChangeText={text =>
                setSelectedValues(prevValues => ({
                  ...prevValues,
                  [`row${row}`]: {...prevValues[`row${row}`], maleQty: text},
                }))
              }
              value={selectedValues[`row${row}`].maleQty || ''}
              keyboardType="numeric"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  columnData: {marginRight: 5},
  container: {
    padding: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 5,
    paddingBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 5,
    paddingBottom: 5,
    // zIndex: 1,
  },
  headerCell: {
    width: 100,
    flex: 1,
    // textAlign: 'center',
    fontWeight: 'bold',
    // padding: 5,

    lineHeight: 40,

    borderRadius: 5,
    paddingHorizontal: 10,
  },
  headerCellSelect: {
    width: 150,
    flex: 1,
    // textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    // padding: 5,
    lineHeight: 40,
  },
  headerCellSno: {
    width: 40,
    flex: 1,
    // textAlign: 'center',
    lineHeight: 40,
    fontWeight: 'bold',
    // padding: 5,
  },
  cell: {
    // width: 'auto',
    width: 150,
    flex: 1, // Adjusts cell width dynamically
    textAlign: 'center',
    lineHeight: 40,
  },
  cellSNo: {
    width: 40,
    flex: 1, // Adjusts cell width dynamically
    lineHeight: 40,
    textAlign: 'center',
    // alignItems: 'center',
  },
  header: {
    fontWeight: 'bold',
  },
  dropdownContainer: {
    width: 150,
    flex: 1,
    height: 40,
    marginRight: 10,
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
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 100, // Adjust input width dynamically
  },
});

export default ItemIssueTable;
