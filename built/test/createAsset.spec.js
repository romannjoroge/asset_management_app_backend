var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Import database pool
import pool from '../db2.js';
// Import testing libraries
import { assert } from 'chai';
import Sinon from 'sinon';
// Import classes
import MyError from '../utility/myError.js';
import utility from '../utility/utility.js';
import Asset from '../src/Allocation/Asset/asset2.js';
import Location from '../src/Tracking/location.js';
import User from '../src/Users/users.js';
import Category from '../src/Allocation/Category/category2.js';
import { Errors } from '../utility/constants.js';
describe.skip("createAsset test", function () {
    // Test inputs
    let fixed = true;
    let assetTag = "AUAOOOO2";
    let assetLifeSpan = 1;
    let acquisitionDate = "12-01-2022";
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
    function assertThatAssetConstructorFails(errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber, residualValue);
                yield asset.initialize();
                assert(false, "An Error Should Be Thrown");
            }
            catch (err) {
                if (err instanceof MyError && err.message === errorMessage) {
                    assert(true);
                }
                else {
                    console.log(err);
                    assert(false, "Wrong Error Thrown");
                }
            }
        });
    }
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            fixed = true;
            assetTag = "AUAOOOO1";
            assetLifeSpan = 1;
            acquisitionDate = "12-01-2022";
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
                yield pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
                yield pool.query("INSERT INTO Asset VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", [assetTag, makeAndModelNo, fixed, serialNumber, acquisitionDate, locationID, status,
                    custodianName, acquisitionCost, insuranceValue, residualValue, categoryID, assetLifeSpan]);
            }
            catch (err) {
                console.log(err);
                assert(false, "Could Not Create Temporary Tables");
            }
        });
    });
    it("should fail when an invalid fixed status is provided", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            fixed = "Wierd Value";
            yield assertThatAssetConstructorFails("Invalid Fixed Status");
        });
    });
    it("should fail when an invalid asset life span", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            assetLifeSpan = -1;
            yield assertThatAssetConstructorFails("Invalid asset life span");
        });
    });
    it("should fail when an invalid acquisition date is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            acquisitionDate = "Super Wrong Date";
            "Invalid acquisition date";
            yield assertThatAssetConstructorFails("Invalid acquisition date");
        });
    });
    it("should fail when an invalid location is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            locationID = 1000;
            yield assertThatAssetConstructorFails(Errors[3]);
        });
    });
    it("should fail when an invalid status is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            status = "Wierd Status";
            "Invalid status";
            yield assertThatAssetConstructorFails("Invalid status");
        });
    });
    it("should fail when an invalid username is given as custodian name", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            custodianName = "Non Existent Name";
            yield assertThatAssetConstructorFails(invalidCustodianErrorMessage);
        });
    });
    it("should fail when an invalid acquisition cost is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            acquisitionCost = -1;
            yield assertThatAssetConstructorFails("Invalid acquisition cost");
        });
    });
    it("should fail when an invalid insurance value is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            insuranceValue = -1;
            yield assertThatAssetConstructorFails("Invalid insurance value");
        });
    });
    it("should fail when a category name that doesn't exist is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            categoryName = "Does Not Exist";
            yield assertThatAssetConstructorFails(Errors[5]);
        });
    });
    it("should fail when an invalid attachment is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            attachments = ['this/does/not/exist'];
            yield assertThatAssetConstructorFails(Errors[4]);
        });
    });
    it("should fail when an existing assetTag is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            assetTag = "AUAOOOO1";
            yield assertThatAssetConstructorFails(Errors[7]);
        });
    });
    it("should add asset when all details are valid", function () {
        return __awaiter(this, void 0, void 0, function* () {
            assetTag = 'AUA00002';
            residualValue = 0;
            try {
                let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber, residualValue);
                yield asset.initialize();
                assert(true, "Test Passed");
            }
            catch (err) {
                console.log(err);
                assert(false, "An Error Should not have been thrown");
            }
        });
    });
    it("should fail when a negative residual value is given", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Test inputs
            residualValue = -11;
            yield assertThatAssetConstructorFails("Invalid Residual Value");
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
