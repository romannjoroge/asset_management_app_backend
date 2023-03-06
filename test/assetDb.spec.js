// Importing database pool
import pool from '../db2.js';

import { assert } from 'chai';

import Asset from '../src/Allocation/Asset/asset2.js';
import utility from '../utility/utility.js';


describe.skip("_doesAssetTagExist Test", function(){
    let assetTag;
    this.beforeEach(async function(){
        assetTag = 'AUA0003';
        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTag]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });
    
    it("should return false when a category that doesn't exist is given", async function(){
        // Test Inputs
        assetTag = 'Does Not Exist';

        await utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetTagExist, false, assetTag);
    });

    it("should return true if asset tag exists", async function(){
        // Test Inputs
        assetTag = 'AUA0003';

        await utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetTagExist, true, assetTag);
    });

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset")
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
});

describe.skip("asset.initialize() Test", function(){
    this.beforeEach(async function(){
        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("CREATE TEMPORARY TABLE Asset_File (LIKE Asset_File INCLUDING ALL)");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    it("should add an asset to the table", async function(){
        let asset;
        let makeAndModelNo = 'HP Omen 16';
        let assetTag = 'AUA0004';
        let fetchResult;
        let result;

        try{
            asset = new Asset(true, 2, '10-22-2022', 1, 'good', 'John Doe', 10000, 1000, 'TestCategory', 
                              ['attachments/download.jpeg'], assetTag , 'HP Omen 16', 'P14dsfsder', 0);    
        }catch(err){
            console.log(err);
            assert(false, "Asset Could Not Be Created");
        }

        try{
            await asset.initialize();
        }catch(err){
            console.log(err);
            assert(false, "Asset Could Not Be Stored In Database")
        }

        try{
            fetchResult = await pool.query("SELECT makeAndModelNo FROM Asset WHERE assetTag = $1", [assetTag]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Get makeAndModelNo from database");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned");
        console.log(fetchResult.rows);

        result = fetchResult.rows[0].makeandmodelno;

        assert.equal(result, makeAndModelNo, "Wrong Item Inserted In Database");
    });

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset_File");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
});

describe.skip("_getAssetCategoryName Test", function(){
    let assetTag;
    let categoryID;
    let categoryName = 'TestCategory3';
    let fetchResult;
    let result;

    this.beforeEach(async function(){
        assetTag = 'AUA0004';
        categoryID = 4;

        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, $2, 4)", [assetTag, categoryID]);
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category VALUES ($1, $2, 1, 'Straight Line')", [categoryID, categoryName]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    it("should throw an error if asset doesn't exist", async function(){
        // Test Inputs
        assetTag = 'Does Not Exist';

        await utility.assertThatAsynchronousFunctionFails(Asset._getAssetCategoryName, "Asset Does Not Exist", assetTag);
    });

    it("should return category name when an existing asset is given", async function(){
        // Test Inputs
        assetTag = 'AUA0004';
        let returnedValue;

        try{
            returnedValue = await Asset._getAssetCategoryName(assetTag);
        }catch(err){
            console.log(err);
            assert(false, "Func did not run");
        }

        try{
            fetchResult = await pool.query("SELECT name FROM Category WHERE ID = $1", [categoryID]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Get category name from database");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
        result = fetchResult.rows[0].name;

        assert.equal(result, categoryName, "Wrong Value Returned");
    })

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    });
});

describe.skip("update Asset Functions", function(){
    let fetchResult;
    let valueFromDatabase;
    let assetTag = 'AUA0004';
    let oldCategoryID = 1;
    let oldmakeAndModelNo = 'HP Folio 13';
    let oldIsFixed = true;
    let oldSerialNumber = 'FSDFDSF';
    let oldAcquisitionDate = new Date(2022, 11, 1);
    let oldLocationID = 1
    let oldStatus = 'good';
    let oldCustodianName = 'John Doe';
    let oldAcquisitionCost = 10000;
    let oldInsuranceValue = 1000;
    let oldResidualValue = 0;
    let oldAssetLifeSpan = 5;
    let newLocationID = 4;
    let newUserName = 'Jane Doe';
    let newCategID = 5;

    async function testDatabaseFunction(func, itemToUpdate, assetTag, itemToCompareAgainst, oldValue, ...params){
        try{
            await func(...params);
        }catch(err){
            console.log(err);
            console.log(`${func.name} did not run`);
        }

        try{
            fetchResult = await pool.query(`SELECT ${itemToUpdate} FROM Asset WHERE assetTag = $1`, [assetTag]);
        }catch(err){
            console.log(`Could not get new ${itemToUpdate} from database`);
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing was returned");

        valueFromDatabase = fetchResult.rows[0][itemToUpdate];

        assert.notDeepEqual(valueFromDatabase, oldValue, "Item Not Changed");
        assert.deepEqual(valueFromDatabase, itemToCompareAgainst, `Wrong ${itemToUpdate} returned, returned value is ${valueFromDatabase}`);
    }

    this.beforeEach(async function(){
        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", 
                            [assetTag, oldmakeAndModelNo, oldIsFixed, oldSerialNumber, oldAcquisitionDate, oldLocationID, oldStatus, oldCustodianName, oldAcquisitionCost,
                            oldInsuranceValue, oldResidualValue, oldCategoryID, oldAssetLifeSpan]);
            await pool.query("CREATE TEMPORARY TABLE Location (LIKE Location INCLUDING ALL)");
            await pool.query("INSERT INTO Location VALUES ($1, 'TestLocation2', 1, 'TestCompany')", [newLocationID]);
            await pool.query("CREATE TEMPORARY TABLE User2 (LIKE User2 INCLUDING ALL)");
            await pool.query("INSERT INTO User2 VALUES ('Jane', 'Doe', 'janedoe@gmail.com', 'fsfsdfsd', $1, 'TestCompany')", [newUserName]);
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category VALUES ($1, 'TestCategory5', 1, 'Straight Line')", [newCategID]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    })

    it("_updateAssetAcquisitionDate Test", async function(){
        // Test Inputs
        let newMonth = 10;
        let newDay = 12;
        let newYear = 2022;
        let newDate = new Date(newYear, newMonth - 1, newDay);

        await testDatabaseFunction(Asset._updateAssetAcquisitionDate, 'acquisitiondate', assetTag, newDate, oldAcquisitionDate , assetTag, newDate);
    });

    it("_updateAssetFixedStatus Test", async function(){
        // Test Inputs
        let newFixedStatus = false;

        await testDatabaseFunction(Asset._updateAssetFixedStatus, 'isfixed', assetTag, newFixedStatus, oldIsFixed, assetTag, newFixedStatus);
    });

    it("_updateAssetLifeSpan Test", async function(){
        // Test Inputs
        let newAssetLifeSpan = 13;

        await testDatabaseFunction(Asset._updateAssetLifeSpan, 'assetlifespan', assetTag, newAssetLifeSpan, oldAssetLifeSpan, assetTag, newAssetLifeSpan);
    });

    it("_updateAssetLocation Test", async function(){
        // Test Inputs
        let newLocation = newLocationID;

        await testDatabaseFunction(Asset._updateAssetLocation, 'locationid', assetTag, newLocation, oldLocationID, assetTag, newLocation);
    });

    it("_updateAssetStatus Test", async function(){
        // Test Inputs
        let newStatus = 'excellent';

        await testDatabaseFunction(Asset._updateAssetStatus, 'status', assetTag, newStatus, oldStatus, assetTag, newStatus);
    });

    it("_updateAssetCustodian Test", async function(){
        // Test Inputs
        let newCustodian = newUserName;

        await testDatabaseFunction(Asset._updateAssetCustodian, 'custodianname', assetTag, newCustodian, oldCustodianName, assetTag, newCustodian);
    });

    it("_updateAssetAcquisitionCost Test", async function(){
        // Test Inputs
        let newAcquisitionCost = 100000;

        await testDatabaseFunction(Asset._updateAssetAcquisitionCost, 'acquisitioncost', assetTag, newAcquisitionCost, oldAcquisitionCost, assetTag, newAcquisitionCost);
    });

    it("_updateAssetInsuranceValue Test", async function(){
        // Test Inputs
        let newInsuranceValue = 5000;

        await testDatabaseFunction(Asset._updateAssetInsuranceValue, 'insurancevalue', assetTag, newInsuranceValue, oldInsuranceValue, assetTag, newInsuranceValue);
    });

    it("_updateAssetCategoryID Test", async function(){
        // Test Inputs
        let newCategoryID = newCategID;

        await testDatabaseFunction(Asset._updateAssetCategoryID, 'categoryid', assetTag, newCategoryID, oldCategoryID, assetTag, newCategoryID);
    });

    it("_updateAssetResidualValue Test", async function(){
        // Test Inputs
        let newResidualValue = 14;

        await testDatabaseFunction(Asset._updateAssetResidualValue, 'residualvalue', assetTag, newResidualValue, oldResidualValue, assetTag, newResidualValue);
    });


    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Location");
            await pool.query("DROP TABLE IF EXISTS pg_temp.User2");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
});

describe.skip("insert Asset Tests", function(){
    let assetTag = 'AUA0004';
    let fetchResult;
    let valueFromDatabase;

    this.beforeEach(async function(){
        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTag]);
            await pool.query("CREATE TEMPORARY TABLE Asset_File (LIKE Asset_File INCLUDING ALL)");
            await pool.query("CREATE TEMPORARY TABLE DepreciationSchedule (LIKE DepreciationSchedule INCLUDING ALL)");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    it("_insertAssetAttachments Test", async function(){
        let attachments = ['attachments/download.jpeg'];

        await utility.assertThatFunctionWorks(Asset._insertAssetAttachments, assetTag, attachments);

        fetchResult = await utility.returnFetchedResultsFromDatabase("SELECT attachment FROM Asset_File WHERE assetTag = $1", [assetTag], 'attachment');
        
        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Returned");
        
        valueFromDatabase = fetchResult.rows[0].attachment;

        assert.equal(attachments[0], valueFromDatabase, "Wrong Attachment Returned");
    });

    it("_insertDepreciationSchedule Test", async function(){
        // Test Inputs
        let year = 2023;
        let openingBookValue = 10_000;
        let depreciationExpense = 2_500;
        let accumulatedDepreciation = 2_500;
        
        await utility.assertThatFunctionWorks(Asset._insertDepreciationSchedule, assetTag, openingBookValue, year, depreciationExpense, accumulatedDepreciation);

        fetchResult = await utility.returnFetchedResultsFromDatabase("SELECT openingBookValue, depreciationExpense, accumulatedDepreciation FROM DepreciationSchedule WHERE assetTag = $1 AND year = $2", 
                                                        [assetTag, year], 'Opening Book Value');

        utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned");
        valueFromDatabase = fetchResult.rows[0]

        assert.deepEqual({
            openingbookvalue: openingBookValue,
            depreciationexpense: depreciationExpense,
            accumulateddepreciation: accumulatedDepreciation
        }, valueFromDatabase, "Wrong Item Returned");
    })

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset_File");
            await pool.query("DROP TABLE IF EXISTS pg_temp.DepreciationSchedule");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    })
})

