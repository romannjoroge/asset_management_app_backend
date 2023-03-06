// Import testing libraries
import { assert } from 'chai';
import Sinon from 'sinon';

// Import classes
import MyError from '../utility/myError.js';
import Asset from '../src/Allocation/Asset/asset2.js';
import Category from '../src/Allocation/Category/category2.js';

describe.skip("createDepreciationSchedule tests", function(){
    let assetLifeSpan;
    let acquisitionCost;
    let acquisitionDate;
    let insertDepreciationScheduleStub;
    let year;
    let month;
    let date;
    let assetTag = 'AUA0001';
    let doesAssetTagExistStub;
    let depreciaitionType;
    let entries;
    let _getCloseBookValueStub;
    let residualValue;

    this.beforeEach(function(){
        assetLifeSpan = 2;
        acquisitionCost = 10_000;
        year = 2003;
        month = 1;
        day = 12;
        acquisitionDate = new Date(year, month - 1, date);
        residualValue = 0;

        doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, "Asset Does Not Exist");
    })

    async function assertThatDepreciationScheduleIsInserted(entries){
        insertDepreciationScheduleStub = Sinon.stub(Asset, "_insertDepreciationSchedule")
                                        .withArgs(entries[0].assetTag, entries[0].year, entries[0].openBookValue, 
                                                  entries[0].depreciationExpense, entries[0].accumulatedDepreciation, entries[0].closeBookValue)
                                        .withArgs(entries[1].assetTag, entries[1].year, entries[1].openBookValue, 
                                                  entries[1].depreciationExpense, entries[1].accumulatedDepreciation, entries[1].closeBookValue);
        _getCloseBookValueStub = Sinon.stub(Asset, "_getCloseBookValue")
                                .withArgs(assetTag, entries[0].year)
                                .returns(entries[0].closeBookValue);
        try{
            await Asset.createDepreciationSchedule(depreciaitionType, assetTag, assetLifeSpan, acquisitionCost, acquisitionDate, residualValue);
        }catch(err){
            console.log(err);
            assert(false, "No Error Should Be Thrown");
        }
    }

    it("should fail when a non existent asset tag is given", async function(){
        // Test Inputs
        assetTag = "Non Existent";
        Asset.doesAssetTagExist.restore();
        doesAssetTagExistStub = Sinon.stub(Asset, "doesAssetTagExist")
                                .withArgs(assetTag, "Asset Does Not Exist")
                                .throws(new MyError("Asset Does Not Exist"));
        try{
            await Asset.createDepreciationSchedule(depreciaitionType, assetTag, assetLifeSpan, acquisitionCost, acquisitionDate, residualValue);
            assert(false, "Error Should Be Thrown");
        }catch(err){
            if (err instanceof MyError && err.message === "Asset Does Not Exist"){
                assert(true);
            }else{
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    });

    it("creating depreciation schedule for straight line depreciation and residual value is 5000", async function(){
        // Test inputs
        depreciaitionType = "Straight Line";
        residualValue = 5000;
        entries = [
            {
                year: 2003,
                openBookValue: 10_000,
                depreciationExpense: 2_500,
                accumulatedDepreciation: 2_500,
                closeBookValue: 7_500
            },
            {
                year: 2004,
                openBookValue: 7_500,
                depreciationExpense: 2_500,
                accumulatedDepreciation: 5_000,
                closeBookValue: 5_000
            }
        ];
        
        await assertThatDepreciationScheduleIsInserted(entries);
    });

    it("create depreciation schedule for double declining balance", async function(){
        // Test Inputs    
        depreciaitionType = "Double Declining Balance";
        entries = [
            {
                year: 2003,
                openBookValue: 10_000,
                depreciationExpense: 10_000,
                accumulatedDepreciation: 10_000,
                closeBookValue: 0
            },
            {
                year: 2004,
                openBookValue: 0,
                depreciationExpense: 0,
                accumulatedDepreciation: 10_000,
                closeBookValue: 0
            }
        ];

        await assertThatDepreciationScheduleIsInserted(entries);
    });

    it("create written down value depreciation schedule", async function(){
        depreciaitionType = "Written Down Value";
        entries = [
            {
                year: 2003,
                openBookValue: 10_000,
                depreciationExpense: 2000,
                accumulatedDepreciation: 2000,
                closeBookValue: 8000
            },
            {
                year: 2004,
                openBookValue: 8000,
                depreciationExpense: 1600,
                accumulatedDepreciation: 3600,
                closeBookValue: 6400
            }
        ];

        await assertThatDepreciationScheduleIsInserted(entries);
    });
})