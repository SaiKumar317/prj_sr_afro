require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const { getTempTesting } = require("./tempTesting_Controller");
const { dbConfig } = require("../config/db.config");

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

async function preferenceHeaderData(req, res) {
  let TestingResponse = {};

  let dateString = getCurrentDateTimeAsString();
  let fileNameWithDate = `${dateString.substring(0, 4)}Sr_Afro_App_Preferences`;
  console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
  try {
    const { companyCode, sCodeArray } = req.body;
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);
    // Create a connection pool
    const suUsers = JSON.parse(process.env.SU_USERS);
    const containsSu = suUsers?.includes(sCodeArray?.username);
    console.log("SU_USERS", suUsers, typeof suUsers, containsSu);
    const pool = new sql.ConnectionPool(dbConfig);
    const connection = await pool.connect();
    console.log("preferenceHeaderDatasCodeArray", sCodeArray);
    let savedPreferencesQuery = `select * from EX_Preferences where Login_User = '${sCodeArray?.username}'`;
    TestingResponse.savedPreferencesQuery = savedPreferencesQuery;
    let companyQuery = `select iMasterId, sName [label], sCode [value] from mcore_Department where iStatus<>5 and sName<>'' ${
      containsSu
        ? ""
        : `and iMasterId in 
                            (select um.iMasterId 
                            from  mSec_UserMasterRestriction um
                            join mSec_Users_Roles ur on um.iUserId=ur.iUserId
                            join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
                            where um.iUserId in (select iUserId from mSec_Users where sLoginName='${sCodeArray?.username}') and um.iMasterTypeId=3) and iStatus<>1 and bGroup=0 order by sName`
    }`;
    TestingResponse.companyQuery = companyQuery;
    let branchQuery = `select iMasterId, sName [label], sCode [value]  from mCore_Location where iStatus<>5 and sName<>'' ${
      containsSu
        ? ""
        : `and iMasterId in 
                             (select um.iMasterId 
                             from  mSec_UserMasterRestriction um
                             join mSec_Users_Roles ur on um.iUserId=ur.iUserId
                             join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
                     where um.iUserId in (select iUserId from mSec_Users where sLoginName='${sCodeArray?.username}') and um.iMasterTypeId=6) and iStatus<>1 and bGroup=0 order by sName`
    } `;
    TestingResponse.branchQuery = branchQuery;
    let companyBranchQuery = `select iMasterId, sName [label], sCode [value], CompanyName1 [companyId], BranchName [branchId] from vmCore_companybranch 
                    where 
                     iStatus<>5 and sName<>''  ${
                       containsSu
                         ? ""
                         : `and
                    iMasterId in
                    (select um.iMasterId 
                            from  mSec_UserMasterRestriction um
                            join mSec_Users_Roles ur on um.iUserId=ur.iUserId
                            join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
                    where um.iUserId in (select iUserId from mSec_Users where sLoginName='${sCodeArray?.username}') and um.iMasterTypeId=3018) and iStatus<>1 and bGroup=0 order by sName`
                     } `;
    TestingResponse.companyBranchQuery = companyBranchQuery;
    let divisionQuery = `select iMasterId ,sName [label], sCode [value] from mCore_division where  iStatus<>5 and sName<>''  ${
      containsSu
        ? ""
        : ` and iMasterId in
							(select um.iMasterId 
                             from  mSec_UserMasterRestriction um
                             join mSec_Users_Roles ur on um.iUserId=ur.iUserId
                             join mSec_RoleTransRights urt on urt.iRoleId=ur.iERPRole
                     where um.iUserId in (select iUserId from mSec_Users where sLoginName='${sCodeArray?.username}') and um.iMasterTypeId=3001) and iStatus<>1 and bGroup=0 order by sName`
    }`;
    TestingResponse.divisionQuery = divisionQuery;

    try {
      console.log("branchQuery", branchQuery);
      let savedPreferencesData;
      try {
        let savedPreferencesResult = await connection.query(
          savedPreferencesQuery
        );
        savedPreferencesData = savedPreferencesResult?.recordsets?.["0"] || [];
      } catch {
        savedPreferencesData = [];
      }

      let companyResult = await connection.query(companyQuery);
      console.log("companyResult", companyResult);
      let companyData = companyResult?.recordsets?.["0"] || [];
      let branchResult = await connection.query(branchQuery);

      let branchData = branchResult?.recordsets["0"];
      let companyBranchResult = await connection.query(companyBranchQuery);

      let companyBranchData = companyBranchResult?.recordsets?.["0"] || [];
      let divisionResult = await connection.query(divisionQuery);

      let divisionData = divisionResult?.recordsets?.["0"] || [];

      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json({
        companyData,
        branchData,
        divisionData,
        companyBranchData,
        savedPreferencesData,
      });
    } catch (error) {
      console.log(error);
      TestingResponse["Error at preferenceHeaderDataQuery"] = error;
      getTempTesting(TestingResponse, fileNameWithDate, "res");

      res.json({
        ErrMsg: `Error occurred while running the query.=> ${error}`,
      });
    } finally {
      sql.close();
    }
  } catch (err) {
    TestingResponse["Error at preferenceHeaderData"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    console.log(`Error at End Point.=> ${err}`);
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  preferenceHeaderData,
};
