// Import database pool
const fs = require('fs');

// Import testing libraries
const assert = require('chai').assert;
const sinon = require('sinon');

// Import classes
const MyError = require("../utility/myError");
const Asset = require('../src/Allocation/asset2');
const Location = require('../src/Tracking/location');
const User = require('../src/Users/users');
const Category = require("../src/Allocation/category2");
const { expect } = require('chai');

describe("updateAsset test cases", function (){
    async function updateAssetShouldThrowError(updateAssetDict, errorMessage){
        try{
            await Asset.updateAsset(updateAssetDict, assetTag);
            assert(false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === errorMessage){
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    }

    let doesAssetTagExistStub;
    let assetTag = 'AUA00001';

    this.beforeEach(function (){
        doesAssetTagExistStub = sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, "Asset Does Not Exist");
    });

    it("should return an error when given an invalid fixed status", async function(){
        // Test input
        let updateAssetDict = {
            fixed: "Wierd Value"
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid Fixed Status");
    });

    it("should return an error when given an invalid asset life span", async function(){
        // Test input
        let updateAssetDict = {
            assetLifeSpan : -1
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid asset life span");
    });

    it("should return an error when given an invalid acquisition date", async function(){
        // Test input
        let updateAssetDict = {
            acquisitionDate: "Wack Ass Date"
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid acquisition date");
    });

    it("should return an error when given an invalid location ID", async function(){
        // Test input
        let updateAssetDict = {
            locationID: "LOL"
        }

        let verifyLocationIDStub = sinon.stub(Location, "verifyLocationID")
                                    .withArgs(updateAssetDict.locationID, "Invalid location")
                                    .throws(new MyError("Invalid location"));

        await updateAssetShouldThrowError(updateAssetDict, "Invalid location");
    });

    it("should return an error when given an invalid status", async function(){
        // Test inputs
        let updateAssetDict = {
            status: "LOLOLOLOOO"
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid status");
    });

    it("should return an error when given a user that doesn't exist as a custodian", async function(){
        // Test inputs
        let updateAssetDict = {
            custodianName: "Does Not Exist"
        }

        let checkIfUserExistsStub = sinon.stub(User, "checkIfUserExists")
                                    .withArgs(updateAssetDict.custodianName, "Invalid custodian")
                                    .throws(new MyError("Invalid custodian"));

        await updateAssetShouldThrowError(updateAssetDict, "Invalid custodian");
    });

    it("should return an error when given an invalid acquisition cost", async function(){
        // Test inputs
        let updateAssetDict = {
            acquisitionCost: -1
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid acquisition cost");
    });

    it("should return an error when given an invalid insurance value", async function(){
        // Test inputs
        let updateAssetDict = {
            insuranceValue: -1
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid insurance value");
    });

    it("should return an error when a non existent category is given", async function(){
        // Test inputs
        let updateAssetDict = {
            categoryName: "Does not exist"
        }

        let getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                                .withArgs(updateAssetDict.categoryName)
                                .throws(new MyError("Category Does not Exist"));

        await updateAssetShouldThrowError(updateAssetDict, "Invalid category");
    });

    it("should return an error when an invalid attachment is given", async function(){
        // Test inputs
        let updateAssetDict = {
            attachments: ['path/to/non-existent/file']
        }

        let fsExistsSyncStub = sinon.stub(fs, "existsSync")
                                .withArgs(updateAssetDict.attachments[0])
                                .returns(false);

        await updateAssetShouldThrowError(updateAssetDict, "Invalid attachments");
    });

    it("should run successfuly when valid information is given", async function(){
        // Test inputs
        let updateAssetDict = {
            attachments: ['path/to/existing/file'],
            categoryName: "Exists",
            insuranceValue: 100,
            acquisitionCost: 1000,
            custodianName: "Exists",
            status: "good",
            locationID: 1,
            acquisitionDate: "12-22-2021",
            assetLifeSpan : 1,
            fixed: true
        }

        let fsExistsSyncStub = sinon.stub(fs, "existsSync")
                                .withArgs(updateAssetDict.attachments[0])
                                .returns(true);
        let _insertAssetAttachmentsStub = sinon.stub(Asset, "_insertAssetAttachments")
                                            .withArgs(assetTag, updateAssetDict.attachments[0])
        let getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                                .withArgs(updateAssetDict.categoryName)
                                .returns(1);
        let _updateAssetCategoryIDStub = sinon.stub(Asset, "_updateAssetCategoryID")
                                            .withArgs(assetTag, updateAssetDict.categoryName);
        let _updateAssetInsuranceValueStub = sinon.stub(Asset, "_updateAssetInsuranceValue")
                                            .withArgs(assetTag, updateAssetDict.insuranceValue);
        let _updateAssetAcquisitionCostStub = sinon.stub(Asset, "_updateAssetAcquisitionCost")
                                                .withArgs(assetTag, updateAssetDict.acquisitionCost);
        let _updateAssetCustodianStub = sinon.stub(Asset, "_updateAssetCustodian")
                                        .withArgs(assetTag, updateAssetDict.custodianName);
        let checkIfUserExistsStub = sinon.stub(User, "checkIfUserExists")
                                    .withArgs(updateAssetDict.custodianName, "Invalid custodian");
        let _updateAssetStatusStub = sinon.stub(Asset, "_updateAssetStatus")
                                    .withArgs(assetTag, updateAssetDict.status);
        let verifyLocationIDStub = sinon.stub(Location, "verifyLocationID")
                                    .withArgs(updateAssetDict.locationID, "Invalid location")
                                    .returns("Test");
        let _updateAssetLocationStub = sinon.stub(Asset, "_updateAssetLocation")
                                        .withArgs(assetTag, updateAssetDict.locationID);
        let _updateAssetAcquisitionDateStub = sinon.stub(Asset, "_updateAssetAcquisitionDate")
                                                .withArgs(assetTag, updateAssetDict.acquisitionDate);
        let _updateAssetLifeSpanStub = sinon.stub(Asset, "_updateAssetLifeSpan")
                                        .withArgs(assetTag, updateAssetDict.assetLifeSpan);
        let _updateAssetFixedStatusStub = sinon.stub(Asset, "_updateAssetFixedStatus")
                                            .withArgs(assetTag, updateAssetDict.fixed);
                                            
        try{
            await Asset.updateAsset(updateAssetDict, assetTag);
            // assert(_updateAssetFixedStatusStub.calledOnceWith(assetTag, updateAssetDict.fixed), "Fixed Status");
            // assert(_updateAssetLifeSpanStub.calledOnceWith(assetTag, updateAssetDict.assetLifeSpan), "Asset Life Span");
            // assert(_updateAssetAcquisitionDateStub.calledOnceWith(assetTag, updateAssetDict.acquisitionDate), "Asset Acquisition Date");
            // assert(_updateAssetLocationStub.calledOnceWith(assetTag, updateAssetDict.locationID), "Asset Location");
            // assert(_updateAssetStatusStub.calledOnceWith(assetTag, updateAssetDict.status), "Asset Status");
            // assert(_updateAssetCustodianStub.calledOnceWith(assetTag, updateAssetDict.custodianName), "Asset Custodian");
            // assert(_updateAssetAcquisitionCostStub.calledOnceWith(assetTag, updateAssetDict.acquisitionCost), "Asset Acquisition Cost");
            // assert(_updateAssetInsuranceValueStub.calledOnceWith(assetTag, updateAssetDict.insuranceValue), "Asset Insurance Value");
            // assert(_updateAssetCategoryIDStub.calledOnceWith(assetTag, updateAssetDict.categoryName), "Asset Category");
            // assert(_insertAssetAttachmentsStub.callCount === updateAssetDict.attachments.length, "Asset Attachments");
        }catch(err){
            console.log(err);
            assert(false, "No error should be thrown");
        }
    });
});