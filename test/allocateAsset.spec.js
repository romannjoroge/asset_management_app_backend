// Importing the database pool
import pool from '../db2.js';

import { assert } from 'chai';

import Asset from '../built/Allocation/Asset/asset2.js'
import utility from '../built/utility/utility.js';

describe.skip("Allocate Asset To User Test", function(){
    let assetTag;
    let username;

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

        await utility.assertThatAsynchronousFunctionFails(Asset.allocateAsset, "Asset Does Not Exist", assetTag, username);
    });

    it("should fail when a username that doesn't exist is given", async function(){
        // Test Inputs
        username = "Does Not Exist";

        await utility.assertThatAsynchronousFunctionFails(Asset.allocateAsset, "User Does Not Exist", assetTag, username);
    });

    it("should pass when an asset and user that already exists is given", async function(){
        try{
            await Asset.allocateAsset(assetTag, username);
            let fetchResult = await pool.query("SELECT custodianName FROM Asset WHERE assetTag=$1", [assetTag]);
            utility.verifyDatabaseFetchResults(fetchResult, "Asset Not Allocated");
            let custodianName = fetchResult.rows[0].custodianname
            assert.equal(custodianName, username, "Wrong User Assigned to Asset");
        }catch(err){
            console.log(err);
            assert(false, "No Error Should be thrown");
        }
    });

    afterEach(async function(){
        try{
            await pool.query('DROP TABLE IF EXISTS pg_temp.Asset');
            await pool.query('DROP TABLE IF EXISTS pg_temp.User2');
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    })
});

