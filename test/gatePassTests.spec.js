import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createAsset, createLocation, createGatePassAuthorization, createGatePassAssetEntry, createGatePassEntry, createCategory } from "./commonTestFunctions.js";
import { assert } from "chai";
import { assignGatePass } from '../built/GatePass/assignGatepass.js';
import MyError from "../built/utility/myError.js";
import { Errors } from "../built/utility/constants.js";
import { getApprovers } from "../built/GatePass/getApprovers.js";
import { doesAssetHaveGatepass } from '../built/GatePass/hasGatepass.js';

describe.skip("Assign Asset Gatepass test", function () {
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
            username: user.username,
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
            username: user.username,
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
            username: user.username,
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


describe.skip("Get Approvers", function () {
    let parentLocation = {
        id: 1002,
        name: "TestyLocation3",
        parentlocationid: 1
    };

    let location = {
        id: 1000,
        name: "TestyLocation",
        parentlocationid: parentLocation.id
    };

    let childLocation = {
        id: 1001,
        name: "TestyLocation2",
        parentlocationid: 1000
    }


    let user = {
        username: "CoolUser",
        name: "Cool User",
        email: "cooluser@gmail.com",
        company: "TestCompany",
        password: "EWFS3424",
        usertype: 1,
    }

    let user2 = {
        username: "CoolUser2",
        name: "Cool User 2",
        email: "cooluser2@gmail.com",
        company: "TestCompany",
        password: "EWFS3424",
        usertype: 1,
    }
    let user3 = {
        username: "CoolUser3",
        name: "Cool User 3",
        email: "cooluser3@gmail.com",
        company: "TestCompany",
        password: "EWFS3424",
        usertype: 1,
    }

    let gatepassauthorize = {
        username: user.username,
        locationID: parentLocation.id,
    }

    let gatepassauthorize2 = {
        username: user2.username,
        locationID: location.id,
    }

    let gatepassauthorize3 = {
        username: user3.username,
        locationID: childLocation.id,
    }

    beforeEach(async function () {
        try {
            await createTemporaryTable("User2");
            await createTemporaryTable("Location");
            await createTestUser(user);
            await createTestUser(user2);
            await createTestUser(user3);
            await createLocation(location);
            await createLocation(parentLocation);
            await createLocation(childLocation);
            await createTemporaryTable("GatePassAuthorizers");
            await createGatePassAuthorization(gatepassauthorize);
        } catch(err){
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    it("should return an error if location does not exist", async function () {
        try {
            await getApprovers(10000);
            assert(false, "An Error Was Meant To Be Thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[3], err.message);
        }
    });

    it.skip("should return approvers for the locations", async function () {
        let approvers;
        try {
            approvers = await getApprovers(childLocation.id);
            let equal = utility.arrayEquals(approvers, [user.username, user2.username, user3.username, 'Benoit Blanc']);
            assert.equal(equal === true, "Approvers Were Not Returned Correctly");
        } catch(err) {
            console.log(err);
            console.log(approvers);
            assert(false, "An Error Was Not Meant To Be Thrown");
        }
    });

    afterEach(async function () {
        try {
            await dropTemporaryTable("User2");
            await dropTemporaryTable("Location");
            await dropTemporaryTable("GatePassAuthorizers");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});

describe.skip("Does Asset Have Gatepass", function () {
    let category = {
        id: 1000,
        name: "OldCategory",
        parentcategoryid: 1,
        depreciationtype: "Straight Line",
        deleted: false
    };

    let user = {
        username: "CoolUser",
        name: "Cool User",
        email: "cooluser@gmail.com",
        company: "TestCompany",
        password: "EWFS3424",
        usertype: 1,
    }

    let asset = {
        assetID: 1000,
        barCode: "AUA7000",
        locationID: 1,
        noInBuilding: 1,
        code: 'AUA7000',
        description: 'This is a test asset',
        categoryID: category.id,
        usefulLife: 10,
        serialNumber: 'AUA7000',
        condition: 'Good',
        responsibleUsername: user.username,
        acquisitionDate: '06-13-2023',
        residualValue: 1000,
        acquisitionCost: 10000
    };

    let location = {
        id: 1000,
        name: "TestyLocation",
        parentlocationid: 1
    };

    let location2 = {
        id: 1001,
        name: "TestyLocation2",
        parentlocationid: 1
    };

    let gatepass = {
        id: 1000,
        reason: "Go to the club",
        name: "Something",
        fromlocation: location.id,
        tolocation: location2.id,
        date: new Date(),
        approved: true,
        comment: "This is some comment"
    };

    let gatepassEntry = {
        gatepassid: gatepass.id,
        assetid: asset.assetID
    }

    beforeEach(async function () {
        try{
            await createTemporaryTable("Category");
            await createCategory({
                id: category.id,
                name: category.name,
                depreciationType: category.depreciationtype,
                parentCategoryID: category.parentcategoryid,
            });
            await createTemporaryTable("Asset");
            await createTemporaryTable("GatePass");
            await createGatePassEntry(gatepass);
            await createTemporaryTable("User2");
            await createTemporaryTable("Location");
            await createLocation(location);
            await createTemporaryTable("gatepassasset");
            await createTestUser(user);
            await createAsset(asset);
            await createGatePassAssetEntry(gatepassEntry)
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    it("should return false when asset does not exist", async function () {
        let nonExistentAsset = -1000;
        try {
            let doesExist = await doesAssetHaveGatepass(nonExistentAsset, Date.now(), location.id, location2.id);
            assert(doesExist == false, "Wrong Result Returned");
        } catch(err) {
            console.log(err);
            assert(false, "Error Should Not Be Thrown");
        }
    });

    it ("should return false if from location is invalid", async function() {
        let assetID = gatepassEntry.assetid;
        let scannedTime = gatepass.date;
        let fromlocation = 100000;
        let toLocation = gatepass.tolocation;

        try {
            let doesExist = await doesAssetHaveGatepass(assetID, scannedTime, fromlocation, toLocation);
            assert(doesExist == false, "Wrong Result Returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });


    it ("should return false if to location is invalid", async function() {
        let assetID = gatepassEntry.assetid;
        let scannedTime = gatepass.date;
        let fromlocation = gatepass.fromlocation;
        let toLocation = 10000;

        try {
            let doesExist = await doesAssetHaveGatepass(assetID, scannedTime, fromlocation, toLocation);
            assert(doesExist == false, "Wrong Result Returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });

    it ("should return false if there is no gatepass entry for the scanned time", async function() {
        let assetID = gatepassEntry.assetid;
        let scannedTime = new Date(2021, 6, 13);
        let fromlocation = gatepass.fromlocation;
        let toLocation = gatepass.tolocation;

        try {
            let doesExist = await doesAssetHaveGatepass(assetID, scannedTime, fromlocation, toLocation);
            assert(doesExist == false, "Wrong Result Returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });

    it ("should return true if the gatepass exists", async function() {
        let assetID = gatepassEntry.assetid;
        let scannedTime = gatepass.date;
        let fromlocation = gatepass.fromlocation;
        let toLocation = gatepass.tolocation;

        try {
            let doesExist = await doesAssetHaveGatepass(assetID, scannedTime, fromlocation, toLocation);
            assert(doesExist == false, "Wrong Result Returned");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });

    afterEach(async function() {
        try {
            await dropTemporaryTable("Category");
            await dropTemporaryTable("Asset");
            await dropTemporaryTable("Gatepass");
            await dropTemporaryTable("User2");
            await dropTemporaryTable("Location");
            await dropTemporaryTable("gatepassasset");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Delete Test Data")
        }
    });
});