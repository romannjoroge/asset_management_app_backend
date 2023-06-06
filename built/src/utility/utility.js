"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const myError_js_1 = __importDefault(require("./myError.js"));
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
        throw new myError_js_1.default(errorMessage);
    }
}
function checkIfNumberisPositive(x, errorMessage) {
    if (!Number.isInteger(x) || x < 0) {
        throw new myError_js_1.default(errorMessage);
    }
}
function checkIfNumberisGreaterThanZero(x, errorMessage) {
    if (!Number.isInteger(x) || x <= 0) {
        console.log(x);
        throw new myError_js_1.default(errorMessage);
    }
}
function checkIfString(x, errorMessage) {
    if (typeof x !== "string") {
        throw new myError_js_1.default(errorMessage);
    }
}
function checkIfValidDate(x, errorMessage) {
    let splitDate;
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
        throw new myError_js_1.default(errorMessage);
    }
    let month = splitDate[0];
    let day = splitDate[1];
    let year = splitDate[2];
    let dateFromX = new Date(year, month - 1, day);
    // Throws an error if x is not a date or cannot be parsed to a date otherwise returns a date object
    if (Object.prototype.toString.call(dateFromX) === "[object Date]") {
        // x is an instance of date
        if (isNaN(dateFromX)) {
            throw new myError_js_1.default(errorMessage);
        }
        else {
            return dateFromX;
        }
    }
    else {
        throw new myError_js_1.default(errorMessage);
    }
}
function verifyDatabaseFetchResults(fetchResult, errorMessage) {
    if (!'rowCount' in fetchResult) {
        throw new myError_js_1.default("rowCount is not in fetchResult");
    }
    else {
        if (fetchResult.rowCount === 0) {
            throw new myError_js_1.default(errorMessage);
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
        throw new myError_js_1.default(errorMessage);
    }
}
function addErrorHandlingToAsyncFunction(func, errorMessage, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield func(...params);
        }
        catch (err) {
            throw new myError_js_1.default(errorMessage);
        }
    });
}
function assertThatAsynchronousFunctionFails(func, errorMessage, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func(...params);
            (0, chai_1.assert)(false, "Error Should Have Been Thrown");
        }
        catch (err) {
            if (err instanceof myError_js_1.default && err.message === errorMessage) {
                (0, chai_1.assert)(true);
            }
            else {
                console.log(err);
                (0, chai_1.assert)(false, "Wrong Error Thrown");
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
            throw new myError_js_1.default(`${func.name} Did Not Run`);
        }
        if (returnedItem === null || returnedItem === 'undefined') {
            (0, chai_1.assert)(false, "Nothing Was Returned");
        }
        chai_1.assert.equal(returnedItem, itemToReturn, "Returned Item Is Different");
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
            throw new myError_js_1.default(`${func.name} Did Not Run`);
        }
        chai_1.assert.equal(returnedItem, null, "Returned Item Is Different");
    });
}
function assertThatFunctionWorks(func, ...params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield func(...params);
        }
        catch (err) {
            console.log(err);
            (0, chai_1.assert)(false, `${func.name} did not run`);
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
            throw new myError_js_1.default(`Could Not Get ${valueWanted} From Database`);
        }
        return fetchResult;
    });
}
// function fileUpload(req, res){
// }
const utility = {
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
    checkIfString
};
exports.default = utility;
