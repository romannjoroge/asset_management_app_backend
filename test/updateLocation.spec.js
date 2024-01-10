// Importing testing packages
import { assert } from 'chai';

// Importing classes used in tests
import MyError from '../built/utility/myError.js';
import { createCategory, createLocation, createTemporaryTable, dropTemporaryTable } from './commonTestFunctions.js';
import { Errors } from '../built/utility/constants.js';
import pool from '../db2.js';
import utility from '../built/utility/utility.js';
import { updateLocation } from '../built/Tracking/update.js'

describe.skip("Update Location Test", function () {
    let testParentLocation = {
        id: 1000,
        name: "ParentLocation",
        parentlocationid: 1,
    };
    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    beforeEach(async function () {
        try {
            await createTemporaryTable('Location');
            await createLocation(testParentLocation);
            await createLocation(testLocation);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    async function assertLocationUpdated(locationID, updateJSON, newLocation) {
        try {
            await updateLocation(locationID, updateJSON);
            // Get updated location
            let result = await pool.query("SELECT id, name, parentlocationid FROM Location WHERE id = $1", [locationID]);
            utility.verifyDatabaseFetchResults(result, "Could Not Get Updated Location");
            let updatedLocation = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                parentlocationid: result.rows[0].parentlocationid
            };
            assert.deepEqual(updatedLocation, newLocation, "Location Not Updated Correctly");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Update Location");
        }
    }

    it("should fail when location doesn't exist", async function() {
        try {
            await updateLocation(10000, {});
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[3])
        }
    });


    it("should fail when an invalid name is given", async function () {
        let name = "InvalidName";
        try {
            await updateLocation(testLocation.id, {name: name});
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[32]);
        }
    });

    it("should update location name", async function(){
        let updateJSON = {
            name: "NewName"
        };
        await assertLocationUpdated(testLocation.id, updateJSON, {
            id: testLocation.id,
            name: updateJSON.name,
            parentlocationid: testLocation.parentlocationid
        });
    });

    it("should update location parent location", async function(){
        let updateJSON = {
            parentlocationid: testParentLocation.id
        };
        await assertLocationUpdated(testLocation.id, updateJSON, {
            id: testLocation.id,
            name: testLocation.name,
            parentlocationid: updateJSON.parentlocationid
        });
    });

    it("should fail when parent location doesn't exist", async function(){
        let updateJSON = {
            parentlocationid: 10000
        };
        try {
            await updateLocation(testLocation.id, updateJSON);
        } catch(err) {
            console.log(err);
            assert(err instanceof MyError && err.message === Errors[3], `Wrong Error Message ${err.message}`);
        }
    });

    afterEach(async function () {
        try {
            await dropTemporaryTable('Location');
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});