"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HCP_SUFFIX = exports.HCP_ID = exports.TIMEOUT = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const hcp_controller_1 = require("./hcp_controller");
const config_manager_1 = require("./utils/config_manager");
const file_manager_1 = require("./utils/file_manager");
exports.TIMEOUT = 300;
exports.HCP_ID = "hcp";
exports.HCP_SUFFIX = `.${exports.HCP_ID}`;
function activate(context) {
    console.log('"hcpworks" is now active!');
    // 各マネージャーの初期化
    const configManager = new config_manager_1.ConfigManager();
    const fileManager = new file_manager_1.FileManager();
    // コントローラー初期化
    const controller = new hcp_controller_1.HCPController(context, configManager, fileManager);
    controller.initialize();
}
function deactivate() { }
//# sourceMappingURL=extension.js.map