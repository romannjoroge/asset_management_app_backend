import { assert } from "chai";
import { createTestReader, createTemporaryTable, dropTemporaryTable } from "./commonTestFunctions.js";
import { createReader} from '../built/Tracking/readers.js';
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