// Import database pool
const pool = require("../db2");

// Importing testing packages
const sinon = require('sinon');
const assert = require('chai').assert;

// Importing classes used in tests
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");
const Folder = require("../src/Allocation/folder");

describe("updateCategory Test", function () {
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
        let updateDepreciationTypeInDB = sinon.stub(Category, "_updateDepreciationTypeInDB");

        // Mock deleteDepreciationPercentInDb
        let deleteDepreciationPercentInDb = sinon.stub(Category, "_deleteDepreciationPercentInDb");

        // Mock insertDepreciationPercentInDb
        let insertDepreciationPercentInDb = sinon.stub(Category, "_insertDepreciationPercentInDb");

        // Stub getCategoryID
        let getCategoryID = sinon.stub(Category, "_getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));

        // Stub doesFolderExist
        let doesFolderExist = sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        // Mocks for updateCategoryName
        let updateNameinDb = sinon.stub(Category, "_updateNameinDb");

        // Mocks for updateCategoryFolder
        let updateFolderinDB = sinon.stub(Category, "_updateFolderinDB");

        // Run function
        try{
            await Category.updateCategory(updateJSON, categoryName);

            // Assert that updateNameinDb is called with right arguements
            sinon.assert.calledWith(updateNameinDb, category_id, updateJSON.name);
            // Assert that updateFolderinDB is called with the right arguements
            sinon.assert.calledWith(updateFolderinDB, category_id, updateJSON.parentFolder);
            // Assert that updateDepreciationTypeInDB is called with the right arguements
            sinon.assert.calledWith(updateDepreciationTypeInDB, category_id, updateJSON.depreciation.type);
            // Assert that deleteDepreciationPercentInDb is called with the right arguements
            sinon.assert.calledWith(deleteDepreciationPercentInDb, category_id);
            // Assert that insertDepreciationPercentInDb is not called
            sinon.assert.notCalled(insertDepreciationPercentInDb);

        }catch(err){
            console.log(err);
            assert(false, "No Error Should have been thrown");
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
        
        let updateDepreciationTypeInDBStub = sinon.stub(Category, "_updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDbStub = sinon.stub(Category, "_deleteDepreciationPercentInDb");
        let insertDepreciationPercentInDbStub = sinon.stub(Category, "_insertDepreciationPercentInDb");
        let getCategoryIDStub = sinon.stub(Category, "_getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));
        let doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        let updateCategoryNameStub = sinon.stub(Category, "_updateCategoryName");
        let updateCategoryFolderStub = sinon.stub(Category, "_updateCategoryFolder");

        // Run function
        try{
            await Category.updateCategory(updateJSON, categoryName);
            assert(updateDepreciationTypeInDBStub.calledOnce, 'updateDepreciationTypeInDBStub 1');
            assert(updateDepreciationTypeInDBStub.calledWith(category_id, updateJSON.depreciation.type), 'updateDepreciationTypeInDBStub 2');
            assert(deleteDepreciationPercentInDbStub.calledOnce, 'deleteDepreciationPercentInDbStub 1');
            assert(deleteDepreciationPercentInDbStub.calledWith(category_id), 'deleteDepreciationPercentInDbStub 2');
            assert(insertDepreciationPercentInDbStub.calledOnce, 'insertDepreciationPercentInDbStub 1');
            assert(updateCategoryFolderStub.calledOnce, 'updateCategoryFolderStub 1');
            assert(updateCategoryFolderStub.calledWith(updateJSON.parentFolder, categoryName), "updateCategoryFolderStub 2");
            assert(updateCategoryNameStub.calledOnce, 'updateCategoryNameStub 1');
            assert(updateCategoryNameStub.calledWith(updateJSON.name, categoryName), "updateCategoryNameStub 2");
        }catch(err){
            console.log(err);
            assert(false, "No Error Should have been thrown");
        }
    });
})