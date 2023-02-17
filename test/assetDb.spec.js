// Importing database pool
const pool = require('../db2');

const sinon = require('sinon');
const assert = require('chai').assert;

const Asset = require('../src/Allocation/asset2');
const utility = require('../utility/utility');


describe("_doesAssetTagExist Test", function(){
    let assetTag;
    this.beforeEach(async function(){
        assetTag = 'AUA0003';
        try{
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTag]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });
    
    it("should return false when a category that doesn't exist is given", async function(){
        // Test Inputs
        assetTag = 'Does Not Exist';

        await utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetTagExist, false, assetTag);
    });

    it("should return true if asset tag exists", async function(){
        // Test Inputs
        assetTag = 'AUA0003';

        await utility.assertThatAsyncFunctionReturnsRightThing(Asset._doesAssetTagExist, true, assetTag);
    })

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset")
        }catch(err){
            console.log(err);
            assert(false, "Could Not Drop Temporary Tables");
        }
    });
});