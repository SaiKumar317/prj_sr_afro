const express = require("express");
const router = express.Router();
const app = express();
app.use(express.json());

const gridData = require("../controller/gridData_Controller");

const extPreferenceTable = require("../controller/extPreferenceTable_Controller");
const gateInHeaderData = require("../controller/gateInHeaderData_Controller");
const gateInPendingV = require("../controller/gateInPendingV_Controller");
const preferenceHeaderData = require("../controller/preferencesHeaderData_Controller");
const gateOutHeaderData = require("../controller/gateOutHeaderData_Controller");
const gridDataPurchaseOut = require("../controller/gateOutPurchaseGd_Controller");
const visitorPending = require("../controller/visitorPending_Controller");

router.post("/gridData", gridData.gridData);
router.post("/extPreferenceTable", extPreferenceTable.extPreferenceTable);
router.post("/gateInHeaderData", gateInHeaderData.gateInHeaderData);
router.post("/gateInPendingV", gateInPendingV.gateInPendingV);
router.post("/preferenceHeaderData", preferenceHeaderData.preferenceHeaderData);
router.post("/gateOutHeaderData", gateOutHeaderData.gateOutHeaderData);
router.post("/gridDataPurchaseOut", gridDataPurchaseOut.gridDataPurchaseOut);
router.post("/visitorPending", visitorPending.visitorPending);

module.exports = router;
