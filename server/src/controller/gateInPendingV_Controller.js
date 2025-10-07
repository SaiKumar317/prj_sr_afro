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

async function gateInPendingV(req, res) {
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

    let LinkedDocQuery = `select iLinkPathId from vmCore_Links_0 where BaseVoucherId=${sCodeArray?.selectedVoucherType}`;
    var voucherNoQuery;
    TestingResponse.LinkedDocQuery = LinkedDocQuery;
    try {
      console.log("LinkedDocQuery", LinkedDocQuery);

      let LinkedDocResult = await connection.query(LinkedDocQuery);

      let iLinkPathIdData = LinkedDocResult?.recordsets?.["0"] || [];
      console.log("iLinkPathIdData", iLinkPathIdData);
      var voucherNoData;
      if (iLinkPathIdData && iLinkPathIdData?.length > 0) {
        voucherNoQuery = `select distinct * from(
select h.sVoucherNo,h.iHeaderId,
CASE 
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0 
AND ISNULL(SUM(vl.Base), 0) > ISNULL(SUM(vl.Balance), 0) THEN 'Partial Consumed'
WHEN ISNULL(SUM(vl.Base), 0) <> 0 AND ISNULL(SUM(vl.Balance), 0) > 0 THEN 'Pending'
ELSE '' END [Link Status], tag.iTag3001 [divisionId]
FROM tCore_Header_0 h
JOIN cCore_Vouchers_0 v with (ReadUncommitted) ON v.iVoucherType = h.iVoucherType
JOIN tCore_Data_0 d ON d.iHeaderId = h.iHeaderId
join tCore_Data_Tags_0 tag on tag.iBodyId=d.iBodyId
JOIN tCore_Indta_0 ind ON ind.iBodyId = d.iBodyId 
LEFT JOIN vCore_AllLinks${iLinkPathIdData?.[0]?.iLinkPathId}_0 vl ON vl.iRefId = d.iTransactionId 
WHERE h.iVoucherType=${sCodeArray?.selectedVoucherType} AND (bVersion IS NULL OR bVersion = 0) AND h.bDraft = 0 
and iFaTag in (${sCodeArray?.companyBranchTag}) and bClosed<>1
GROUP BY 
h.iHeaderId,h.iDate, h.sVoucherNo,tag.iTag3001 ) a 
where a.[Link Status]<>'' 
order by iHeaderId`;
        TestingResponse.voucherNoQuery = voucherNoQuery;
        console.log("voucherNoQuery", voucherNoQuery);
        let voucherNoResult = await connection.query(voucherNoQuery);
        voucherNoData = voucherNoResult?.recordsets?.["0"]?.map((item) => ({
          label: item?.sVoucherNo,
          value: item?.iHeaderId,
          LinkStatus: item?.["Link Status"],
          divisionId: item?.divisionId,
        }));
      } else {
        voucherNoData = [];
      }
      getTempTesting(TestingResponse, fileNameWithDate, "res");
      res.status(200).json({ iLinkPathIdData, voucherNoData });
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
  gateInPendingV,
};
