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

async function gateInHeaderData(req, res) {
  let TestingResponse = {};

  let dateString = getCurrentDateTimeAsString();
  let fileNameWithDate = `${dateString.substring(0, 4)}Sr_Afro_App_Gate_IN`;
  console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
  try {
    const { companyCode, sCodeArray } = req.body;
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);
    // Create a connection pool
    const pool = new sql.ConnectionPool(dbConfig);
    const connection = await pool.connect();

    let voucherNameQuery = `select cv.iVoucherType [value], cv.sName [label], WBRequired from tCore_Header_0 h join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_Data7968_0 dd on dd.iBodyId=d.iBodyId
join cCore_Vouchers_0 cv on cv.iVoucherType=ScreenName
join tCore_Data_Tags_0 td on td.iBodyId=d.iBodyId
where h.iVoucherType=7968 and iFaTag=${sCodeArray?.companyBranchTag}
and GERequired=1
and iTag3022=${sCodeArray?.purchaseSalesTag}
and sVoucherNo in(SELECT Top 1 sVoucherNo FROM 
tCore_Header_0 h join tCore_Data_0 d on d.iHeaderId=h.iHeaderId
join tCore_Indta_0 i on i.iBodyId=d.iBodyId
WHERE iVoucherType=7968 and iFaTag=${sCodeArray?.companyBranchTag} --and iTag3001=${sCodeArray?.divisionTag}
ORDER BY iDate DESC) `;

    TestingResponse.voucherNameQuery = voucherNameQuery;
    try {
      console.log("voucherNameQuery", voucherNameQuery);

      let voucherNameResult = await connection.query(voucherNameQuery);

      let voucherNameData = voucherNameResult?.recordsets?.["0"] || [];
      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json({ voucherNameData });
    } catch (error) {
      console.log(error);
      TestingResponse["Error at gateInHeaderDataQuery"] = error;
      getTempTesting(TestingResponse, fileNameWithDate, "res");

      res.json({
        ErrMsg: `Error occurred while running the query.=> ${error}`,
      });
    } finally {
      sql.close();
    }
  } catch (err) {
    TestingResponse["Error at gateInHeaderData"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    console.log(`Error at End Point.=> ${err}`);
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  gateInHeaderData,
};
