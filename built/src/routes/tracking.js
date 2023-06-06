"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db2_js_1 = __importDefault(require("../../db2.js"));
const db_location_js_1 = __importDefault(require("../Tracking/db_location.js"));
const constants_js_1 = require("../utility/constants.js");
const db_reports_js_1 = __importDefault(require("../Reports/db_reports.js"));
// Route to send all locations and their ids
router.get('/getLocations', (req, res) => {
    db2_js_1.default.query(db_location_js_1.default.getLocations, []).then((data) => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: constants_js_1.Errors[13]
            });
        }
        return res.status(200).json(data.rows);
    }).catch((e) => {
        console.log(e);
        return res.status(501).json({
            message: constants_js_1.Errors[9]
        });
    });
});
router.get('/children/:id', (req, res) => {
    let locationID = req.params.id;
    // Get all children of a location
    db2_js_1.default.query(db_reports_js_1.default.getChildLocations, [locationID]).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.get('/view/:item', (req, res) => {
    const item = req.params.item;
    let query;
    let queryArguements;
    let errorMessage;
    if (item == 'location') {
        query = db_location_js_1.default.getLocationSites;
        queryArguements = [];
        errorMessage = constants_js_1.Errors[13];
    }
    else if (item == 'site') {
        query = db_location_js_1.default.getSites;
        queryArguements = [];
        errorMessage = constants_js_1.Errors[34];
    }
    else {
        return res.status(400).json({ message: constants_js_1.Errors[0] });
    }
    // Get All Locations And Their Sites
    db2_js_1.default.query(query, queryArguements).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: errorMessage });
        }
        return res.json(fetchResult.rows);
    });
});
// Route for creating locations or sites
router.post('/create/:item', (req, res) => {
    const item = req.params.item;
    let itemExistParams;
    let itemExistQuery;
    let ExistErrorMessage;
    let createItemQuery;
    let createItemParams;
    let successMessage;
    if (item == 'location') {
        let { name, site, companyName } = req.body;
        itemExistParams = [name, site, companyName];
        itemExistQuery = db_location_js_1.default.doesLocationExist;
        ExistErrorMessage = constants_js_1.Errors[32];
        createItemQuery = db_location_js_1.default.createLocation;
        createItemParams = [name, companyName, site, companyName];
        successMessage = constants_js_1.Succes[5];
    }
    else if (item == 'site') {
        let { name, county, city, address, companyName } = req.body;
        itemExistParams = [name, companyName];
        itemExistQuery = db_location_js_1.default.doesSiteExist;
        ExistErrorMessage = constants_js_1.Errors[33];
        createItemQuery = db_location_js_1.default.createSite;
        createItemParams = [name, county, city, address, companyName];
        successMessage = constants_js_1.Succes[6];
    }
    else if (item == 'reader') {
        let { address, locationID, name } = req.body;
        address = Number.parseInt(address);
        locationID = Number.parseInt(locationID);
        itemExistParams = [name, locationID];
        itemExistQuery = db_location_js_1.default.doesReaderExist;
        ExistErrorMessage = constants_js_1.Errors[39];
        createItemQuery = db_location_js_1.default.createReader;
        createItemParams = [address, locationID, name];
        successMessage = constants_js_1.Succes[9];
    }
    else if (item == 'antennae') {
        let { readerID, name, entry } = req.body;
        readerID = Number.parseInt(readerID);
        itemExistParams = [name, readerID];
        itemExistQuery = db_location_js_1.default.doesAntennaeExist;
        ExistErrorMessage = constants_js_1.Errors[40];
        createItemQuery = db_location_js_1.default.createAntennae;
        createItemParams = [name, readerID, entry];
        successMessage = constants_js_1.Succes[10];
    }
    else {
        return res.status(400).json({ message: constants_js_1.Errors[0] });
    }
    // Confirm if item exists
    db2_js_1.default.query(itemExistQuery, itemExistParams).then(fetchResult => {
        // If item exists return error
        if (fetchResult.rowCount > 0) {
            return res.status(400).json({ message: ExistErrorMessage });
        }
        // Create item
        db2_js_1.default.query(createItemQuery, createItemParams).then(_ => {
            return res.json({ message: successMessage });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: constants_js_1.Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' });
});
exports.default = router;
