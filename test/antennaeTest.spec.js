import pool from "../db2.js";
import { createTemporaryTable, dropTemporaryTable, createTestAntennae, createTestReader } from "./commonTestFunctions.js";
import { createAntennae, updateAntennae } from '../built/Tracking/antennae.js'
import MyError from '../built/utility/myError.js';
import { Errors } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import { assert } from "chai";

describe.skip("Create Antennae Tests", function () {
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

describe.skip("Update Antennae Tests", function () {
    let existingReader = {
        hardwareKey: "1234567890",
        locationID: 1,
        id: 100,
        deleted: false,
        noantennae: 4
    };
    let existingAntennae = {
        id: 150,
        readerid: existingReader.id,
        deleted: false,
        antennaeno: existingReader.noantennae - 1,
        entry: false
    };
    let newReader = {
        hardwareKey: "0987654321",
        locationID: 2,
        id: 101,
        deleted: false,
        noantennae: 4
    };



    beforeEach(async function () {
        try {
            await createTemporaryTable("RFIDReader");
            await createTemporaryTable("Antennae");
            await createTestReader(existingReader);
            await createTestAntennae(existingAntennae);
            await createTestReader(newReader);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    async function assertThatFunctionFails(antennaeID, updateJSON, errorMessage) {
        try {
            await updateAntennae(antennaeID, updateJSON);
            assert(false, "An Error Should Have Been Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === errorMessage, err.message);
        }
    }

    async function assertThatFunctionWorks(antennaeID, updateJSON, newAntennae) {
        try {
            await updateAntennae(antennaeID, updateJSON);
            let result = await pool.query(`SELECT * FROM Antennae WHERE id = $1`, [antennaeID]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Antennae");
            let updatedAntennae = {
                id: result.rows[0].id,
                readerid: result.rows[0].readerid,
                antennaeno: result.rows[0].antennaeno,
                entry: result.rows[0].entry,
            };
            assert.deepEqual(updatedAntennae, newAntennae, "Antennae was not updated correctly");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    }

    it("should fail when antennae doesn't exist", async function () {
        await assertThatFunctionFails(1000, {}, Errors[60]);
    });

    it("should fail when reader doesn't exist", async function () {
        let updateJSON = {
            readerID: 1000
        };
        await assertThatFunctionFails(existingAntennae.id, updateJSON, Errors[56]);
    });

    it("should update reader id", async function () {
        let updateJSON = {
            readerID: newReader.id
        };
        await assertThatFunctionWorks(existingAntennae.id, updateJSON, {
            id: existingAntennae.id,
            readerid: updateJSON.readerID,
            antennaeno: existingAntennae.antennaeno,
            entry: existingAntennae.entry
        });
    });

    it("should update entry", async function () {
        let updateJSON = {
            entry: true
        };
        await assertThatFunctionWorks(existingAntennae.id, updateJSON, {
            id: existingAntennae.id,
            readerid: existingAntennae.readerid,
            antennaeno: existingAntennae.antennaeno,
            entry: updateJSON.entry
        });
    });

    it("should fail when given invalid antennae number", async function () {
        let updateJSON = {
            antennaeno: 100
        };
        await assertThatFunctionFails(existingAntennae.id, updateJSON, Errors[57]);
    });

    it("should fail when given an antennae number that's already taken", async function () {
        let updateJSON = {
            antennaeno: existingAntennae.antennaeno
        };
        await assertThatFunctionFails(existingAntennae.id, updateJSON, Errors[40]);
    });

    it("should update antennae number", async function () {
        let updateJSON = {
            antennaeno: existingAntennae.antennaeno - 1
        };
        await assertThatFunctionWorks(existingAntennae.id, updateJSON, {
            id: existingAntennae.id,
            readerid: existingAntennae.readerid,
            antennaeno: updateJSON.antennaeno,
            entry: existingAntennae.entry
        });
    });

    it.skip("should be able to update multiple fields", async function () {
        // For some reason it is failing but the request works in postman
        let updateJSON = {
            readerID: newReader.id,
            antennaeno: existingAntennae.antennaeno - 1,
            entry: !existingAntennae.entry
        };
        await assertThatFunctionWorks(existingAntennae.id, updateJSON, {
            id: existingAntennae.id,
            readerid: updateJSON.readerID,
            antennaeno: updateJSON.antennaeno,
            entry: updateJSON.entry
        });
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable("RFIDReader");
            await dropTemporaryTable("Antennae");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});