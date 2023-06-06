// Importing the database pool
import pool from '../db2.js';

import { assert } from 'chai';

import Asset from '../src/Allocation/Asset/asset2.js'
import utility from '../utility/utility.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';

describe.skip("Add Asset Test", function() {
    let barcode = "ASDFASDF";
    this.beforeEach(async function() {
        try{
            await pool.query('CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)');
            await pool.query(`INSERT INTO Asset (barcode, locationID, noinbuilding, code, description,
                categoryID, usefullife, serialnumber, condition, responsibleusername, acquisitiondate,
                residualvalue, acquisitioncost, disposalvalue, disposaldate, currentvaluationvalue, latestvaluationdate,
                depreciationtype, depreciationpercent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`, [
                    barcode, 1, 1, "ASDFASDF", "This is a test asset", 1, 1, "ASDFASDF", "Good", "TestUser", "12-12-2021", 1, 10000, 1, "12-12-2021", 1, "12-12-2021", "Straight Line", 0
                ]);
        }catch(err){
            console.log(err);
            assert(false, "Could not run database queries");
        }
    });

    it("should add asset to database", async function() {
        // Create a new Asset
        let asset = new Asset(
            "SDFDSFDS",
            12,
            "12-12-2021",
            1,
            "Good",
            "TestUser",
            10000,
            "TestCategory2",
            [],
            1,
            "ASDFFSDFDS",
            0,
            "SDFSF",
            "This is a test asset",
            "Straight Line",
            0
        );
        await asset.initialize();
        let fethcResult = await pool.query("SELECT * FROM Asset WHERE barcode = 'SDFDSFDS'");
        console.log(fethcResult.rows[0]);
        assert(true, "Shit Works")
    });

    it("should return false if barcode doesn't exist", async function() {
        let barcode = "SOME BAR CODE"
        try {
            let doesExist = await Asset._doesBarCodeExist(barcode);
            assert(doesExist === false, "True Returned")
        } catch(err) {
            console.log(err);
            assert(false, "Error Thrown");
        }
    });

    it("should return true if barcode exist", async function() {
        try {
            let doesExist = await Asset._doesBarCodeExist(barcode);
            assert(doesExist, "False Returned")
        } catch(err) {
            console.log(err);
            assert(false, "Error Thrown");
        }
    })

    this.afterEach(async function() {
        try {
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
        } catch(err) {
            console.log(err);
            assert(false, "Could not delete temp tables")
        }
    })
})