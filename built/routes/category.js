import express from 'express';
import pool from '../../db2.js';
const router = express.Router();
import Category from '../Allocation/Category/category2.js';
import { Errors, Succes } from '../utility/constants.js';
import categoryTable from '../Allocation/Category/db_category2.js';
import updateCategory from '../Allocation/Category/updateCategory.js';
// View a specific category
router.get('/view/:name', (req, res) => {
    let name = req.params.name;
    pool.query(categoryTable.getCategory, [name]).then(data => {
        // Check if something was returned from database
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: Errors[11],
            });
        }
        return res.status(200).json(data.rows[0]);
    }).catch(e => {
        return res.status(501).json({
            message: Errors[9]
        });
    });
});
router.get('/view', (req, res) => {
    // Get all categories from database and return
    pool.query(categoryTable.getAllCategories).then(data => {
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: Errors[10],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        return res.status(500).json({
            message: Errors[9],
        });
    });
});
router.get('/get', (req, res) => {
    // Return all categories and their info
    pool.query(categoryTable.getAllCategories2, []).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: Errors[10] });
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
    let categ = new Category(categoryName, parentCategoryID, depreciationType, depreciationPercentage);
    categ.initialize().then(data => {
        return res.status(201).json({
            message: 'Category Created'
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[12],
        });
    });
});
router.put('/update', (req, res) => {
    let updateBody = {};
    let updateBodyFromJSON = req.body.updateBody;
    let id = Number.parseInt(req.body.id);
    if (updateBodyFromJSON.depreciationtype) {
        updateBody.depreciationtype = { type: updateBodyFromJSON.depreciationtype.type };
        if (updateBodyFromJSON.depreciationtype.value) {
            updateBody.depreciationtype.value = Number.parseFloat(updateBodyFromJSON.depreciationtype.value);
        }
    }
    if (updateBodyFromJSON.parentcategoryid) {
        updateBody.parentcategoryid = Number.parseInt(updateBodyFromJSON.parentcategoryid);
    }
    if (updateBodyFromJSON.name) {
        updateBody.name = updateBodyFromJSON.name;
    }
    console.log(updateBody);
    updateCategory(id, updateBody).then(() => {
        return res.json({
            message: Succes[12],
        });
    }).catch(err => {
        return res.status(500).json({
            message: err.message,
        });
    });
});
export default router;
//# sourceMappingURL=category.js.map