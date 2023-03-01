// Import database pool
import fs from 'fs'

// Import testing libraries
import { assert } from 'chai';
import Sinon from 'sinon';

// Import classes
import MyError from '../utility/myError.js';
import Asset from '../src/Allocation/Asset/asset2.js';
import Location from '../src/Tracking/location.js'
import User from '../src/Users/users.js';
import {Category} from '../src/Allocation/Category/category2.js';

describe.skip("updateAsset test cases", function (){
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
        doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
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

        let verifyLocationIDStub = Sinon.stub(Location, "verifyLocationID")
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

        let checkIfUserExistsStub = Sinon.stub(User, "checkIfUserExists")
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

        let getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
                                .withArgs(updateAssetDict.categoryName)
                                .throws(new MyError("Category Does not Exist"));

        await updateAssetShouldThrowError(updateAssetDict, "Invalid category");
    });

    it("should return an error when an invalid attachment is given", async function(){
        // Test inputs
        let updateAssetDict = {
            attachments: ['path/to/non-existent/file']
        }

        let fsExistsSyncStub = Sinon.stub(fs, "existsSync")
                                .withArgs(updateAssetDict.attachments[0])
                                .returns(false);

        await updateAssetShouldThrowError(updateAssetDict, "Invalid attachments");
    });

    it("should return an error when a negative residual value is given", async function(){
        // Test inputs
        let updateAssetDict = {
            residualValue: -100
        }

        await updateAssetShouldThrowError(updateAssetDict, "Invalid Residual Value");
    });

    it("should return an error when a non negative residual value is given but depreciation type is not straight line", async function(){
        // Test inputs
        let updateAssetDict = {
            residualValue: 100
        }

        let categoryName = "Category with written value depreciation";

        let _getAssetCategoryName = Sinon.stub(Asset, "_getAssetCategoryName")
                                    .withArgs(assetTag)
                                    .returns(categoryName);

        let getCategoryDepreciationTypeStub = Sinon.stub(Category, "_getCategoryDepreciationType")
                                                .withArgs(categoryName)
                                                .returns("Written Down Value");

        await updateAssetShouldThrowError(updateAssetDict, "Invalid Residual Value for the Depreciation Type");
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
            fixed: true,
            residualValue: 100
        }

        let fsExistsSyncStub = Sinon.stub(fs, "existsSync")
                                .withArgs(updateAssetDict.attachments[0])
                                .returns(true);
        let _insertAssetAttachmentsStub = Sinon.stub(Asset, "_insertAssetAttachments")
                                            .withArgs(assetTag, updateAssetDict.attachments[0])
        let getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
                                .withArgs(updateAssetDict.categoryName)
                                .returns(1);
        let _updateAssetCategoryIDStub = Sinon.stub(Asset, "_updateAssetCategoryID")
                                            .withArgs(assetTag, updateAssetDict.categoryName);
        let _updateAssetInsuranceValueStub = Sinon.stub(Asset, "_updateAssetInsuranceValue")
                                            .withArgs(assetTag, updateAssetDict.insuranceValue);
        let _updateAssetAcquisitionCostStub = Sinon.stub(Asset, "_updateAssetAcquisitionCost")
                                                .withArgs(assetTag, updateAssetDict.acquisitionCost);
        let _updateAssetCustodianStub = Sinon.stub(Asset, "_updateAssetCustodian")
                                        .withArgs(assetTag, updateAssetDict.custodianName);
        let checkIfUserExistsStub = Sinon.stub(User, "checkIfUserExists")
                                    .withArgs(updateAssetDict.custodianName, "Invalid custodian");
        let _updateAssetStatusStub = Sinon.stub(Asset, "_updateAssetStatus")
                                    .withArgs(assetTag, updateAssetDict.status);
        let verifyLocationIDStub = Sinon.stub(Location, "verifyLocationID")
                                    .withArgs(updateAssetDict.locationID, "Invalid location")
                                    .returns("Test");
        let _updateAssetLocationStub = Sinon.stub(Asset, "_updateAssetLocation")
                                        .withArgs(assetTag, updateAssetDict.locationID);
        let _updateAssetAcquisitionDateStub = Sinon.stub(Asset, "_updateAssetAcquisitionDate")
                                                .withArgs(assetTag, updateAssetDict.acquisitionDate);
        let _updateAssetLifeSpanStub = Sinon.stub(Asset, "_updateAssetLifeSpan")
                                        .withArgs(assetTag, updateAssetDict.assetLifeSpan);
        let _updateAssetFixedStatusStub = Sinon.stub(Asset, "_updateAssetFixedStatus")
                                            .withArgs(assetTag, updateAssetDict.fixed);
        let _getAssetCategoryName = Sinon.stub(Asset, "_getAssetCategoryName")
                                    .withArgs(assetTag)
                                    .returns(updateAssetDict.categoryName);
        let getCategoryDepreciationTypeStub = Sinon.stub(Category, "_getCategoryDepreciationType")
                                                .withArgs(updateAssetDict.categoryName)
                                                .returns("Straight Line");
        let _updateAssetResidualValueStub = Sinon.stub(Asset, "_updateAssetResidualValue")
                                            .withArgs(assetTag, updateAssetDict.residualValue);
                                            
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