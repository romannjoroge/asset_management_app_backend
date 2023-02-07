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

    async storeInDB(){
        
    }
}

module.exports = Asset;