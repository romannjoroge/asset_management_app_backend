import Sinon from "sinon";
import { assert } from "chai";
import MyError from "../built/utility/myError.js";
import { MyErrors2 } from "../built/utility/constants.js";
import {batchAddSiteBuildingLocation} from "../built/Reports/helpers.js";
import Location from "../built/Tracking/location.js";

describe("Convert RawAssetRegisterData to AssetRegisterData", function () {
    const nonExistentLocation = 1000;
    const siteLocation = 1;
    const buildingLocation = 2;
    const officeLocation = 3;
    const siteName = "Test Site";
    const buildingName = "Test Building";
    const officeName = "Test Office";

    const rawDataWithNonExistentLocation = {
        serial_number: "string",
        acquisition_date: "string",
        condition: "string",
        responsible_users_name: "string",
        acquisition_cost: 1,
        residual_value: 1,
        category_name: "string",
        useful_life: 1,
        barcode: "string",
        description: "string",
        location_id: nonExistentLocation,
        expected_depreciation_date: "string",
        days_to_disposal: 1
    };
    const rawData = {
        serial_number: "string",
        acquisition_date: "string",
        condition: "string",
        responsible_users_name: "string",
        acquisition_cost: 1,
        residual_value: 1,
        category_name: "string",
        useful_life: 1,
        barcode: "string",
        description: "string",
        location_id: officeLocation,
        expected_depreciation_date: "string",
        days_to_disposal: 1
    };
    const expectedData = {
        serial_number: "string",
        acquisition_date: "string",
        condition: "string",
        responsible_users_name: "string",
        acquisition_cost: 1,
        residual_value: 1,
        category_name: "string",
        useful_life: 1,
        barcode: "string",
        description: "string",
        site: siteName,
        building: buildingName,
        office: officeName,
        expected_depreciation_date: "string",
        days_to_disposal: 1
    }

    this.beforeEach(function () {
        try {
            let locationExistsStub = Sinon.stub(Location, "verifyLocationID")
                                    .withArgs(nonExistentLocation)
                                    .resolves(false)
                                    .withArgs(siteLocation)
                                    .resolves(true)
                                    .withArgs(buildingLocation)
                                    .resolves(true)
                                    .withArgs(officeLocation)
                                    .resolves(true)
            let locationNameStub = Sinon.stub(Location, "getLocationName")
                                    .withArgs(siteLocation)
                                    .resolves(siteName)
                                    .withArgs(buildingLocation)
                                    .resolves(buildingName)
                                    .withArgs(officeLocation)
                                    .resolves(officeName)
            let locationParentStub = Sinon.stub(Location, "findParentLocation")
                                        .withArgs(siteLocation)
                                        .resolves()
                                        .withArgs(buildingLocation)
                                        .resolves(siteLocation)
                                        .withArgs(officeLocation)
                                        .resolves(buildingLocation)
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Set Up Tests");
        }
    })


    it("should fail if location does not exist", async function() {
        try {
            await batchAddSiteBuildingLocation(rawDataWithNonExistentLocation);
            assert(false, "Error Meant To Be Thrown")
        } catch(err) {
            if (err instanceof MyError && err.message === MyErrors2.LOCATION_NOT_EXIST) {
                assert(true)
            } else {
                console.log(err);
                assert(false, "Wrong Error Thrown")
            }
        }
    });

    it("should return data with building, site and office", async function() {
        try {
            const converted = await batchAddSiteBuildingLocation(rawData);
            assert.deepEqual(converted, expectedData)
        } catch(err) {
            console.log(err);
            assert(false);
        }
    })
})