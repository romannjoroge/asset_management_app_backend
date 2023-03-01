import { assert } from "chai";
const url = 'http://localhost:5000/graphql';
import { request, gql } from 'graphql-request';
import pool from "../db2.js";

describe.skip('GraphQL Test', function(){
    let categoryName;
    let query;
    let result;
    let assetTags = ['AUA0005', 'AUA0006'];

    this.beforeEach(async function(){
        categoryName = 'Existing';

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
    })
    it('category query should return a value when the specified category exists', async function(){
        categoryName = 'Existing';
        query = gql`
            query ($categoryName: ID!){
                category (name: $categoryName) {
                    name
                    depreciationtype
                    assets {
                        assettag
                        makeandmodelno
                    }
                }
            }
        `

        let expectedResult = {
            data: {
                category: {
                    name: categoryName,
                    depreciationtype: 'Double Declining Balance',
                    assets: [
                        {
                            assettag: assetTags[0],
                            makeandmodelno: 'HP Folio 13',
                        },
                        {
                            assettag: assetTags[1],
                            makeandmodelno: 'HP Folio 13',
                        }
                    ]
                }
            }
        }

        try{
            result = await request(url, query, {categoryName: categoryName});
            assert.deepEqual(result, expectedResult, `Wrong result returned ${result}`);
        }catch(err){
            console.log(err);
            assert(false, "No Error Meant To Be Thrown")
        }
    })

    this.afterEach(async function(){
        try{
            await pool.query("DROP TABLE IF EXISTS pg_temp.Asset");
            await pool.query("DROP TABLE IF EXISTS pg_temp.Category");
        }catch(err){
            console.log(err);
            assert(false, "Could Not Delete Temporary Tables");
        }
    });
})