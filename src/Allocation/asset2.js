const fs = require('fs');

// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing custom classes
const MyError = require('../../utility/myError');
const Folder = require('./folder');
const utility = require('../../utility/utility');
const Location = require('../Tracking/location');
const User = require('../Users/users');
const Category = require('../Allocation/category2');
const assetTable = require('../Allocation/db_assets');


class Asset{
    static assetStatusOptions = ['good', 'excellent', 'fair'];

    constructor(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName,
                acquisitionCost, insuranceValue, categoryName, attachments, assetTag, makeAndModelNo,
                serialNumber, residualValue){
                    utility.checkIfBoolean(fixed, "Invalid Fixed Status");
                    this.fixed = fixed;

                    utility.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
                    this.assetLifeSpan = assetLifeSpan;

                    this.acquisitionDate = utility.checkIfValidDate(acquisitionDate, "Invalid acquisition date");

                    this.locationID = locationID;

                    if (!status instanceof String){
                        throw new MyError("Invalid status");
                    }
                    utility.checkIfInList(Asset.assetStatusOptions, status.toLowerCase(), "Invalid status");
                    this.status = status;

                    this.custodianName = custodianName;

                    utility.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
                    this.acquisitionCost = acquisitionCost;

                    utility.checkIfNumberisPositive(insuranceValue, "Invalid insurance value");
                    this.insuranceValue = insuranceValue;

                    this.categoryName = categoryName;
                    
                    if (!Array.isArray(attachments)){
                        throw new MyError("Invalid attachments")
                    }else{
                        if (attachments.length){
                            for (let i = 0; i < attachments.length; i++){
                                if(!fs.existsSync(attachments[i])){
                                    throw new MyError("Invalid attachments");
                                }
                            }
                        }
                    }
                    this.attachments = attachments;
                    this.assetTag = assetTag;
                    this.makeAndModelNo = makeAndModelNo;
                    this.serialNumber = serialNumber;

                    utility.checkIfNumberisPositive(residualValue, "Invalid Residual Value");
                    this.residualValue = residualValue;
                }
    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    async initialize(){
        try{
            if (!await Category._doesCategoryExist(this.categoryName)){
                throw new MyError("Invalid category");
            }else{
                this.categoryID = await Category._getCategoryID(this.categoryName);
            }
        }catch(err){
            throw new MyError("Invalid category");
        }

        await Location.verifyLocationID(this.locationID, "Invalid location");
        await User.checkIfUserExists(this.custodianName, "Invalid custodian");

        if(!await Asset._doesAssetTagExist(this.assetTag)){
            throw new MyError("Asset Tag Has Already Been Assigned");
        }

        let depreciaitionType = Category._getCategoryDepreciationType(this.categoryName);
        if (depreciaitionType !== "Straight Line"){
            if(this.residualValue){
                throw new MyError("Invalid Residual Value for Depreciation Type");
            }
        }

        await this._storeAssetInAssetRegister();
    }

    static async _doesAssetTagExist(assetTag){
        let fetchResult;
        try{
            fetchResult = await pool.query(assetTable.doesAssetTagExist, [assetTag]);
        }catch(err){
            throw new MyError("Could Not Verify Asset Tag");
        }

        if (utility.isFetchResultEmpty(fetchResult)){
            return false;
        }else{
            return true;
        }
    }

    async _storeAssetInAssetRegister(){
        try{
            await pool.query(assetTable.addAssetToAssetRegister, [this.assetTag, this.makeAndModelNo, this.fixed, this.serialNumber,
                            this.acquisitionDate, this.locationID, this.status, this.custodianName, this.acquisitionCost, this.insuranceValue, this.categoryID,
                            this.assetLifeSpan]);
            Asset._insertAssetAttachments(this.assetTag, this.attachments);
        }catch(err){
            throw new MyError("Could not add asset to asset Register");
        }
    }

    static async _getAssetCategoryName(assetTag){
        let fetchResult;

        if (! await Asset._doesAssetTagExist(assetTag)){
            throw new MyError("Asset Does Not Exist");
        }else{
            try{
                fetchResult = await pool.query(assetTable.getAssetCategoryName, [assetTag]);
            }catch(err){
                throw new MyError("Could Not Get Category Name");
            }

            utility.verifyDatabaseFetchResults(fetchResult, "Nothing Was Returned From Database");

            return fetchResult.rows[0].name;
        }
    }

    static async _updateAssetAcquisitionDate(assetTag, newDate){
        await pool.query(assetTable.updateAssetAcquisitionDate, [newDate, assetTag]);
    }

    static async _updateAssetFixedStatus(assetTag, newFixedStatus){
        await pool.query(assetTable.updateAssetFixedStatus, [newFixedStatus, assetTag]);
    }

    static async _updateAssetLifeSpan(assetTag, newLifeSpan){
        await pool.query(assetTable.updateAssetLifeSpan, [newLifeSpan, assetTag]); 
    }

    static async _updateAssetLocation(assetTag, newLocation){
        await pool.query(assetTable.updateAssetLocation, [newLocation, assetTag]);
    }

    static async _updateAssetStatus(assetTag, newStatus){
        await pool.query(assetTable.updateAssetStatus, [newStatus, assetTag]);
    }

    static async _updateAssetCustodian(assetTag, newCustodian){
        await pool.query(assetTable.updateAssetCustodian, [newCustodian, assetTag]);
    }

    static async _updateAssetAcquisitionCost(assetTag, newAcquisitionCost){
        await pool.query(assetTable.updateAssetAcquisitionCost, [newAcquisitionCost, assetTag]);
    }
    
    static async _updateAssetInsuranceValue(assetTag, newInsuranceValue){
        await pool.query(assetTable.updateAssetInsuranceValue, [newInsuranceValue, assetTag]);
    }

    static async _updateAssetCategoryID(assetTag, newCategoryID){
        await pool.query(assetTable.updateAssetCategory, [newCategoryID, assetTag]);
    }

    static async _insertAssetAttachments(assetTag, attachments){
        for (let i = 0; i < attachments.length; i++){
            await pool.query(assetTable.addAssetFileAttachment, [assetTag, attachments[i]]);
        }
    }

    static async _updateAssetResidualValue(assetTag, residualValue){
        await pool.query(assetTable.updateAssetResidualValue, [residualValue, assetTag]);
    }

    static async updateAsset(updateAssetDict, assetTag){
        // Throw an error if no asset with asset tag exists
        if (!await Asset._doesAssetTagExist(assetTag)){
            throw new MyError("Asset Does Not Exist");
        }

        if ('fixed' in updateAssetDict){
            utility.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetFixedStatus, 
                                                        "Invalid Fixed Status", assetTag, 
                                                        updateAssetDict.fixed);
        }
        else if ('assetLifeSpan' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.assetLifeSpan, "Invalid asset life span");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLifeSpan, "Invalid asset life span",
                                                        assetTag, updateAssetDict.assetLifeSpan);
        }
        else if ('acquisitionDate' in updateAssetDict){
            newDate = utility.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionDate, "Invalid acquisition date",
                                                        assetTag, newDate);
        }
        else if ('locationID' in updateAssetDict){
            await Location.verifyLocationID(updateAssetDict.locationID, "Invalid location");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetLocation, "Invalid location",
                                                        assetTag, updateAssetDict.locationID);
        }
        else if('status' in updateAssetDict){
            if (!updateAssetDict.status instanceof String){
                throw new MyError("Invalid status");
            }
            utility.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetStatus, "Invalid status",
                                                        assetTag, updateAssetDict.status);
        }
        else if ('custodianName' in updateAssetDict){
            await User.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Invalid custodian",
                                                        assetTag, updateAssetDict.custodianName);
        }
        else if ('acquisitionCost' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetAcquisitionCost, "Invalid acquisition cost",
                                                        assetTag, updateAssetDict.acquisitionCost);
        }
        else if ('insuranceValue' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
            await utility.addErrorHandlingToAsyncFunction(Asset._updateAssetInsuranceValue, "Invalid insurance value",
                                                        assetTag, updateAssetDict.insuranceValue);
        }
        else if ('categoryName' in updateAssetDict){
            try{
                if (!await Category._doesCategoryExist(updateAssetDict.categoryName)){
                    throw new MyError("Invalid category");
                }else{
                    let categoryID = await Category._getCategoryID(updateAssetDict.categoryName);
                    await Asset._updateAssetCategoryID(assetTag, categoryID);
                }
            }catch(err){
                throw new MyError("Invalid category");
            }
        }
        else if('attachments' in updateAssetDict){
            if (!Array.isArray(updateAssetDict.attachments)){
                throw new MyError("Invalid attachments")
            }else{
                if (updateAssetDict.attachments.length){
                    for (let i = 0; i < updateAssetDict.attachments.length; i++){
                        if(!fs.existsSync(updateAssetDict.attachments[i])){
                            throw new MyError("Invalid attachments");
                        }
                    }
                }
            }
            await utility.addErrorHandlingToAsyncFunction(Asset._insertAssetAttachments, "Invalid attachments",
                                                        assetTag, updateAssetDict.attachments);
        }
        else if('residualValue' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.residualValue, "Invalid Residual Value");
            let assetCategoryName = utility.addErrorHandlingToAsyncFunction(Asset._getAssetCategoryName, "Could not get category name for asset",
                                                                            assetTag);
            if (assetCategoryName !== "Straight Line"){
                if(updateAssetDict.residualValue){
                    throw new MyError("Invalid Residual Value for the Depreciation Type");
                }
            }
            utility.addErrorHandlingToAsyncFunction(Asset._updateAssetResidualValue, "Invalid Residual Value",
                                                    assetTag, updateAssetDict.residualValue);
        }
    }

    static async displayAllAssetTags(){
        try{
            let fetchResult = await pool.query(assetTable.getAssetTags);
            let assetTags = fetchResult.rows.map(obj => obj.assettag);
            return assetTags;
        }catch(err){
            throw new MyError("Could not get asset tags");
        }
    }

    static async disposeAsset(assetTag){
        try{
            await pool.query(assetTable.disposeAsset, [assetTag]);
        }catch(err){
            throw new MyError("Asset Could Not Be Deleted");
        }
    }

    static async _insertDepreciationSchedule(assetTag, year, openBookValue, depreciationExpense, accumulatedDepreciation){
        await pool.query(assetTable.insertDepreciationSchedule, [year, openBookValue, depreciationExpense, accumulatedDepreciation, assetTag]);
    }

    static async _getCloseBookValue(assetTag, year){
        let fetchResult = await pool.query(assetTable.getCloseBookValue, [assetTag, year]);
        utility.verifyDatabaseFetchResults(fetchResult, "No Closing Book Value for specified year");
        return fetchResult.rows[0].closingBookValue;
    }

    static async _getAccumulatedDepreciation(assetTag){
        let fetchResult = await pool.query(assetTable.getAccumulatedDepreciation, [assetTag]);
        utility.verifyDatabaseFetchResults(fetchResult, "Could not sum previous depreciation expenses");
        return fetchResult.rows[0].accumulatedDepreciation;
    }

    static async createDepreciationSchedule(depreciationType, assetTag, assetLifeSpan, acquisitionCost, acquisitionDate, residualValue, depreciationPercentage){
        if (!await Asset._doesAssetTagExist(assetTag)){
            throw new MyError("Asset Does Not Exist");
        }

        let year;
        let openBookValue;
        let depreciationExpense;
        let accumulatedDepreciation;

        for (let i = 0; i < assetLifeSpan; i++){
            year = acquisitionDate.getFullYear() + i;

            if (i === 0){
                openBookValue = acquisitionCost;
                accumulatedDepreciation = depreciationExpense;
            }else{
                openBookValue = utility.addErrorHandlingToAsyncFunction(Asset._getCloseBookValue, "No close book value",
                                                                            assetTag, year);                 
                accumulatedDepreciation = utility.addErrorHandlingToAsyncFunction(Asset._getAccumulatedDepreciation, "Could Not Get Accumulated Depreciation",
                                                assetTag);
            }

            if (depreciationType === "Straight Line"){
                depreciationExpense = ((acquisitionCost - residualValue) / assetLifeSpan);

            }else if (depreciationType === "Double Declining Balance"){
                depreciationExpense = 2 * (1 / assetLifeSpan) * openBookValue;

            }else if (depreciationType === "Written Down Value"){
                depreciationExpense = openBookValue * (depreciationPercentage / 100);

            }else{
                throw new MyError("Depreciation Type is not supported");
            }

            utility.addErrorHandlingToAsyncFunction(Asset._insertDepreciationSchedule, "Invalid Depreciation Schedule Entry",
                                                            assetTag, openBookValue, year, openBookValue, depreciationExpense, accumulatedDepreciation);
        }
    }

    static async allocateAsset(assetTag, username){
        if (!await Asset._doesAssetTagExist(assetTag)){
            throw new MyError("Asset Does Not Exist");
        }

        await User.checkIfUserExists(username, "User Does Not Exist");
        utility.addErrorHandlingToAsyncFunction(Asset._updateAssetCustodian, "Could Not Assign Asset To User", 
                                                assetTag, username);
    }
}

module.exports = Asset;