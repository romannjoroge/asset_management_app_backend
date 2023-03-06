import express from 'express';
const router = express.Router();
import Asset from '../src/Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';

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
router.post('/add', (req, res) => {
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
        // Log new asset created

        res.status(201).json({
            message: Succes[1],
        })
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[1],
        })
    });
})
// router.put('/update', updateItem)
// router.delete('/remove', removeItem)
router.get('/view', (req, res) => {
    Asset.displayAllAssetTags().then(data => {
        res.status(200).json({
            data
        });
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[2],
        })
    });
})
// router.get('/view/:id', getItem)
// router.route('*', (req, res) => {
//     res.status(404).json({ data: 'Resource not found' })
// })

export default router;