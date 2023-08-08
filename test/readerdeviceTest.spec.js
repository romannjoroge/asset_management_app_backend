import pool from "../db2.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { MyErrors2, Errors } from "../built/utility/constants.js";
import { createLocation, createTemporaryTable, createTestReaderDevice, dropTemporaryTable } from "./commonTestFunctions.js";
import {checkIfReaderDeviceExists, createReaderDevice, createReaderDeviceDB} from '../built/Tracking/rfidReader.js';

describe("Check If Reader Device Is Created", () => {
    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    let testReaderDevice = {
        locationid: testLocation.id,
        readerdeviceid: "SomeThing",
        deleted: false,
        entry: true,
        id: 1000
    }

    beforeEach(async function() {
        try {
            await createTemporaryTable('location');
            await createTemporaryTable('readerdevice');
            await createLocation(testLocation);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    it("Should Create Reader Device in database", async function() {
        try {
            await createReaderDeviceDB(testReaderDevice.readerdeviceid, testReaderDevice.locationid, testReaderDevice.entry);
            let fetchResult = await pool.query("SELECT * FROM ReaderDevice WHERE readerdeviceid = $1", [testReaderDevice.readerdeviceid]);
            let returnedData = fetchResult.rows[0];
            let createdReader = {
                locationid: returnedData.locationid,
                readerdeviceid: returnedData.readerdeviceid,
                deleted: returnedData.deleted,
                entry: returnedData.entry
            };
            let expectedReader = {
                locationid: testReaderDevice.locationid,
                readerdeviceid: testReaderDevice.readerdeviceid,
                deleted: testReaderDevice.deleted,
                entry: testReaderDevice.entry
            }
            assert.deepEqual(expectedReader, createdReader, "Wrong Thing Created");
        } catch(err) {
            console.log(err);
            assert(false, "Should Not Throw Error");
        }
    })

    afterEach(async function() {
        try {
            await dropTemporaryTable('location');
            await dropTemporaryTable('readerdevice');
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data");
        }
    })
});

describe("Check If Reader Device Exists Tests", () => {

    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    let testReaderDevice = {
        locationid: testLocation.id,
        readerdeviceid: "SomeThing",
        deleted: false,
        entry: true,
        id: 1000
    }

    beforeEach(async function() {
        try {
            await createTemporaryTable('location');
            await createLocation(testLocation);
            await createTemporaryTable('readerdevice');
            await createTestReaderDevice(testReaderDevice);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    })

    it("Should return false if reader device does not exist", async function() {
        try {
            let nonExistentID = "Does Not Exist";
            let doesExist = await checkIfReaderDeviceExists(nonExistentID);
            assert(doesExist == false, "Wrong thing returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Be Thrown");
        }
    });

    it("Should return true if reader device does exist", async function() {
        try {
            let doesExist = await checkIfReaderDeviceExists(testReaderDevice.readerdeviceid);
            assert(doesExist, "Wrong thing returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Be Thrown");
        }
    });

    afterEach(async function() {
        try {
            await dropTemporaryTable('readerdevice');
            await dropTemporaryTable('location');
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data");
        }
    })
})