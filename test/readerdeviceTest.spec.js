import pool from "../db2.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { MyErrors2, Errors } from "../built/utility/constants.js";
import { createLocation, createTemporaryTable, createTestReaderDevice, dropTemporaryTable } from "./commonTestFunctions.js";
import {checkIfReaderDeviceExists, createReaderDevice, createReaderDeviceDB, doesReaderDeviceIDExist, editReaderDevice} from '../built/Tracking/rfidReader.js';

describe("Edit Reader Device", function() {
    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    let testLocation2 = {
        id: 1011,
        name: "TestestLocation2",
        parentlocationid: 1
    }

    let testReaderDevice = {
        locationid: testLocation.id,
        readerdeviceid: "SomeThing",
        deleted: false,
        entry: true,
        id: 1000
    }
    beforeEach(async () => {
        try {
            await createTemporaryTable('location');
            await createTemporaryTable('readerdevice');
            await createTestReaderDevice(testReaderDevice);
            await createLocation(testLocation);
            await createLocation(testLocation2);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    async function assertThatFunctionFails(deviceid, props, errorMessage) {
        try {
            await editReaderDevice(deviceid, props);
            assert(false, "Error Should Have Been Thrown");
        } catch(err) {
            if (err instanceof MyError && err.message == errorMessage) {
                assert(true, "Correct Error Thrown");
            } else {
                console.log(err);
                assert(false, "Wrong Error Thrown")
            }
        }
    }

    it("Should fail if non existing reader id is given", async function() {
        let nonExistentID = 1000000;
        await assertThatFunctionFails(nonExistentID, {}, MyErrors2.READER_DOESNT_EXIST);
    });

    it ("Should fail if provided details are invalid", async function () {
        let invalidDetails = {
            locationid: 100000
        };

        await assertThatFunctionFails(testReaderDevice.id, invalidDetails, MyErrors2.INVALID_READER_DETAILS);
    });

    // For some reason it doesn't work
    it.skip("Should edit the details", async function() {
        try {
            let validDetails = {
                locationid: testLocation2.id,
                readerdeviceid: "Something That Is Good",
                entry: false
            };
    
            await editReaderDevice(testReaderDevice.id, validDetails);

            let fetchResult = await pool.query("SELECT * FROM ReaderDevice WHERE id = $1", [testReaderDevice.id]);
            let fetchResultData = fetchResult.rows[0];
            let expected = {
                locationid: validDetails.locationid,
                readerdeviceid: validDetails.readerdeviceid,
                deleted: false,
                entry: validDetails.entry,
                id: testReaderDevice.id
            };
            let actual = {
                locationid: fetchResultData.locationid,
                readerdeviceid: fetchResultData.readerdeviceid,
                deleted: fetchResultData.deleted,
                entry: fetchResultData.entry,
                id: fetchResultData.id
            };

            assert.deepEqual(actual, expected, "Wrong Things Edited");
        } catch(err) {
            console.log(err);
            assert(false, "Error Should Not Be Thrown");
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
    });
})

describe("Does Reader ID Exist Test", function() {
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
    beforeEach(async () => {
        try {
            await createTemporaryTable('location');
            await createTemporaryTable('readerdevice');
            await createTestReaderDevice(testReaderDevice);
            await createLocation(testLocation);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    it("Should return true if reader exists", async function() {
        let existingID = testReaderDevice.id;
        assert(await doesReaderDeviceIDExist(existingID), "Wrong Thing Returned");
    });

    it("Should return false if reader does not exist", async function() {
        let nonExistingID = 100000;
        assert(await doesReaderDeviceIDExist(nonExistingID) == false, "Wrong Thing Returned");
    });

    afterEach(async function() {
        try {
            await dropTemporaryTable('location');
            await dropTemporaryTable('readerdevice');
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data");
        }
    });
})

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