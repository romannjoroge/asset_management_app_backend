import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createAsset, createLocation, createGatePassAuthorization } from "./commonTestFunctions.js";
import { assert } from "chai";
import { assignGatePass } from '../built/GatePass/assignGatepass.js';
import MyError from "../built/utility/myError.js";
import { Errors } from "../built/utility/constants.js";
import { getApprovers } from "../built/GatePass/getApprovers.js";
import { createInventory } from '../built/GatePass/createInventory.js'
import { createBatch } from '../built/GatePass/createBatch.js';

describe("Create Inventory Test", function() {
    beforeEach(async function() {
        try {
            await createTemporaryTable("Inventory");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    })

    it("should create an inventory", async function() {
        let name = "Test";
        try {
            await createInventory(name);
            let result = await pool.query('SELECT name FROM Inventory');
            assert.equal(name, result.rows[0]['name']);
        } catch(err) {
            console.log(err);
            assert(false, "No Error Meant To Be Thrown")
        }
    });

    this.afterEach(async function() {
        try {
            await dropTemporaryTable("Inventory")
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data");
        }
    })
});

describe("Create Batch Test", function() {
    let location = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    beforeEach(async function() {
        try {
            await createTemporaryTable("Batch");
            await createTemporaryTable("Location");
            await createLocation(location);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data")
        }
    });

    it("should fail when location doesn't exist", async function(){
        let date = new Date(2021, 2, 12);
        let comments = "Comment";
        let locationID = 1000;
        try {
            await createBatch(date, comments, locationID);
            assert(false, "Error Should Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message == Errors[66], err.message);
        }
    });

    it("should create batch", async function() {
        let date = new Date(2021, 2, 12);
        let comments = "Comment";
        let locationID = location.id;
        try {
            await createBatch(date, comments, locationID);
            let result = await pool.query("SELECT * FROM Batch WHERE date = $1", [date]);
            let createdBatch = {
                date: result.rows[0]['date'],
                comments: result.rows[0]['comments'],
                locationID: result.rows[0]['locationid'],
            }
            assert.deepEqual(createdBatch, {
                date: date,
                comments: comments,
                locationID: locationID
            }, "Batch Not Created Nicely")
        } catch(err) {
            console.log(err);
            assert(false, "Error Not Meant To Be Thrown");
        }
    });

    afterEach(async function() {
        try {
            await dropTemporaryTable("Batch");
            await dropTemporaryTable("Location");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data")
        }
    })
});