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

export enum DepreciationTypes {
    StraightLine = "Straight Line",
    DoubleDecliningBalance = "Double Declining Balance",
    WrittenDownValue = "Written Down Value"
}

export enum assetStatusOptions {
    Good = "Good",
    Excellent = "Excellent",
    Fair = "Fair",
    Bad = "Bad"
}

interface DoesAssetExistFetchResult {
    rowCount: number;
    rows: string[];
}

interface GetNextAssetIDResult {
    rowCount: number;
    rows: {next: number}[]
}

class Asset {
    barcode: string;
    assetLifeSpan: number;
    acquisitionDate: Date;
    locationID: number;
    condition: assetStatusOptions;
    custodian_id: number;
    acquisitionCost: number;
    categoryName: string;
    categoryID: number;
    attachments?: string[];
    noInBuilding: number;
    serialNumber: string;
    residualValue?: number;
    code: string;
    description: string;
    depreciaitionType?: DepreciationTypes;
    depreciationPercent?: number;

    constructor(assetLifeSpan: number, acquisitionDate: string | Date, locationID: number, condition: assetStatusOptions, custodian_id: number,
        acquisitionCost: number, categoryName: string, attachments: string[], noInBuilding: number,
        serialNumber: string, code: string, description: string, residualValue?: number, depreciaitionType?: DepreciationTypes, depreciationPercent?: number) {
        // utility.checkIfBoolean(fixed, "Invalid Fixed Status");
        // this.fixed = fixed;

        utility.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
        this.assetLifeSpan = assetLifeSpan;

        this.acquisitionDate = utility.checkIfValidDate(acquisitionDate, "Invalid acquisition date");

        utility.checkIfNumberisPositive(locationID, "Invalid location ID");
        this.locationID = locationID;

        if (Object.values(assetStatusOptions).includes(condition) === true) {
            this.condition = condition;
        } else {
            throw new MyError(Errors[49])
        }

        this.custodian_id = custodian_id;

        utility.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
        this.acquisitionCost = acquisitionCost;

        utility.checkIfString(description, "Invalid Description");
        this.description = description;

        utility.checkIfString(code, "Invalid Code");
        this.code = code;

        utility.checkIfNumberisPositive(noInBuilding, "Invalid Number in Building");
        this.noInBuilding = noInBuilding;

        if (depreciaitionType) {
            if (Object.values(DepreciationTypes).includes(depreciaitionType) == true) {
                this.depreciaitionType = depreciaitionType;
            } else {
                throw new MyError(Errors[50])
            }
        }

        if (depreciationPercent) {
            utility.checkIfNumberisPositive(depreciationPercent, Errors[50]);
            this.depreciationPercent = depreciationPercent;
        }

        this.categoryName = categoryName;

        if (!Array.isArray(attachments)) {
            throw new MyError(Errors[51])
        } else {
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

        if (residualValue) {
            utility.checkIfNumberisPositive(residualValue, Errors[52]);
            this.residualValue = residualValue;
        }

        this.categoryID = 0;
    }

    // Check is the asset status given is valid
    static isAssetStatusValid(status: string): boolean {
        return Object.values(assetStatusOptions).includes(status) === true;
    }

    // Gets code of asset status
    static getAssetStatusCode(status: string): string {
        if (this.isAssetStatusValid(status) == false) {
            throw new MyError(MyErrors2.ASSET_STATUS_NOT_EXIST);
        }

        // Return location of status as code
        return Object.values(assetStatusOptions).indexOf(status).toString();
    }

    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    initialize(): Promise<void | never> {
        return new Promise((res, rej) => {
            // Get category ID
            Category._getCategoryID(this.categoryName).then(categoryID => {
                this.categoryID = categoryID;
                // Check that location exists
                Location.verifyLocationID(this.locationID).then(doesExist => {
                    if (!doesExist) {
                        rej(new MyError(Errors[3]));
                    }
                    // Check if user exists
                    User.checkIfUserIDExists(this.custodian_id).then(doesUserExist => {
                        if (!doesUserExist) {
                            rej(new MyError(Errors[30]));
                        }
                        
                        // Get ID of next asset
                        Asset._getIDOfNextAsset().then(nextAssetID => {
                            // Generate barcode
                            generateBarcode(categoryID, this.locationID, nextAssetID, this.condition).then(genBarcode => {
                                this.barcode = genBarcode;
                                this._storeAssetInAssetRegister().then(_ => {
                                    res();
                                }).catch(err => {
                                    return rej(new MyError(MyErrors2.NOT_STORE_ASSET));
                                });
                            }).catch((err: MyError) => {
                                return rej(new MyError(MyErrors2.NOT_GENERATE_BARCODE));
                            })
                        }).catch((err: MyError) => {
                            return rej(new MyError(MyErrors2.NOT_GET_NEXT_ASSET_ID));
                        })
                        
                    }).catch(err => {
                        return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                    });
                }).catch(err => {
                    return rej(new MyError(MyErrors2.LOCATION_NOT_EXIST));
                });
            }).catch(err => {
                return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
            });
        })
    }

    static _getIDOfNextAsset(): Promise<number> {
        return new Promise((res, rej) => {
            pool.query(assetTable.getNextAssetID).then((fetchResult: GetNextAssetIDResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_GET_NEXT_ASSET_ID));
                }
                return res(fetchResult.rows[0].next);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GET_NEXT_ASSET_ID));
            })
        });
    }

    static async _doesAssetIDExist(assetID: number): Promise<boolean | never> {
        return new Promise((res, rej) => {
            pool.query(assetTable.doesAssetTagExist, [assetID]).then((fetchResult: DoesAssetExistFetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return res(false);
                }
                return res(true);
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        });
    }

    static _doesBarCodeExist(barCode: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(assetTable.doesBarCodeExist, [barCode]).then(fetchResult => {
                if (utility.isFetchResultEmpty(fetchResult)) {
                    return res(false);
                } else {
                    return res(true);
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[36]));
            });
        })
    }

    async _storeAssetInAssetRegister(): Promise<void> {
        return new Promise((res, rej) => {
            pool.query(assetTable.addAssetToAssetRegister, [this.barcode, this.noInBuilding, this.code, this.description,
                this.serialNumber, this.acquisitionDate, this.locationID, this.residualValue, this.condition, this.custodian_id, this.acquisitionCost, this.categoryID,
                this.assetLifeSpan, this.depreciaitionType, this.depreciationPercent]).catch(err => {
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
                })
        });
    }

    static async _getAssetCategoryName(assetTag: string) {
        let fetchResult;

        if (! await Asset._doesAssetIDExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        } else {
            try {
                fetchResult = await pool.query(assetTable.getAssetCategoryName, [assetTag]);
            } catch (err) {
                throw new MyError("Could Not Get Category Name");
            }

            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");

            return fetchResult.rows[0].name;
        }
    }

    static _getAssetID(barcode: string): Promise<number | never> {
        return new Promise((res, rej) => {
            pool.query(assetTable.getAssetID, [barcode]).then(fetchResult=> {
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

    static async _updateAssetAcquisitionDate(assetTag, newDate) {
        await pool.query(assetTable.updateAssetAcquisitionDate, [newDate, assetTag]);
    }

    static async _updateAssetFixedStatus(assetTag, newFixedStatus) {
        await pool.query(assetTable.updateAssetFixedStatus, [newFixedStatus, assetTag]);
    }

    static async _updateAssetLocation(assetTag, newLocation) {
        await pool.query(assetTable.updateAssetLocation, [newLocation, assetTag]);
    }

    static async _updateAssetStatus(assetTag, newStatus) {
        await pool.query(assetTable.updateAssetStatus, [newStatus, assetTag]);
    }

    static async _updateAssetCustodian(assetTag, newCustodian) {
        await pool.query(assetTable.updateAssetCustodian, [newCustodian, assetTag]);
    }

    static async _updateAssetAcquisitionCost(assetTag, newAcquisitionCost) {
        await pool.query(assetTable.updateAssetAcquisitionCost, [newAcquisitionCost, assetTag]);
    }

    static async _updateAssetInsuranceValue(assetTag, newInsuranceValue) {
        await pool.query(assetTable.updateAssetInsuranceValue, [newInsuranceValue, assetTag]);
    }

    static async _updateAssetCategoryID(assetTag, newCategoryID) {
        await pool.query(assetTable.updateAssetCategory, [newCategoryID, assetTag]);
    }

    static async _insertAssetAttachments(assetTag, attachments) {
        for (let i = 0; i < attachments.length; i++) {
            await pool.query(assetTable.addAssetFileAttachment, [assetTag, attachments[i]]);
        }
    }

    static async _updateAssetResidualValue(assetTag, residualValue) {
        await pool.query(assetTable.updateAssetResidualValue, [residualValue, assetTag]);
    }

    static async updateAsset(updateAssetDict, assetTag) {
        // Throw an error if no asset with asset tag exists
        if (!await Asset._doesAssetIDExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        }

        if ('fixed' in updateAssetDict) {
            utility.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetFixedStatus,
                "Invalid Fixed Status", assetTag,
                updateAssetDict.fixed);
        }
        else if ('acquisitionDate' in updateAssetDict) {
            newDate = utility.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionDate, "Invalid acquisition date",
                assetTag, newDate);
        }
        else if ('locationID' in updateAssetDict) {
            await Location.verifyLocationID(updateAssetDict.locationID, "Invalid location");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLocation, "Invalid location",
                assetTag, updateAssetDict.locationID);
        }
        else if ('status' in updateAssetDict) {
            if (!updateAssetDict.status instanceof String) {
                throw new MyError("Invalid status");
            }
            utility.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetStatus, "Invalid status",
                assetTag, updateAssetDict.status);
        }
        else if ('custodianName' in updateAssetDict) {
            await User.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Invalid custodian",
                assetTag, updateAssetDict.custodianName);
        }
        else if ('acquisitionCost' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionCost, "Invalid acquisition cost",
                assetTag, updateAssetDict.acquisitionCost);
        }
        else if ('insuranceValue' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetInsuranceValue, "Invalid insurance value",
                assetTag, updateAssetDict.insuranceValue);
        }
        else if ('categoryName' in updateAssetDict) {
            try {
                if (!await Category._doesCategoryExist(updateAssetDict.categoryName)) {
                    throw new MyError("Invalid category");
                } else {
                    let categoryID = await Category._getCategoryID(updateAssetDict.categoryName);
                    await Asset._updateAssetCategoryID(assetTag, categoryID);
                }
            } catch (err) {
                throw new MyError("Invalid category");
            }
        }
        else if ('attachments' in updateAssetDict) {
            if (!Array.isArray(updateAssetDict.attachments)) {
                throw new MyError("Invalid attachments")
            } else {
                if (updateAssetDict.attachments.length) {
                    for (let i = 0; i < updateAssetDict.attachments.length; i++) {
                        if (!fs.existsSync(updateAssetDict.attachments[i])) {
                            throw new MyError("Invalid attachments");
                        }
                    }
                }
            }
            await utility.addErrorHandlingToAsyncFunction(Asset._insertAssetAttachments, "Invalid attachments",
                assetTag, updateAssetDict.attachments);
        }
        else if ('residualValue' in updateAssetDict) {
            utility.checkIfNumberisPositive(updateAssetDict.residualValue, "Invalid Residual Value");
            let assetCategoryName = utility.addErrorHandlingToAsyncFunction(Asset._getAssetCategoryName, "Could not get category name for asset",
                assetTag);
            if (assetCategoryName !== "Straight Line") {
                if (updateAssetDict.residualValue) {
                    throw new MyError("Invalid Residual Value for the Depreciation Type");
                }
            }
            utility.addErrorHandlingToAsyncFunction(Asset._updateAssetResidualValue, "Invalid Residual Value",
                assetTag, updateAssetDict.residualValue);
        }
    }

    static async displayAllAssetTags() {
        try {
            let fetchResult = await pool.query(assetTable.getAssetTags);
            let assetTags = fetchResult.rows.map(obj => obj.assettag);
            return assetTags;
        } catch (err) {
            console.log(err);
            throw new MyError("Could not get asset tags");
        }
    }

    static async disposeAsset(assetTag) {
        try {
            await pool.query(assetTable.disposeAsset, [assetTag]);
        } catch (err) {
            throw new MyError("Asset Could Not Be Deleted");
        }
    }


    static async allocateAsset(assetTag, username) {
        if (!await Asset._doesAssetIDExist(assetTag)) {
            throw new MyError("Asset Does Not Exist");
        }

        await User.checkIfUserExists(username, "User Does Not Exist");
        utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Could Not Assign Asset To User",
            assetTag, username);
    }
}

export default Asset;