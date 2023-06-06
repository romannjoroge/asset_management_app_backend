// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import MyError from '../utility/myError.js';
import locationTable from './db_location.js';
import { Errors } from '../utility/constants.js';

class Location {
    constructor (){}

    static async verifyLocationID(id: number): Promise<boolean | never>{
        // Returns true if locationID exists in the database, false otherwise
        let fetchResult;
        try{
            fetchResult = await pool.query(locationTable.getLocation, [id]);
        }catch(err){
            throw new MyError(Errors[3]);
        }
        return (fetchResult.rowCount > 0);
    }
}

export default Location;