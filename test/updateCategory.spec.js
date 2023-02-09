// Import database pool
const pool = require("../db2");

// Importing testing packages
const sinon = require('sinon');
const assert = require('chai').assert;

// Importing classes used in tests
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");
const Folder = require("../src/Allocation/folder");

describe.skip("updateCategory Test", function () {
    it("should update depreciation type is double declining, value is 0 and the other details are valid", async function () {
        // Test inputs
        let updateJSON = {
            name: "NewCategory",
            parentFolder: 1,
            depreciation: {
                type: "Double Declining Balance",
                value: 0
            }
        };
        let categoryName = "Existing";

        let category_id = 1;
        
        // Stubbing

        // Stubs for updateDepreciation
        // Stub updateDepreciationTypeInDB
        let updateDepreciationTypeInDB = sinon.stub(Category, "updateDepreciationTypeInDB");

        // Stub deleteDepreciationPerYearInDb
        let deleteDepreciationPerYearInDb = sinon.stub(Category, "deleteDepreciationPerYearInDb");

        // Mock deleteDepreciationPercentInDb
        let deleteDepreciationPercentInDb = sinon.stub(Category, "deleteDepreciationPercentInDb");

        // Mock insertDepreciationPercentInDb
        let insertDepreciationPercentInDb = sinon.stub(Category, "insertDepreciationPercentInDb");

        // Mock insertDepreciationValueInDB
        let insertDepreciationValueInDB = sinon.stub(Category, "insertDepreciationValueInDB");

        // Stub getCategoryID
        let getCategoryID = sinon.stub(Category, "getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));

        // Stub doesFolderExist
        let doesFolderExist = sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        // Mocks for updateCategoryName
        let updateNameinDb = sinon.stub(Category, "updateNameinDb");

        // Mocks for updateCategoryFolder
        let updateFolderinDB = sinon.stub(Category, "updateFolderinDB");

        // Run function
        try{
            await Category.updateCategory(updateJSON, categoryName);

            // Assert that updateNameinDb is called with right arguements
            sinon.assert.calledWith(updateNameinDb, category_id, updateJSON.name);
            // Assert that updateFolderinDB is called with the right arguements
            sinon.assert.calledWith(updateFolderinDB, category_id, updateJSON.parentFolder);
            // Assert that updateDepreciationTypeInDB is called with the right arguements
            sinon.assert.calledWith(updateDepreciationTypeInDB, category_id, updateJSON.depreciation.type);
            // Assert that deleteDepreciationPerYearInDb is called with the right arguements
            sinon.assert.calledWith(deleteDepreciationPerYearInDb, category_id);
            // Assert that deleteDepreciationPercentInDb is called with the right arguements
            sinon.assert.calledWith(deleteDepreciationPercentInDb, category_id);
            // Assert that insertDepreciationValueInDB is not called
            sinon.assert.notCalled(insertDepreciationValueInDB);
            // Assert that insertDepreciationPercentInDb is not called
            sinon.assert.notCalled(insertDepreciationPercentInDb);

        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should have been thrown");
        }
    });
    it("should pass when depreciation type is written down, value is 200 and the rest is fine", async function () {
        // Test inputs
        let updateJSON = {
            name: "NewCategory",
            parentFolder: 1,
            depreciation: {
                type: "Written Down Value",
                value: 200
            }
        };
        let categoryName = "Existing";
        let category_id = 1;
        
        let updateDepreciationTypeInDBStub = sinon.stub(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPerYearInDbStub = sinon.stub(Category, "deleteDepreciationPerYearInDb");
        let deleteDepreciationPercentInDbStub = sinon.stub(Category, "deleteDepreciationPercentInDb");
        let insertDepreciationPercentInDbStub = sinon.stub(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDBStub = sinon.stub(Category, "insertDepreciationValueInDB");
        let getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));
        let doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        let updateCategoryNameStub = sinon.stub(Category, "updateCategoryName");
        let updateCategoryFolderStub = sinon.stub(Category, "updateCategoryFolder");

        // Run function
        try{
            await Category.updateCategory(updateJSON, categoryName);
            assert(updateDepreciationTypeInDBStub.calledOnce);
            assert(updateDepreciationTypeInDBStub.calledWith(category_id, updateJSON.depreciation.type));
            assert(deleteDepreciationPerYearInDbStub.calledOnce);
            assert(deleteDepreciationPerYearInDbStub.calledWith(category_id));
            assert(deleteDepreciationPercentInDbStub.calledOnce);
            assert(deleteDepreciationPercentInDbStub.calledWith(category_id));
            assert(insertDepreciationPercentInDbStub.notCalled);
            assert(insertDepreciationValueInDBStub.calledOnce);
            assert(insertDepreciationValueInDBStub.calledWith(category_id, updateJSON.depreciation.value));
            assert(updateCategoryFolderStub.calledOnce);
            assert(updateCategoryFolderStub.calledWith(category_id, updateJSON.parentFolder));
            assert(updateCategoryNameStub.calledOnce);
            assert(updateCategoryNameStub.calledWith(category_id, updateJSON.name));
        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should have been thrown");
        }
    });
})