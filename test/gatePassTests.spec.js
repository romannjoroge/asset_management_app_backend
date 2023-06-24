import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createAsset, createLocation } from "./commonTestFunctions.js";
import { assert } from "chai";
import { assignGatePass } from '../built/GatePass/assignGatepass.js';
import MyError from "../built/utility/myError.js";
import { Errors } from "../built/utility/constants.js";

describe("Assign Asset Gatepass test", function () {
    let asset = {
        assetID: 1000,
        barCode: "AUA7000",
        locationID: 1,
        noInBuilding: 1,
        code: 'AUA7000',
        description: 'This is a test asset',
        categoryID: 1,
        usefulLife: 10,
        serialNumber: 'AUA7000',
        condition: 'Good',
        responsibleUsername: 'TestUser',
        acquisitionDate: '06-13-2023',
        residualValue: 1000,
        acquisitionCost: 10000
    };

    let location = {
        id: 1000,
        name: "TestyLocation",
        parentlocationid: 1
    };

    let user = {
        username: "CoolUser",
        name: "Cool User",
        email: "cooluser@gmail.com",
        company: "TestCompany",
        password: "EWFS3424",
        usertype: 1,
    }

    beforeEach(async function () {
        try{
            await createTemporaryTable("Asset");
            await createTemporaryTable("GatePass");
            await createTemporaryTable("User2");
            await createTemporaryTable("Location");
            await createLocation(location);
            await createTemporaryTable("GatePassAsset");
            await createTestUser(user);
            await createAsset(asset);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    it("should return an error if asset does not exist", async function () {
        let gatepass = {
            username: user.name,
            fromLocation: '',
            toLocation: '',
            date: '',
            reason: '',
            barcode: 'Does Not Exist',
        };
        try {
            await assignGatePass(gatepass);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[29], err.message);
        }
    });

    it("should return an error if user does not exist", async function () {
        let gatepass = {
            username: 'Does Not Exist',
            fromLocation: '',
            toLocation: '',
            date: '',
            reason: '',
            barcode: asset.barCode,
        };
        try {
            await assignGatePass(gatepass);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[30], err.message);
        }
    });

    it("should return an error if location does not exist", async function () {
        let gatepass = {
            username: user.name,
            fromLocation: '',
            toLocation: '',
            date: '',
            reason: '',
            barcode: asset.barCode,
        };
        try {
            await assignGatePass(gatepass);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[3], err.message);
        }
    });

    it("should crete a gatepass entry", async function () {
        // For some reason the database is saying that assetID column in GatePassAsset does not exist when creating a gatepass entry
        let gatepass = {
            username: user.name,
            fromLocation: location.id,
            toLocation: location.id,
            date: new Date(2021, 6, 13),
            reason: 'Repairs',
            barcode: asset.barCode,
        };
        try{
            await assignGatePass(gatepass);
            let result = await pool.query("SELECT * FROM GatePass WHERE date = $1", [gatepass.date]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Created Gatepass");
            let createdGatePass = {
                reason: result.rows[0].reason,
                username: result.rows[0].name,
                fromLocation: result.rows[0].fromlocation,
                toLocation: result.rows[0].tolocation,
                date: result.rows[0].date,
            };   
            result = await pool.query("SELECT * FROM GatePassAsset WHERE assetID = $1", [asset.assetID]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Created Gatepass Asset");
            assert.deepEqual(createdGatePass, {
                reason: gatepass.reason,
                username: gatepass.username,
                fromLocation: gatepass.fromLocation,
                toLocation: gatepass.toLocation,
                date: gatepass.date,
            }, "Gatepass Was Not Created Correctly"); 
        } catch(err) {
            console.log(err);
            assert(false, "An Error Was Not Meant To Be Thrown");
        }
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable("Asset");
            await dropTemporaryTable("GatePass");
            await dropTemporaryTable("User2");
            await dropTemporaryTable("Location");
            await dropTemporaryTable("GatePassAsset");
        }catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});