import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createAsset } from "./commonTestFunctions.js";
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

    let user = {
        username: "CoolUser",
        fname: "Cool",
        lname: "User",
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
            username: user.fname + " " + user.lname,
            fromLocation: '',
            toLocation: '',
            date: '',
            reason: '',
            asset: 'Does Not Exist',
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
            asset: asset.barCode,
        };
        try {
            await assignGatePass(gatepass);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[30], err.message);
        }
    });

    it("should return an error if starting date is after leaving date", async function () {
        let leaveDate = new Date(2023, 10, 15);
        let returnDate = new Date(2023, 10, 11);
        try{    
            await assignGatePass([asset.assetID], user.username, "Repairs", leaveDate, returnDate);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[59], err.message);
        }
    });

    it.skip("should crete a gatepass entry", async function () {
        // For some reason the database is saying that assetID column in GatePassAsset does not exist when creating a gatepass entry
        let newGatePass = {
            assetID: asset.assetID,
            username: user.username,
            reason: "Repairs",
            leaveDate: new Date(2023, 10, 11),
            returnDate: new Date(2023, 10, 15),
            entry: false
        };
        let newGatePassAsset = {
            gatepassid: 10,
            assetid: asset.assetID,
            deleted: false
        };
        try{
            await assignGatePass([newGatePass.assetID], newGatePass.username, newGatePass.reason, newGatePass.leaveDate, newGatePass.returnDate, newGatePass.entry);
            let result = await pool.query("SELECT * FROM GatePass WHERE assetID = $1", [newGatePass.assetID]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Created Gatepass");
            let createdGatePass = {
                entry: result.rows[0].entry,
                username: result.rows[0].username,
                reason: result.rows[0].reason,
                leaveDate: result.rows[0].leavingtime,
                returnDate: result.rows[0].arrivingtime,
            };   
            result = await pool.query("SELECT * FROM GatePassAsset WHERE assetID = $1", [newGatePass.assetID]);
            let gatePassEntry = {
                gatepassid: result.rows[0].gatepassid,
                assetid: result.rows[0].assetid,
                deleted: result.rows[0].deleted
            }
            assert.deepEqual(createdGatePass, newGatePass); 
            assert.deepEqual(gatePassEntry, newGatePassAsset);
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
            await dropTemporaryTable("GatePassAsset");
        }catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});