// Importing testing packages
import { assert } from 'chai';
import Sinon from 'sinon';

// Importing classes
import Category from '../src/Allocation/Category/category2.js';
import MyError from '../utility/myError.js';
import utility from '../utility/utility.js';

describe.skip("verifyDepreciationDetails Test", function () {
    it("should accept when depType is Double Depreciation and value is 0", function () {
        // Test inputs
        let deptype = "Double Declining Balance";
        let value = 0;

        // Run function
        try{
            Category.verifyDepreciationDetails(deptype, value);
            assert(true);
        }catch(err){
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });
    it("should accept when deptype is Written Down Value and value positive non zero integer", function () {
        // Test inputs
        let deptype = "Written Down Value";
        let value = 100;

        // Run function
        try{
            Category.verifyDepreciationDetails(deptype, value);
            assert(true);
        }catch(err){
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });
    it("should bring an error if depType is of the wrong type", function () {
        // Test inputs
        let depType = 6;
        let value = 6;

        // Run function
        try{
            Category.verifyDepreciationDetails(depType, value);
            assert(false, "An Error Should Be Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type"){
                assert(true);
            }else{
                console.log(err);
                assert(true, false, "Wrong Error Thrown");
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
            assert(false, "An Error Should have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Invalid Depreciation Type") {
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
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
            if (err instanceof MyError && err.message === "There should be no depreciation percentage") {
                assert(true);
            }else{
                assert(false, "Wrong Error Thrown");
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
            if (err instanceof MyError && err.message === "Invalid Depreciation Percentage"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
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
            assert(false, "An Error Should Have been thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "There should be no depreciation percentage"){
                assert.equal(true, true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
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
            assert(false, "An Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "There should be no depreciation percentage"){
                assert(true);
            }else{
                assert(false, "Wrong Error Thrown");
            }
        }
    });
});

describe.skip("updateDepreciationType Test", function () {    
    it("should fail when depreciation type is Straight Line and value is positive non zero number", async function () {
        // Test inputs
        let depType = "Straight Line";
        let value = 200;
        let categoryName = "Valid";

        let category_id = 1;

        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "There should be no depreciation percentage", depType, value, categoryName);
    });
    it("should fail when depreciation type is Written Value and value is 0",async function (){
        // test inputs
        let depType = "Written Down Value";
        let value = 0;
        let categoryName = "Existing";

        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "Invalid Depreciation Percentage", depType, value, categoryName);
        
    });
    it("should fail when Double Declining Balance has a non zero value", async function () {
        // test inputs
        let depType = "Double Declining Balance";
        let value = 120;
        let categoryName = "Existing";


        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "There should be no depreciation percentage", depType, value, categoryName);

    });
    it("should fail when Written Value has a negative depreciation value", async function () {
        // test inputs
        let depType = "Written Down Value";
        let value = -100;
        let categoryName = "Existing";

        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "Invalid Depreciation Percentage", depType, value, categoryName);

    });
    it("should fail when an invalid depreciation type is given", async function () {
        // test inputs
        let depType = "Invalid Type";
        let value = 0;
        let categoryName = "Existing";


        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "Invalid Depreciation Type", depType, value, categoryName);

    });
    
    it("should fail when depreciation type is of the wrong type", async function () {
        // test inputs
        let depType = 6;
        let value = 0;
        let categoryName = "Existing";

        utility.assertThatAsynchronousFunctionFails(Category._updateDepreciationType, "Invalid Depreciation Type", depType, value, categoryName);
    });

    it("should pass when depreciation type is Double Declining Balance and value is 0", async function () {
        // test inputs
        let depType = "Double Declining Balance";
        let value = 0;
        let categoryName = "Existing";

        let category_id = 1;

        // Stub getCategoryID
        let getCategoryID = Sinon.stub(Category, "_getCategoryID")
                        .withArgs(categoryName)
                        .returns(category_id);

        // Stub database functions
        let _updateDepreciationTypeInDB = Sinon.stub(Category, "_updateDepreciationTypeInDB");
        let _deleteDepreciationPercentInDb = Sinon.stub(Category, "_deleteDepreciationPercentInDb");
        let _insertDepreciationPercentInDb = Sinon.stub(Category, "_insertDepreciationPercentInDb");

        // Run function
        try{
            await Category._updateDepreciationType(depType, value, categoryName);
            
            // Make assertions on database funcitons
            Sinon.assert.calledWith(_updateDepreciationTypeInDB, category_id, depType);
            Sinon.assert.calledWith(_deleteDepreciationPercentInDb, category_id);
            Sinon.assert.notCalled(_insertDepreciationPercentInDb);
        }catch(err){
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    });
});