var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../../db2.js';
// Importing custom classes
import MyError from '../../utility/myError.js';
import utility from '../../utility/utility.js';
import Location from '../../Tracking/location.js';
import User from '../../Users/users.js';
import Category from '../Category/category2.js';
import assetTable from './db_assets.js';
import { Errors, MyErrors2 } from '../../utility/constants.js';
import { createDepreciationSchedules } from './depreciations.js';
import generateBarcode from './generateBarcode.js';
import { checkIfAssetStatusExists } from './addAssetStatus.js';
export var DepreciationTypes;
(function (DepreciationTypes) {
    DepreciationTypes["StraightLine"] = "Straight Line";
    DepreciationTypes["DoubleDecliningBalance"] = "Double Declining Balance";
    DepreciationTypes["WrittenDownValue"] = "Written Down Value";
})(DepreciationTypes || (DepreciationTypes = {}));
class Asset {
    constructor(assetLifeSpan, acquisitionDate, locationID, condition, custodian_id, acquisitionCost, categoryName, attachments, serialNumber, description, make, modelnumber, residualValue, depreciaitionType, depreciationPercent, oldBarcode) {
        utility.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
        this.assetLifeSpan = assetLifeSpan;
        this.condition = condition;
        this.acquisitionDate = utility.checkIfValidDate(acquisitionDate, "Invalid acquisition date");
        utility.checkIfNumberisPositive(locationID, "Invalid location ID");
        this.locationID = locationID;
        this.custodian_id = custodian_id;
        this.make = make;
        this.modelnumber = modelnumber;
        utility.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
        this.acquisitionCost = acquisitionCost;
        utility.checkIfString(description, "Invalid Description");
        this.description = description;
        this.oldBarcode = oldBarcode;
        if (depreciaitionType) {
            if (Object.values(DepreciationTypes).includes(depreciaitionType) == true) {
                this.depreciaitionType = depreciaitionType;
            }
            else {
                throw new MyError(Errors[50]);
            }
        }
        if (depreciationPercent) {
            utility.checkIfNumberisPositive(depreciationPercent, Errors[50]);
            this.depreciationPercent = depreciationPercent;
        }
        this.categoryName = categoryName;
        if (!Array.isArray(attachments)) {
            throw new MyError(Errors[51]);
        }
        else {
            if (attachments.length) {
                for (let i = 0; i < attachments.length; i++) {
                    if (!fs.existsSync(attachments[i])) {
                        throw new MyError(Errors[4]);
                    }
                }
            }
        }
        this.attachments = attachments;
        this.serialNumber = serialNumber;
        if (residualValue != null && residualValue != undefined) {
            utility.checkIfNumberisPositive(residualValue, Errors[52]);
            this.residualValue = residualValue;
        }
        this.categoryID = 0;
    }
    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categID = yield Category._getCategoryID(this.categoryName);
                this.categoryID = categID;
                if (!(yield Location.verifyLocationID(this.locationID))) {
                    throw new MyError(MyErrors2.LOCATION_NOT_EXIST);
                }
                if (this.custodian_id) {
                    if (!(yield User.checkIfUserIDExists(this.custodian_id))) {
                        throw new MyError(MyErrors2.USER_NOT_EXIST);
                    }
                }
                let nextAssetID = yield Asset._getIDOfNextAsset();
                let genBarcode = yield generateBarcode(categID, this.locationID, nextAssetID, this.condition);
                this.barcode = genBarcode;
                if (!(yield checkIfAssetStatusExists(this.condition))) {
                    throw new MyError(MyErrors2.NOT_STORE_ASSET);
                }
                this._storeAssetInAssetRegister();
            }
            catch (err) {
                if (err instanceof MyError) {
                    throw err;
                }
                else {
                    throw new MyError(MyErrors2.NOT_STORE_ASSET);
                }
            }
        });
    }
    static _getIDOfNextAsset() {
        return new Promise((res, rej) => {
            pool.query(assetTable.getNextAssetID).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_GET_NEXT_ASSET_ID));
                }
                return res(fetchResult.rows[0].next);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_NEXT_ASSET_ID));
            });
        });
    }
    static _doesAssetIDExist(assetID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(assetTable.doesAssetTagExist, [assetID]).then((fetchResult) => {
                    if (fetchResult.rowCount <= 0) {
                        return res(false);
                    }
                    return res(true);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            });
        });
    }
    static _doesBarCodeExist(barCode) {
        return new Promise((res, rej) => {
            pool.query(assetTable.doesBarCodeExist, [barCode]).then(fetchResult => {
                if (utility.isFetchResultEmpty(fetchResult)) {
                    return res(false);
                }
                else {
                    return res(true);
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[36]));
            });
        });
    }
    _storeAssetInAssetRegister() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(assetTable.addAssetToAssetRegister, [this.barcode, this.description,
                    this.serialNumber, this.acquisitionDate, this.locationID, this.residualValue, this.condition, this.custodian_id, this.acquisitionCost, this.categoryID,
                    this.assetLifeSpan, this.depreciaitionType, this.depreciationPercent, this.make, this.modelnumber, this.oldBarcode]).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[6]));
                }).then(_ => {
                    // Create depreciation schedules
                    createDepreciationSchedules(this.barcode).then(_ => {
                        return res();
                    }).catch(err => {
                        console.log(err);
                        return rej(new MyError(Errors[1]));
                    });
                });
            });
        });
    }
    static _getAssetCategoryName(assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new MyError("Asset Does Not Exist");
            }
            else {
                try {
                    fetchResult = yield pool.query(assetTable.getAssetCategoryName, [assetTag]);
                }
                catch (err) {
                    throw new MyError("Could Not Get Category Name");
                }
                utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");
                return fetchResult.rows[0].name;
            }
        });
    }
    static _getAssetID(barcode) {
        return new Promise((res, rej) => {
            pool.query(assetTable.getAssetID, [barcode]).then(fetchResult => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(Errors[29]));
                }
                return res(fetchResult.rows[0].assetid);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[29]));
            });
        });
    }
    static _updateAssetAcquisitionDate(assetTag, newDate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetAcquisitionDate, [newDate, assetTag]);
        });
    }
    static _updateAssetFixedStatus(assetTag, newFixedStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetFixedStatus, [newFixedStatus, assetTag]);
        });
    }
    static _updateAssetLocation(assetTag, newLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetLocation, [newLocation, assetTag]);
        });
    }
    static _updateAssetStatus(assetTag, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetStatus, [newStatus, assetTag]);
        });
    }
    static _updateAssetCustodian(assetTag, newCustodian) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetCustodian, [newCustodian, assetTag]);
        });
    }
    static _updateAssetAcquisitionCost(assetTag, newAcquisitionCost) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetAcquisitionCost, [newAcquisitionCost, assetTag]);
        });
    }
    static _updateAssetInsuranceValue(assetTag, newInsuranceValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetInsuranceValue, [newInsuranceValue, assetTag]);
        });
    }
    static _updateAssetCategoryID(assetTag, newCategoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetCategory, [newCategoryID, assetTag]);
        });
    }
    static _insertAssetAttachments(assetTag, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < attachments.length; i++) {
                yield pool.query(assetTable.addAssetFileAttachment, [assetTag, attachments[i]]);
            }
        });
    }
    static _updateAssetResidualValue(assetTag, residualValue) {
        return __awaiter(this, void 0, void 0, function* () {
            yield pool.query(assetTable.updateAssetResidualValue, [residualValue, assetTag]);
        });
    }
    static updateAsset(updateAssetDict, assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            // Throw an error if no asset with asset tag exists
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new MyError("Asset Does Not Exist");
            }
            if ('fixed' in updateAssetDict) {
                utility.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetFixedStatus, "Invalid Fixed Status", assetTag, updateAssetDict.fixed);
            }
            else if ('acquisitionDate' in updateAssetDict) {
                newDate = utility.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionDate, "Invalid acquisition date", assetTag, newDate);
            }
            else if ('locationID' in updateAssetDict) {
                yield Location.verifyLocationID(updateAssetDict.locationID, "Invalid location");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLocation, "Invalid location", assetTag, updateAssetDict.locationID);
            }
            else if ('status' in updateAssetDict) {
                if (!updateAssetDict.status instanceof String) {
                    throw new MyError("Invalid status");
                }
                utility.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetStatus, "Invalid status", assetTag, updateAssetDict.status);
            }
            else if ('custodianName' in updateAssetDict) {
                yield User.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Invalid custodian", assetTag, updateAssetDict.custodianName);
            }
            else if ('acquisitionCost' in updateAssetDict) {
                utility.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionCost, "Invalid acquisition cost", assetTag, updateAssetDict.acquisitionCost);
            }
            else if ('insuranceValue' in updateAssetDict) {
                utility.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
                yield utility.addErrorHandlingToAsyncFunction(Asset._updateAssetInsuranceValue, "Invalid insurance value", assetTag, updateAssetDict.insuranceValue);
            }
            else if ('categoryName' in updateAssetDict) {
                try {
                    if (!(yield Category._doesCategoryExist(updateAssetDict.categoryName))) {
                        throw new MyError("Invalid category");
                    }
                    else {
                        let categoryID = yield Category._getCategoryID(updateAssetDict.categoryName);
                        yield Asset._updateAssetCategoryID(assetTag, categoryID);
                    }
                }
                catch (err) {
                    throw new MyError("Invalid category");
                }
            }
            else if ('attachments' in updateAssetDict) {
                if (!Array.isArray(updateAssetDict.attachments)) {
                    throw new MyError("Invalid attachments");
                }
                else {
                    if (updateAssetDict.attachments.length) {
                        for (let i = 0; i < updateAssetDict.attachments.length; i++) {
                            if (!fs.existsSync(updateAssetDict.attachments[i])) {
                                throw new MyError("Invalid attachments");
                            }
                        }
                    }
                }
                yield utility.addErrorHandlingToAsyncFunction(Asset._insertAssetAttachments, "Invalid attachments", assetTag, updateAssetDict.attachments);
            }
            else if ('residualValue' in updateAssetDict) {
                utility.checkIfNumberisPositive(updateAssetDict.residualValue, "Invalid Residual Value");
                let assetCategoryName = utility.addErrorHandlingToAsyncFunction(Asset._getAssetCategoryName, "Could not get category name for asset", assetTag);
                if (assetCategoryName !== "Straight Line") {
                    if (updateAssetDict.residualValue) {
                        throw new MyError("Invalid Residual Value for the Depreciation Type");
                    }
                }
                utility.addErrorHandlingToAsyncFunction(Asset._updateAssetResidualValue, "Invalid Residual Value", assetTag, updateAssetDict.residualValue);
            }
        });
    }
    static displayAllAssetTags() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fetchResult = yield pool.query(assetTable.getAssetTags);
                let assetTags = fetchResult.rows.map(obj => obj.assettag);
                return assetTags;
            }
            catch (err) {
                console.log(err);
                throw new MyError("Could not get asset tags");
            }
        });
    }
    static disposeAsset(assetTag) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query(assetTable.disposeAsset, [assetTag]);
            }
            catch (err) {
                throw new MyError("Asset Could Not Be Deleted");
            }
        });
    }
    static allocateAsset(assetTag, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield Asset._doesAssetIDExist(assetTag))) {
                throw new MyError("Asset Does Not Exist");
            }
            yield User.checkIfUserExists(username, "User Does Not Exist");
            utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Could Not Assign Asset To User", assetTag, username);
        });
    }
}
export default Asset;
//# sourceMappingURL=asset2.js.map