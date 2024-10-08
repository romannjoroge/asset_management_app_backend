var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { assert } from "chai";
import MyError from "./myError.js";
import { MyErrors2 } from "./constants.js";
import pool from "../../db2.js";
function getTimeDifferenceInSeconds(startTime, endTime) {
    return (endTime.getTime() - startTime.getTime()) / 1000;
}
function isAnyEmpty(arr) {
    /*
        arr - arr is an array of variables of any type
        RETURNS true if any element is empty and false if all items are full
    */
    let isEmpty = false;
    // Goes through all the items and returns if any is empty
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === undefined || arr[i] === null) {
            isEmpty = true;
        }
    }
    return isEmpty;
}
function checkIfBoolean(x, errorMessage) {
    if (typeof x !== "boolean") {
        throw new MyError(errorMessage);
    }
}
function checkIfNumberisPositive(x, errorMessage) {
    if (!Number.isInteger(x) || x < 0) {
        throw new MyError(errorMessage);
    }
}
function checkIfNumberisGreaterThanZero(x, errorMessage) {
    if (!Number.isInteger(x) || x <= 0) {
        console.log(x);
        throw new MyError(errorMessage);
    }
}
function checkIfString(x, errorMessage) {
    if (typeof x !== "string") {
        throw new MyError(errorMessage);
    }
}
function checkIfValidDate(x, errorMessage) {
    let splitDate;
    if (x instanceof Date) {
        return x;
    }
    if (x.includes('.')) {
        splitDate = x.split('.');
    }
    else if (x.includes('-')) {
        splitDate = x.split('-');
    }
    else if (x.includes('/')) {
        splitDate = x.split('/');
    }
    else {
        throw new MyError(errorMessage);
    }
    let month = splitDate[0];
    let day = splitDate[1];
    let year = splitDate[2];
    let dateFromX = new Date(year, month - 1, day);
    // Throws an error if x is not a date or cannot be parsed to a date otherwise returns a date object
    if (Object.prototype.toString.call(dateFromX) === "[object Date]") {
        // x is an instance of date
        if (isNaN(dateFromX)) {
            throw new MyError(errorMessage);
        }
        else {
            return dateFromX;
        }
    }
    else {
        throw new MyError(errorMessage);
    }
}
function verifyDatabaseFetchResults(fetchResult, errorMessage) {
    if (!'rowCount' in fetchResult) {
        throw new MyError("rowCount is not in fetchResult");
    }
    else {
        if (fetchResult.rowCount === 0) {
            throw new MyError(errorMessage);
        }
    }
}
function isFetchResultEmpty(fetchResult) {
    if (fetchResult.rowCount === 0) {
        return true;
    }
    else {
        return false;
    }
}
function checkIfInList(list, item, errorMessage) {
    // This function throws an error containing errorMessage if item is not in list
    if (!list.includes(item)) {
        throw new MyError(errorMessage);
    }
}
function addErrorHandlingToAsyncFunction(func, errorMessage, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield func(...params);
        }
        catch (err) {
            throw new MyError(errorMessage);
        }
    });
}
function assertThatAsynchronousFunctionFails(func, errorMessage, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func(...params);
            assert(false, "Error Should Have Been Thrown");
        }
        catch (err) {
            if (err instanceof MyError && err.message === errorMessage) {
                assert(true);
            }
            else {
                console.log(err);
                assert(false, "Wrong Error Thrown");
            }
        }
    });
}
function assertThatAsyncFunctionReturnsRightThing(func, itemToReturn, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        let returnedItem;
        try {
            returnedItem = yield func(...params);
        }
        catch (err) {
            console.log(err);
            throw new MyError(`${func.name} Did Not Run`);
        }
        if (returnedItem === null || returnedItem === 'undefined') {
            assert(false, "Nothing Was Returned");
        }
        assert.equal(returnedItem, itemToReturn, "Returned Item Is Different");
    });
}
function assertThatAsyncFunctionReturnsNull(func, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        let returnedItem;
        try {
            returnedItem = yield func(...params);
        }
        catch (err) {
            console.log(err);
            throw new MyError(`${func.name} Did Not Run`);
        }
        assert.equal(returnedItem, null, "Returned Item Is Different");
    });
}
function assertThatFunctionWorks(func, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func(...params);
        }
        catch (err) {
            console.log(err);
            assert(false, `${func.name} did not run`);
        }
    });
}
function returnFetchedResultsFromDatabase(query, arguements, valueWanted) {
    return __awaiter(this, void 0, void 0, function* () {
        let fetchResult;
        try {
            fetchResult = yield pool.query(query, arguements);
        }
        catch (err) {
            throw new MyError(`Could Not Get ${valueWanted} From Database`);
        }
        return fetchResult;
    });
}
function arrayEquals(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val) => b.includes(val));
}
// function fileUpload(req, res){
// }
// This function takes a string and prefixes it with character till it reaches valid length
// Function assumes that character is a single characther
// The function returns string if it is not shorter than length
function padStringWithCharacter(string, character, length) {
    if (character.length != 1) {
        throw new MyError(MyErrors2.INVALID_CHARACTER_LENGTH);
    }
    // Check if string is shorter than prefix
    if (string.length < length) {
        // If shorter find difference 
        const difference = length - string.length;
        // Generate strings of character of length of difference
        const padding = character.repeat(difference);
        // Prefix string with characters
        return padding + string;
    }
    // If string is longer or equal to prefix return string
    else {
        return string;
    }
}
const utility = {
    arrayEquals,
    isAnyEmpty,
    checkIfBoolean,
    checkIfNumberisPositive,
    checkIfValidDate,
    verifyDatabaseFetchResults,
    checkIfInList,
    addErrorHandlingToAsyncFunction,
    checkIfNumberisGreaterThanZero,
    assertThatAsynchronousFunctionFails,
    assertThatAsyncFunctionReturnsRightThing,
    assertThatAsyncFunctionReturnsNull,
    isFetchResultEmpty,
    assertThatFunctionWorks,
    returnFetchedResultsFromDatabase,
    checkIfString,
    getTimeDifferenceInSeconds,
    padStringWithCharacter
};
export default utility;
//# sourceMappingURL=utility.js.map