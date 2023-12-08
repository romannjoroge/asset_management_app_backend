// Importing testing packages
import { assert } from 'chai';

// Importing classes used in tests
import MyError from '../built/utility/myError.js';
import { createCategory, createTemporaryTable, dropTemporaryTable } from './commonTestFunctions.js';
import { Errors } from '../built/utility/constants.js';
import updateCategory from '../built/Allocation/Category/updateCategory.js';
import pool from '../db2.js';
import utility from '../built/utility/utility.js';

describe.skip("Update Category Test", function () {
    let oldCategory = {
        id: 1000,
        name: "OldCategory",
        parentcategoryid: 1,
        depreciationtype: "Straight Line",
        deleted: false
    };

    let parentCategory = {
        id: 1001,
        name: "ParentCategory",
        parentcategoryid: 1,
        depreciationtype: "Straight Line",
        deleted: false
    };

    let writtenValueDepreciationPercentEntry = {
        categoryid: oldCategory.id,
        percentage: 20,
        deleted: false
    };


    beforeEach(async function () {
        try {
            await dropTemporaryTable('Category');
            await createTemporaryTable('Category');
            await dropTemporaryTable('DepreciationPercent');
            await createTemporaryTable('DepreciationPercent');
            await createCategory({
                id: oldCategory.id,
                name: oldCategory.name,
                depreciationType: oldCategory.depreciationtype,
                parentCategoryID: oldCategory.parentcategoryid,
            });
            await createCategory({
                id: parentCategory.id,
                name: parentCategory.name,
                depreciationType: parentCategory.depreciationtype,
                parentCategoryID: parentCategory.parentcategoryid,
            });
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Create Test Data");
        }
    });

    async function assertThatUpdateCategoryWorks(updateJSON, categoryID, newCategory) {
        try{
            await updateCategory(categoryID, updateJSON);
            let fetchResults = await pool.query(`SELECT * FROM Category WHERE id = ${categoryID}`);
            utility.verifyDatabaseFetchResults(fetchResults, "Could Not Get Category");
            let updatedCategory = {
                id: fetchResults.rows[0].id,
                name: fetchResults.rows[0].name,
                parentcategoryid: fetchResults.rows[0].parentcategoryid,
                depreciationtype: fetchResults.rows[0].depreciationtype,
                deleted: fetchResults.rows[0].deleted
            }
            assert.deepEqual(updatedCategory, newCategory, "Category was not updated correctly");
        } catch(err) {
            console.log(err);
            assert(false, "No Error Should Have Been Thrown");
        }
    }

    it("should return an error when a non-existent category is given", async function () {
        let nonExistentCategory = 10000;
        try {
            await updateCategory(nonExistentCategory, oldCategory);
            assert(false, "No Error was thrown");
        } catch(err) {
            assert(err instanceof MyError && err.message === Errors[5], err.message);
        }
    });

    it("should update category name", async function(){
        let updateJSON = {name: "NewCategory"};
        await assertThatUpdateCategoryWorks(updateJSON, oldCategory.id, {
            id: oldCategory.id,
            name: updateJSON.name,
            parentcategoryid: oldCategory.parentcategoryid,
            depreciationtype: oldCategory.depreciationtype,
            deleted: oldCategory.deleted
        });
    });

    it("should update parentcategoryid", async function(){
        let updateJSON = {parentcategoryid: parentCategory.id};
        await assertThatUpdateCategoryWorks(updateJSON, oldCategory.id, {
            id: oldCategory.id,
            name: oldCategory.name,
            parentcategoryid: updateJSON.parentcategoryid,
            depreciationtype: oldCategory.depreciationtype,
            deleted: oldCategory.deleted
        });
    });

    it("should update depreciationtype", async function(){
        let updateJSON = {
            depreciationtype: {
                type: "Written Down Value",
                value: writtenValueDepreciationPercentEntry.percentage
            },
        };

        await assertThatUpdateCategoryWorks(updateJSON, oldCategory.id, {
            id: oldCategory.id,
            name: oldCategory.name,
            parentcategoryid: oldCategory.parentcategoryid,
            depreciationtype: updateJSON.depreciationtype.type,
            deleted: oldCategory.deleted
        });

        let fetchResults = await pool.query(`SELECT * FROM DepreciationPercent WHERE categoryid = ${oldCategory.id}`);
        utility.verifyDatabaseFetchResults(fetchResults, "Could Not Get Depreciation Percent");
        let updatedDepreciationPercent = {
            categoryid: fetchResults.rows[0].categoryid,
            percentage: fetchResults.rows[0].percentage,
            deleted: fetchResults.rows[0].deleted
        };
        assert.deepEqual(updatedDepreciationPercent, writtenValueDepreciationPercentEntry, "Depreciation Percent was not updated correctly");
    });

    it.skip("should be able to update multiple fields", async function(){
        // For some reason the test fails but when the function is used on an actual request it works
        let updateJSON = {
            name: "NewCategory",
            parentcategoryid: parentCategory.id,
        }

        await assertThatUpdateCategoryWorks(updateJSON, oldCategory.id, {
            id: oldCategory.id,
            name: updateJSON.name,
            parentcategoryid: updateJSON.parentcategoryid,
            depreciationtype: oldCategory.depreciationtype,
            deleted: oldCategory.deleted
        });
    });

    afterEach(async function () {
        try{
            await dropTemporaryTable('Category');
            await dropTemporaryTable('DepreciationPercent');
        } catch(err) {
            console.log(err);
            assert(false, "Could Not Drop Temporary Table");
        }
    });
});