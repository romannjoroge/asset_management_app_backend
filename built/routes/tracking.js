var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import createLocation from '../Tracking/create_location.js';
import handleError from '../utility/handleError.js';
import multer from 'multer';
import { getDataFromExcel } from '../Excel/getDataFromExcelFile.js';
import Location from '../Tracking/location.js';
const upload = multer({ dest: './attachments' });
import User from '../Users/users.js';
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
router.post('/bulkAdd', upload.single("excel"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let file = req.file;
        //@ts-ignore
        let company = yield User.getCompanyName(req.id);
        if (file) {
            let data = getDataFromExcel(file.path);
            console.log(data);
            function addLocation(data) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let parentlocationid;
                        if (data.parentlocation) {
                            parentlocationid = (_a = yield Location.getLocationID(data.parentlocation)) !== null && _a !== void 0 ? _a : undefined;
                            if (!parentlocationid) {
                                throw new MyError(MyErrors2.NOT_GET_PARENT_LOCATION);
                            }
                        }
                        yield createLocation(data.name, company, parentlocationid);
                    }
                    catch (err) {
                        console.log(err);
                        if (err instanceof MyError) {
                            throw err;
                        }
                        else {
                            throw new MyError(MyErrors2.NOT_CREATE_LOCATION);
                        }
                    }
                });
            }
            let promises = [];
            for (let d of data) {
                //@ts-ignore
                promises.push(addLocation(d));
            }
            yield Promise.all(promises);
            return res.status(201).json({ message: Success2.CREATED_LOCATION });
        }
        else {
            return res.status(500).json({ message: MyErrors2.NOT_PROCESS_EXCEL_FILE });
        }
    }
    catch (err) {
        console.log(err);
        let { errorMessage, errorCode } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
    }
}));
// Route for creating locations or sites
router.post('/create', (req, res) => {
    let { parentlocationid, name, companyName } = req.body;
    parentlocationid = Number.parseInt(parentlocationid);
    // Create location
    createLocation(name, companyName, parentlocationid).then(_ => {
        return res.status(201).json({ message: Success2.CREATED_LOCATION });
    }).catch((err) => {
        const { errorMessage, errorCode } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
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