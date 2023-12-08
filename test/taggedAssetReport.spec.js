import { assert } from "chai";
import MyError from '../built/utility/myError.js';
import {addOfficeBuildingLocationToAsset} from '../built/Reports/tagged_assets.js'
import { Errors } from '../built/utility/constants.js';
import utility from "../built/utility/utility.js";
import pool from "../db2.js";
import Sinon from "sinon";
import Location from "../built/Tracking/location.js";

// Testing the addOfficeBuildingLocationToAsset function
describe("Add Office Building Location To Asset Test", () => {
    // Variables
    const rawAssetA = {
        id: 1,
        barcode: 'A',
        description: "A",
        category_name: "Cat",
        serial_number: "A",
        location_id: 1
    }

    const rawAssetB = {
        id: 1,
        barcode: 'A',
        description: "A",
        category_name: "Cat",
        serial_number: "A",
        location_id: 2
    }

    const rawAssetC = {
        id: 1,
        barcode: 'A',
        description: "A",
        category_name: "Cat",
        serial_number: "A",
        location_id: 3
    }

    const locationNames = {
        1: "Location 1",
        2: "Location 2",
        3: "Location 3",
    }

    beforeEach(() => {
        const parentLocationStub = Sinon.stub(Location, "findParentLocation")
                                    .withArgs(rawAssetA.location_id)
                                    .returns(new Promise((res, rej) => res(null)))
                                    .withArgs(rawAssetB.location_id)
                                    .returns(new Promise((res, rej) => res(rawAssetA.location_id)))
                                    .withArgs(rawAssetC.location_id)
                                    .returns(new Promise((res, rej) => res(rawAssetB.location_id)));                                                  
        const locationNameStub = Sinon.stub(Location, "getLocationName")
                                    .withArgs(rawAssetA.location_id)
                                    .returns(new Promise((res, rej) => res(locationNames[1])))
                                    .withArgs(rawAssetB.location_id)
                                    .returns(new Promise((res, rej) => res(locationNames[2])))
                                    .withArgs(rawAssetC.location_id)
                                    .returns(new Promise((res, rej) => res(locationNames[3])));
    })

    it("should return a tagged asset with only a location if the location has no parent", async() => {
        // Call the function
        const taggedAsset = await addOfficeBuildingLocationToAsset(rawAssetA);
        assert.deepEqual(taggedAsset, {
            id: rawAssetA.id,
            barcode: rawAssetA.barcode,
            description: rawAssetA.description,
            category_name: rawAssetA.category_name,
            serial_number: rawAssetA.serial_number,
            location: locationNames[1],
            building: undefined,
            office: undefined
        })
    });

    it("should return an asset that has a location and building if its location only has one parent", async() => {                            
        // Call the function
        const taggedAsset = await addOfficeBuildingLocationToAsset(rawAssetB);
        assert.deepEqual(taggedAsset, {
            id: rawAssetB.id,
            barcode: rawAssetB.barcode,
            description: rawAssetB.description,
            category_name: rawAssetB.category_name,
            serial_number: rawAssetB.serial_number,
            location: locationNames[1],
            building: locationNames[2],
            office: undefined
        })
    })

    it("should return an asset that has a location, building and office if its location has a parent building and location", async() => {                            
        // Call the function
        const taggedAsset = await addOfficeBuildingLocationToAsset(rawAssetC);
        assert.deepEqual(taggedAsset, {
            id: rawAssetC.id,
            barcode: rawAssetC.barcode,
            description: rawAssetC.description,
            category_name: rawAssetC.category_name,
            serial_number: rawAssetC.serial_number,
            location: locationNames[1],
            building: locationNames[2],
            office: locationNames[3]
        })
    })
})