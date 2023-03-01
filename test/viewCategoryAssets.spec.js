import {assert} from 'chai';
import sinon from 'sinon';
import Category from '../src/Allocation/Category/category2.js';
import pool from '../db2.js';
import utility from '../utility/utility.js';

describe("viewCategoryAssets Test", function(){
    let categoryName;
    let assetTags = ['AUA0005', 'AUA0006']

    this.beforeEach(async function(){
        categoryName = "Existing";

        try{
            await pool.query("CREATE TEMPORARY TABLE Category (LIKE Category INCLUDING ALL)");
            await pool.query("INSERT INTO Category (ID, name, parentFolderID, depreciationType) VALUES (5, $2, 1, 'Double Declining Balance')", [categoryName]);
            await pool.query("CREATE TEMPORARY TABLE Asset (LIKE Asset INCLUDING ALL)");
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTags[0]]);
            await pool.query("INSERT INTO Asset VALUES ($1, 'HP Folio 13', true, 'SSDFDAS', '01-12-2022', 1, 'good', 'John Doe', 10000, 1000, 5000, 1, 4)", [assetTags[1]]);
        }catch(err){
            console.log(err);
            assert(false, "Could Not Create Temporary Tables");
        }
    });

    it("should bring an error if a category that doesn't exist is given", async function(){
        categoryName = 'Does Not Exist';

        utility.assertThatAsynchronousFunctionFails(Category.viewCategoryAssets, "Category Does Not Exist", categoryName);
    });

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    })
});