// Importing pool
const pool = require('../db2');

const assert = require('chai').assert;

const Category = require('../src/Allocation/category2');
const utility = require('../utility/utility');

describe("getCategoryID Tests", function(){
    let categoryName;
    let categoryID;
    let errorMessage;

    beforeEach(async function(){
        categoryName = "Existing";
        categoryID = 3;
        errorMessage = "Category Does Not Exist";

        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category (ID, name, parentFolderID, depreciationType) VALUES ($1, $2, 1, 'Double Declining Balance')", [categoryID, categoryName]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not create temporary databases");
        }
    });

    it("should throw an error when category name does not exist", async function(){
        // Test Inputs
        categoryName = "Does Not Exist";

        await utility.assertThatAsynchronousFunctionFails(Category.getCategoryID, errorMessage, categoryName, errorMessage);
    });

    it("should return a category ID when a valid category ID is given", async function(){
        await utility.assertThatAsyncFunctionReturnsRightThing(Category.getCategoryID, categoryID, categoryName);
    });

    afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Table");
        }
    })
});