import pool from "../db2.js";
import utility from "../built/utility/utility.js";
import { createTemporaryTable, dropTemporaryTable, createLocation } from "./commonTestFunctions.js";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { Errors, MyErrors2 } from "../built/utility/constants.js";
import Location from "../built/Tracking/location.js";
import Sinon from "sinon";

describe("Finding site, building and office of location", function () {
    const nonExistentLocation = 100;
    const existingLocation = 1;
    const siteLocation = 1;
    const buildingLocation = 2;
    const officeLocation = 3;

    const siteName = "Test Site";
    const buildingName = "Test Building";
    const officeName = "Test Office";

    this.beforeEach(async function () {
        try {
            let locationExistStub = Sinon.stub(Location, "verifyLocationID")
                                    .withArgs(nonExistentLocation)
                                    .resolves(false)
                                    .withArgs(existingLocation)
                                    .resolves(true)
                                    .withArgs(siteLocation)
                                    .resolves(true)
                                    .withArgs(buildingLocation)
                                    .resolves(true)
                                    .withArgs(officeLocation)
                                    .resolves(true)
            let locationParentStub = Sinon.stub(Location, "findParentLocation")
                                        .withArgs(siteLocation)
                                        .resolves()
                                        .withArgs(buildingLocation)
                                        .resolves(siteLocation)
                                        .withArgs(officeLocation)
                                        .resolves(buildingLocation)

            let locationNameStub = Sinon.stub(Location, "getLocationName")
                                    .withArgs(siteLocation)
                                    .resolves(siteName)
                                    .withArgs(buildingLocation)
                                    .resolves(buildingName)
                                    .withArgs(officeLocation)
                                    .resolves(officeName);
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Set Up Tests")
        }
    })

    it ("should return error if location does not exist", async function () {
        try {
            await Location.getSiteBuildingOffice(nonExistentLocation);
            assert(false, "Should have said location does not exist");
        } catch(err) {
            if (err instanceof MyError && err.message === MyErrors2.LOCATION_NOT_EXIST) {
                assert(true)
            } else {
                console.log(err);
                assert(false, "Wrong Error Thrown")
            }
        }
    });

    it ("should only return site name if the location is a site", async function () {
        try {
            let result = await Location.getSiteBuildingOffice(siteLocation);
            assert.deepEqual(result, {
                site: siteName,
                building: "all",
                office: "all"
            })
        } catch(err) {
            console.log(err);
            assert(false, "There should be no error")
        }
    })

    it ("should return only site and building name if the location is a building", async function () {
        try {
            let result = await Location.getSiteBuildingOffice(buildingLocation);
            assert.deepEqual(result, {
                site: siteName,
                building: buildingName,
                office: "all"
            })
        } catch(err) {
            console.log(err);
            assert(false, "There should be no error")
        }
    })

    it ("should return site, building and office name if the location is an office", async function () {
        try {
            let result = await Location.getSiteBuildingOffice(officeLocation);
            assert.deepEqual(result, {
                site: siteName,
                building: buildingName,
                office: officeName
            })
        } catch(err) {
            console.log(err);
            assert(false, "There should be no error")
        }
    })
})

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