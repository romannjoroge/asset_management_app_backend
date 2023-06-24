// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import userTable from './db_users.js'

interface UserFromDB {
    fname: string;
    lname: string;
    email: string;
    password: string;
    username: string;
    companyname: string;
    usertype: number;
    delete: boolean
}

interface UserFetchResult {
    rowCount: number;
    rows: UserFromDB[]
}



class User {
    constructor(){}

    static async checkIfUserExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfUserInDB, [username]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false);
                }
            }).catch(err => {
                console.log(err);
                res(false);
            });
        });
    }

    static async checkIfUserNameExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfNameExists, [username]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false);
                }
            }).catch(err => {
                console.log(err);
                res(false);
            });
        });
    }
}

export default User;