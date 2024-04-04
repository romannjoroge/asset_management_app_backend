import express from 'express'
const router = express.Router();
import Asset from '../Allocation/Asset/asset2.js';
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import pool from '../../db2.js';
import assetTable from '../Allocation/Asset/db_assets.js';
import checkifAuthorized from '../../middleware/checkifAuthorized.js';
import checkifAuthenticated from '../../middleware/checkifAuthenticated.js';
import userTable from '../Users/db_users.js';
import MyError from '../utility/myError.js';
import { filterAssetByDetails } from '../Allocation/Asset/filter.js';
// import storage from '../Importing/multerSetup.js';
import multer from 'multer';
import { Log } from '../Log/log.js';
import { UserRoles } from '../Users/users.js';
import createAssetStatus from '../Allocation/Asset/addAssetStatus.js';
import handleError from '../utility/handleError.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';
const upload = multer({dest: './attachments'});

router.post('/add', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    let {
        locationID,
        description,
        categoryName,
        usefulLife,
        serialNumber,
        condition,
        responsibleuserid,
        acquisitionDate,
        acquisitionCost,
        residualValue,
        depreciationType,
        depreciationPercent,
        attachments
    } = req.body;

    // Temporary attachements fix
    attachments = [];

    // Convert values to right type
    responsibleuserid = Number.parseInt(responsibleuserid);
    usefulLife = Number.parseInt(usefulLife);
    acquisitionCost = Number.parseFloat(acquisitionCost);
    residualValue = Number.parseFloat(residualValue);

    if (depreciationPercent) {
        depreciationPercent = Number.parseFloat(depreciationPercent);
    }

    let asset = new Asset(usefulLife, acquisitionDate, locationID, condition, responsibleuserid, acquisitionCost, categoryName, 
        attachments, serialNumber, description, residualValue, depreciationType, depreciationPercent);
    asset.initialize().then(_ => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.CREATE_ASSET).then((_: any) => {
            return res.json({message: Success2.CREATED_ASSET});
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        })
    }).catch(e => {
        console.log(e);
        if (e instanceof MyError) {
            return res.status(400).json({message: e.message});
        } else {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        }
    });
});

router.post('/createAssetStatus', checkifAuthorized(UserRoles.ASSET_ADMIN), (req, res) => {
    let {
        name,
        description
    } = req.body;

    createAssetStatus(name, description).then((_: any) => {
        return res.json({message: Success2.CREATED_STATUS});
    }).catch((err: MyError) => {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    })
})

router.get("/assetStatus", (req, res) => {
  let query = "SELECT name FROM AssetStatus WHERE delete = false";
  getResultsFromDatabase<{name: string}>(query, []).then(data => {
    return res.json(data);
  }).catch((err: MyError) => {
    let {errorMessage, errorCode} = handleError(err);
    return res.status(errorCode).json({message: errorMessage});
  })
})

router.post('/update/:id', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    // Get barcode from request
    let assetID = req.params.id;

    const updatableItems = ["barcode", "locationID", "noInBuilding", "code", "description", "categoryID", "serialNumber", "condition", "responsibleUsername",
        "acquisitionDate", "acquisitionCost", "residualValue", "depreciationType"]
    const requestParams = Object.keys(req.body);

    // Loop through the keys of request body to get aspects of item to update
    for (var i in requestParams) {
        // Check if item is a valid parameter to update
        if (updatableItems.includes(requestParams[i])) {
            // Run update query
            pool.query(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`, [req.body[requestParams[i]], assetID]).then(fetchResult => {
                
            }).catch(err => {
                return res.status(500).json({message: Errors[9]})
            });
        }else {
            // What to do if item not in possible items to update
            return res.status(404).json({message: Errors[43]})
        }
    }

    // Add log
    Log.createLog(req.ip, req.id, Logs.UPDATE_ASSET, Number.parseInt(assetID)).then((_: any) => {
        return res.json({message: Succes[11]})
    }).catch((err: any) => {
        return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
    })
});


router.get('/view', checkifAuthenticated,  checkifAuthorized('Asset Administrator'), (req, res) => {
    Asset.displayAllAssetTags().then(data => {
        res.status(200).json(data);
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[2],
        })
    });
})

router.get('/view/:id', checkifAuthenticated, checkifAuthorized('Asset User'), (req, res) => {
    // Get asset tag from request params
    let asset_id = req.params.id;
    console.log(asset_id);

    // Query database for details of asset with given assettag
    pool.query(assetTable.getAssetDetails, [asset_id]).then(fetchResult => {
        console.log("DB Request Done!")
        if (fetchResult.rowCount <= 0) {
            res.status(404).json({
                message: Errors[8],
            })
        }else{
            console.log(fetchResult.rows[0])
            res.status(200).json(fetchResult.rows[0]);
        }
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[9]
        })
    });
});

router.get('/get/:item', (req, res) => {
    let item = req.params.item;
    let query;
    let arguements: any[];
    let errorMessage: string;

    if (item === "assetCategory") {
        query = assetTable.assetCategories;
        arguements = [];
        errorMessage = Errors[22];
    } else if (item === "assets") {
        query = assetTable.getAllAssets;
        arguements = [];
        errorMessage = Errors[8];
    } else if(item === "assetLocations") {
        query = assetTable.getAllAssetsWithLocationID;
        arguements = [];
        errorMessage = Errors[8];
    } else {
        return res.status(400).json({message: Errors[0]})
    }

    // Return category name with the number of assets in it
    pool.query(query, arguements).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: errorMessage})
        }
        return res.json(fetchResult.rows)
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
});

router.get('/assetData', (req, res) => {
    // Fetch asset net value and total number of assets
    pool.query(assetTable.getAssetNetAndTotal).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: Errors[8]})
        }
        let netValTotal = fetchResult.rows[0];
        // Fetch number of assets added in the last 12 months
        pool.query(assetTable.getAssetAddedInLast12Months).then(fetchResult2 => {
            if(fetchResult2.rowCount <= 0) {
                console.log(5)
                return res.status(400).json({message: Errors[8]})
            }
            let assetsAdded = fetchResult2.rows[0];
            
            // Get number of users
            pool.query(userTable.getNumberOfUsers).then(fetchResult3 => {
                if(fetchResult3.rowCount <= 0) {
                    console.log(8)
                    return res.status(400).json({message: Errors[8]})
                }
                let users = fetchResult3.rows[0];
                // Combine all data
                let data = {...netValTotal, ...assetsAdded, ...users};
                res.json(data);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({message: Errors[9]})
            })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({message: Errors[9]})
        });
        
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
})

router.delete('/delete/:barcode', (req, res) => {
    let barcode = req.params.barcode

    // Run query
    pool.query(assetTable.deleteAsset, [barcode]).then(fetchResult => {
        return res.json({message: Succes[7]})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
})


router.get('/search', (req, res) => {
    const query = req.query.query;

    // Search database with query
    pool.query(assetTable.searchForAsset, [query]).then(fetchResult => {
        return res.json(fetchResult.rows)
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    });
});

router.get('/filter', (req, res) => {
    // Get arguements from request
    let location = req.query.locationID;
    let category = req.query.categoryID;

    let locationID: number | undefined;
    let categoryID: number | undefined;

    if(location && typeof location === "string") {
        locationID = Number.parseInt(location);
    }
    if(category && typeof category === "string") {
        categoryID = Number.parseInt(category);
    }

    filterAssetByDetails({locationID, categoryID}).then(data => {
        return res.json(data);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({message: Errors[9]})
    });
});

router.post('/testUpload', upload.single('file'), (req, res) => {
    try {
        console.log(req.file);
        res.send("Hello");
    } catch(err) {
        console.log(err);
        res.status(500).send("Could Not Send File");
    }
});

router.route("*", (req, res) => {
    res.status(404).json({message: "Route not found"});
});

export default router;
