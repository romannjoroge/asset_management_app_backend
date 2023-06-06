import pool from '../db2.js';

// Import testing libraries
import { assert } from 'chai';

// Import classes
import MyError from '../built/utility/myError.js';
import Asset from '../built/Allocation/Asset/asset2.js';
import { Errors } from '../built/utility/constants.js';
import { createAsset, createTemporaryTable, dropTemporaryTable } from './commonTestFunctions.js';
import utility from '../built/utility/utility.js';

describe.skip("createAsset test", function () {
    // Test inputs
    let fixed = true;
    let assetTag = "AUAOOOO2";
    let assetLifeSpan = 1;
    let acquisitionDate= "12-01-2022";
    let locationID = 1;
    let status = "good";
    let custodianName = "John";
    let acquisitionCost = 1000;
    let insuranceValue = 100;
    let categoryName = 'TestCategory';
    let categoryID = 1;
    let attachments = ['attachments/download.jpeg'];
    let verifyLocationStub;
    let invalidCustodianErrorMessage = "Invalid custodian";
    let checkIfUserExistsStub;
    let doesCategoryExistStub;
    let getCategoryIDStub;
    let fsExistsSyncStub;
    let doesAssetTagExistStub;
    let makeAndModelNo = "FSDFSDFSDFSDF";
    let serialNumber = 'ERSRSESRESFSe';
    let residualValue = 0;
    let getCategoryDepreciationTypeStub;

    async function assertThatAssetConstructorFails(errorMessage){
        try{
            let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, 
                    acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, 
                    serialNumber, residualValue);
            await asset.initialize();
            assert(false, "An Error Should Be Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === errorMessage){
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    }
    
    beforeEach(async function (){
        fixed = true;
        assetTag = "AUAOOOO1";
        assetLifeSpan = 1;
        acquisitionDate= "12-01-2022";
        locationID = 1;
        status = "good";
        custodianName = "JohnDoe";
        acquisitionCost = 1000;
        insuranceValue = 100;
        categoryID = 1;
        attachments = ['attachments/download.jpeg'];
        makeAndModelNo = "FSDFSDFSDFSDF";
        serialNumber = 'ERSRSESRESFSe';
        residualValue = 100;
        categoryName = 'TestCategory';
        // Test inputs

        // verifyLocationStub = Sinon.stub(Location, "verifyLocationID")
        //                     .withArgs(locationID, locationErrorMessage)
        //                     .returns("Test");
        // checkIfUserExistsStub = Sinon.stub(User, "checkIfUserExists")
        //                         .withArgs(custodianName, invalidCustodianErrorMessage);
        // doesCategoryExistStub = Sinon.stub(Category, "_doesCategoryExist")
        //                         .withArgs(categoryName)
        //                         .returns(true);
        // getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
        //                     .withArgs(categoryName)
        //                     .returns(1);
        // fsExistsSyncStub = Sinon.stub(fs, "existsSync")
        //                    .withArgs(attachments[0])
        //                    .returns(true);
        // doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
        //                         .withArgs(assetTag, assetTagErrorMessage);
        // 
        // getCategoryDepreciationTypeStub = Sinon.stub(Category, "_getCategoryDepreciationType")
        //                                     .withArgs(categoryName)
        //                                     .returns("Straight Line");

        try {
            await pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
            await pool.query("INSERT INTO Asset VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", 
                            [assetTag, makeAndModelNo, fixed, serialNumber, acquisitionDate, locationID, status, 
                            custodianName, acquisitionCost, insuranceValue, residualValue, categoryID, assetLifeSpan]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables")
        }
    });

    it("should fail when an invalid fixed status is provided", async function () {
        // Test inputs
        fixed = "Wierd Value";
        
        await assertThatAssetConstructorFails("Invalid Fixed Status");
    });

    it("should fail when an invalid asset life span", async function () {
        // Test inputs
        assetLifeSpan = -1; 
        
        await assertThatAssetConstructorFails("Invalid asset life span");
    });

    it("should fail when an invalid acquisition date is given", async function(){
        // Test inputs
        acquisitionDate = "Super Wrong Date"; "Invalid acquisition date"
        
        await assertThatAssetConstructorFails("Invalid acquisition date");
    });

    it("should fail when an invalid location is given", async function() {
        locationID = 1000;

        await assertThatAssetConstructorFails(Errors[3]);
    });

    it("should fail when an invalid status is given", async function () {
        // Test inputs
        status = "Wierd Status"; "Invalid status"

        await assertThatAssetConstructorFails("Invalid status");
    });

    it("should fail when an invalid username is given as custodian name", async function (){
        // Test inputs
        custodianName = "Non Existent Name";

        await assertThatAssetConstructorFails(invalidCustodianErrorMessage);
    });

    it("should fail when an invalid acquisition cost is given", async function (){
        // Test inputs
        acquisitionCost = -1;

        await assertThatAssetConstructorFails("Invalid acquisition cost");
    });

    it("should fail when an invalid insurance value is given", async function() {
        // Test inputs
        insuranceValue = -1;

        await assertThatAssetConstructorFails("Invalid insurance value");
    });

    it("should fail when a category name that doesn't exist is given", async function (){
        // Test inputs
        categoryName = "Does Not Exist";

        await assertThatAssetConstructorFails(Errors[5]);
    });

    it("should fail when an invalid attachment is given", async function(){
        // Test inputs
        attachments = ['this/does/not/exist'];

        await assertThatAssetConstructorFails(Errors[4]);
    });

    it("should fail when an existing assetTag is given", async function(){
        // Test inputs
        assetTag = "AUAOOOO1";

        await assertThatAssetConstructorFails(Errors[7]);
    });

    it("should add asset when all details are valid", async function(){
        assetTag = 'AUA00002';
        residualValue = 0;
        try{
            let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, 
                acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber, residualValue);
            await asset.initialize();
            assert(true, "Test Passed");
        }catch(err){
            console.log(err);
            assert(false, "An Error Should not have been thrown");
        }
    });

    it("should fail when a negative residual value is given", async function(){
        // Test inputs
        residualValue = -11;

        await assertThatAssetConstructorFails("Invalid Residual Value");
    });

    this.afterEach(async function() {
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset")
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
})


describe.skip("Create Asset Test", () => {
    let expectedDetails = {
        barcode: "AUA7000",
        assetLifeSpan: 10,
        acquisitionDate:"05-11-2021",
        locationID: 1,
        condition: "Good",
        custodianName: "GreatestDetective",
        acquisitionCost: 10000,
        categoryName: "NewCategory",
        attachments: [],
        noInBuilding: 1,
        serialNumber: "ISBN 978-24343",
        code: "CODE 12312",
        description: "This is a test asset",
        residualValue: 0,
    }
    


    beforeEach(async function() {
        try {
            await createTemporaryTable("Asset");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Asset Table");
        }
    });

    async function createAsset() {
        let asset = new Asset(expectedDetails.barcode, expectedDetails.assetLifeSpan, expectedDetails.acquisitionDate, expectedDetails.locationID, 
            expectedDetails.condition, expectedDetails.custodianName, expectedDetails.acquisitionCost, expectedDetails.categoryName, expectedDetails.attachments, 
            expectedDetails.noInBuilding, expectedDetails.serialNumber, expectedDetails.code, expectedDetails.description, expectedDetails.residualValue);
        await asset.initialize()
    }

    it("should populate asset table with correct details", async () => {
        try {
            await createAsset();

            // Get asset from database
            let fetchResult = await pool.query("SELECT barcode, locationID, usefullife FROM Asset WHERE barcode = $1", [expectedDetails.barcode]);
            utility.verifyDatabaseFetchResults(fetchResult, "Invalid Asset Details");
            let assetDetails = {
                barcode: fetchResult.rows[0].barcode,
                assetLifeSpan: fetchResult.rows[0].usefullife,
                locationID: fetchResult.rows[0].locationid,
            };

            assert.deepEqual(assetDetails, {
                barcode: expectedDetails.barcode,
                assetLifeSpan: expectedDetails.assetLifeSpan,
                locationID: expectedDetails.locationID
            }, `Wrong Details Returned ${assetDetails}`);
        } catch(err) {
            console.log(err);
            assert(false, "No Error Meant To Be Thrown")
        }
    });

    afterEach(async function() {
        try {
            await dropTemporaryTable("Asset");
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables")
        }
    })
});