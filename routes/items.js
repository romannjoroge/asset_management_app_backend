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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const {
//     addItem,
//     removeItem,
//     updateItem,
//     getItem,
//     getItems,
//     calculateNewPrice
// } = require('../logic/items')

// const {test} = require('../test/routes_test') 
// const { route } = require('./tracking')
// Test to see if the route is reachable

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

    if (item === "assetCategory") {
        // Return category name with the number of assets in it
        pool.query(assetTable.assetCategories, []).then(fetchResult => {
            if(fetchResult.rowCount <= 0) {
                return res.status(400).json({message: Errors[22]})
            }
            return res.json(fetchResult.rows)
        })
    } else {
        return res.status(400).json({message: Errors[0]})
    }
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