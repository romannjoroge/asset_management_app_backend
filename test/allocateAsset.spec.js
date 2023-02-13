// Importing the database pool
const pool = require('../db2');

const sinon = require('sinon');
const assert = require('chai').assert;

const Asset = require('../src/Allocation/asset2');
const User = require('../src/Users/users');
const MyError = require('../utility/myError');

describe.skip("Allocate Asset To User Test", function(){
    let assetTag;
    let username;

    async function assertThatAllocateUserFails(errorMessage){
        try{
            await Asset.allocateAsset(assetTag, username);
            assert(false, "Error Should Have Been Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === errorMessage){
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    }

    beforeEach(async function(){
        assetTag = 'AUA0001';
        username = 'John Doe';

        try{
            await pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
            await pool.query("INSERT INTO Asset VALUES ('AUA0001', 'Test At Test Company', true, 'adfsfsdfs', '10-13-2002', 1, 'good', 'John Doe', 10000, 100, 0, 1, 4)");
            await pool.query('CREATE TEMPORARY TABLE User2 (LIKE User2 INCLUDING ALL)');
            await pool.query("INSERT INTO User2 VALUES ('John', 'Doe', 'johndoe@gmail.com', 'gsdgsdgsd', 'John Doe', 'TestCompany')");
        }catch(err){
            console.log(err);
            assert(false, "Could not run database queries");
        }
    });

    it("should fail when an asset that doesn't exist is given", async function(){
        // Test Inputs
        assetTag = "Does Not Exist";

        await assertThatAllocateUserFails("Asset Does Not Exist");
    });

    it("should fail when a username that doesn't exist is given", async function(){
        // Test Inputs
        username = "Does Not Exist";

        await assertThatAllocateUserFails("User Does Not Exist");
    });

    it("should pass when an asset and user that already exists is given", async function(){
        try{
            await Asset.allocateAsset(assetTag, username);
            assert(true);
        }catch(err){
            console.log(err);
            assert(false, "No Error Should be thrown");
        }
    })

    afterEach(async function(){
        try{
            await pool.query('DROP TABLE IF EXISTS pg_temp.Asset');
            await pool.query('DROP TABLE IF EXISTS pg_temp.User2');
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    })
})

