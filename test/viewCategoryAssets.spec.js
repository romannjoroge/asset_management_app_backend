import {assert} from 'chai';
import sinon from 'sinon';
import {Category} from '../src/Allocation/Category/category2.js';
import pool from '../db2.js';
import utility from '../utility/utility.js';
import { Errors } from '../utility/constants.js';

describe("viewCategoryAssets Test", function(){
    let categoryName;
    let assetTags = ['AUA0005', 'AUA0006']

    this.beforeEach(async function(){
        categoryName = "Existing";

        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category (ID, name, parentFolderID, depreciationType) VALUES (5, $1, 1, 'Double Declining Balance')", [categoryName]);
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 5, 4)", [assetTags[0]]);
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 5, 4)", [assetTags[1]]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    it("should bring an error if a category that doesn't exist is given", async function(){
        categoryName = 'Does Not Exist';

        await utility.assertThatAsynchronousFunctionFails(Category.viewCategoryAssets, Errors[1], categoryName);
    });

    it("should return a list of categories assets when given an existing asset", async function(){
        categoryName = 'Existing';
        let assetsToBeReturned = [
            {
                assettag: assetTags[0],
                makeandmodelno: 'HP Folio 13',
                isfixed: true,
                serialnumber: 'SSDFDAS',
                acquisitiondate: new Date(2022, 0, 12),
                locationid: 1,
                status: 'good',
                custodianname: 'John Doe',
                acquisitioncost: 10000,
                insurancevalue: 1000,
                residualvalue: 5000,
                categoryid: 5,
                assetlifespan: 4
            },
            {
                assettag: assetTags[1],
                makeandmodelno: 'HP Folio 13',
                isfixed: true,
                serialnumber: 'SSDFDAS',
                acquisitiondate: new Date(2022, 0, 12),
                locationid: 1,
                status: 'good',
                custodianname: 'John Doe',
                acquisitioncost: 10000,
                insurancevalue: 1000,
                residualvalue: 5000,
                categoryid: 5,
                assetlifespan: 4
            }
        ]

        await utility.assertThatAsyncFunctionReturnsRightThing(Category.viewCategoryAssets, assetsToBeReturned, categoryName);
    });

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    });
});