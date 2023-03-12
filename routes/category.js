import express from 'express';
import pool from '../db2.js';
const router = express.Router();
import Category from '../src/Allocation/Category/category2.js'
import { Errors, Succes } from '../utility/constants.js';
import categoryTable from '../src/Allocation/Category/db_category2.js';

// View a specific category
router.get('/view/:name', (req, res) => {
    let name =  req.params.name;

    pool.query(categoryTable.getCategory, [name]).then(data => {
        // Check if something was returned from database
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: Errors[11],
            });
        }  
        return res.status(200).json({
            data: data.rows[0],
        }) 
    }).catch(e => {
        return res.status(501).json({
            message: Errors[9]
        })
    })
});

router.get('/view', (req, res) => {
    // Get all categories from database and return
    pool.query(categoryTable.getAllCategories).then(data => {
        if (data.rowCount === 0) {
            return res.status(404).json({
                message: Errors[10],
            })
        }
        return res.status(200).json({
            data: data.rows
        });
    }).catch(e => {
        return res.status(500).json({
            message: Errors[9],
        })
    })
});

router.post('/add', (req, res) => {
    // Get Category details from request body
    let {
        categoryName, 
        parentFolderID, 
        depreciationType, 
        depreciationPercentage
    } = req.body;

    // Parse ints and floats from req.body
    parentFolderID = Number.parseInt(parentFolderID);
    depreciationPercentage = Number.parseFloat(depreciationPercentage);

    // Call database query
    let categ = new Category(categoryName, parentFolderID, depreciationType, depreciationPercentage);
    categ.initialize().then(data => {
        return res.status(201).json({
            message: 'Category Created'
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[12],
        })
    });
})

export default router;