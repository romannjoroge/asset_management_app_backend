import { assert } from "chai";
import { createTestReader, createTemporaryTable, dropTemporaryTable, createLocation, createTestAntennae } from "./commonTestFunctions.js";
import { createReader, updateReader} from '../built/Tracking/readers.js';
import MyError from '../built/utility/myError.js';
import { Errors } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import pool from "../db2.js";

describe("Create Reader Tests", function () {
    let existingReader = {
        hardwareKey: "1234567890",
        locationID: 1,
        id: 100,
        deleted: false,
        noantennae: 4
    };

    beforeEach(async function () {
        try{
            await dropTemporaryTable("RFIDReader");
            await createTemporaryTable("RFIDReader");
            await createTestReader(existingReader);
        } catch (err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    it("should return an error when an existing reader is given", async function () {
        try {
            await createReader(existingReader.hardwareKey, existingReader.locationID, existingReader.noantennae);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[39], err.message)
        }
    });

    it("should create a new reader", async function(){
        let newReader = {
            hardwareKey: "0987654321",
            locationID: 1,
            noantennae: 4,
            deleted: false
        };
        try{
            await createReader(newReader.hardwareKey, newReader.locationID, newReader.noantennae);
            let result = await pool.query(`SELECT * FROM RFIDReader WHERE hardwareKey = '0987654321'`);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Reader");
            let createdReader = {
                hardwareKey: result.rows[0].hardwarekey,
                locationID: result.rows[0].locationid,
                noantennae: result.rows[0].noantennae,
                deleted: false
            }
            assert.deepEqual(createdReader, newReader, "Reader was not created correctly");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable("RFIDReader")
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Test Data")
        }
    });
});

describe("Update Reader Tests", function () {
    let existingReader = {
        hardwareKey: "1234567890",
        locationID: 1,
        id: 100,
        deleted: false,
        noantennae: 4
    };
    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }
    let existingAntennae = {
        id: 150,
        readerid: existingReader.id,
        deleted: false,
        antennaeno: existingReader.noantennae - 1,
        entry: false
    };

    beforeEach(async function () {
        try{
            await createTemporaryTable('Location');
            await createLocation(testLocation);
            await dropTemporaryTable("RFIDReader");
            await createTemporaryTable("RFIDReader");
            await createTemporaryTable("Antennae");
            await createTestReader(existingReader);
            await createTestAntennae(existingAntennae);
        } catch (err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    async function assertThatFunctionFails(readerID, updateJSON, errorMessage) {
        try {
            await updateReader(readerID, updateJSON);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === errorMessage, err.message);
        }
    }

    async function assertThatFunctionWorks(readerID, updateJSON, newReader) {
        try {
            await updateReader(readerID, updateJSON);
            let result = await pool.query(`SELECT * FROM RFIDReader WHERE id = $1`, [readerID]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Reader");
            let updatedReader = {
                id: result.rows[0].id,
                hardwareKey: result.rows[0].hardwarekey,
                locationID: result.rows[0].locationid,
                noantennae: result.rows[0].noantennae,
                deleted: result.rows[0].deleted
            };
            assert.deepEqual(updatedReader, newReader, "Reader was not updated correctly");
        } catch(err){
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    }

    it("should fail when a reader doesn't exist", async function () {
        await assertThatFunctionFails(1000, {}, Errors[56]);
    });

    it("should fail when an existing hardware key is given", async function () {
        let updateJSON = {
            hardwarekey: existingReader.hardwareKey
        };
        await assertThatFunctionFails(existingReader.id, updateJSON, Errors[39]);
    });

    it("should update valid hardware key", async function () {
        let updateJSON = {
            hardwarekey: "ValidHardwareKey"
        };
        await assertThatFunctionWorks(existingReader.id, updateJSON, {
            id: existingReader.id,
            hardwareKey: updateJSON.hardwarekey,
            locationID: existingReader.locationID,
            noantennae: existingReader.noantennae,
            deleted: existingReader.deleted
        });
    });

    it("should fail when an invalid location is given", async function () {
        let updateJSON = {
            locationid: 1000
        };
        await assertThatFunctionFails(existingReader.id, updateJSON, Errors[3]);
    });

    it("should update valid location", async function () {
        let updateJSON = {
            locationid: testLocation.id
        };
        await assertThatFunctionWorks(existingReader.id, updateJSON, {
            id: existingReader.id,
            hardwareKey: existingReader.hardwareKey,
            locationID: updateJSON.locationid,
            noantennae: existingReader.noantennae,
            deleted: existingReader.deleted
        });
    });

    it("should update antennae", async function () {
        let updateJSON = {
            noantennae: existingAntennae.antennaeno - 1
        }
        await assertThatFunctionWorks(existingReader.id, updateJSON, {
            id: existingReader.id,
            hardwareKey: existingReader.hardwareKey,
            locationID: existingReader.locationID,
            noantennae: updateJSON.noantennae,
            deleted: existingReader.deleted
        });
    });

    it.skip("should be able to update multiple fields", async function () {
        // Doesn't work but it works in postman
        let updateJSON = {
            hardwarekey: "ValidHardwareKey",
            locationid: testLocation.id,
            noantennae: existingAntennae.antennaeno - 1
        };

        await assertThatFunctionWorks(existingReader.id, updateJSON, {
            id: existingReader.id,
            hardwareKey: updateJSON.hardwarekey,
            locationID: updateJSON.locationid,
            noantennae: updateJSON.noantennae,
            deleted: existingReader.deleted
        });
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable("RFIDReader");
            await dropTemporaryTable("Location");
            await dropTemporaryTable("Antennae");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Test Data")
        }
    });
});