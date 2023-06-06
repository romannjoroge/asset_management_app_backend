"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const router = express_1.default.Router();
const asset2_js_1 = __importDefault(require("../Allocation/Asset/asset2.js"));
const constants_js_1 = require("../utility/constants.js");
const users_js_1 = __importDefault(require("../Users/users.js"));
const myError_js_1 = __importDefault(require("../utility/myError.js"));
const db2_js_1 = __importDefault(require("../../db2.js"));
const convert_array_to_csv_1 = require("convert-array-to-csv");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const db_assets_js_1 = __importDefault(require("../Allocation/Asset/db_assets.js"));
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
router.post('/', (req, res) => {
    // Get data from client
    const { username, assettag } = req.body;
    asset2_js_1.default.allocateAsset(assettag, username).then(_ => {
        return res.send(constants_js_1.Succes[3]);
    }).catch(err => {
        if (err instanceof myError_js_1.default) {
            return res.status(400).json({ message: err.message });
        }
    });
});
router.get('/view', (req, res) => {
    // Get users and their allocated items
    db2_js_1.default.query("SELECT assettag, custodianname FROM Asset", []).then(data => {
        // Return an error if no data is gotten
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[22] });
        }
        let csvData = data.rows;
        let csvFromData = (0, convert_array_to_csv_1.convertArrayToCSV)(csvData);
        // Create file
        promises_1.default.writeFile(path_1.default.join(__dirname, 'allocation.csv'), csvFromData).then(_ => {
            const options = {
                root: path_1.default.join(__dirname),
            };
            res.sendFile('allocation.csv', options, err => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: constants_js_1.Errors[17],
                    });
                }
                promises_1.default.unlink(path_1.default.join(__dirname, 'allocation.csv'), err => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: constants_js_1.Errors[23],
                        });
                    }
                });
            });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({
                message: constants_js_1.Errors[16],
            });
        });
    }).catch(e => {
        console.log(e);
        return res.status(505).json({ message: constants_js_1.Errors[9] });
    });
});
router.post('/unallocate', (req, res) => {
    // Get asset to unallocate
    const { assettag } = req.body;
    // Unallocate asset
    db2_js_1.default.query(db_assets_js_1.default.unallocate, [assettag]).then(_ => {
        return res.send("Asset Unallocated");
    }).catch(e => {
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
exports.default = router;
