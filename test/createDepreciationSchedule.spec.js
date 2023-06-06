import { assert } from "chai";
import pool from "../db2.js";
import {createDeprecaitonSchedule} from '../src/Allocation/Asset/depreciations.js';
import { Errors } from "../utility/constants.js";
import utility from "../utility/utility.js";

async function createAsset(props) {
    await pool.query(`INSERT INTO Asset (assetID, barCode, locationID, noInBuilding, code, description, 
        categoryID, usefulLife, serialNumber, condition, responsibleUsername, acquisitionDate, residualValue, 
        acquisitionCost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [props.assetID, 
        props.barCode, props.locationID, props.noInBuilding, props.code, props.description, props.categoryID,
        props.usefulLife, props.serialNumber, props.condition, props.responsibleUsername, props.acquisitionDate,
        props.residualValue, props.acquisitionCost]);
}

async function createCategory(props) {
    await pool.query(`INSERT INTO Category (ID, name, depreciationType, parentCategoryID)
        VALUES ($1, $2, $3, $4)`, [props.id, props.name, props.depreciationType, props.parentCategoryID]);
}

async function createDepreciationPercent(props) {
    await pool.query(`INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)`, [props.categoryID, props.percentage]);
}

async function createTemporaryTable(table) {
    await pool.query(`CREATE TEMPORARY TABLE ${table} (LIKE ${table} INCLUDING ALL)`);
}

async function dropTemporaryTable(table) {
    await pool.query(`DROP TABLE IF EXISTS pg_temp.${table}`);
}

describe("Creating Depreciation Schedules for assets with written down value depreciation type", function(){
    // Test Variables
    let depreciationPercentage = 20;
    let barcode = 'AUA7000';
    let lifeSpan = 5;
    let acquisitionCost = 10000;
    let acquisitionDate = '06-02-2023';
    let assetID = 1000
    let categoryID = 100;

    this.beforeEach(async function(){
        // Create temporary tables and test values
        try {
            await createTemporaryTable('Asset');
            await createTemporaryTable('Category');
            await createTemporaryTable('DepreciationPercent');
            await createAsset({
                assetID: assetID,
                barCode: barcode,
                locationID: 1,
                noInBuilding: 1,
                code: 'AUA7000',
                description: 'This is a test asset',
                categoryID: categoryID,
                usefulLife: lifeSpan,
                serialNumber: 'AUA7000',
                condition: 'Good',
                responsibleUsername: 'TestUser',
                acquisitionDate: acquisitionDate,
                residualValue: 1,
                acquisitionCost: acquisitionCost
            });
            await createCategory({
                id: categoryID,
                name: 'Test Category',
                depreciationType: 'Written Down Value',
                parentCategoryID: 1
            });
            await createDepreciationPercent({
                categoryID: categoryID,
                percentage: depreciationPercentage
            });
        } catch(err) {
            console.log(err);
            assert(false, "Could not create test values");
        }
    });

    it("should fail when a non existent asset tag is given", async function(){
        let testAssetID = 1001;
        try {
            await createDeprecaitonSchedule(testAssetID);
            assert(false, "No error thrown");
        }catch(err){
            assert(err.message === Errors[29], err);
        }   
    });

    it("create written down value depreciation schedule", async function(){
        // Test that correct details are returned
        try {
            await createDeprecaitonSchedule(assetID);
            
            // Get added depreciation schedule
            let fetchResults = await pool.query(`SELECT FROM DepreciationSchedule WHERE assetID = $1 ORDER BY year ASC`, [assetID])
            utility.verifyDatabaseFetchResults(fetchResults, "Nothing Was Returned");

            // Compare results with what is expected
            assert.deepEqual(fetchResults.rows, [
                {year: 2023, openingbookvalue: 10000, depreciationexpense: 2000, accumulateddepreciation: 2000, closingbookvalue: 8000, assetid: assetID},
                {year: 2024, openingbookvalue: 8000, depreciationexpense: 1600, accumulateddepreciation: 3600, closingbookvalue: 6400, assetid: assetID},
                {year: 2025, openingbookvalue: 6400, depreciationexpense: 1280, accumulateddepreciation: 4880, closingbookvalue: 5120, assetid: assetID},
                {year: 2026, openingbookvalue: 5120, depreciationexpense: 1024, accumulateddepreciation: 5904, closingbookvalue: 4096, assetid: assetID},
                {year: 2027, openingbookvalue: 4096, depreciationexpense: 819.2, accumulateddepreciation: 6723.2, closingbookvalue: 3276.8, assetid: assetID}
            ], `Wrong data returned \n ${fetchResults.rows}`);
        }catch(err){
            assert(false, err);
        }
    });

    this.afterEach(function(){
        // Dropping created temporary tables
        try {
            dropTemporaryTable('Asset');
            dropTemporaryTable('Category');
            dropTemporaryTable('DepreciationPercent');
        } catch(err) {
            console.log(err);
            assert(false, "Could not drop temporary tables");
        }
    });
})