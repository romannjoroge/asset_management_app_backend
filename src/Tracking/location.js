// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing custom classes
const MyError = require('../../utility/myError');
const Folder = require('../Allocation/folder');
const utility = require('../../utility/utility');
const locationTable = require('../Tracking/db_location');

class Location {
    constructor (){}

    static async verifyLocationID(id, message){
        // Throws an error if location doesn't exist and returns it's name if it does exist
        let fetchResult;
        try{
            fetchResult = await pool.query(locationTable.getLocation, [id]);
        }catch(err){
            throw new MyError(message);
        }
        return fetchResult.rows[0].name;
    }
}

module.exports = Location;