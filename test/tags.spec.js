import {syncTag, syncTags} from '../built/Tracking/tags.js';
import { assert } from 'chai';
import {createTemporaryTable, createAsset, createCategory, createTestUser, dropTemporaryTable, createLocation} from './commonTestFunctions.js'
import MyError from '../built/utility/myError.js';
import { MyErrors2 } from '../built/utility/constants.js';
import pool from '../db2.js';
import Asset from '../built/Allocation/Asset/asset2.js';

describe("Sync Asset Tests", () => {
    let testLocation = {
        id: 1010,
        name: "TestestLocation",
        parentlocationid: 1
    }

    let testCategory = {
        id: 1000,
        name: "OldCategory",
        parentcategoryid: 1,
        depreciationType: "Straight Line",
        deleted: false
    };

    let testUser = {
        username: "johndoe",
        name: 'John Doe',
        email: "johndoe@gmail.com",
        password: "password",
        company: "TestCompany",
    };

    let testAsset = {
        assetID: 1000,
        barCode: "AUA7000",
        locationID: testLocation.id,
        noInBuilding: 1,
        code: 'AUA7000',
        description: 'This is a test asset',
        categoryID: testCategory.id,
        usefulLife: 10,
        serialNumber: 'AUA7000',
        condition: 'Good',
        responsibleUsername: testUser.name,
        acquisitionDate: '06-13-2023',
        residualValue: 1000,
        acquisitionCost: 10000
    };

    let testAsset2 = {
        assetID: 1001,
        barCode: "AUA7001",
        locationID: testLocation.id,
        noInBuilding: 1,
        code: 'AUA7001',
        description: 'This is a test asset',
        categoryID: testCategory.id,
        usefulLife: 10,
        serialNumber: 'AUA7000',
        condition: 'Good',
        responsibleUsername: testUser.name,
        acquisitionDate: '06-13-2023',
        residualValue: 1000,
        acquisitionCost: 10000
    };

    beforeEach(async () => {
        try {
            await createTemporaryTable('Asset');
            await createTemporaryTable('User2');
            await createTemporaryTable('Category');
            await createTemporaryTable('Location');
            await createTestUser(testUser);
            await createLocation(testLocation);
            await createCategory(testCategory)
            await createAsset(testAsset);
            await createAsset(testAsset2);
        } catch(err) {
            console.log(err);
            assert.equal(false, "Could Not Create Test Asset")
        }
    })


    it("should fail when non existing barcode is given", async() => {
        let nonExistingbarcode = "Some Nonsense";

        let tag = {
            barcode: nonExistingbarcode,
            timestamp: new Date
        }

        try {
            await syncTag(tag);
        } catch(err) {
            if (err instanceof MyError && err.message == MyErrors2.ASSET_NOT_EXIST) {
                assert(true, "Correct Error Thrown");
            } else {
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    });

    it("should pass when existing asset is given", async() => {
        let tag = {
            barcode: testAsset.barCode,
            timestamp: new Date()
        }

        try {
            await syncTag(tag);

            // See if entry was update
            let assetID = await Asset._getAssetID(tag.barcode);
            const query = "SELECT lastConverted, isConverted, isTagged FROM Asset WHERE assetID = $1";
            let fetchResult = await pool.query(query, [assetID]);
            let result = fetchResult.rows[0];
            let expectedResult = {
                "lastconverted": tag.timestamp,
                "isconverted": true,
                "istagged": true
            };
            assert.deepEqual(result, expectedResult, "Wrong Thing Returned");
        } catch(err) {
            console.log(err);
            assert(false, "Error Should Not Be Thrown");
        }
    });

    it("should be able to sync multiple tags", async() => {
        let tags = [
            {
                barcode: testAsset.barCode,
                timestamp: new Date()
            },
            {
                barcode: testAsset2.barCode,
                timestamp: new Date()
            }
        ];

        try {
            await syncTags(tags);

            // See if entry was update
            let assetID1 = await Asset._getAssetID(tags[0].barcode);
            const query = "SELECT lastConverted, isConverted, istagged FROM Asset WHERE assetID = $1";
            let fetchResult1 = await pool.query(query, [assetID1]);
            let result1 = fetchResult1.rows[0];
            let expectedResult1 = {
                "lastconverted": tags[0].timestamp,
                "isconverted": true,
                "istagged": true
            };
            assert.deepEqual(result1, expectedResult1, "Wrong Thing Returned");

            // See if entry2 was update
            let assetID2 = await Asset._getAssetID(tags[1].barcode);
            let fetchResult2 = await pool.query(query, [assetID2]);
            let result2 = fetchResult2.rows[0];
            let expectedResult2 = {
                "lastconverted": tags[1].timestamp,
                "isconverted": true,
                "istagged": true
            };
            assert.deepEqual(result2, expectedResult2, "Wrong Thing Returned");
        } catch(err) {
            console.log(err);
            assert(false, "Error Should Not Be Thrown");
        }
    });

    afterEach(async () => {
        try {
            await dropTemporaryTable('Asset');
            await dropTemporaryTable('User2');
            await dropTemporaryTable('Category');
            await dropTemporaryTable('Location');
        } catch(err) {
            console.log(err);
            assert.equal("Could Not Delete Test Data")
        }
    })
});