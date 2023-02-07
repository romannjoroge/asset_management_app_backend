// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing custom classes
const MyError = require('../../utility/myError');
const Folder = require('./folder');
const utility = require('../../utility/utility');
const Location = require('../Tracking/location');
const User = require('../Users/users');


class Asset{
    static assetStatusOptions = ['good', 'excellent', 'fair'];

    constructor(fixed, assetLifeSpan, acquisitionDate, locationID, status, custodianName,
                acquisitionCost, insuranceValue, categoryName, attachments){
                    utility.checkIfBoolean(fixed, "Invalid Fixed Status");
                    this.fixed = fixed;

                    utility.checkIfNumberisPositive(assetLifeSpan, "Invalid asset life span");
                    this.assetLifeSpan = assetLifeSpan;

                    this.acquisitionDate = utility.checkIfValidDate(acquisitionDate, "Invalid acquisition date");

                    Location.verifyLocationID(locationID, "Invalid location");
                    this.locationID = locationID;

                    if (!status instanceof String){
                        throw new MyError("Invalid status");
                    }
                    utility.checkIfInList(Asset.assetStatusOptions, status.toLowerCase(), "Invalid status");

                    User.checkIfUserExists(custodianName, "Invalid custodian");

                    utility.checkIfNumberisPositive(acquisitionCost, "Invalid acquisition cost");
                }
}

module.exports = Asset;