import { assert } from "chai";
const url = 'http://localhost:5000/graphql';
import { request, gql } from 'graphql-request';
import pool from "../db2.js";
import utility from '../utility/utility.js';
import { Errors } from "../utility/constants.js";

describe('Category Query Test', function(){
    let categoryName;
    let query = gql`
    query ($categoryName: ID!){
        category (name: $categoryName) {
            ... on Category {
                name 
                depreciationtype
                assets {
                    assettag
                    makeandmodelno
                }
            }
            ... on DoesNotExist {
                message
            }
        }
    }
`
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
    });

    it("should return an error message if no category exists with specified name", async function(){
        categoryName = 'Does Not Exist';
        let expectedResult = {
            data: {
                category: {
                    message: Errors[1],
                },
            },
        }
        request(url, query, {categoryName}).then((res)=>{
            assert.deepEqual(expectedResult, res);
        }).catch((e)=>{
            console.log(e);
            assert(false, "An Error Was Thrown")
        })
        // await utility.assertThatGraphQLQueryFails(query, {categoryName: categoryName}, ApolloServerErrorCode.BAD_USER_INPUT, 'Category Does Not Exist');
    });

    it.skip('category query should return a value when the specified category exists', async function(){
        categoryName = 'Existing';
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