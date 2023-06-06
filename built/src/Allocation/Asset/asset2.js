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
const fs_1 = __importDefault(require("fs"));
// Importing the database bool from db2.js. This will allow me to connect to the database
const db2_js_1 = __importDefault(require("../../../db2.js"));
// Importing custom classes
const myError_js_1 = __importDefault(require("../../utility/myError.js"));
const utility_js_1 = __importDefault(require("../../utility/utility.js"));
const location_js_1 = __importDefault(require("../../Tracking/location.js"));
const users_js_1 = __importDefault(require("../../Users/users.js"));
const category2_js_1 = __importDefault(require("../Category/category2.js"));
const db_assets_js_1 = __importDefault(require("./db_assets.js"));
const constants_js_1 = require("../../utility/constants.js");
class Asset {
    constructor(barCode, assetLifeSpan, acquisitionDate, locationID, status, custodianName, acquisitionCost, categoryName, attachments, noInBuilding, serialNumber, residualValue, code, description, depreciaitionType, depreciationPercent) {
        // utility.checkIfBoolean(fixed, "Invalid Fixed Status");
        // this.fixed = fixed;
        utility_js_1.default.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
        this.assetLifeSpan = assetLifeSpan;
        this.acquisitionDate = utility_js_1.default.checkIfValidDate(acquisitionDate, "Invalid acquisition date");
        utility_js_1.default.checkIfNumberisPositive(locationID, "Invalid location ID");
        this.locationID = locationID;
        if (!status instanceof String) {
            throw new myError_js_1.default("Invalid status");
        }
        utility_js_1.default.checkIfInList(Asset.assetStatusOptions, status.toLowerCase(), "Invalid status");
        this.status = status;
        this.custodianName = custodianName;
        utility_js_1.default.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
        this.acquisitionCost = acquisitionCost;
        // utility.checkIfNumberisPositive(insuranceValue, "Invalid insurance value");
        // this.insuranceValue = insuranceValue;
        utility_js_1.default.checkIfString(description, "Invalid Description");
        this.description = description;
        utility_js_1.default.checkIfString(code, "Invalid Code");
        this.code = code;
        utility_js_1.default.checkIfString(barCode, "Invalid Barcode");
        this.barCode = barCode;
        utility_js_1.default.checkIfNumberisPositive(noInBuilding, "Invalid Number in Building");
        this.noInBuilding = noInBuilding;
        utility_js_1.default.checkIfString(depreciaitionType, "Invalid Depreciation Type");
        this.depreciaitionType = depreciaitionType;
        utility_js_1.default.checkIfNumberisPositive(depreciationPercent, "Invalid Depreciation Percent");
        this.depreciationPercent = depreciationPercent;
        this.categoryName = categoryName;
        if (!Array.isArray(attachments)) {
            throw new myError_js_1.default("Attachments is not array");
        }
        else {
            if (attachments.length) {
                for (let i = 0; i < attachments.length; i++) {
                    if (!fs_1.default.existsSync(attachments[i])) {
                        throw new myError_js_1.default(constants_js_1.Errors[4]);
                    }
                }
            }
        }
        this.attachments = attachments;
        // this.makeAndModelNo = makeAndModelNo;
        this.serialNumber = serialNumber;
        if (residualValue) {
            utility_js_1.default.checkIfNumberisPositive(residualValue, "Invalid Residual Value");
            this.residualValue = residualValue;
        }
        else {
            this.residualValue = null;
        }
    }
    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield category2_js_1.default._doesCategoryExist(this.categoryName))) {
                throw new myError_js_1.default(constants_js_1.Errors[5]);
            }
            try {
                this.categoryID = yield category2_js_1.default._getCategoryID(this.categoryName);
            }
            catch (err) {
                console.log(err);
                throw new myError_js_1.default(constants_js_1.Errors[6]);
            }
            if (!(yield location_js_1.default.verifyLocationID(this.locationID))) {
                throw new myError_js_1.default(constants_js_1.Errors[3]);
            }
            yield users_js_1.default.checkIfUserExists(this.custodianName, "Invalid custodian");
            if (yield Asset._doesBarCodeExist(this.assetTag)) {
                throw new myError_js_1.default(constants_js_1.Errors[7]);
            }
            if (this.depreciaitionType == null) {
                let depreciaitionType = category2_js_1.default._getCategoryDepreciationType(this.categoryID);
                if (depreciaitionType !== "Straight Line") {
                    if (this.residualValue) {
                        throw new myError_js_1.default("Invalid Residual Value for Depreciation Type");
                    }
                }
            }
            yield this._storeAssetInAssetRegister();
        });
    }
    static _doesAssetIDExist(assetID) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            try {
                fetchResult = yield db2_js_1.default.query(db_assets_js_1.default.doesAssetTagExist, [assetID]);
            }
            catch (err) {
                throw new myError_js_1.default("Could Not Verify Asset Tag");
            }
            if (utility_js_1.default.isFetchResultEmpty(fetchResult)) {
                return false;
            }
            else {
                return true;
            }
        });
    }
    static _doesBarCodeExist(barCode) {
        return new Promise((res, rej) => {
            db2_js_1.default.query(db_assets_js_1.default.doesBarCodeExist, [barCode]).then(fetchResult => {
                if (utility_js_1.default.isFetchResultEmpty(fetchResult)) {
                    res(false);
                }
                else {
                    res(true);
                }
            }).catch(err => {
                console.log(err);
                rej(new myError_js_1.default(constants_js_1.Errors[36]));
            });
        });
    }
    _storeAssetInAssetRegister() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db2_js_1.default.query(db_assets_js_1.default.addAssetToAssetRegister, [this.barCode, this.noInBuilding, this.description, this.code, this.serialNumber,
                    this.acquisitionDate, this.locationID, this.residualValue, this.status, this.custodianName, this.acquisitionCost, this.categoryID,
                    this.assetLifeSpan, this.depreciaitionType, this.depreciationPercent]);
                yield Asset._insertAssetAttachments(this.assetTag, this.attachments);
            }
            catch (err) {
                console.log(err);
                throw new myError_js_1.default("Could not add asset to asset Register");
            }
        });
    }
    static _getAssetCategoryName(assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new myError_js_1.default("Asset Does Not Exist");
            }
            else {
                try {
                    fetchResult = yield db2_js_1.default.query(db_assets_js_1.default.getAssetCategoryName, [assetTag]);
                }
                catch (err) {
                    throw new myError_js_1.default("Could Not Get Category Name");
                }
                utility_js_1.default.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
                return fetchResult.rows[0].name;
            }
        });
    }
    static _updateAssetAcquisitionDate(assetTag, newDate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetAcquisitionDate, [newDate, assetTag]);
        });
    }
    static _updateAssetFixedStatus(assetTag, newFixedStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetFixedStatus, [newFixedStatus, assetTag]);
        });
    }
    static _updateAssetLifeSpan(assetTag, newLifeSpan) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetLifeSpan, [newLifeSpan, assetTag]);
        });
    }
    static _updateAssetLocation(assetTag, newLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetLocation, [newLocation, assetTag]);
        });
    }
    static _updateAssetStatus(assetTag, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetStatus, [newStatus, assetTag]);
        });
    }
    static _updateAssetCustodian(assetTag, newCustodian) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetCustodian, [newCustodian, assetTag]);
        });
    }
    static _updateAssetAcquisitionCost(assetTag, newAcquisitionCost) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetAcquisitionCost, [newAcquisitionCost, assetTag]);
        });
    }
    static _updateAssetInsuranceValue(assetTag, newInsuranceValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetInsuranceValue, [newInsuranceValue, assetTag]);
        });
    }
    static _updateAssetCategoryID(assetTag, newCategoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetCategory, [newCategoryID, assetTag]);
        });
    }
    static _insertAssetAttachments(assetTag, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < attachments.length; i++) {
                yield db2_js_1.default.query(db_assets_js_1.default.addAssetFileAttachment, [assetTag, attachments[i]]);
            }
        });
    }
    static _updateAssetResidualValue(assetTag, residualValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db2_js_1.default.query(db_assets_js_1.default.updateAssetResidualValue, [residualValue, assetTag]);
        });
    }
    static updateAsset(updateAssetDict, assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            // Throw an error if no asset with asset tag exists
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new myError_js_1.default("Asset Does Not Exist");
            }
            if ('fixed' in updateAssetDict) {
                utility_js_1.default.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetFixedStatus, "Invalid Fixed Status", assetTag, updateAssetDict.fixed);
            }
            else if ('assetLifeSpan' in updateAssetDict) {
                utility_js_1.default.checkIfNumberisPositive(updateAssetDict.assetLifeSpan, "Invalid asset life span");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetLifeSpan, "Invalid asset life span", assetTag, updateAssetDict.assetLifeSpan);
            }
            else if ('acquisitionDate' in updateAssetDict) {
                newDate = utility_js_1.default.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionDate, "Invalid acquisition date", assetTag, newDate);
            }
            else if ('locationID' in updateAssetDict) {
                yield location_js_1.default.verifyLocationID(updateAssetDict.locationID, "Invalid location");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetLocation, "Invalid location", assetTag, updateAssetDict.locationID);
            }
            else if ('status' in updateAssetDict) {
                if (!updateAssetDict.status instanceof String) {
                    throw new myError_js_1.default("Invalid status");
                }
                utility_js_1.default.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetStatus, "Invalid status", assetTag, updateAssetDict.status);
            }
            else if ('custodianName' in updateAssetDict) {
                yield users_js_1.default.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Invalid custodian", assetTag, updateAssetDict.custodianName);
            }
            else if ('acquisitionCost' in updateAssetDict) {
                utility_js_1.default.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionCost, "Invalid acquisition cost", assetTag, updateAssetDict.acquisitionCost);
            }
            else if ('insuranceValue' in updateAssetDict) {
                utility_js_1.default.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetInsuranceValue, "Invalid insurance value", assetTag, updateAssetDict.insuranceValue);
            }
            else if ('categoryName' in updateAssetDict) {
                try {
                    if (!(yield category2_js_1.default._doesCategoryExist(updateAssetDict.categoryName))) {
                        throw new myError_js_1.default("Invalid category");
                    }
                    else {
                        let categoryID = yield category2_js_1.default._getCategoryID(updateAssetDict.categoryName);
                        yield Asset._updateAssetCategoryID(assetTag, categoryID);
                    }
                }
                catch (err) {
                    throw new myError_js_1.default("Invalid category");
                }
            }
            else if ('attachments' in updateAssetDict) {
                if (!Array.isArray(updateAssetDict.attachments)) {
                    throw new myError_js_1.default("Invalid attachments");
                }
                else {
                    if (updateAssetDict.attachments.length) {
                        for (let i = 0; i < updateAssetDict.attachments.length; i++) {
                            if (!fs_1.default.existsSync(updateAssetDict.attachments[i])) {
                                throw new myError_js_1.default("Invalid attachments");
                            }
                        }
                    }
                }
                yield utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._insertAssetAttachments, "Invalid attachments", assetTag, updateAssetDict.attachments);
            }
            else if ('residualValue' in updateAssetDict) {
                utility_js_1.default.checkIfNumberisPositive(updateAssetDict.residualValue, "Invalid Residual Value");
                let assetCategoryName = utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._getAssetCategoryName, "Could not get category name for asset", assetTag);
                if (assetCategoryName !== "Straight Line") {
                    if (updateAssetDict.residualValue) {
                        throw new myError_js_1.default("Invalid Residual Value for the Depreciation Type");
                    }
                }
                utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetResidualValue, "Invalid Residual Value", assetTag, updateAssetDict.residualValue);
            }
        });
    }
    static displayAllAssetTags() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fetchResult = yield db2_js_1.default.query(db_assets_js_1.default.getAssetTags);
                let assetTags = fetchResult.rows.map(obj => obj.assettag);
                return assetTags;
            }
            catch (err) {
                console.log(err);
                throw new myError_js_1.default("Could not get asset tags");
            }
        });
    }
    static disposeAsset(assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db2_js_1.default.query(db_assets_js_1.default.disposeAsset, [assetTag]);
            }
            catch (err) {
                throw new myError_js_1.default("Asset Could Not Be Deleted");
            }
        });
    }
    static _insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation) {
        return new Promise((res, rej) => {
            db2_js_1.default.query(db_assets_js_1.default.insertDepreciationSchedule, [year, openBookValue, depreciationExpense, accumulatedDepreciation, closingBookValue, assetTag]).then(_ => {
                res("Done");
            }).catch(err => {
                console.log(err);
                rej(err);
            });
        });
    }
    static _getCloseBookValue(assetTag, year) {
        return new Promise((res, rej) => {
            db2_js_1.default.query(db_assets_js_1.default.getCloseBookValue, [assetTag, year]).then(fetchresult => {
                if (fetchresult.rowCount <= 0) {
                    return rej(new myError_js_1.default("No Close Book Value For Asset"));
                }
                var closingBookVal = fetchresult.rows[0].closingbookvalue;
                return res(closingBookVal);
            });
        });
    }
    static _getAccumulatedDepreciation(assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                db2_js_1.default.query(db_assets_js_1.default.getAccumulatedDepreciation, [assetTag]).then(fetchResult => {
                    if (fetchResult.rowCount <= 0) {
                        return rej(new myError_js_1.default("Could Not Get Accumulated Depreciation"));
                    }
                    return res(fetchResult.rows[0]['sum']);
                });
            });
        });
    }
    static createDepreciationSchedule(depreciationType, assetTag, assetLifeSpan, acquisitionCost, acquisitionDate, residualValue, depreciationPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            let year;
            let openBookValue;
            let depreciationExpense;
            let accumulatedDepreciation;
            let closingBookValue;
            const getOpenBookValue = (i, acquisitionCost, assetTag, year) => {
                return new Promise((res, rej) => {
                    if (i == 0) {
                        res(acquisitionCost);
                    }
                    else {
                        Asset._getCloseBookValue(assetTag, year).then(val => {
                            res(val);
                        }).catch(err => {
                            console.log(`i is ${i}`);
                            console.log(err);
                            rej(new myError_js_1.default("No close book value"));
                        });
                    }
                });
            };
            const getDepreciationExpense = (depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage) => {
                return new Promise((res, rej) => {
                    if (depreciationType === "Straight Line") {
                        return res((acquisitionCost - residualValue) / assetLifeSpan);
                    }
                    else if (depreciationType === "Double Declining Balance") {
                        return res(2 * (1 / assetLifeSpan) * openBookValue);
                    }
                    else if (depreciationType === "Written Down Value") {
                        return res(openBookValue * (depreciationPercentage / 100));
                    }
                    else {
                        console.log(depreciationType);
                        return rej(new myError_js_1.default("Depreciation Type is not supported"));
                    }
                });
            };
            const getAccumulatedDepreciation = (i, depreciationExpense, assetTag) => {
                return new Promise((res, rej) => {
                    if (i == 0) {
                        return res(depreciationExpense);
                    }
                    else {
                        Asset._getAccumulatedDepreciation(assetTag).then(val => {
                            return res(val + depreciationExpense);
                        }).catch(err => {
                            console.log(err);
                            return rej(new myError_js_1.default("Could Not Get Accumulated Depreciation"));
                        });
                    }
                });
            };
            let i = 0;
            function loop() {
                if (i < assetLifeSpan) {
                    year = acquisitionDate.getFullYear() + i;
                    return getOpenBookValue(i, acquisitionCost, assetTag, year - 1).then(openBookValue => {
                        return getDepreciationExpense(depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage).then(depreciationExpense => {
                            return getAccumulatedDepreciation(i, depreciationExpense, assetTag).then(accumulatedDepreciation => {
                                closingBookValue = openBookValue - depreciationExpense;
                                return Asset._insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation).then(() => {
                                    i++;
                                    return loop();
                                });
                            });
                        });
                    }).catch(err => {
                        console.log(err);
                        throw new myError_js_1.default("Invalid Depreciation Schedule Entry");
                    });
                }
                else {
                    Promise.resolve();
                }
            }
            return loop();
            // return new Promise((res, rej) => {
            //     for(let i = 0; i < assetLifeSpan; i++) {
            //         // Get openbookvalue
            //         getOpenBookValue(i, acquisitionCost, assetTag, year).then(val1 => {
            //             year = acquisitionDate.getFullYear() + i;
            //             openBookValue = val1
            //             // Get Depreciation Expense
            //             getDepreciationExpense(depreciationType, acquisitionCost, residualValue, assetLifeSpan, openBookValue, depreciationPercentage).then(val2 => {
            //                 depreciationExpense = val2;
            //                 console.log("Done 1")
            //                 // Get Accumulated Depreciation
            //                 getAccumulatedDepreciation(i, depreciationExpense, assetTag).then(val3 => {
            //                     accumulatedDepreciation = val3;
            //                     console.log("Done 2")
            //                     // Insert deprecition schedule
            //                     closingBookValue = openBookValue - depreciationExpense;
            //                     console.log(assetTag, year, openBookValue, depreciationExpense, accumulatedDepreciation, closingBookValue);
            //                     Asset._insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, closingBookValue, accumulatedDepreciation).then(_ => {
            //                         console.log("Depreciation Schedule Created");
            //                     }).catch(err => {
            //                         console.log(1)
            //                         console.log(err);
            //                         return rej(new MyError("Invalid Depreciation Schedule Entry"));
            //                     })
            //                 }).catch(err => {
            //                     console.log(2)
            //                     console.log(err);
            //                     return rej(err);
            //                 })
            //             }).catch(err => {
            //                 console.log(3)
            //                 console.log(err)
            //                 return rej(err)
            //             })
            //         }).catch(err => {
            //             console.log(4)
            //             console.log(err)
            //             return rej(err)
            //         })
            //     }
            // });
        });
    }
    static allocateAsset(assetTag, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new myError_js_1.default("Asset Does Not Exist");
            }
            yield users_js_1.default.checkIfUserExists(username, "User Does Not Exist");
            utility_js_1.default.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Could Not Assign Asset To User", assetTag, username);
        });
    }
}
Asset.assetStatusOptions = ['good', 'excellent', 'fair'];
exports.default = Asset;
