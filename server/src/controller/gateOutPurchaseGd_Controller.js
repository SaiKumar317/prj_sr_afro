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

async function gridDataPurchaseOut(req, res) {
  try {
    const { companyCode, sCodeArray } = req.body;
    let TestingResponse = {};

    let dateString = getCurrentDateTimeAsString();
    let fileNameWithDate = `${dateString.substring(0, 4)}Sr_Afro_App_Gate_OUT`;
    console.log("dateString", dateString.substring(0, 4), fileNameWithDate);
    dbConfig.database = `Focus8${companyCode}`;
    console.log("config1", dbConfig);
    // Create a connection pool
    const pool = new sql.ConnectionPool(dbConfig);
    const connection = await pool.connect();
    var gridDataArray = [];
    var mrnNo = null;
    let getVoucherNoQuery = `select iVoucherType from cCore_Vouchers_0 where sAbbr='${sCodeArray?.voucherAbbr}'`;

    let onLoadQuery = `select distinct h.sVoucherNo,d.iTransactionId, eh.VehicleNo,id.iProduct,p.sName [Item],iUnit, mu.sName [Unit], abs(id.fQuantity) [qty], abs(vbs.[Quantity in KGS]) [qtyKgs],td.iTag3001,dd.sRemarks , dd.PO_SO_STR_STONo,cb.sName [companyBranch], dn.sName [division], tr.sName [transation]
from tCore_Header_0 h 
join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_HeaderData7940_0 eh on eh.iHeaderId = d.iHeaderId
join tCore_Data7940_0 dd on dd.iBodyId=d.iBodyId
join tCore_Indta_0 id on id.iBodyId = dd.iBodyId
join vCore_BodyScreenData_0 vbs on vbs.iBodyId=d.iBodyId
join vCore_Links520363787_0 vref on vref.iRefId=d.iBodyId
join tCore_Data_Tags_0 td on td.iBodyId=d.iBodyId
join mCore_Product p on p.iMasterId = id.iProduct
join mCore_Units mu on mu.iMasterId=iUnit
join mCore_companybranch cb on cb.iMasterId = d.iFaTag
join mCore_division dn on dn.iMasterId = td.iTag3001
join mCore_transactiontype tr on tr.iMasterId = td.iTag3022
where iVoucherType = 7940 and vref.iStatus <> 2 --and iTag3001 = ${sCodeArray?.divisionTag} 
and iTag3022 = ${sCodeArray?.purchaseSalesTag} and iFaTag =${sCodeArray?.companyBranchTag} and sVoucherNo = '${sCodeArray?.selectedVoucher}'`;
    TestingResponse.onLoadQuery = onLoadQuery;
    try {
      console.log("onLoadQuery", onLoadQuery);
      let getVoucherNoResult = await connection.query(getVoucherNoQuery);
      if (
        getVoucherNoResult &&
        getVoucherNoResult?.recordsets &&
        getVoucherNoResult?.recordsets?.["0"] &&
        getVoucherNoResult?.recordsets?.["0"]?.length > 0
      ) {
        const ivoucherType =
          getVoucherNoResult?.recordsets?.["0"]?.[0]?.iVoucherType;
        console.log(
          "ivoucherType",
          ivoucherType,
          getVoucherNoResult?.recordsets?.["0"]
        );
        let getMRNQuery = `select sVoucherNo from tCore_Header_0 h join tCore_Data_0 d on h.iHeaderId=d.iHeaderId
join tCore_HeaderData${ivoucherType}_0 hd on hd.iHeaderId=h.iHeaderId
where iVoucherType=${ivoucherType} and GateEntryNo='${sCodeArray?.selectedVoucher}'`;
        let getMRNResult = await connection.query(getMRNQuery);
        console.log("getMRNResult", getMRNResult);
        var onLoadResult;
        if (
          getMRNResult &&
          getMRNResult?.recordset &&
          getMRNResult?.recordset?.["0"] &&
          getMRNResult?.recordset?.length > 0
        ) {
          mrnNo = getMRNResult?.recordset?.["0"]?.sVoucherNo;
          if (mrnNo) {
            onLoadResult = await connection.query(onLoadQuery);
            gridDataArray = onLoadResult?.recordsets?.["0"] || [];
          } else {
            // gridDataArray = [];
            gridDataArray = onLoadResult?.recordsets?.["0"] || [];
          }
        }
        onLoadResult = await connection.query(onLoadQuery);
        gridDataArray = onLoadResult?.recordsets?.["0"] || [];
      }
      console.log("gridDataPurchaseOut", { gridDataArray, mrnNo });
      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json({ gridDataArray, mrnNo });
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
    TestingResponse["Error at gridDataPurchaseOut"] = err;
    getTempTesting(TestingResponse, fileNameWithDate, "res");
    console.log(`Error at End Point.=> ${err}`);
    res.json({
      ErrMsg: `Error at End Point.=> ${err}`,
    });
  }
}

module.exports = {
  gridDataPurchaseOut,
};
