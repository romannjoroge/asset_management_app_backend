// Importing modules used to write tests
const assert = require('chai').assert;
const sinon = require('sinon');

// Importing classes to be used in test
const Category = require('../src/Allocation/category2');
const pool = require('../db2');
const MyError = require("../utility/myError");
const Folder = require('../src/Allocation/folder');

// Creating the test suite
describe("addCategory Test", function () {
    let category;
    let depreciaitionType;
    let depreciationPercentage;
    let categoryName;
    let parentFolderID;
    let doesCategoryExistStub;
    let saveCategoryStub;
    let doesFolderExistStub;

    async function assertThatCategotyConstructorFails(errorMessage){
        try{
            category = new Category(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
            await category.initialize();
            assert(false, "An error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === errorMessage){
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    }

    async function assertThatCategoryConstructorSucceds(){
        try {
            category = new Category(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
            await category.initialize();
            assert(true);
        }catch(err){
            console.log(err);
            assert(false, "No error should have been thrown");
        }
    }

    this.beforeEach(function (){
        depreciaitionType = "Written Down Value";
        depreciationPercentage = 40;
        categoryName = "Existing Category";
        parentFolderID = 1;

        doesCategoryExistStub = sinon.stub(Category, "doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(true);
        saveCategoryStub = sinon.stub(Category, "saveCategoryInDb")
                            .withArgs(categoryName, parentFolderID, depreciaitionType, depreciationPercentage);
        doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
                                .withArgs(parentFolderID)
                                .returns(true);

    })


    it("should add category when depreciation type is double declining with no depreciation value", async function () {
        // Test input values
        depreciaitionType = "Double Declining Balance";
        depreciationPercentage = null;

        await assertThatCategoryConstructorSucceds();
    });

    it("should add category when depreciation type is written value with a depreciation value", async function () {
        await assertThatCategoryConstructorSucceds();
    });

    it("should bring an error when any of category details are missing", async function () {
        // Test input values
        categoryName = null;
        await assertThatCategotyConstructorFails("Missing Information");
    });

    it("should bring an error when a category already exists", async function () {
        // Test inputs
        categoryName = "existing"

        Category.doesCategoryExist.restore();
        doesCategoryExistStub = sinon.stub(Category, "doesCategoryExist")
                                .withArgs(categoryName)
                                .returns(false);
        await assertThatCategotyConstructorFails("Category Already Exists");
    });

    it("should bring an error if the parent folder does not exist", async function () {
        // Test inputs
        parentFolderID = 1000;

        Folder.doesFolderExist.restore();
        doesFolderExistStub = sinon.stub(Folder, "doesFolderExist")
                                .withArgs(parentFolderID)
                                .returns(false);
        await assertThatCategotyConstructorFails("Parent Folder Does Not Exist");
    });

    it("should bring an error if depreciation type is invalid", async function (){
        // Test inputs
        depreciaitionType = "None Existent Type";

        await assertThatCategotyConstructorFails("Invalid Depreciation Type");
    });

    it("should bring an error if double declining or straight line balance has a depreciation value", async function (){
        // Test inputs
        depreciaitionType = "Double Declining Balance";
        depreciationPercentage = 200;

        await assertThatCategotyConstructorFails("There should be no depreciation percentage");
    });

    it("should bring an error if written value does not have a depreciation percentage", async function (){
        // Test inputs
        depreciaitionType = "Written Down Value";
        depreciationPercentage = null;

        await assertThatCategotyConstructorFails("Invalid Depreciation Percentage");
    });

    it("should bring an error if written value has a negative depreciation percentage", async function (){
        // Test inputs
        depreciaitionType = "Written Down Value";
        depreciationPercentage = -10;

        await assertThatCategotyConstructorFails("Invalid Depreciation Percentage");
    });
});

// Removes wrappers before each test
afterEach(function () {
    sinon.restore();
});