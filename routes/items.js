import express from 'express';
const router = express.Router();
import Asset from '../src/Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';
import pool from '../db2.js';
import assetTable from '../src/Allocation/Asset/db_assets.js';
import checkifAuthorized from '../middleware/checkifAuthorized.js';
import checkifAuthenticated from '../middleware/checkifAuthenticated.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../src/Allocation/Category/category2.js';
import userTable from '../src/Users/db_users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// router.get('/', test)
router.post('/add', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    // Get asset values from request
    let {
        fixed,
        assetLifeSpan,
        acquisitionDate,
        locationID,
        status,
        custodianName,
        acquisitionCost,
        insuranceValue,
        categoryName,
        attachments,
        assetTag,
        makeAndModelNo,
        serialNumber,
        residualValue
    } = req.body;

    // Convert values to right type
    fixed = (fixed === 'true');
    assetLifeSpan = Number.parseInt(assetLifeSpan);
    acquisitionCost = Number.parseFloat(acquisitionCost);
    insuranceValue = Number.parseFloat(insuranceValue);
    residualValue = Number.parseFloat(residualValue)

    let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, 
                            status, custodianName, acquisitionCost, insuranceValue, 
                            categoryName, attachments, assetTag, makeAndModelNo, serialNumber, 
                            residualValue);

    asset.initialize().then(data => {
        // Get Depreciation Details
        Category._getDepreciationDetails(categoryName).then(data => {
            // Create Depreciation Schedule
            Asset.createDepreciationSchedule(data.depType, asset.assetTag, asset.assetLifeSpan,asset.acquisitionCost,asset.acquisitionDate, asset.residualValue, data.perc).then(_ => {
                return res.json({message: Succes[1]});
            })
        }).catch(er => {
            console.log(er);
            return res.status(500).json({message: Errors[9]});
        })
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[1],
        })
    });
})
// router.put('/update', updateItem)
// router.delete('/remove', removeItem)
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
    let assetTag = req.params.id;

    // Query database for details of asset with given assettag
    pool.query(assetTable.getAssetDetails, [assetTag]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            res.status(404).json({
                message: Errors[8],
            })
        }else{
            res.status(200).json(fetchResult.rows[0]);
        }
    }).catch(e => {
        res.status(500).json({
            message: Errors[9]
        })
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
    } else if (item === "assets") {
        query = assetTable.getAllAssets;
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
                return res.status(400).json({message: Errors[8]})
            }
            let assetsAdded = fetchResult2.rows[0];
            
            // Get number of users
            pool.query(userTable.getNumberOfUsers).then(fetchResult3 => {
                if(fetchResult3.rowCount <= 0) {
                    return res.status(400).json({message: Errors[8]})
                }
                let users = fetchResult3.rows[0];
                // Combine all data
                let data = {...netValTotal, ...assetsAdded, ...users};
                console.log(data);
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

router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let {
        commandCode, 
        hardwareKey,
        tagRecNums,
        tagRecords
    } = req.body;
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
                })
            });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({message: Errors[9]})
        })
    }
    res.send("Done");
})

// 192.168.0.180:80

router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
})
// router.route('*', (req, res) => {
//     res.status(404).json({ data: 'Resource not found' })
// })

export default router;