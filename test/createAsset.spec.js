// Import database pool
const pool = require("../db2");
const fs = require('fs');

// Import testing libraries
const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

// Import classes
const MyError = require("../utility/myError");
const utility = require('../utility/utility');
const Asset = require('../src/Allocation/asset2');
const Location = require('../src/Tracking/location');
const User = require('../src/Users/users');
const Category = require("../src/Allocation/category2");

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

    async function assertThatAssetConstructorFails(errorMessage){
        try{
            let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, 
                    acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber);
            await asset.initialize();
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
        
        verifyLocationStub = sinon.stub(Location, "verifyLocationID")
                            .withArgs(locationID, locationErrorMessage)
                            .returns("Test");
        checkIfUserExistsStub = sinon.stub(User, "checkIfUserExists")
                                .withArgs(custodianName, invalidCustodianErrorMessage);
        doesCategoryExistStub = sinon.stub(Category, "doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(true);
        getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                            .withArgs(categoryName)
                            .returns(1);
        fsExistsSyncStub = sinon.stub(fs, "existsSync")
                           .withArgs(attachments[0])
                           .returns(true);
        doesAssetTagExistStub = sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, assetTagErrorMessage);
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
        verifyLocationStub = sinon.stub(Location, "verifyLocationID")
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
        checkIfUserExistsStub = sinon.stub(User, "checkIfUserExists")
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


        Category.doesCategoryExist.restore();
        Category.getCategoryID.restore();
        doesCategoryExistStub = sinon.stub(Category, "doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(false);
        getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                            .withArgs(categoryName)
                            .throws("Category Does Not Exist");

        await assertThatAssetConstructorFails("Invalid category");
    });

    it("should fail when an invalid attachment is given", async function(){
        // Test inputs
        attachments = ['this/does/not/exist'];

        fs.existsSync.restore();
        fsExistsSyncStub = sinon.stub(fs, "existsSync")
                            .withArgs(attachments[0])
                            .returns(false);

        await assertThatAssetConstructorFails("Invalid attachments");
    });

    it("should fail when an existing assetTag is given", async function(){
        // Test inputs
        assetTag = "Already assigned";

        Asset.doesAssetTagExist.restore();
        doesAssetTagExistStub = sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, assetTagErrorMessage)
                                .throws(new MyError(assetTagErrorMessage));

        await assertThatAssetConstructorFails(assetTagErrorMessage);
    });

    it("should add asset when all details are valid", async function(){
        try{
            let asset = new Asset(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName, 
                acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo, serialNumber);
            await asset.initialize();
            assert(true, "Test Passed");
        }catch(err){
            console.log(err);
            asset(false, "An Error Should not have been thrown");
        }
    });
})