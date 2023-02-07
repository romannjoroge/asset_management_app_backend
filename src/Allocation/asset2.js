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
                serialNumber){
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
                }
    // Since the constructor cannot make asynchronous calls a seprate initialize function is needed to initialize
    // asynchronous values
    async initialize(){
        try{
            if (!await Category.doesCategoryExist(this.categoryName)){
                throw new MyError("Invalid category");
            }else{
                this.categoryID = await Category.getCategoryID(this.categoryName);
            }
        }catch(err){
            throw new MyError("Invalid category");
        }

        await Location.verifyLocationID(this.locationID, "Invalid location");
        await User.checkIfUserExists(this.custodianName, "Invalid custodian");
        await Asset.doesAssetTagExist(this.assetTag, "Asset Tag Has Already Been Assigned");
    }

    static async doesAssetTagExist(assetTag, errorMessage){
        try{
            let fetchResult = await pool.query(assetTable.doesAssetTagExist, [assetTag]);
            utility.verifyDatabaseFetchResults(fetchResult, errorMessage);
        }catch(err){
            throw new MyError(errorMessage);
        }
    }

    async storeAssetInAssetRegister(){
        try{
            await pool.query(assetTable.addAssetToAssetRegister, [this.assetTag, this.makeAndModelNo, this.fixed, this.serialNumber,
                            this.acquisitionDate, this.locationID, this.status, this.custodianName, this.acquisitionCost, this.insuranceValue, this.categoryID,
                            this.assetLifeSpan]);
            for (let i = 0; i < this.attachments.length; i++){
                await pool.query(assetTable.addAssetFileAttachment, [this.assetTag. this.attachments[i]]);
            }
        }catch(err){
            throw new MyError("Could not add asset to asset Register");
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

    static async updateAsset(updateAssetDict, assetTag){
        // Throw an error if no asset with asset tag exists
        await Asset.doesAssetTagExist(assetTag, "Asset Does Not Exist");

        if ('fixed' in updateAssetDict){
            utility.checkIfBoolean(updateAssetDict.fixed, "Invalid Fixed Status");
            await Asset._updateAssetFixedStatus(assetTag, updateAssetDict.fixed);
        }
        else if ('assetLifeSpan' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.assetLifeSpan, "Invalid asset life span");
            await Asset._updateAssetLifeSpan(assetTag, updateAssetDict.assetLifeSpan);
        }
        else if ('acquisitionDate' in updateAssetDict){
            newDate = utility.checkIfValidDate(updateAssetDict.acquisitionDate, "Invalid acquisition date");
            await Asset._updateAssetAcquisitionDate(assetTag, newDate);
        }
        else if ('locationID' in updateAssetDict){
            await Location.verifyLocationID(updateAssetDict.locationID, "Invalid location");
            await Asset._updateAssetLocation(assetTag, updateAssetDict.locationID);
        }
        else if('status' in updateAssetDict){
            if (!updateAssetDict.status instanceof String){
                throw new MyError("Invalid status");
            }
            utility.checkIfInList(Asset.assetStatusOptions, updateAssetDict.status.toLowerCase(), "Invalid status");
            await Asset._updateAssetStatus(assetTag, updateAssetDict.status);
        }
        else if ('custodianName' in updateAssetDict){
            await User.checkIfUserExists(updateAssetDict.custodianName, "Invalid custodian");
            await Asset._updateAssetCustodian(assetTag, updateAssetDict.custodianName);
        }
        else if ('acquisitionCost' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.acquisitionCost, "Invalid acquisition cost");
            await Asset._updateAssetAcquisitionCost(assetTag, updateAssetDict.acquisitionCost);
        }
        else if ('insuranceValue' in updateAssetDict){
            utility.checkIfNumberisPositive(updateAssetDict.insuranceValue, "Invalid insurance value");
            await Asset._updateAssetInsuranceValue(assetTag, updateAssetDict.insuranceValue);
        }
        else if ('categoryName' in updateAssetDict){
            try{
                if (!await Category.doesCategoryExist(updateAssetDict.categoryName)){
                    throw new MyError("Invalid category");
                }else{
                    let categoryID = await Category.getCategoryID(updateAssetDict.categoryName);
                    await Asset._updateAssetCategoryID(assetTag, categoryID);
                }
            }catch(err){
                throw new MyError("Invalid category");
            }
        }
    }
}

module.exports = Asset;