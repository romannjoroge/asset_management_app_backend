import {assert} from "chai";
import {createTemporaryTable, createAsset, createCategory, createLocation, dropTemporaryTable} from "./commonTestFunctions.js";
import {filterAssetByDetails} from '../built/Allocation/Asset/filter.js'


describe("Filter Assets Test", function () {
    const asset1ID = 1000;
    const asset2ID = 1001;
    const category1ID = 1000;
    const category2ID = 1001;
    const category1 = "Test Category";
    const category2 = "Test Category 2";
    const location1ID = 1000;
    const location2ID = 1001;
    const location1 = "Test Location";
    const location2 = "Test Location 2";

    const asset1 = {
        assetid: asset1ID,
        barcode: "AUA7000",
        description: "This is a test asset",
        condition: "Good",
        category: category1,
        serialnumber: "ISBN 978-0-321-87758-1",
        location: location2
    };

    const asset2 = {
        assetid: asset2ID,
        barcode: "AUA7001",
        description: "This is a test asset 2",
        condition: "Fair",
        category: category2,
        serialnumber: "ISBN 978-0-321-87758-2",
        location: location1
    };

    beforeEach(async function () {
        // Create Test Data
        try{
            await createTemporaryTable("Asset");
            await createTemporaryTable("Category");
            await createTemporaryTable("Location");
            await createCategory({
                id: category1ID,
                name: category1,
                depreciationType: 'Double Declining Balance',
                parentCategoryID: 1
            });
            await createCategory({
                id: category2ID,
                name: category2,
                depreciationType: 'Double Declining Balance',
                parentCategoryID: 1
            });
            await createLocation({
                id: location1ID,
                name: location1,
                parentLocationID: 1
            });
            await createLocation({
                id: location2ID,
                name: location2,
                parentLocationID: 1
            });
            await createAsset({
                assetID: asset1ID,
                barCode: asset1.barcode,
                locationID: location2ID,
                noInBuilding: 1,
                code: 'AUA7000',
                description: asset1.description,
                categoryID: category1ID,
                usefulLife: 10,
                serialNumber: asset1.serialnumber,
                condition: asset1.condition,
                responsibleUsername: 'TestUser',
                acquisitionDate: '05-06-2021',
                residualValue: 1,
                acquisitionCost: 10000
            });
            await createAsset({
                assetID: asset2ID,
                barCode: asset2.barcode,
                locationID: location1ID,
                noInBuilding: 1,
                code: 'AUA7000',
                description: asset2.description,
                categoryID: category2ID,
                usefulLife: 10,
                serialNumber: asset2.serialnumber,
                condition: asset2.condition,
                responsibleUsername: 'TestUser',
                acquisitionDate: '05-06-2021',
                residualValue: 1,
                acquisitionCost: 10000
            });   
        } catch (err) {
            console.log(err);
            assert(false, "Could not create test data");
        }
    });

    async function testFilterAssetsReturnValue(locationID, categoryID, expectedResults) {
        try {
            let results = await filterAssetByDetails({categoryID: categoryID, locationID: locationID});
            assert.deepEqual(results, expectedResults);
        } catch (err) {
            console.log(err);
            assert(false, "Could not filter assets");
        }
    }

    it("should return nothing for non existent location", async function () {
        await testFilterAssetsReturnValue(1002, category1ID, []);
    });

    it("should return nothing for non existent category", async function () {
        await testFilterAssetsReturnValue(location1ID, 1002, []);
    });

    it("should return asset2 if location 1 is given", async function () {
        await testFilterAssetsReturnValue(location1ID, null, [asset2]);
    });

    it("should return asset1 if category 1 is given", async function () {
        await testFilterAssetsReturnValue(null, category1ID, [asset1]);
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable("Asset");
            await dropTemporaryTable("Category");
            await dropTemporaryTable("Location");
        } catch(err) {
            console.log(err);
            assert(false, "Could not drop temporary tables");
        }
    });
});