import express from 'express';
import pool from '../../db2.js';
const router = express.Router();
import Category from '../Allocation/Category/category2.js'
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import categoryTable from '../Allocation/Category/db_category2.js';
import updateCategory from '../Allocation/Category/updateCategory.js';
import { UpdateCategoryJSON } from '../Allocation/Category/updateCategory.js';
import { Log } from '../Log/log.js';
import MyError from '../utility/myError.js';
import handleError from '../utility/handleError.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';
import multer from 'multer';
import { getDataFromExcel } from '../Excel/getDataFromExcelFile.js';
const upload = multer({dest: './attachments'});

// Get subcategories
router.get("/subcategory/:id", async(req, res) => {
    try {
        let id = Number.parseInt(req.params.id);
        let subCategories = await getResultsFromDatabase<{id: number, name: string}>(
            "SELECT id, name FROM Category WHERE parentcategoryid = $1",
            [id]
        );
        return res.json(subCategories);
    } catch(err) {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
})

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
        return res.status(200).json(data.rows[0]) 
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
        return res.status(200).json(data.rows);
    }).catch(e => {
        return res.status(500).json({
            message: Errors[9],
        })
    })
});

router.get('/get', (req, res) => {
    // Return all categories and their info
    pool.query(categoryTable.getAllCategories2, []).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: Errors[10]})
        }
        return res.json(fetchResult.rows)
    })
})

interface BulkAddCategoryItem {
    name: string,
    parentcategory?: string,
    depreciationtype: string,
    depreciationpercent?: number
}

router.post('/bulkAdd', upload.single("excel"), async(req, res) => {
    try {
        let file = req.file;

        if(file) {
            let data = getDataFromExcel(file.path);
            async function addCategory(data: BulkAddCategoryItem) {
                try {
                    let parentCategoryID: number | undefined;

                    if(data.parentcategory) {
                        parentCategoryID = await Category._getCategoryID(data.parentcategory);
                    }

                    let categ = new Category(data.name, parentCategoryID, data.depreciationtype, data.depreciationpercent);
                    await categ.initialize();

                    // @ts-ignore
                    await Log.createLog(req.ip, req.id, Logs.CREATE_CATEGORY);
                } catch(err) {
                    if(err instanceof MyError) {
                        throw err;
                    } else {
                        throw new MyError(MyErrors2.NOT_CREATE_CATEGORY);
                    }
                }
            }

            let promises: Promise<void>[] = [];
            for (let d of data) {
                // @ts-ignore
                promises.push(addCategory(d));
            }

            await Promise.all(promises);
            return res.status(201).json({message: Success2.CREATED_CATEGORY});
        } else {
            return res.status(500).json({message: MyErrors2.NOT_PROCESS_EXCEL_FILE});
        }
    } catch(err) {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage})
    }
});

router.post('/add', (req, res) => {
    // Get Category details from request body
    let {
        categoryName, 
        parentCategoryID, 
        depreciationType, 
        depreciationPercentage
    } = req.body;

    // Parse ints and floats from req.body
    parentCategoryID = Number.parseInt(parentCategoryID);
    depreciationPercentage = Number.parseFloat(depreciationPercentage);

    // Call database query
    let categ = new Category(categoryName, parentCategoryID, depreciationType, depreciationPercentage);
    categ.initialize().then(data => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.CREATE_CATEGORY).then((_: any) => {
            return res.status(201).json({
                message: 'Category Created'
            });
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        })
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[12],
        })
    });
})

interface UpdateCategoryFromJSON {
    name?: string;
    depreciationtype?: DepreciationFROMJSON;
    parentcategoryid?: string;
}

interface DepreciationFROMJSON {
    type: string;
    value?: string;
}

router.post('/update', (req, res) => {
    let updateBody: UpdateCategoryJSON = {};
    let updateBodyFromJSON: UpdateCategoryFromJSON = req.body.updateBody;
    let id: number = Number.parseInt(req.body.id);

    console.log("\n\nRequest Body\n\n");
    console.log(req.body);
    console.log("\n\n");
    console.log("\n\nUpdate Body\n\n");
    console.log(updateBodyFromJSON);
    console.log("\n\n");
    if(updateBodyFromJSON.depreciationtype) {
        updateBody.depreciationtype = {type: updateBodyFromJSON.depreciationtype.type};
        if(updateBodyFromJSON.depreciationtype.value) {
            updateBody.depreciationtype.value = Number.parseFloat(updateBodyFromJSON.depreciationtype.value);
        }
    }

    if(updateBodyFromJSON.parentcategoryid) {
        updateBody.parentcategoryid = Number.parseInt(updateBodyFromJSON.parentcategoryid);
    }

    if(updateBodyFromJSON.name) {
        updateBody.name = updateBodyFromJSON.name;
    }
    
    updateCategory(id, updateBody).then(() => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.UPDATE_CATEGORY, id).then((_: any) => {
            return res.json({
                message: Succes[12],
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        })
    }).catch(err => {
        return res.status(500).json({
            message: err.message,
        });
    });
})

export default router;