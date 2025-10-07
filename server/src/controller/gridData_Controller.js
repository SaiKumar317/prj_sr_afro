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

async function gridData(req, res) {
  try {
    const { companyCode, sCodeArray } = req.body;
    let TestingResponse = {};

    let dateString = getCurrentDateTimeAsString();
    let fileNameWithDate = `${dateString.substring(0, 4)}Sr_Afro_App_Gate_IN`;
    console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);
    // Create a connection pool
    const pool = new sql.ConnectionPool(dbConfig);
    const connection = await pool.connect();

    let onLoadQuery = `select fTolerance,Balance,sVoucherNo,iProduct ItemId,mp.sName Item,iUnit UnitId,mu.sName Unit,abs(fQuantity) OrdQty,iBookNo AccountId,ma.sName AccountName,abs(vbs.[Quantity in KGS]) [qtyKgs],tag.iTag3001
                        from tCore_Header_0 h
                        JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
                        JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId
                        join vCore_BodyScreenData_0 vbs on vbs.iBodyId=d.iBodyId
                        join mCore_Product mp on mp.iMasterId=iProduct
                        join mCore_Units mu on mu.iMasterId=iUnit
                        join mCore_Account ma on ma.iMasterId=iBookNo
                        join vCore_Links${sCodeArray.iLinkPathId}_0 vref on vref.iRefId=d.iBodyId
                        join tCore_Data_Tags_0 tag on tag.iBodyId =d.iBodyId
                        join mCore_Product_Props pp on pp.iMasterId=iProduct
                        WHERE h.iVoucherType=${sCodeArray?.selectedVoucherType} and sVoucherNo in (${sCodeArray?.pendingVochNo}) and Balance <> 0 order by d.iBodyId`;
    TestingResponse.onLoadQuery = onLoadQuery;
    try {
      console.log("onLoadQuery", onLoadQuery);
      let onLoadResult = await connection.query(onLoadQuery);
      let gridDataArray = onLoadResult?.recordsets?.["0"] || [];
      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json(gridDataArray);
    } catch (error) {
      console.log(error);
      TestingResponse["Error at onLoadQuery"] = error;
      getTempTesting(TestingResponse, fileNameWithDate, "res");

      res.json({
        ErrMsg: `Error occurred while running the query.=> ${error}`,
      });
    } finally {
      sql.close();
    }
  } catch (err) {
    TestingResponse["Error at gridData"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    console.log(`Error at End Point.=> ${err}`);
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  gridData,
};
