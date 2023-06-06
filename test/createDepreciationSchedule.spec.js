import { assert } from "chai";
import pool from "../db2.js";
import {createDeprecaitonScheduleEntries} from '../built/Allocation/Asset/depreciations.js';
import { Errors } from "../built/utility/constants.js";
import utility from "../built/utility/utility.js";

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

async function checkDepreciationScheduleEntries(expectedEntries, assetID) {
    try{
        let depSchedules = await createDeprecaitonScheduleEntries(assetID);

        assert.deepEqual(depSchedules, expectedEntries, "Wrong Depreciation Schedule Entries");
    } catch(err) {
        console.log(err);
        assert(false, "Could not check depreciation schedule entries");
    }
}

describe("Creating Depreciation Schedules for assets with written down value depreciation type", function(){
    // Test Variables
    let depreciationPercentage = 20;
    let barcode = 'AUA7000';
    let lifeSpan = 5;
    let acquisitionCost = 10000;
    let acquisitionDate = '06-02-2023';
    let assetID = 1000;
    let categoryID = 100;

    beforeEach(async function(){
        // Create temporary tables and test values
        try {
            await createTemporaryTable('Asset');
            await createTemporaryTable('Category');
            await createTemporaryTable('DepreciationPercent');
            await createTemporaryTable('depreciationschedule');
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

    it("should fail when a non existent assetID is given", async function(){
        let testAssetID = 1001;
        try {
            await createDeprecaitonScheduleEntries(testAssetID);
            assert(false, "No error thrown");
        }catch(err){
            assert(err.message === Errors[29], err);
        }   
    });

    it("create written down value depreciation schedule", async function(){
        // Test that correct details are returned
        checkDepreciationScheduleEntries([
            {year: 2023, openingbookvalue: 10000, depreciationexpense: 2000, accumulateddepreciation: 2000, closingbookvalue: 8000, assetid: assetID},
            {year: 2024, openingbookvalue: 8000, depreciationexpense: 1600, accumulateddepreciation: 3600, closingbookvalue: 6400, assetid: assetID},
            {year: 2025, openingbookvalue: 6400, depreciationexpense: 1280, accumulateddepreciation: 4880, closingbookvalue: 5120, assetid: assetID},
            {year: 2026, openingbookvalue: 5120, depreciationexpense: 1024, accumulateddepreciation: 5904, closingbookvalue: 4096, assetid: assetID},
            {year: 2027, openingbookvalue: 4096, depreciationexpense: 819.2, accumulateddepreciation: 6723.2, closingbookvalue: 3276.8, assetid: assetID},
        ], assetID);
    });

    afterEach(async function(){
        // Dropping created temporary tables
        try {
            await dropTemporaryTable('Asset');
            await dropTemporaryTable('Category');
            await dropTemporaryTable('DepreciationPercent');
            await dropTemporaryTable("DepreciationSchedule");
        } catch(err) {
            console.log(err);
            assert(false, "Could not drop temporary tables");
        }
    });
});

describe("Creating Depreciation Schedules for assets with straight line depreciation type", function(){
    let assetID = 1000;
    let acquisitionCost = 10000;
    let residualValue = 2000;
    let assetlifespan = 5;
    let acquisitionDate = new Date(2023, 4, 6);
    let categoryID = 100;

    beforeEach(async function(){
        try{
            await createTemporaryTable('Asset');
            await createTemporaryTable('Category');
            await createTemporaryTable('depreciationschedule');
            await createAsset({
                assetID: assetID,
                barCode: "AUA7000",
                locationID: 1,
                noInBuilding: 1,
                code: 'AUA7000',
                description: 'This is a test asset',
                categoryID: categoryID,
                usefulLife: assetlifespan,
                serialNumber: 'AUA7000',
                condition: 'Good',
                responsibleUsername: 'TestUser',
                acquisitionDate: acquisitionDate,
                residualValue: residualValue,
                acquisitionCost: acquisitionCost
            });
            await createCategory({
                id: categoryID,
                name: 'Test Category',
                depreciationType: 'Straight Line',
                parentCategoryID: 1
            });
        }catch(err) {
            console.log(err);
            assert(false, "Could not create test values");
        }
    });

    it("should fail when a non existent assetID is given", async function(){
        try {
            await createDeprecaitonScheduleEntries(1001);
            assert(false, "No error thrown");
        } catch(err) {
            assert(err.message === Errors[29], err.message);
        }
    });

    it("should fill depreciation schedule with correct values", async function(){
        try {
            // Get values added to depreciation schedule
            await checkDepreciationScheduleEntries([
                {year: 2023, openingbookvalue: 10000, depreciationexpense: 1600, accumulateddepreciation: 1600, closingbookvalue: 8400, assetid: assetID},
                {year: 2024, openingbookvalue: 8400, depreciationexpense: 1600, accumulateddepreciation: 3200, closingbookvalue: 6800, assetid: assetID},
                {year: 2025, openingbookvalue: 6800, depreciationexpense: 1600, accumulateddepreciation: 4800, closingbookvalue: 5200, assetid: assetID},
                {year: 2026, openingbookvalue: 5200, depreciationexpense: 1600, accumulateddepreciation: 6400, closingbookvalue: 3600, assetid: assetID},
                {year: 2027, openingbookvalue: 3600, depreciationexpense: 1600, accumulateddepreciation: 8000, closingbookvalue: 2000, assetid: assetID}
            ], assetID);
        } catch(err) {
            assert(false, err.message);
        }
    });

    afterEach(async function(){
        try{
            await dropTemporaryTable('Asset');
            await dropTemporaryTable('Category');
            await dropTemporaryTable('depreciationschedule');
        } catch(err) {
            console.log(err);
            assert(false, "Could not drop temporary tables");
        }
    });
});

describe("Creating Depreciation Schedules for assets with double declining balance", function(){
    let assetID = 1000;
    let acquisitionCost = 10000;
    let assetlifespan = 5;
    let acquisitionDate = new Date(2023, 4, 6);
    let categoryID = 100;

    beforeEach(async function(){
        try{
            await createTemporaryTable('Asset');
            await createTemporaryTable('Category');
            await createTemporaryTable('depreciationschedule');
            await createAsset({
                assetID: assetID,
                barCode: "AUA7000",
                locationID: 1,
                noInBuilding: 1,
                code: 'AUA7000',
                description: 'This is a test asset',
                categoryID: categoryID,
                usefulLife: assetlifespan,
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
                depreciationType: 'Double Declining Balance',
                parentCategoryID: 1
            });
        }catch(err) {
            console.log(err);
            assert(false, "Could not create test values");
        }
    });

    it("should fail when a non existent assetID is given", async function(){
        try {
            await createDeprecaitonScheduleEntries(1001);
            assert(false, "No error thrown");
        } catch(err) {
            assert(err.message === Errors[29], err.message);
        }
    });

    it("should fill depreciation schedule with correct values", async function(){
        try {
            // Get values added to depreciation schedule
            await checkDepreciationScheduleEntries([
                {year: 2023, openingbookvalue: 10000, depreciationexpense: 4000, accumulateddepreciation: 4000, closingbookvalue: 6000, assetid: assetID},
                {year: 2024, openingbookvalue: 6000, depreciationexpense: 2400, accumulateddepreciation: 6400, closingbookvalue: 3600, assetid: assetID},
                {year: 2025, openingbookvalue: 3600, depreciationexpense: 1440, accumulateddepreciation: 7840, closingbookvalue: 2160, assetid: assetID},
                {year: 2026, openingbookvalue: 2160, depreciationexpense: 864, accumulateddepreciation: 8704, closingbookvalue: 1296, assetid: assetID},
                {year: 2027, openingbookvalue: 1296, depreciationexpense: 518.4, accumulateddepreciation: 9222.4, closingbookvalue: 777.6, assetid: assetID}
            ], assetID);
        } catch(err) {
            assert(false, err.message);
        }
    });

    afterEach(async function(){
        try{
            await dropTemporaryTable('Asset');
            await dropTemporaryTable('Category');
            await dropTemporaryTable('depreciationschedule');
        } catch(err) {
            console.log(err);
            assert(false, "Could not drop temporary tables");
        }
    });
});