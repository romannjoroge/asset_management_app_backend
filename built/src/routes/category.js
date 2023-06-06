"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db2_js_1 = __importDefault(require("../../db2.js"));
const router = express_1.default.Router();
const category2_js_1 = __importDefault(require("../Allocation/Category/category2.js"));
const constants_js_1 = require("../utility/constants.js");
const db_category2_js_1 = __importDefault(require("../Allocation/Category/db_category2.js"));
// View a specific category
router.get('/view/:name', (req, res) => {
    let name = req.params.name;
    db2_js_1.default.query(db_category2_js_1.default.getCategory, [name]).then(data => {
        // Check if something was returned from database
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: constants_js_1.Errors[11],
            });
        }
        return res.status(200).json(data.rows[0]);
    }).catch(e => {
        return res.status(501).json({
            message: constants_js_1.Errors[9]
        });
    });
});
router.get('/view', (req, res) => {
    // Get all categories from database and return
    db2_js_1.default.query(db_category2_js_1.default.getAllCategories).then(data => {
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: constants_js_1.Errors[10],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        return res.status(500).json({
            message: constants_js_1.Errors[9],
        });
    });
});
router.get('/get', (req, res) => {
    // Return all categories and their info
    db2_js_1.default.query(db_category2_js_1.default.getAllCategories2, []).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[10] });
        }
        return res.json(fetchResult.rows);
    });
});
router.post('/add', (req, res) => {
    // Get Category details from request body
    let { categoryName, parentCategoryID, depreciationType, depreciationPercentage } = req.body;
    // Parse ints and floats from req.body
    parentCategoryID = Number.parseInt(parentCategoryID);
    depreciationPercentage = Number.parseFloat(depreciationPercentage);
    // Call database query
    let categ = new category2_js_1.default(categoryName, parentCategoryID, depreciationType, depreciationPercentage);
    categ.initialize().then(data => {
        return res.status(201).json({
            message: 'Category Created'
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: constants_js_1.Errors[12],
        });
    });
});
router.post('/update', (req, res) => {
    let { updateBody, name } = req.body;
    updateBody.parentFolder = Number.parseInt(updateBody.parentFolder);
    updateBody.depreciation.value = Number.parseFloat(updateBody.depreciation.value);
    // Update items based on what is there
    category2_js_1.default.updateCategory(updateBody, name).then(_ => {
        return res.send("Category Updated");
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
exports.default = router;
