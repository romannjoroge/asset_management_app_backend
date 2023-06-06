import express from 'express';
const router = express.Router();
import pool from '../../db2.js';
import locationTable from '../Tracking/db_location.js';
import { Errors, Succes } from '../utility/constants.js';
import reportsTable from '../Reports/db_reports.js';
// Route to send all locations and their ids
router.get('/getLocations', (req, res) => {
    pool.query(locationTable.getLocations, []).then((data) => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[13]
            });
        }
        return res.status(200).json(data.rows);
    }).catch((e) => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9]
        });
    });
});
router.get('/children/:id', (req, res) => {
    let locationID = req.params.id;
    // Get all children of a location
    pool.query(reportsTable.getChildLocations, [locationID]).then(data => {
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.get('/view/:item', (req, res) => {
    const item = req.params.item;
    let query;
    let queryArguements;
    let errorMessage;
    if (item == 'location') {
        query = locationTable.getLocationSites;
        queryArguements = [];
        errorMessage = Errors[13];
    }
    else if (item == 'site') {
        query = locationTable.getSites;
        queryArguements = [];
        errorMessage = Errors[34];
    }
    else {
        return res.status(400).json({ message: Errors[0] });
    }
    // Get All Locations And Their Sites
    pool.query(query, queryArguements).then(fetchResult => {
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
        itemExistQuery = locationTable.doesLocationExist;
        ExistErrorMessage = Errors[32];
        createItemQuery = locationTable.createLocation;
        createItemParams = [name, companyName, site, companyName];
        successMessage = Succes[5];
    }
    else if (item == 'site') {
        let { name, county, city, address, companyName } = req.body;
        itemExistParams = [name, companyName];
        itemExistQuery = locationTable.doesSiteExist;
        ExistErrorMessage = Errors[33];
        createItemQuery = locationTable.createSite;
        createItemParams = [name, county, city, address, companyName];
        successMessage = Succes[6];
    }
    else if (item == 'reader') {
        let { address, locationID, name } = req.body;
        address = Number.parseInt(address);
        locationID = Number.parseInt(locationID);
        itemExistParams = [name, locationID];
        itemExistQuery = locationTable.doesReaderExist;
        ExistErrorMessage = Errors[39];
        createItemQuery = locationTable.createReader;
        createItemParams = [address, locationID, name];
        successMessage = Succes[9];
    }
    else if (item == 'antennae') {
        let { readerID, name, entry } = req.body;
        readerID = Number.parseInt(readerID);
        itemExistParams = [name, readerID];
        itemExistQuery = locationTable.doesAntennaeExist;
        ExistErrorMessage = Errors[40];
        createItemQuery = locationTable.createAntennae;
        createItemParams = [name, readerID, entry];
        successMessage = Succes[10];
    }
    else {
        return res.status(400).json({ message: Errors[0] });
    }
    // Confirm if item exists
    pool.query(itemExistQuery, itemExistParams).then(fetchResult => {
        // If item exists return error
        if (fetchResult.rowCount > 0) {
            return res.status(400).json({ message: ExistErrorMessage });
        }
        // Create item
        pool.query(createItemQuery, createItemParams).then(_ => {
            return res.json({ message: successMessage });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' });
});
export default router;
//# sourceMappingURL=tracking.js.map