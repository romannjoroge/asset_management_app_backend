// Import database pool
const pool = require("../db2");

// Importing testing modules
const assert = require('chai').assert;
const sinon = require('sinon');

// Importing classes used in testing
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");
const Folder = require("../src/Allocation/folder");

describe("verifyFolder Test", function () {
    it("should deny a folder id that is not a number", async function() {
        // Test inputs
        let id = "hello";

        // Run function
        try{
            await Category.verifyFolder(id);
            assert.equal(true, false, "An Error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Folder") {
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should deny a folder id that does not exist", async function () {
        // Test Inputs
        let id = 1000;

        // Stub Folder.doesFolderExist function
        let stub = sinon.stub(Folder, "doesFolderExist")
                        .withArgs(1000)
                        .returns(false);

        // Run function
        try {
            await Category.verifyFolder(id);
            assert.equal(true, false, "An Error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Folder does not exist") {
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
});

describe("updateCategoryFolder Test", function () {
    it("should add a folder if new folder ID exists", async function () {
        // Test input
        let id = 2;
        let categotyName = "Existing";

        let category_id = 1;

        // Stub doesFolderExist
        let doesFolderExist = sinon.stub(Folder, "doesFolderExist")
                        .withArgs(id)
                        .returns(true);

        // Stub _getCategoryID
        let _getCategoryID = sinon.stub(Category, "_getCategoryID")
                        .withArgs(categotyName)
                        .returns(category_id);

        // Stub _updateFolderinDB
        let _updateFolderinDB = sinon.stub(Category, "_updateFolderinDB");

        // Call function
        try{
            await Category._updateCategoryFolder(id, categotyName);
            
            // Assert that _updateFolderinDB was called with the right arguements
            sinon.assert.calledWith(_updateFolderinDB, category_id, id);

        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should Have Been Thrown");
        }
    });
    it("should fail if a non existent folder ID is given", async function () {
        // Test inputs
        let id = 1000;
        let categoryName = "Existing";

        // Stub _getCategoryID
        let _getCategoryID = sinon.stub(Category, "_getCategoryID");

        // Stub does folder exist
        let stub2 = sinon.stub(Folder, "doesFolderExist")
                         .withArgs(id)
                         .returns(false);

        // Stub _updateFolderinDB
        let _updateFolderinDB = sinon.stub(Category, "_updateFolderinDB");

        // Run function
        try{
            await Category._updateCategoryFolder(id, categoryName);
            assert.equal(true, false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Folder does not exist"){
                // Assert that _getCategoryID is not called
                sinon.assert.notCalled(_getCategoryID);
                // Assert that _updateFolderinDB is not called
                sinon.assert.notCalled(_updateFolderinDB);
            }else{
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail if folder id is invalid", async function () {
        // Test inputs
        let id = "hello";
        let categoryName = "Existsing";

        // Stub doesFolderExist
        let doesFolderExist = sinon.stub(Folder, "doesFolderExist");

        // Stub _getCategoryID
        let _getCategoryID = sinon.stub(Category, "_getCategoryID");

        // Stub _updateFolderinDB
        let _updateFolderinDB = sinon.stub(Category, "_updateFolderinDB");

        // Run function
        try{
            await Category._updateCategoryFolder(id, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Folder"){
                // Assert that doesFolderExist is not called
                sinon.assert.notCalled(doesFolderExist);
                // Assert that _getCategoryID is not called
                sinon.assert.notCalled(_getCategoryID);
                // Assert that _updateFolderinDB is not called
                sinon.assert.notCalled(_updateFolderinDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
});