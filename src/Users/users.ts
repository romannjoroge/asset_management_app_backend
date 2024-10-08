// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';

// Importing custom classes
import userTable from './db_users.js'
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';

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

interface GetUserIDFetchResult {
    rowCount: number;
    rows: {id: number}[]
}

interface GetUserNameFetchResult {
    rowCount: number;
    rows: {username: string}[]
}

interface GetUserEmailFetchResult {
    rowCount: number;
    rows: {email: string}[]
}

export enum UserRoles {
    "COMPANY_ADMIN" = "Company Administrator",
    "USER_MANAGER" = "User Manager",
    "ASSET_ADMIN" = "Asset Administrator",
    "ASSET_RECONCILER" = "Asset Reconciler",
    "RFID_READER" = "RFID Reader",
    "ASSET_USER" = "Asset User",
    "GATEPASS_AUTH" = "GatePass Authorizer",
    "REPORT_GEN" = "Report Generator"
}



class User {
    constructor(){}

    static async getName(username: string): Promise<string | never> {
        return new Promise((res, rej) => {
            pool.query(userTable.getName, [username]).then((data) => {
                if(data.rowCount > 0) {
                    return res(data.rows[0]['name']);
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        });
    }

    static async checkIfUserExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfUserInDB, [username]).then((data: UserFetchResult) => {
                console.log(data);
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

    static async getCompanyName(userID: number): Promise<string> {
        try {
            let results = await getResultsFromDatabase<{companyname: string}>(
                "SELECT companyname FROM User2 WHERE id = $1",
                [userID]
            )
            return results[0].companyname;
        } catch(err) {
            console.log(err);
            throw new MyError(MyErrors2.USER_NOT_EXIST);
        }
    }

    static checkIfUserIDExists(userID: number): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfUserIDExists, [userID]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false)
                }
            }).catch(_ => {
                rej(new MyError(MyErrors2.USER_NOT_EXIST))
            })
        });
    }

    static checkIfUserNameExists(username: string): Promise<boolean> {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfNameExists, [username]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    res(true);
                } else {
                    res(false);
                }
            }).catch((err: any) => {
                console.log(err);
                res(false);
            });
        });
    }

    /**
     * 
     * @param username Username of user
     * @description Gets the id of the user from their username
     */
    static getUserID(username: string): Promise<number> {
        return new Promise((res, rej) => {
            pool.query(userTable.getUserID, [username]).then((fetchResult: GetUserIDFetchResult) => {
                if (fetchResult.rowCount <=0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }

                return res(fetchResult.rows[0].id);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GET_USER_ID));
            })
        })
    }

    /**
     * 
     * @param userid id of the user to get username of
     * @returns username of the user
     */
    static getUsername(userid: number): Promise<string> {
        return new Promise((res, rej) => {
            pool.query(userTable.getUsername, [userid]).then((fetchResult: GetUserNameFetchResult) => {
                if(fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }

                return res(fetchResult.rows[0].username);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.USER_NOT_EXIST));
            })
        })
    }

    /**
     * 
     * @param userid ID of the user to get email of
     * @returns Email of user
     * @description Returns the email of user with given ID
     */
    static getEmail(userid: number): Promise<string> {
        return new Promise((res, rej) => {
            pool.query(userTable.getEmail, [userid]).then((fetchResult: GetUserEmailFetchResult) => {
                if(fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }

                return res(fetchResult.rows[0].email);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.USER_NOT_EXIST));
            })
        })
    }
}

export default User;