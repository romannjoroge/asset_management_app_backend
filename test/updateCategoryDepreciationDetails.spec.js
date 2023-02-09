// Import pool
const pool = require("../db2");

// Importing testing packages
const assert = require('chai').assert;
const sinon = require('sinon');

// Importing classes
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");

describe.skip("verifyDepreciationDetails Test", function () {
    it("should accept when depType is Double Depreciation and value is 0", function () {
        // Test inputs
        let deptype = "Double Declining Balance";
        let value = 0;

        // Run function
        try{
            Category.verifyDepreciationDetails(deptype, value);
            assert.equal(true, true);
        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should Have Been Thrown");
        }
    });
    it("should accept when deptype is Written Down Value and value positive non zero integer", function () {
        // Test inputs
        let deptype = "Written Down Value";
        let value = 100;

        // Run function
        try{
            Category.verifyDepreciationDetails(deptype, value);
            assert.equal(true, true);
        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should Have Been Thrown");
        }
    });
    it("should bring an error if depType is of the wrong type", function () {
        // Test inputs
        let depType = 6;
        let value = 6;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should Be Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if depType is not in depType list", function () {
        // Test inputs
        let depType = "Invalid";
        let value = 100;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type") {
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if depType is Double Declining Balance but value is non zero", function () {
        // Test inputs
        let depType = "Double Declining Balance";
        let value = 100;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should Have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Double Declining Balance should not have a depreciation value") {
                assert.equal(true, true);
            }else{
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if depType is Written Value but value is 0", function () {
        // Test inputs
        let depType = "Written Down Value";
        let value = 0;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                assert.equal(true, true);
            }else{
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error if depType is Straight Line and value is a negative number", function () {
        // Test inputs
        let depType = "Straight Line";
        let value = -100;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should Have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should bring an error when depType is Straight Line but value is of the wrong type", function () {
        // Test inputs
        let depType = "Straight Line";
        let value = 'c';

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert.equal(true, false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                assert.equal(true, true);
            }else{
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
});

describe.skip("updateDepreciationType Test", function () {    
    it("should pass when depreciation type is Straight Line and value is positive non zero number", async function () {
        // Test inputs
        let depType = "Straight Line";
        let value = 200;
        let categoryName = "Valid";

        let category_id = 1;

        // Stub getCategoryID
        let getCategoryID = sinon.stub(Category, "getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id);

        // Stub updateDepreciationTypeInDB
        let updateDepreciationTypeInDB = sinon.stub(Category, "updateDepreciationTypeInDB");

        // Stub deleteDepreciationPerYearInDb
        let deleteDepreciationPerYearInDb = sinon.stub(Category, "deleteDepreciationPerYearInDb");

        // Stub deleteDepreciationPercentInDb
        let deleteDepreciationPercentInDb = sinon.stub(Category, "deleteDepreciationPercentInDb");

        // Stub insertDepreciationPercentInDb
        let insertDepreciationPercentInDb = sinon.stub(Category, "insertDepreciationPercentInDb");

        // Stub insertDepreciationValueInDB
        let insertDepreciationValueInDB = sinon.stub(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            // Assert that database functions were called with correct arguements
            sinon.assert.calledWith(updateDepreciationTypeInDB, category_id, depType);
            sinon.assert.calledWith(deleteDepreciationPerYearInDb, category_id);
            sinon.assert.calledWith(deleteDepreciationPercentInDb, category_id);
            sinon.assert.notCalled(insertDepreciationPercentInDb);
            sinon.assert.calledWith(insertDepreciationValueInDB, category_id, value);

        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should Have Been Thrown");
        }
    });
    it("should fail when depreciation type is Written Value and value is 0",async function (){
        // test inputs
        let depType = "Written Down Value";
        let value = 0;
        let categoryName = "Existing";

        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail when Double Declining Balance has a non zero value", async function () {
        // test inputs
        let depType = "Double Declining Balance";
        let value = 120;
        let categoryName = "Existing";


        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Double Declining Balance should not have a depreciation value"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail when Written Value has a negative depreciation value", async function () {
        // test inputs
        let depType = "Written Down Value";
        let value = -100;
        let categoryName = "Existing";

        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail when an invalid depreciation type is given", async function () {
        // test inputs
        let depType = "Invalid Type";
        let value = 0;
        let categoryName = "Existing";


        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail when depreciation type is of the wrong type", async function () {
        // test inputs
        let depType = 6;
        let value = 0;
        let categoryName = "Existing";

        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should fail when depreciation type is Straight Line but value is of the wrong type", async function () {
        // test inputs
        let depType = "Straight Line";
        let value = 'c';
        let categoryName = "Existing";

        // Spy functions
        let getCategoryID = sinon.spy(Category, "getCategoryID");
        let updateDepreciationTypeInDB = sinon.spy(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPercentInDb = sinon.spy(Category, "deleteDepreciationPercentInDb");
        let deleteDepreciationPerYearInDb = sinon.spy(Category, "deleteDepreciationPerYearInDb");
        let insertDepreciationPercentInDb = sinon.spy(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.spy(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            assert.equal(true, false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid depreciation value"){
                sinon.assert.notCalled(getCategoryID);
                sinon.assert.notCalled(updateDepreciationTypeInDB);
                sinon.assert.notCalled(deleteDepreciationPercentInDb);
                sinon.assert.notCalled(deleteDepreciationPerYearInDb);
                sinon.assert.notCalled(insertDepreciationPercentInDb);
                sinon.assert.notCalled(insertDepreciationValueInDB);
            }else{
                console.log(err);
                assert.equal(true, false, "Wrong Error Thrown");
            }
        }
    });
    it("should pass when depreciation type is Double Declining Balance and value is 0", async function () {
        // test inputs
        let depType = "Double Declining Balance";
        let value = 0;
        let categoryName = "Existing";

        let category_id = 1;

        // Stub getCategoryID
        let getCategoryID = sinon.stub(Category, "getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id);

        // Stub database functions
        let updateDepreciationTypeInDB = sinon.stub(Category, "updateDepreciationTypeInDB");
        let deleteDepreciationPerYearInDb = sinon.stub(Category, "deleteDepreciationPerYearInDb");
        let deleteDepreciationPercentInDb = sinon.stub(Category, "deleteDepreciationPercentInDb");
        let insertDepreciationPercentInDb = sinon.stub(Category, "insertDepreciationPercentInDb");
        let insertDepreciationValueInDB = sinon.stub(Category, "insertDepreciationValueInDB");

        // Run function
        try{
            await Category.updateDepreciationType(depType, value, categoryName);
            
            // Make assertions on database funcitons
            sinon.assert.calledWith(updateDepreciationTypeInDB, category_id, depType);
            sinon.assert.calledWith(deleteDepreciationPerYearInDb, category_id);
            sinon.assert.calledWith(deleteDepreciationPercentInDb, category_id);
            sinon.assert.notCalled(insertDepreciationPercentInDb);
            sinon.assert.notCalled(insertDepreciationValueInDB);
        }catch(err){
            console.log(err);
            assert.equal(true, false, "No Error Should Have Been Thrown");
        }
    });
});