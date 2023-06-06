"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    This route deals with deleting items in the database
*/
const express_1 = __importDefault(require("express"));
const db2_js_1 = __importDefault(require("../../db2.js"));
const router = express_1.default.Router();
const constants_js_1 = require("../utility/constants.js");
router.delete('/delete/:item', (req, res) => {
    let item = req.params.item;
    let { id } = req.query;
    id = Number.parseInt(id);
    let table;
    let query;
    let arguements;
    console.log("Asset Is Being Deleted");
    if (item == "DepreciationPercent") {
        table = "DepreciationPercent";
        query = `UPDATE ${table} SET deleted = true WHERE categoryID = $1`;
        arguements = [id];
    }
    else if (item == "StockTakeAssets") {
        table = "StockTakeAssets";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND stockTakeID = $2`;
        let { assetID, stockTakeID } = req.query;
        arguements = [assetID, stockTakeID];
    }
    else if (item == "assetAttachment") {
        table = "Asset_File";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND stockTakeID = $2`;
        let { assetID, attachment } = req.query;
        arguements = [assetID, attachment];
    }
    else if (item == "category") {
        table = "Category";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "role") {
        table = "Role";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "userrole") {
        table = "UserRole";
        query = `UPDATE ${table} SET deleted = true WHERE roleID = $1 AND username = $2`;
        let { roleID, username } = req.query;
        arguements = [roleID, username];
    }
    else if (item == "tag") {
        table = "Tags";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "depreciationSchedule") {
        table = "DepreciationSchedule";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND year = $2`;
        let { assetID, year } = req.query;
        arguements = [assetID, year];
    }
    else if (item == "stocktake") {
        table = "StockTake";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "asset") {
        table = "Asset";
        query = `UPDATE ${table} SET deleted = true WHERE assetid = $1`;
        let { assetID } = req.query;
        arguements = [assetID];
        console.log("This asset is being deleted");
    }
    else if (item == "user") {
        table = "User2";
        query = `UPDATE ${table} SET deleted = true WHERE username = $1`;
        let { username } = req.query;
        arguements = [username];
    }
    else if (item == "log") {
        table = "Log";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "gatepass") {
        table = "GatePass";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "gatepassAsset") {
        table = "GatePass_Asset";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND gatePassID = 2`;
        let { assetID, gatePassID } = req.query;
        arguements = [assetID, gatePassID];
    }
    else if (item == "location") {
        table = "Location";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "reader") {
        table = "RFIDReader";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "antennae") {
        table = "Antennae";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else {
        return res.status(404).json({ message: constants_js_1.Errors[0] });
    }
    db2_js_1.default.query(query, arguements).then(fetchResult => {
        return res.json({ message: `${item} deleted successfully` });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
exports.default = router;
