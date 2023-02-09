// Import database pool
const pool = require("../db2");

// Import testing libraries
const assert = require('chai').assert;
const sinon = require('sinon');

// Import classes
const Category = require("../src/Allocation/category2");
const MyError = require("../utility/myError");

describe.skip("Category.view test", function () {
    it("should return an error when a category that doesn't exist is given", async function () {
        // Test Values
        let categoryName = 'test';

        let viewDetailsSpy = sinon.spy(Category, "viewDetails");

        let doesCategoryExistStub = sinon.stub(Category, "doesCategoryExist")
                                    .withArgs(categoryName)
                                    .returns(false);

        try{
            let result = await Category.viewDetails(categoryName);
            assert(viewDetailsSpy.threw(new MyError("Category Does Not Exist")));
        }catch(err){
            
        }
    });
    it("should return an object with a value in depreciationValue when depType is not double declining balance", async function () {
        // Test Values
        let categoryName = "Test";
        let depreciaitionType = "Straight Line";
        let depreciationValue = 200;
        let categoryID = 1;

        let getDepreciationTypeStub = sinon.stub(Category, "getCategoryDepreciationType")
                                     .withArgs(categoryName)
                                     .returns(depreciaitionType);
        let getDepreciationValueStub = sinon.stub(Category, "getCategoryDepreciationValue")
                                       .withArgs(categoryID, depreciaitionType)
                                       .returns(depreciationValue);
        let getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                                .withArgs(categoryName)
                                .returns(categoryID);
        
        try {
            let result = await Category.viewDetails(categoryName);
            assert(getDepreciationTypeStub.calledWith(categoryName));
            assert(getDepreciationValueStub.calledWith(categoryID, depreciaitionType));
            assert.deepEqual(result, {
                categoryName: categoryName,
                depreciationType: depreciaitionType,
                depreciationValue: depreciationValue
            });
        }catch(err){
            console.log(err);
            assert.equal(true, false, "Error should not have been thrown");
        }
    });
    it("should return an object with a null value in depreciationValue if depreciationType is Double Declining Balance", async function () {
        // Test Values
        let categoryName = "Test";
        let depreciaitionType = "Double Declining Balance";
        let depreciationValue = null;
        let categoryID = 1;

        let getDepreciationTypeStub = sinon.stub(Category, "getCategoryDepreciationType")
                                     .withArgs(categoryName)
                                     .returns(depreciaitionType);
        let getDepreciationValueStub = sinon.stub(Category, "getCategoryDepreciationValue")
                                       .withArgs(categoryID, depreciaitionType)
                                       .returns(depreciationValue);
        let getCategoryIDStub = sinon.stub(Category, "getCategoryID")
                                .withArgs(categoryName)
                                .returns(categoryID);
        
        try {
            let result = await Category.viewDetails(categoryName);
            assert(getDepreciationTypeStub.calledWith(categoryName));
            assert(getDepreciationValueStub.calledWith(categoryID, depreciaitionType));
            assert.equal(result.depreciationValue, null);
        }catch(err){
            console.log(err);
            assert.equal(true, false, "Error should not have been thrown");
        }
    });
})