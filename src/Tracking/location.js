// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import MyError from '../utility/myError.js';
import Folder from '../Allocation/Folder/folder.js';
import utility from '../utility/utility.js';
import locationTable from './db_location.js';

class Location {
    constructor (){}

    static async verifyLocationID(id){
        // Returns true if locationID exists in the database, false otherwise
        let fetchResult;
        try{
            fetchResult = await pool.query(locationTable.getLocation, [id]);
        }catch(err){
            throw new MyError(message);
        }
        return (fetchResult.rowCount > 0);
    }
}

export default Location;