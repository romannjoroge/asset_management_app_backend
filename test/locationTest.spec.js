import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createTestUser, createLocation, createGatePassAuthorization } from "./commonTestFunctions.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { Errors } from "../built/utility/constants.js";
import Location from "../built/Tracking/location.js";


describe.skip("Child And Parent Locations", function () {
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

    beforeEach(async function () {
        try {
            await createTemporaryTable("Location");
            await createLocation(location);
            await createLocation(parentLocation);
            await createLocation(childLocation);
        } catch(err){
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    it("should return child locations", async function () {
        try {
            let locationIDs = [];
            let result = await Location.findChildLocations(parentLocation.id, locationIDs);
            let equal = utility.arrayEquals(result, [location.id, childLocation.id])
            assert(equal == true, "Child Locations Were Not Returned Correctly");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Get Child Locations");
        }
    });

    it("should return parent locations", async function () {
        let result;
        try {
            let locationIDs = [];
            result = await Location.findParentLocations(childLocation.id, locationIDs);
            let equal = utility.arrayEquals(result, [location.id, parentLocation.id, 1])
            assert(equal == true, "Parent Locations Were Not Returned Correctly");
        } catch(err) {
            console.log(err);
            console.log(result);
            assert(false, "Could Not Get Parent Locations");
        }
    });

    it("should return both parent and child locations", async function () {
        let result;
        try {
            let locationIDs = [];
            result = await Location.findParentLocations(location.id, locationIDs);
            console.log(result);
            let result2 = await Location.findChildLocations(location.id, result);
            console.log(result2);
            let equal = utility.arrayEquals(result2, [childLocation.id, parentLocation.id, 1])
            assert(equal, "Parent and Child Locations Were Not Returned Correctly");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Get Parent and Child Locations");
        }
    });

    afterEach(async function () {
        try {
            await dropTemporaryTable("Location");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});