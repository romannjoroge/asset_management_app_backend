// Import database pool
const pool = require("../db2");

// Import testing libraries
const assert = require('chai').assert;
const sinon = require('sinon');

// Import classes
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");

describe.skip("verifyCategoryName test", function () {
    it("should deny a category name that is not a string", async function (){
        // Test input
        let newName = 1;

        // Run the function
        try {
            await Category.verifyCategoryName(newName);
            assert.equal(true, false, "An error was meant to be thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Category Name is of invalid type"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong error thrown");
            }
        }
    });
    it("should deny a category name that is too long", async function () {
        // Test input
        let newName = 'jsklfjskljfklasjfkljsfkljsdfkjdsklfjskldfjklasjklsjjflskdfklsdfdsljfklsjdlsjflskjfksjfkdsjfkldsjfkldsjklfjsklfjdsklfjkdsjfklsjfkldsjfklsndfkldsfklsf';

        // Run the function
        try{
            await Category.verifyCategoryName(newName);
            assert.equal(true, false, "An error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Category Name is too long"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong error thrown");
            }
        }
    });
    it("should deny a category name that already exists", async function () {
        // Test input
        let newName = "Existing";

        // Stub doesCategoryExist
        let stub = sinon.stub(Category, "doesCategoryExist")
                        .withArgs(newName)
                        .returns(true)

        // Run function
        try{
            await Category.verifyCategoryName(newName);
            assert.equal(true, false, "An error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === `${newName} category already exists`){
                assert.equal(true, true);
            }else{
                assert.equal(true, false, "Wrong error thrown");
            }
        }
    });
    it("should accept a category name that is of the right type, length and does not exist", async function () {
        // Test input
        let newName = "NewCategory";

        // Stub doesCategoryExist
        let stub = sinon.stub(Category, "doesCategoryExist")
                        .withArgs(newName)
                        .returns(false)

        // Run function
        try {
            const result = await Category.verifyCategoryName(newName);
            assert.equal(result, "Name is valid!");
            sinon.assert.calledWith(stub, newName);
        }catch(err){
            console.log(err);
            assert.equal(false, true, "An Error Should not have been thrown");
        }
    })
});

describe.skip("updateCategoryName Test",async function () {
    it("should update category table if new category name is valid and old category exists", async function () {
        
        // Test inputs
        let newName = "Test2";
        let oldName = "Existing";

        let category_id = 1;

        // Stub getCategoryID
        let getCategory = sinon.stub(Category, "getCategoryID")
                               .throws(new MyError("No Category exists with that name"))
                               .onCall(1)                             
                               .returns(1)
                               .onCall(2);

        // Stub updateNameinDB
        let updateNameinDB = sinon.stub(Category, "updateNameinDb");
        
        // Call function
        try{
            await Category.updateCategoryName(newName, oldName);
            sinon.assert.calledWith(updateNameinDB, category_id, newName);
        }catch(err){
            console.log(err);
            console.log(getCategory.callCount);
            assert.equal(true, false);
        }

    });
    it("should deny updating a category that does not exist", async function () {
        // Test inputs
        let newName = "Valid";
        let oldName = "Non Existent";

        // Stub getCategoryID
        let stub = sinon.stub(Category, "getCategoryID")
                        .withArgs(oldName)
                        .throws(new MyError("No Category exists with that name"))
                        .withArgs(newName)
                        .throws(new MyError("No Category exists with that name"));

        // Mock updateNameinDB
        let mock = sinon.mock(Category);
        let expectation = mock.expects("updateNameinDb");
        expectation.exactly(0);

        mock.verify();

        // Run function
        try{
            await Category.updateCategoryName(newName, oldName);
            assert.equal(true, false, "An error should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "No Category exists with that name"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should deny updating a category's name to one that already exists", async function () {
        // Test inputs
        let oldName = "Existing";
        let newName = "Existing";

        let category_id1 = 1;
        let category_id2 = 2;

        // Stub getCategoryID
        let stub = sinon.stub(Category, "getCategoryID")
                        .withArgs(newName)
                        .returns(category_id1)
                        .withArgs(oldName)
                        .returns(category_id2);

        // Run function
        try {
            await Category.updateCategoryName(newName, oldName);
            assert.equal(true, false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === `${newName} category already exists`) {
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should deny updating a categories name to an invalid one", async function () {
        // Test input
        let newName = 1;
        let oldName = "Existing";

        // Run function
        try {
            await Category.updateCategoryName(newName, oldName);
            assert.equal(true, false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Category Name is of invalid type"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
});