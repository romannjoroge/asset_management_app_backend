var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing database pool
import pool from '../db2.js';
import { assert } from 'chai';
import Asset from '../src/Allocation/Asset/asset2.js';
import utility from '../utility/utility.js';
describe.skip("_doesAssetTagExist Test", function () {
    let assetTag;
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            assetTag = 'AUA0003';
            try {
                yield pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
                yield pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTag]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("should return false when a category that doesn't exist is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            assetTag = 'Does Not Exist';
            yield utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetIDExist, false, assetTag);
        });
    });
    it("should return true if asset tag exists", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            assetTag = 'AUA0003';
            yield utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetIDExist, true, assetTag);
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Drop Temporary Tables");
            }
        });
    });
});
describe.skip("asset.initialize() Test", function () {
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
                yield pool.query("CREATE TEMPORARY TABLE Asset_File (LIKE Asset_File INCLUDING ALL)");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("should add an asset to the table", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let asset;
            let makeAndModelNo = 'HP Omen 16';
            let assetTag = 'AUA0004';
            let fetchResult;
            let result;
            try {
                asset = new Asset(true, 2, '10-22-2022', 1, 'good', 'John Doe', 10000, 1000, 'TestCategory', ['attachments/download.jpeg'], assetTag, 'HP Omen 16', 'P14dsfsder', 0);
            }
            catch (err) {
                console.log(err);
                assert(false, "Asset Could Not Be Created");
            }
            try {
                yield asset.initialize();
            }
            catch (err) {
                console.log(err);
                assert(false, "Asset Could Not Be Stored In Database");
            }
            try {
                fetchResult = yield pool.query("SELECT makeAndModelNo FROM Asset WHERE assetTag = $1", [assetTag]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Get makeAndModelNo from database");
            }
            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned");
            console.log(fetchResult.rows);
            result = fetchResult.rows[0].makeandmodelno;
            assert.equal(result, makeAndModelNo, "Wrong Item Inserted In Database");
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset_File");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Drop Temporary Tables");
            }
        });
    });
});
describe.skip("_getAssetCategoryName Test", function () {
    let assetTag;
    let categoryID;
    let categoryName = 'TestCategory3';
    let fetchResult;
    let result;
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            assetTag = 'AUA0004';
            categoryID = 4;
            try {
                yield pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
                yield pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, $2, 4)", [assetTag, categoryID]);
                yield pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
                yield pool.query("INSERT INTO Category VALUES ($1, $2, 1, 'Straight Line')", [categoryID, categoryName]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("should throw an error if asset doesn't exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            assetTag = 'Does Not Exist';
            yield utility.assertThatAsynchronousFunctionFails(Asset._getAssetCategoryName, "Asset Does Not Exist", assetTag);
        });
    });
    it("should return category name when an existing asset is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            assetTag = 'AUA0004';
            let returnedValue;
            try {
                returnedValue = yield Asset._getAssetCategoryName(assetTag);
            }
            catch (err) {
                console.log(err);
                assert(false, "Func did not run");
            }
            try {
                fetchResult = yield pool.query("SELECT name FROM Category WHERE ID = $1", [categoryID]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Get category name from database");
            }
            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
            result = fetchResult.rows[0].name;
            assert.equal(result, categoryName, "Wrong Value Returned");
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Category");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Delete Temporary Tables");
            }
        });
    });
});
describe.skip("update Asset Functions", function () {
    let fetchResult;
    let valueFromDatabase;
    let assetTag = 'AUA0004';
    let oldCategoryID = 1;
    let oldmakeAndModelNo = 'HP Folio 13';
    let oldIsFixed = true;
    let oldSerialNumber = 'FSDFDSF';
    let oldAcquisitionDate = new Date(2022, 11, 1);
    let oldLocationID = 1;
    let oldStatus = 'good';
    let oldCustodianName = 'John Doe';
    let oldAcquisitionCost = 10000;
    let oldInsuranceValue = 1000;
    let oldResidualValue = 0;
    let oldAssetLifeSpan = 5;
    let newLocationID = 4;
    let newUserName = 'Jane Doe';
    let newCategID = 5;
    function testDatabaseFunction(func, itemToUpdate, assetTag, itemToCompareAgainst, oldValue, ...params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield func(...params);
            }
            catch (err) {
                console.log(err);
                console.log(`${func.name} did not run`);
            }
            try {
                fetchResult = yield pool.query(`SELECT ${itemToUpdate} FROM Asset WHERE assetTag = $1`, [assetTag]);
            }
            catch (err) {
                console.log(`Could not get new ${itemToUpdate} from database`);
            }
            utility.verifyDatabaseFetchResults(fetchResult, "Nothing was returned");
            valueFromDatabase = fetchResult.rows[0][itemToUpdate];
            assert.notDeepEqual(valueFromDatabase, oldValue, "Item Not Changed");
            assert.deepEqual(valueFromDatabase, itemToCompareAgainst, `Wrong ${itemToUpdate} returned, returned value is ${valueFromDatabase}`);
        });
    }
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
                yield pool.query("INSERT INTO Asset VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", [assetTag, oldmakeAndModelNo, oldIsFixed, oldSerialNumber, oldAcquisitionDate, oldLocationID, oldStatus, oldCustodianName, oldAcquisitionCost,
                    oldInsuranceValue, oldResidualValue, oldCategoryID, oldAssetLifeSpan]);
                yield pool.query("CREATE TEMPORARY TABLE Location (LIKE Location INCLUDING ALL)");
                yield pool.query("INSERT INTO Location VALUES ($1, 'TestLocation2', 1, 'TestCompany')", [newLocationID]);
                yield pool.query("CREATE TEMPORARY TABLE User2 (LIKE User2 INCLUDING ALL)");
                yield pool.query("INSERT INTO User2 VALUES ('Jane', 'Doe', 'janedoe@gmail.com', 'fsfsdfsd', $1, 'TestCompany')", [newUserName]);
                yield pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
                yield pool.query("INSERT INTO Category VALUES ($1, 'TestCategory5', 1, 'Straight Line')", [newCategID]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("_updateAssetAcquisitionDate Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newMonth = 10;
            let newDay = 12;
            let newYear = 2022;
            let newDate = new Date(newYear, newMonth - 1, newDay);
            yield testDatabaseFunction(Asset._updateAssetAcquisitionDate, 'acquisitiondate', assetTag, newDate, oldAcquisitionDate, assetTag, newDate);
        });
    });
    it("_updateAssetFixedStatus Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newFixedStatus = false;
            yield testDatabaseFunction(Asset._updateAssetFixedStatus, 'isfixed', assetTag, newFixedStatus, oldIsFixed, assetTag, newFixedStatus);
        });
    });
    it("_updateAssetLifeSpan Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newAssetLifeSpan = 13;
            yield testDatabaseFunction(Asset._updateAssetLifeSpan, 'assetlifespan', assetTag, newAssetLifeSpan, oldAssetLifeSpan, assetTag, newAssetLifeSpan);
        });
    });
    it("_updateAssetLocation Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newLocation = newLocationID;
            yield testDatabaseFunction(Asset._updateAssetLocation, 'locationid', assetTag, newLocation, oldLocationID, assetTag, newLocation);
        });
    });
    it("_updateAssetStatus Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newStatus = 'excellent';
            yield testDatabaseFunction(Asset._updateAssetStatus, 'status', assetTag, newStatus, oldStatus, assetTag, newStatus);
        });
    });
    it("_updateAssetCustodian Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newCustodian = newUserName;
            yield testDatabaseFunction(Asset._updateAssetCustodian, 'custodianname', assetTag, newCustodian, oldCustodianName, assetTag, newCustodian);
        });
    });
    it("_updateAssetAcquisitionCost Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newAcquisitionCost = 100000;
            yield testDatabaseFunction(Asset._updateAssetAcquisitionCost, 'acquisitioncost', assetTag, newAcquisitionCost, oldAcquisitionCost, assetTag, newAcquisitionCost);
        });
    });
    it("_updateAssetInsuranceValue Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newInsuranceValue = 5000;
            yield testDatabaseFunction(Asset._updateAssetInsuranceValue, 'insurancevalue', assetTag, newInsuranceValue, oldInsuranceValue, assetTag, newInsuranceValue);
        });
    });
    it("_updateAssetCategoryID Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newCategoryID = newCategID;
            yield testDatabaseFunction(Asset._updateAssetCategoryID, 'categoryid', assetTag, newCategoryID, oldCategoryID, assetTag, newCategoryID);
        });
    });
    it("_updateAssetResidualValue Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let newResidualValue = 14;
            yield testDatabaseFunction(Asset._updateAssetResidualValue, 'residualvalue', assetTag, newResidualValue, oldResidualValue, assetTag, newResidualValue);
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Location");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.User2");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Category");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Drop Temporary Tables");
            }
        });
    });
});
describe.skip("insert Asset Tests", function () {
    let assetTag = 'AUA0004';
    let fetchResult;
    let valueFromDatabase;
    this.beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
                yield pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTag]);
                yield pool.query("CREATE TEMPORARY TABLE Asset_File (LIKE Asset_File INCLUDING ALL)");
                yield pool.query("CREATE TEMPORARY TABLE DepreciationSchedule (LIKE DepreciationSchedule INCLUDING ALL)");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("_insertAssetAttachments Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let attachments = ['attachments/download.jpeg'];
            yield utility.assertThatFunctionWorks(Asset._insertAssetAttachments, assetTag, attachments);
            fetchResult = yield utility.returnFetchedResultsFromDatabase("SELECT attachment FROM Asset_File WHERE assetTag = $1", [assetTag], 'attachment');
            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Returned");
            valueFromDatabase = fetchResult.rows[0].attachment;
            assert.equal(attachments[0], valueFromDatabase, "Wrong Attachment Returned");
        });
    });
    it("_insertDepreciationSchedule Test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test Inputs
            let year = 2023;
            let openingBookValue = 10000;
            let depreciationExpense = 2500;
            let accumulatedDepreciation = 2500;
            yield utility.assertThatFunctionWorks(Asset._insertDepreciationSchedule, assetTag, openingBookValue, year, depreciationExpense, accumulatedDepreciation);
            fetchResult = yield utility.returnFetchedResultsFromDatabase("SELECT openingBookValue, depreciationExpense, accumulatedDepreciation FROM DepreciationSchedule WHERE assetTag = $1 AND year = $2", [assetTag, year], 'Opening Book Value');
            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned");
            valueFromDatabase = fetchResult.rows[0];
            assert.deepEqual({
                openingbookvalue: openingBookValue,
                depreciationexpense: depreciationExpense,
                accumulateddepreciation: accumulatedDepreciation
            }, valueFromDatabase, "Wrong Item Returned");
        });
    });
    this.afterEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.Asset_File");
                yield pool.query("DROP TABLE IF EXISTS pg_temp.DepreciationSchedule");
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Drop Temporary Tables");
            }
        });
    });
});
