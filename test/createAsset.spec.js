// Import database pool
import fs from 'fs';

// Import testing libraries
import { assert } from 'chai';
import Sinon from 'sinon';

// Import classes
import MyError from '../utility/myError.js';
import Asset from '../src/Allocation/Asset/asset2.js';
import Location from '../src/Tracking/location.js'
import User from '../src/Users/users.js';
import Category from '../src/Allocation/Category/category2.js';

describe.skip("createAsset test", function () {
    // Test inputs
    let fixed;
    let assetTag;
    let assetLifeSpan;
    let acquisitionDate;
    let locationID;
    let status;
    let custodianName;
    let acquisitionCost;
    let insuranceValue;
    let categoryName;
    let attachments;
    let locationErrorMessage = "Invalid location";
    let verifyLocationStub;
    let invalidCustodianErrorMessage = "Invalid custodian";
    let checkIfUserExistsStub;
    let doesCategoryExistStub;
    let getCategoryIDStub;
    let fsExistsSyncStub;
    let doesAssetTagExistStub;
    let assetTagErrorMessage = "Asset Tag Has Already Been Assigned";
    let makeAndModelNo = "FSDFSDFSDFSDF";
    let serialNumber = 'ERSRSESRESFSe';
    let residualValue;
    let getCategoryDepreciationTypeStub;

    async function assertThatAssetConstructorFails(errorMessage){
        try{
            let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, 
                    acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber, residualValue);
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
    
    beforeEach(function (){
        // Test inputs
        fixed = true;
        assetTag = "AUAOOOO1";
        assetLifeSpan = 1;
        acquisitionDate = "12-01-2022";
        locationID = 1;
        status = "good";
        custodianName = "John";
        acquisitionCost = 1000;
        insuranceValue = 100;
        categoryName = "Test";
        attachments = ['attachments/908e0d1a8f2bc03775753a55d4bc57fe'];
        
        verifyLocationStub = Sinon.stub(Location, "verifyLocationID")
                            .withArgs(locationID, locationErrorMessage)
                            .returns("Test");
        checkIfUserExistsStub = Sinon.stub(User, "checkIfUserExists")
                                .withArgs(custodianName, invalidCustodianErrorMessage);
        doesCategoryExistStub = Sinon.stub(Category, "_doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(true);
        getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
                            .withArgs(categoryName)
                            .returns(1);
        fsExistsSyncStub = Sinon.stub(fs, "existsSync")
                           .withArgs(attachments[0])
                           .returns(true);
        doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, assetTagErrorMessage);
        residualValue = 100;
        getCategoryDepreciationTypeStub = Sinon.stub(Category, "_getCategoryDepreciationType")
                                            .withArgs(categoryName)
                                            .returns("Straight Line");
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

        Location.verifyLocationID.restore();
        verifyLocationStub = Sinon.stub(Location, "verifyLocationID")
                            .withArgs(locationID, locationErrorMessage)
                            .throws(new MyError(locationErrorMessage));

        await assertThatAssetConstructorFails(locationErrorMessage);
    });

    it("should fail when an invalid status is given", async function () {
        // Test inputs
        status = "Wierd Status"; "Invalid status"

        await assertThatAssetConstructorFails("Invalid status");
    });

    it("should fail when an invalid username is given as custodian name", async function (){
        // Test inputs
        custodianName = "Non Existent Name";

        User.checkIfUserExists.restore();
        checkIfUserExistsStub = Sinon.stub(User, "checkIfUserExists")
                                .withArgs(custodianName, invalidCustodianErrorMessage)
                                .throws(new MyError(invalidCustodianErrorMessage));

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


        Category._doesCategoryExist.restore();
        Category._getCategoryID.restore();
        doesCategoryExistStub = Sinon.stub(Category, "_doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(false);
        getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
                            .withArgs(categoryName)
                            .throws("Category Does Not Exist");

        await assertThatAssetConstructorFails("Invalid category");
    });

    it("should fail when an invalid attachment is given", async function(){
        // Test inputs
        attachments = ['this/does/not/exist'];

        fs.existsSync.restore();
        fsExistsSyncStub = Sinon.stub(fs, "existsSync")
                            .withArgs(attachments[0])
                            .returns(false);

        await assertThatAssetConstructorFails("Invalid attachments");
    });

    it("should fail when an existing assetTag is given", async function(){
        // Test inputs
        assetTag = "Already assigned";

        Asset.doesAssetTagExist.restore();
        doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, assetTagErrorMessage)
                                .throws(new MyError(assetTagErrorMessage));

        await assertThatAssetConstructorFails(assetTagErrorMessage);
    });

    it("should add asset when all details are valid", async function(){
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

    it("should fail when a non zero residual value is given when depreciation type is not straight line", async function(){
        // Test inputs
        residualValue = 100;
        categoryName = "Category with written down depreciation type";

        // Stubbing database calls
        Category._getCategoryDepreciationType.restore();
        Category._doesCategoryExist.restore();
        doesCategoryExistStub = Sinon.stub(Category, "_doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(true);
        getCategoryDepreciationTypeStub = Sinon.stub(Category, "_getCategoryDepreciationType")
                                            .withArgs(categoryName)
                                            .returns("Written Down Value");

        await assertThatAssetConstructorFails("Invalid Residual Value for Depreciation Type");
    });
})