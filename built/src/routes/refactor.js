"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/get/:item', (req, res) => {
    let item = req.params.item;
    let { id } = req.body;
    id = Number.parseInt(id);
    let table;
    let query;
    let arguements;
    if (item == "DepreciationPercent") {
        table = "DepreciationPercent";
        query = `UPDATE ${table} SET deleted = true WHERE categoryID = $1`;
        arguements = [id];
    }
    else if (item == "StockTakeAssets") {
        table = "StockTakeAssets";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND stockTakeID = $2`;
        let { assetID, stockTakeID } = req.body;
        arguements = [assetID, stockTakeID];
    }
    else if (item == "assetAttachment") {
        table = "Asset_File";
        query = `UPDATE ${table} SET deleted = true WHERE assetID = $1 AND stockTakeID = $2`;
        let { assetID, attachment } = req.body;
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
        let { roleID, username } = req.body;
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
        let { assetID, year } = req.body;
        arguements = [assetID, year];
    }
    else if (item == "stocktake") {
        table = "StockTake";
        query = `UPDATE ${table} SET deleted = true WHERE id = $1`;
        arguements = [id];
    }
    else if (item == "asset") {
        table = "Asset";
        query = `UPDATE ${table} SET deleted = true WHERE barCode = $1`;
        let { barcode } = req.body;
        arguements = [barcode];
    }
    else if (item == "user") {
        table = "User2";
        query = `UPDATE ${table} SET deleted = true WHERE username = $1`;
        let { username } = req.body;
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
        let { assetID, gatePassID } = req.body;
        arguements = [assetID, gatePassID];
    }
    else if (item == "location") {
        table = "Location";
        query = `UPDATE ${table} SET deleted = true WHERE id = 1`;
        arguements = [id];
        0;
    }
    else {
        return res.status(404).json({ message: Errors[0] });
    }
    pool.query(query, arguements).then(fetchResult => {
        return res.json({ message: `${item} deleted successfully` });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
exports.default = router;
