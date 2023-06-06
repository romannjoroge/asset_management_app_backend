// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import MyError from '../utility/myError.js';
import utility from '../utility/utility.js';
import userTable from './db_users.js'

class User {
    constructor(){}

    static async checkIfUserExists(username, errorMessage) {
        try{
            let fetchResults = await pool.query(userTable.checkIfUserInDB, [username]);
            utility.verifyDatabaseFetchResults(fetchResults, errorMessage);
        }catch(err){
            throw new MyError(errorMessage);
        }
    }
}

export default User;