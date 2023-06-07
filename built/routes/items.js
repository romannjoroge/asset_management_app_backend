import express from 'express';
const router = express.Router();
import Asset from '../Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';
import pool from '../../db2.js';
import assetTable from '../Allocation/Asset/db_assets.js';
import checkifAuthorized from '../../middleware/checkifAuthorized.js';
import checkifAuthenticated from '../../middleware/checkifAuthenticated.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import userTable from '../Users/db_users.js';
import { filterAssetByDetails } from '../Allocation/Asset/filter.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.post('/add', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    let { barcode, locationID, noInBuilding, code, description, categoryName, usefulLife, serialNumber, condition, responsibleUsername, acquisitionDate, acquisitionCost, residualValue, depreciationType, depreciationPercent, attachments } = req.body;
    // Convert values to right type
    noInBuilding = Number.parseInt(noInBuilding);
    usefulLife = Number.parseInt(usefulLife);
    acquisitionCost = Number.parseFloat(acquisitionCost);
    residualValue = Number.parseFloat(residualValue);
    if (depreciationPercent) {
        depreciationPercent = Number.parseFloat(depreciationPercent);
    }
    let asset = new Asset(barcode, usefulLife, acquisitionDate, locationID, condition, responsibleUsername, acquisitionCost, categoryName, attachments, noInBuilding, serialNumber, code, description, residualValue, depreciationType, depreciationPercent);
    asset.initialize().then(_ => {
        return res.send(Succes[1]);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.post('/update/:id', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    // Get barcode from request
    let assetID = req.params.id;
    console.log(req.body);
    const updatableItems = ["barcode", "locationID", "noInBuilding", "code", "description", "categoryID", "usefulLife", "serialNumber", "condition", "responsibleUsername",
        "acquisitionDate", "acquisitionCost", "residualValue", "depreciationType"];
    const requestParams = Object.keys(req.body);
    console.log("THE REQUEST PARAMS: ", requestParams);
    // Loop through the keys of request body to get aspects of item to update
    for (var i in requestParams) {
        console.log("Loop entered");
        // Check if item is a valid parameter to update
        if (updatableItems.includes(requestParams[i])) {
            // Run update query
            console.log(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`);
            pool.query(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`, [req.body[requestParams[i]], assetID]).then(fetchResult => {
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: Errors[9] });
            });
        }
        else {
            // What to do if item not in possible items to update
            return res.status(404).json({ message: Errors[43] });
        }
    }
    return res.json({ message: Succes[11] });
});
router.get('/view', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    Asset.displayAllAssetTags().then(data => {
        res.status(200).json(data);
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[2],
        });
    });
});
router.get('/view/:id', checkifAuthenticated, checkifAuthorized('Asset User'), (req, res) => {
    // Get asset tag from request params
    let assetTag = req.params.id;
    // Query database for details of asset with given assettag
    pool.query(assetTable.getAssetDetails, [assetTag]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            res.status(404).json({
                message: Errors[8],
            });
        }
        else {
            res.status(200).json(fetchResult.rows[0]);
        }
    }).catch(e => {
        res.status(500).json({
            message: Errors[9]
        });
    });
});
router.get('/get/:item', (req, res) => {
    let item = req.params.item;
    let query;
    let arguements;
    let errorMessage;
    if (item === "assetCategory") {
        query = assetTable.assetCategories;
        arguements = [];
        errorMessage = Errors[22];
    }
    else if (item === "assets") {
        query = assetTable.getAllAssets;
        arguements = [];
        errorMessage = Errors[8];
    }
    else {
        return res.status(400).json({ message: Errors[0] });
    }
    // Return category name with the number of assets in it
    pool.query(query, arguements).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: errorMessage });
        }
        return res.json(fetchResult.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.get('/assetData', (req, res) => {
    // Fetch asset net value and total number of assets
    pool.query(assetTable.getAssetNetAndTotal).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: Errors[8] });
        }
        let netValTotal = fetchResult.rows[0];
        // Fetch number of assets added in the last 12 months
        pool.query(assetTable.getAssetAddedInLast12Months).then(fetchResult2 => {
            if (fetchResult2.rowCount <= 0) {
                return res.status(400).json({ message: Errors[8] });
            }
            let assetsAdded = fetchResult2.rows[0];
            // Get number of users
            pool.query(userTable.getNumberOfUsers).then(fetchResult3 => {
                if (fetchResult3.rowCount <= 0) {
                    return res.status(400).json({ message: Errors[8] });
                }
                let users = fetchResult3.rows[0];
                // Combine all data
                let data = Object.assign(Object.assign(Object.assign({}, netValTotal), assetsAdded), users);
                console.log(data);
                res.json(data);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: Errors[9] });
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.delete('/delete/:barcode', (req, res) => {
    let barcode = req.params.barcode;
    // Run query
    pool.query(assetTable.deleteAsset, [barcode]).then(fetchResult => {
        return res.json({ message: Succes[7] });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let { commandCode, hardwareKey, tagRecNums, tagRecords } = req.body;
    // Add tag to database
    for (var i in tagRecords) {
        let tag = tagRecords[i];
        console.log(tag);
        pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, tag.antNo, tag.pc, tag.epcID, tag.crc]).then(_ => {
            // Add an entry to log.csv file
            let csvData = [{
                    commandCode,
                    hardwareKey,
                    tagRecNums,
                    antNo: tag.antNo,
                    pc: tag.pc,
                    epcID: tag.epcID,
                    crc: tag.crc
                }];
            let csvFromData = convertArrayToCSV(csvData);
            fs.appendFile(path.join(__dirname, 'tags.log'), `${new Date().toISOString()},${commandCode},${hardwareKey},${tagRecNums},${tag.antNo},${tag.pc},${tag.epcID},${tag.crc}\n`).then(_ => {
            }).catch(e => {
                console.log(e);
                return res.status(500).json({
                    message: Errors[9],
                });
            });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: Errors[9] });
        });
    }
    res.send("Done");
});
// 192.168.0.180:80
router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});
router.get('/search', (req, res) => {
    // // Get arguements from request
    // let query = req.query.query;
    // // Split query term into individual words
    // let queryTerms = query.split(",");
    // console.log(queryTerms);
    // // Removing all items that have a space
    // for (var i in queryTerms) {
    //     // Check if ith item has a space
    //     if(queryTerms[i].includes(" ")) {
    //         // Split item by the space and add to the list
    //         let newTerms = queryTerms[i].split(" ");
    //         queryTerms.push(...newTerms);
    //         // Remove the split item from list to avoid having duplicates
    //         queryTerms.splice(i, 1);
    //     } 
    // }
    // // Create query term from query terms
    // let queryString = queryTerms.join(" & ");
    // // Search database with query
    // pool.query(assetTable.searchForAsset, [queryString]).then(fetchResult => {
    //     if(fetchResult.rowCount <= 0) {
    //         return res.status(400).json({message: Errors[44]})
    //     }
    //     console.log(fetchResult.rows);
    //     return res.json(fetchResult.rows)
    // }).catch(err => {
    //     console.log(err);
    //     return res.status(500).json({message: Errors[9]})
    // });
    const query = req.query.query;
    // Search database with query
    pool.query(assetTable.searchForAsset, [query]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: Errors[44] });
        }
        return res.json(fetchResult.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.get('/filter', (req, res) => {
    // Get arguements from request
    let location = req.query.locationID;
    let category = req.query.categoryID;
    let locationID;
    let categoryID;
    if (location && typeof location === "string") {
        locationID = Number.parseInt(location);
    }
    if (category && typeof category === "string") {
        categoryID = Number.parseInt(category);
    }
    filterAssetByDetails({ locationID, categoryID }).then(data => {
        return res.json(data);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' });
});
export default router;
//# sourceMappingURL=items.js.map