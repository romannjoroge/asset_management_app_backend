"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utility_js_1 = __importDefault(require("../utility/utility.js"));
const constants_js_1 = require("../utility/constants.js");
const router = express_1.default.Router();
const db_location_js_1 = __importDefault(require("../Tracking/db_location.js"));
const db2_js_1 = __importDefault(require("../../db2.js"));
router.get('/movements', (req, res) => {
    let { from, to } = req.query;
    // Check if they are valid dates
    try {
        from = utility_js_1.default.checkIfValidDate(from, "Invalid From Date");
        to = utility_js_1.default.checkIfValidDate(to, "Invalid To Date");
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: constants_js_1.Errors[37] });
    }
    // Get all movements between the dates
    db2_js_1.default.query(db_location_js_1.default.getTags, [from, to]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[38] });
        }
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ message: constants_js_1.Errors[9] });
    });
});
exports.default = router;
