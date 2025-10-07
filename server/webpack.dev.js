const path = require("path");

module.exports = {
  entry: {
    main: "./src/index.js",
    "db.config": "./src/config/db.config.js",

    extPreferenceTable_Controller:
      "./src/controller/extPreferenceTable_Controller.js",
    gateInHeaderData_Controller:
      "./src/controller/gateInHeaderData_Controller.js",
    gateInPendingV_Controller: "./src/controller/gateInPendingV_Controller.js",
    gateOutHeaderData_Controller:
      "./src/controller/gateOutHeaderData_Controller.js",
    gateOutPurchaseGd_Controller:
      "./src/controller/gateOutPurchaseGd_Controller.js",
    gridData_Controller: "./src/controller/gridData_Controller.js",
    preferencesHeaderData_Controller:
      "./src/controller/preferencesHeaderData_Controller.js",
    visitorPending_Controller: "./src/controller/visitorPending_Controller.js",

    srAfroRouter: "./src/routes/srAfroRouter.js",
  },
  output: {
    path: path.join(
      "C:\\inetpub\\wwwroot\\prj_sr_afro_gate_entry",
      "prj_sr_afro_Server"
    ),
    publicPath: "/",
    filename: "[name].js",
    clean: true,
  },
  mode: "production",
  target: "node",

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
};
