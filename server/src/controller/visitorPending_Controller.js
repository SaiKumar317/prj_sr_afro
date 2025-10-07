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

async function visitorPending(req, res) {
  let TestingResponse = {};

  let dateString = getCurrentDateTimeAsString();
  let fileNameWithDate = `${dateString.substring(
    0,
    4
  )}Sr_Afro_App_Visitor_Movement`;
  console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
  try {
    const { companyCode, sCodeArray } = req.body;
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);
    // Create a connection pool
    const pool = new sql.ConnectionPool(dbConfig);
    const connection = await pool.connect();
    var voucherNoQuery;
    try {
      var voucherNoData;
      voucherNoQuery = `select 
distinct eh.VisitorName [label], eh.VisitorName [value], h.sVoucherNo,d.iTransactionId,cb.sName, eh.VisitorName, eh.FromPlace, eh.ToMeet, eh.PurposeofVisit, eh.VehicleNo
from tCore_Header_0 h 
join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_HeaderData7987_0 eh on eh.iHeaderId = d.iHeaderId
join tCore_Data7987_0 dd on dd.iBodyId=d.iBodyId
join vCore_Links523444020_0 vref on vref.iRefId=d.iBodyId
join mCore_companybranch cb on cb.iMasterId = d.iFaTag
where iVoucherType = 7987 and vref.iStatus <> 2 and iFaTag =${sCodeArray?.companyBranchTag}
order by eh.VisitorName`;
      let voucherNoResult = await connection.query(voucherNoQuery);
      voucherNoData = voucherNoResult?.recordsets?.["0"] || [];

      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json(voucherNoData);
    } catch (error) {
      console.log(error);
      TestingResponse["Error at visitorPendingQuery"] = error;
      getTempTesting(TestingResponse, fileNameWithDate, "res");

      res.json({
        ErrMsg: `Error occurred while running the query.=> ${error}`,
      });
    } finally {
      sql.close();
    }
  } catch (err) {
    TestingResponse["Error at visitorPending"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    console.log(`Error at End Point.=> ${err}`);
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  visitorPending,
};
