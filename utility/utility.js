const { assert } = require("chai");
const MyError = require("./myError")

function isAnyEmpty(arr){
    /*
        arr - arr is an array of variables of any type
        RETURNS true if any element is empty and false if all items are full
    */
   let isEmpty = false
   // Goes through all the items and returns if any is empty
   for (let i = 0; i < arr.length; i++){
        if (arr[i] === undefined || arr[i] === null){
            isEmpty = true
        }
   }
   return isEmpty
}

function checkIfBoolean(x, errorMessage) {
    if (typeof x !== "boolean"){
        throw new MyError(errorMessage);
    }
}

function checkIfNumberisPositive(x, errorMessage){
    if (!Number.isInteger(x) || x < 0){
        throw new MyError(errorMessage);
    }
}

function checkIfNumberisGreaterThanZero(x, errorMessage){
    if (!Number.isInteger(x) || x <= 0){
        throw new MyError(errorMessage);
    } 
}

function checkIfValidDate(x, errorMessage){
    let splitDate = x.split('-');
    let month = splitDate[0];
    let day = splitDate[1];
    let year = splitDate[2];
    let dateFromX = new Date(year, month - 1, day);

    // Throws an error if x is not a date or cannot be parsed to a date otherwise returns a date object
    if (Object.prototype.toString.call(dateFromX) === "[object Date]"){
        // x is an instance of date
        if(isNaN(dateFromX)){
            throw new MyError(errorMessage);
        }else{
            return dateFromX
        }
    }else{
        throw new MyError(errorMessage);
    }
}

function verifyDatabaseFetchResults(fetchResult, errorMessage){
    if(fetchResult.rowCount === 0){
        throw new MyError(errorMessage);
    }
}

function checkIfInList(list, item, errorMessage){
    // This function throws an error containing errorMessage if item is not in list
    if (!list.includes(item)){
        throw new MyError(errorMessage);
    }
}

async function addErrorHandlingToAsyncFunction(func, errorMessage, ...params){
    try{
        return await func(...params);
    }catch(err){
        throw new MyError(errorMessage);
    }
}

async function assertThatAsynchronousFunctionFails(func, errorMessage, ...params){
    try{
        await func(...params);
        assert(false, "Error Should Have Been Thrown");
    }catch(err){
        if (err instanceof MyError && err.message === errorMessage){
            assert(true);
        }else{
            console.log(err);
            assert(false, "Wrong Error Thrown");
        }
    }
}

async function assertThatAsyncFunctionReturnsRightThing(func, itemToCheckAgainst, ...params){
    let result;
    try{
        result = await func(...params);
    }catch(err){
        throw new MyError("Function Failed To Run");
    }

    assert.equal(result, itemToCheckAgainst, "Wrong Item Returned");
    assert(true);
}

// async function assertThatDBFunctionReturnsRightThing(func, returnedItem, itemName, ...params){
//     let fetchResult;

//     try{
//         fetchResult = await func(params);
//     }catch(err){
//         console.log(err);
//         throw new MyError("Could Not Get Item From Database");
//     }

//     verifyDatabaseFetchResults(fetchResult, "Nothing Returned From Database");

//     assert.equal(returnedItem, fetchResult.rows[0][itemName], "Returned Item Is Different");
// }

// function fileUpload(req, res){

// }

module.exports = {
    isAnyEmpty,
    checkIfBoolean,
    checkIfNumberisPositive,
    checkIfValidDate,
    verifyDatabaseFetchResults,
    checkIfInList,
    addErrorHandlingToAsyncFunction,
    checkIfNumberisGreaterThanZero,
    assertThatAsynchronousFunctionFails,
    assertThatAsyncFunctionReturnsRightThing
}