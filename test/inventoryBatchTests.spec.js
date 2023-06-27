import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createAsset, createLocation, createGatePassAuthorization } from "./commonTestFunctions.js";
import { assert } from "chai";
import { assignGatePass } from '../built/GatePass/assignGatepass.js';
import MyError from "../built/utility/myError.js";
import { Errors } from "../built/utility/constants.js";
import { getApprovers } from "../built/GatePass/getApprovers.js";
import { createInventory } from '../built/GatePass/createInventory.js'

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