// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing custom classes
const MyError = require('../../utility/myError');
const Folder = require('../Allocation/folder');
const utility = require('../../utility/utility');
const userTable = require('../Users/db_users');

class User {
    constructor(){}

    static async checkIfUserExists(username, errorMessage) {
        try{
            await pool.query(userTable.checkIfUserInDB, [username]);
        }catch(err){
            throw new MyError(errorMessage);
        }
    }
}

module.exports = User;