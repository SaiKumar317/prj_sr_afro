require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const { dbConfig } = require("../config/db.config");
const { getTempTesting } = require("./tempTesting_Controller");

const app = express();
app.use(express.json());

function getCurrentDateTimeAsString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${month}${day}${hours}${minutes}${seconds}`;
}

async function extPreferenceTable(req, res) {
  let TestingResponse = {};
  let dateString = getCurrentDateTimeAsString();
  let fileNameWithDate = `${dateString.substring(0, 4)}Sr_Afro_App_Preferences`;
  console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
  try {
    const { companyCode, sCodeArray } = req.body;
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);

    const sqlQuery = `select * from sys.tables where name in ('EX_Preferences')`;
    console.log("sCodeArray", sCodeArray);
    try {
      // Create a connection pool
      const pool = new sql.ConnectionPool(dbConfig);
      const connection = await pool.connect();
      const connect = await connection.query(sqlQuery);

      console.log(connect);
      if (connect?.recordsets?.["0"]?.length === 0) {
        const EX_PreferencesQuery = `create table EX_Preferences (Login_User varchar(200), CreatedDateTime datetime, Company_Id int,Company_Name varchar(200), Company_Code varchar(200),
Branch_Id int, Branch_Name varchar(200), Branch_Code varchar(200),
Company_Branch_Id int, Company_Branch_Name varchar(200), Company_Branch_Code varchar(200),
Division_Id int, Division_Name varchar(200), Division_Code varchar(200));`;
        TestingResponse.EX_PreferencesQuery = EX_PreferencesQuery;

        const EX_PreferencesResult = await connection.query(
          EX_PreferencesQuery
        );

        const preferenceUpdateQuery = `INSERT INTO EX_Preferences 
(Login_User, CreatedDateTime, Company_Id, Company_Name, Company_Code, Branch_Id, Branch_Name, Branch_Code, Company_Branch_Id, Company_Branch_Name, Company_Branch_Code)
VALUES 
('${sCodeArray?.username}',CURRENT_TIMESTAMP, ${sCodeArray?.CompanyId}, '${sCodeArray?.CompanyName}', '${sCodeArray?.CompanyCode}', ${sCodeArray?.BranchId}, '${sCodeArray?.BranchName}', '${sCodeArray?.BranchCode}', 
${sCodeArray?.CompanyBranchId}, '${sCodeArray?.CompanyBranchName}', '${sCodeArray?.CompanyBranchCode}')`;
        console.log("preferenceUpdateQuery", preferenceUpdateQuery);

        TestingResponse.preferenceUpdateQuery = preferenceUpdateQuery;

        const extTableResult1 = await connection.query(preferenceUpdateQuery);
        getTempTesting(TestingResponse, fileNameWithDate, "res");
        res.status(200).json(extTableResult1);
      } else {
        const userValidateQuery = `select * from EX_Preferences where Login_User = '${sCodeArray?.username}'`;

        const userValidateResult = await connection.query(userValidateQuery);
        if (
          userValidateResult &&
          userValidateResult?.recordsets &&
          userValidateResult?.recordsets?.["0"] &&
          userValidateResult?.recordsets?.["0"].length > 0
        ) {
          const preferenceUpdateQuery = `UPDATE EX_Preferences
          SET
          Company_Id = ${sCodeArray?.CompanyId},
          CreatedDateTime = CURRENT_TIMESTAMP,
          Company_Name = '${sCodeArray?.CompanyName}',
          Company_Code = '${sCodeArray?.CompanyCode}',
          Branch_Id = ${sCodeArray?.BranchId},
          Branch_Name = '${sCodeArray?.BranchName}',
          Branch_Code = '${sCodeArray?.BranchCode}',
          Company_Branch_Id = ${sCodeArray?.CompanyBranchId},
          Company_Branch_Name = '${sCodeArray?.CompanyBranchName}',
          Company_Branch_Code = '${sCodeArray?.CompanyBranchCode}'
          WHERE 
          Login_User = '${sCodeArray?.username}';`;
          console.log("preferenceUpdateQuery", preferenceUpdateQuery);
          TestingResponse.preferenceUpdateQuery = preferenceUpdateQuery;

          const extTableResult1 = await connection.query(preferenceUpdateQuery);
          getTempTesting(TestingResponse, fileNameWithDate, "res");
          res.status(200).json(extTableResult1);
        } else {
          const preferenceUpdateQuery = `INSERT INTO EX_Preferences 
  (Login_User, CreatedDateTime, Company_Id, Company_Name, Company_Code, Branch_Id, Branch_Name, Branch_Code, Company_Branch_Id, Company_Branch_Name, Company_Branch_Code)
  VALUES 
  ('${sCodeArray?.username}', CURRENT_TIMESTAMP, ${sCodeArray?.CompanyId}, '${sCodeArray?.CompanyName}', '${sCodeArray?.CompanyCode}', ${sCodeArray?.BranchId}, '${sCodeArray?.BranchName}', '${sCodeArray?.BranchCode}', 
  ${sCodeArray?.CompanyBranchId}, '${sCodeArray?.CompanyBranchName}', '${sCodeArray?.CompanyBranchCode}')`;
          console.log("preferenceUpdateQuery", preferenceUpdateQuery);
          TestingResponse.preferenceUpdateQuery = preferenceUpdateQuery;

          const extTableResult1 = await connection.query(preferenceUpdateQuery);
          getTempTesting(TestingResponse, fileNameWithDate, "res");
          res.status(200).json(extTableResult1);
        }
      }
    } catch (error) {
      console.log(error);
      TestingResponse["Error at extPreferenceTableQuery"] = error;
      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.json({
        ErrMsg: `Error occurred while running the query.=> ${error}`,
      });
    }
  } catch (err) {
    console.log(`Error at End Point.=> ${err}`);
    TestingResponse["Error at extPreferenceTable"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  extPreferenceTable,
};
