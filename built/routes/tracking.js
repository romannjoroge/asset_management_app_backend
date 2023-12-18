import express from 'express';
const router = express.Router();
import pool from '../../db2.js';
import locationTable from '../Tracking/db_location.js';
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import reportsTable from '../Reports/db_reports.js';
import { createAntennae } from '../Tracking/antennae.js';
import { createReader } from '../Tracking/readers.js';
import { updateLocation } from '../Tracking/update.js';
import { getAssetsLeavingLocationAndIfAuthorized } from '../Tracking/movements.js';
import MyError from '../utility/myError.js';
import { createReaderDevice, editReaderDevice, getReaderDevices } from '../Tracking/rfidReader.js';
import { syncTags } from '../Tracking/tags.js';
import { Log } from '../Log/log.js';
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
router.get('/locationDetails', (req, res) => {
    pool.query(locationTable.getLocationDetails, []).then((data) => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[13]
            });
        }
        return res.json(data.rows);
    }).catch((e) => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9]
        });
    });
});
router.get('/getTrackedLocations', (req, res) => {
    pool.query(locationTable.getTrackedLocations, []).then((data) => {
        return res.send(data.rows);
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
    else if (item == 'reader') {
        query = locationTable.viewReaders;
        queryArguements = [];
        errorMessage = Errors[22];
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
// Gets reader devices in system
router.get("/reader", (req, res) => {
    // Run command
    getReaderDevices().then(data => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
    });
});
/**
 * @description This routes receives details of the written assets from the reader. It then sends to the reader a list of the barcodes of assets that were not found in the database
 */
router.post('/sync', (req, res) => {
    // Get data
    let tags = req.body.tags;
    // Sync tags
    syncTags(tags).then(missingAssets => {
        return res.json({ message: Success2.SYNC_CONVERTED, data: missingAssets });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
    });
});
router.post('/editReaderDevice', (req, res) => {
    let body = req.body;
    let props = {};
    let deviceID = Number.parseInt(req.body.deviceID);
    if (body.locationid) {
        props.locationid = body.locationid;
    }
    if (body.readerdeviceid) {
        props.readerdeviceid = body.readerdeviceid;
    }
    if (body.entry !== null && body.entry !== undefined) {
        props.entry = body.entry;
    }
    // Update reader device
    editReaderDevice(deviceID, props).then(_ => {
        return res.json({ message: Success2.UPDATE_READER_DEVICE });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
    });
});
// Creates a reader device
router.post('/reader', (req, res) => {
    // Get data from request
    let readerdeviceid = req.body.readerID;
    let locationid = Number.parseInt(req.body.locationID);
    let entry = req.body.entry;
    // Create reader
    createReaderDevice(readerdeviceid, locationid, entry).then(_ => {
        return res.json({ message: Success2.CREATED_READER_DEVICE });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
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
    let eventid;
    /**
     * @description This handles creating a location.
     * @param name is the name of the location to create. It must be unique in its site / parent location (to be decided if useful)
     * @param companyName the name of the organization
     * @param site name of the parent location. This is optional
     */
    if (item == 'location') {
        let { name, site, companyName } = req.body;
        eventid = Logs.CREATE_LOCATION;
        // Check if site is there
        if (!site) {
            itemExistParams = [name, companyName];
            itemExistQuery = locationTable.doesSiteExist;
            ExistErrorMessage = MyErrors2.EXISTS_LOCATION;
            createItemQuery = locationTable.createLocationWithNoParent,
                createItemParams = [name, companyName];
            successMessage = Success2.CREATED_LOCATION;
        }
        else {
            itemExistParams = [name, site, companyName];
            itemExistQuery = locationTable.doesLocationExist;
            ExistErrorMessage = MyErrors2.EXISTS_LOCATION;
            createItemQuery = locationTable.createLocation;
            createItemParams = [name, companyName, site, companyName];
            successMessage = Success2.CREATED_LOCATION;
        }
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
            // Add log
            Log.createLog(req.ip, req.id, eventid).then((_) => {
                return res.json({ message: successMessage });
            }).catch((err) => {
                return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
            });
        }).catch(err => {
            console.log(err);
            return res.status(400).json({ message: MyErrors2.NOT_CREATE_LOCATION });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
// Route for creating an antenna
router.post('/createAntennae', (req, res) => {
    // Get Data From Request
    let antennaeno = Number.parseInt(req.body.antennaeno);
    let readerID = Number.parseInt(req.body.readerID);
    let entry = req.body.entry;
    // Create Antennae
    createAntennae(antennaeno, readerID, entry).then(_ => {
        return res.json({ message: Succes[10] });
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ message: err.message });
    });
});
router.get('/movements', (req, res) => {
    let locationID = Number.parseInt(req.query.locationID);
    getAssetsLeavingLocationAndIfAuthorized(locationID).then(movements => {
        res.send(movements);
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(500).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: Errors[74] });
        }
    });
});
router.post('/updateLocation', (req, res) => {
    // Get Data From Request
    let locationID = Number.parseInt(req.body.id);
    let updateJSON = req.body.updateJSON;
    // Verify data
    let updateLocationJSON = {};
    if (updateJSON.name) {
        updateLocationJSON.name = updateJSON.name;
    }
    if (updateJSON.parentlocationid) {
        updateLocationJSON.parentlocationid = Number.parseInt(updateJSON.parentlocationid);
    }
    // Update Location
    updateLocation(locationID, updateLocationJSON).then(_ => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.UPDATE_LOCATION, locationID).then((_) => {
            return res.json({ message: Succes[14] });
        }).catch((err) => {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ message: err.message });
    });
});
// Route for creating a reader
router.post('/createReader', (req, res) => {
    // Get Data From Request
    let hardwareKey = req.body.hardwareKey;
    let locationID = Number.parseInt(req.body.locationID);
    let noantennae = Number.parseInt(req.body.noantennae);
    // Call Create Reader
    createReader(hardwareKey, locationID, noantennae).then(_ => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.CREATE_READER).then((_) => {
            return res.json({ message: Succes[9] });
        }).catch((err) => {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ message: err.message });
    });
});
router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' });
});
export default router;
//# sourceMappingURL=tracking.js.map