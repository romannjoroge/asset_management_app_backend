// Importing modules used to write tests
const assert = require('chai').assert;
const sinon = require('sinon');

// Importing classes to be used in test
const Category = require('../src/Allocation/category2');
const pool = require('../db2');
const MyError = require("../utility/myError");
const Folder = require('../src/Allocation/folder');

// Creating the test suite
describe.skip("addCategory Test", function () {
    it("should add category when depreciation type is double declining with no depreciation value", async function () {
        this.timeout(0);

        // Test input values
        let categoryName = 'Test';
        let parentFolderID = 1;
        let depreciaitionType = "Double Declining Balance";
        let depDetail = 0;

        // Create category object
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Stub saveCategory and getCategoryID
        let stub = sinon.stub(Category, "saveCategoryInDb")
                            .withArgs(categoryName, parentFolderID, depreciaitionType, depDetail)
                            .returns("Category created");

        // Run the function
        let result = await category1.addCategory();
        assert.equal(result, "Category created");
    });
    it("should add category when depreciation type is written value with a depreciation value", async function () {
        this.timeout(0);

        // Test input values
        let categoryName = 'Test';
        let parentFolderID = 2;
        let depreciaitionType = "Written Down Value";
        let depDetail = 200;

        // Create category object
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Stub saveCategory and getCategoryID
        let stub = sinon.stub(Category, "saveCategoryInDb")
                            .withArgs(categoryName, parentFolderID, depreciaitionType, depDetail)
                            .returns("Category created");

        // Run the function
        let result = await category1.addCategory();
        assert.equal(result, "Category created");
    });
    it("should bring an error when any or all of category details are missing", async function () {
        this.timeout(0);

        // Test input values
        let categoryName;
        let parentFolderID;
        let depreciaitionType;
        let depDetail;

        // Create category object
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Stub saveCategory and getCategoryID
        let stub = sinon.stub(Category, "saveCategoryInDb")
                            .withArgs(categoryName, parentFolderID, depreciaitionType, depDetail)
                            .returns("Category created");

        // Function should return an error
        try {
            await category1.addCategory();
            assert.equal(true, false, "An error should have been thrown");
        }catch(err){
            if (err instanceof MyError){
                assert.equal(true, true);
            }
            else{
                assert.equal(true, false, `${err.name} was thrown`);
            }
        }
    });
    it("should bring an error when a category already exists", async function () {
        this.timeout(0);

        // Test inputs
        let categoryName = "existing";
        let parentFolderID = 1;
        let depreciaitionType = "Written Down Value";
        let depDetail = 200;

        let category_id = 1;

        // Create category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Stub getCategoryID
        let stub = sinon.stub(Category, 'getCategoryID')
                        .withArgs(categoryName)
                        .returns(category_id);

        // If it works the function should return an error
        try {
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Category Exists"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(false, true, `${err} was returned`);
            }
        }
    });
    it("should bring an error if the parent folder does not exist", async function () {
        // Test inputs
        let categoryName = "Test";
        let parentFolderID = 1000;
        let depreciaitionType = "Double Declining Balance";
        let depDetail = 0;

        // Creating category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Creating a stub
        let stub = sinon.stub(Category, 'getCategoryID')
                        .withArgs(categoryName)
                        .throws(new MyError("No Category exists with that name"));
        let stub2 = sinon.stub(Folder, 'doesFolderExist')
                         .withArgs(parentFolderID)
                         .returns(false);

        // Calling the function
        try {
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Folder does not Exist") {
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error thrown");
            }
        }
    });
    it("should bring an error if depreciation type is invalid", async function (){
        // Test inputs
        let categoryName = "Test";
        let parentFolderID = 1;
        let depreciaitionType = "None Existent Type";
        let depDetail = 0;

        // Create a category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Call function
        try {
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if double declining balance has a depreciation value", async function (){
        // Test inputs
        let categoryName = "Test";
        let parentFolderID = 1;
        let depreciaitionType = "Double Declining Balance";
        let depDetail = 200;

        // Create category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Call function
        try{
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Double Declining Balance should not have a depreciation value"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if written value or straight does not have a depDetail", async function (){
        // Test inputs
        let categoryName = "Test";
        let parentFolderID = 1;
        let depreciaitionType = "Written Down Value";
        let depDetail = 0;

        // Create category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Call function
        try {
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if written value or straight has a negative depDetail", async function (){
        // Test inputs
        let categoryName = "Test";
        let parentFolderID = 1;
        let depreciaitionType = "Straight Line";
        let depDetail = -10;

        // Create category
        let category1 = new Category(categoryName, parentFolderID, depreciaitionType, depDetail);

        // Call function
        try {
            await category1.addCategory();
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
});

// Removes wrappers before each test
afterEach(function () {
    sinon.restore();
});