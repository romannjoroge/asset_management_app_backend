// Import database pool

// Importing testing packages
import Sinon from 'sinon';
import { assert } from 'chai';

// Importing classes used in tests
import {Category} from '../src/Allocation/Category/category2.js';
import MyError from '../utility/myError.js';
import Folder from '../src/Allocation/Folder/folder.js';

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
        let updateDepreciationTypeInDB = Sinon.stub(Category, "_updateDepreciationTypeInDB");

        // Mock deleteDepreciationPercentInDb
        let deleteDepreciationPercentInDb = Sinon.stub(Category, "_deleteDepreciationPercentInDb");

        // Mock insertDepreciationPercentInDb
        let insertDepreciationPercentInDb = Sinon.stub(Category, "_insertDepreciationPercentInDb");

        // Stub getCategoryID
        let getCategoryID = Sinon.stub(Category, "_getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));

        // Stub doesFolderExist
        let doesFolderExist = Sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        // Mocks for updateCategoryName
        let updateNameinDb = Sinon.stub(Category, "_updateNameinDb");

        // Mocks for updateCategoryFolder
        let updateFolderinDB = Sinon.stub(Category, "_updateFolderinDB");

        // Run function
        try{
            await Category.updateCategory(updateJSON, categoryName);

            // Assert that updateNameinDb is called with right arguements
            Sinon.assert.calledWith(updateNameinDb, category_id, updateJSON.name);
            // Assert that updateFolderinDB is called with the right arguements
            Sinon.assert.calledWith(updateFolderinDB, category_id, updateJSON.parentFolder);
            // Assert that updateDepreciationTypeInDB is called with the right arguements
            Sinon.assert.calledWith(updateDepreciationTypeInDB, category_id, updateJSON.depreciation.type);
            // Assert that deleteDepreciationPercentInDb is called with the right arguements
            Sinon.assert.calledWith(deleteDepreciationPercentInDb, category_id);
            // Assert that insertDepreciationPercentInDb is not called
            Sinon.assert.notCalled(insertDepreciationPercentInDb);

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
        
        let updateDepreciationTypeInDBStub = Sinon.stub(Category, "_updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDbStub = Sinon.stub(Category, "_deleteDepreciationPercentInDb");
        let insertDepreciationPercentInDbStub = Sinon.stub(Category, "_insertDepreciationPercentInDb");
        let getCategoryIDStub = Sinon.stub(Category, "_getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id)
                        .withArgs(updateJSON.name)
                        .throws(new MyError("No Category exists with that name"));
        let doesFolderExistStub = Sinon.stub(Folder, "doesFolderExist")
                         .withArgs(updateJSON.parentFolder)
                         .returns(true);

        let updateCategoryNameStub = Sinon.stub(Category, "_updateCategoryName");
        let updateCategoryFolderStub = Sinon.stub(Category, "_updateCategoryFolder");

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