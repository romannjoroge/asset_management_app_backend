import pool from "../db2.js";
import { createTemporaryTable, dropTemporaryTable, createTestAntennae, createTestReader } from "./commonTestFunctions.js";
import { createAntennae } from '../built/Tracking/antennae.js'
import MyError from '../built/utility/myError.js';
import { Errors } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import { assert } from "chai";

describe("Create Antennae Tests", function () {
    let existingReader = {
        hardwareKey: "1234567890",
        locationID: 1,
        id: 100,
        deleted: false,
        noantennae: 4
    };
    let existingAntennae = {
        id: 100,
        readerid: existingReader.id,
        deleted: false,
        antennaeno: existingReader.noantennae - 1,
        entry: false
    };



    beforeEach(async function () {
        try {
            await createTemporaryTable("RFIDReader");
            await createTemporaryTable("Antennae");
            await createTestReader(existingReader);
            await createTestAntennae(existingAntennae);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    it("should bring an error when an existing antennae is given", async function () {
        try {
            await createAntennae(existingAntennae.antennaeno, existingAntennae.readerid, existingAntennae.entry);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[40], err.message);
        }
    });

    it("should bring an error when an invalid reader is given", async function () {
        let nonExistingReader = 1000;
        try {
            await createAntennae(1, nonExistingReader, false);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[56], err.message);
        }
    });

    it("should bring an error when an invalid antennae number is given", async function () {
        let invalidAntennaeNumber = existingReader.noantennae + 1;
        try {
            await createAntennae(invalidAntennaeNumber, existingReader.id, false);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[57], err.message);
        }
    });

    it("should create a new antennae", async function () {
        let newAntennae = {
            readerid: existingReader.id,
            antennaeno: existingReader.noantennae - 2,
            entry: false
        };

        try{
            await createAntennae(newAntennae.antennaeno, newAntennae.readerid, newAntennae.entry);
            let result = await pool.query(`SELECT * FROM Antennae WHERE readerID = ${newAntennae.readerid} AND antennaeNo = ${newAntennae.antennaeno}`);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Antennae");
            let createdAntennae = {
                readerid: result.rows[0].readerid,
                antennaeno: result.rows[0].antennaeno,
                entry: result.rows[0].entry,
            };
            assert.deepEqual(createdAntennae, newAntennae, "Antennae was not created correctly");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });

    this.afterEach(async function () {
        try{
            await dropTemporaryTable("RFIDReader");
            await dropTemporaryTable("Antennae");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});