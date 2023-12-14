import bcrypt from 'bcrypt';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';
import pool from '../../db2.js';
import authTable from './db.js';

interface GetAuthenticationDetailsFetchRequest{
    rowCount: number;
    rows: {id: number}[]
}

/**
 * 
 * @param username Username of the user
 * @param password Password of the user
 * @description This function is used to check if the given email password combo is correct for the purpose of authentication
 */
export default function verifyAuthenticationDetails(username: string, password: string): Promise<boolean> {
    return new Promise((res, rej) => {
        // Encrypt password
        bcrypt.hash(password, 10).then(hashedPass => {
            // Return if any user has the encrypted password and the username
            pool.query(authTable.confirm_authentication_details, [username, password]).then((fetchResult: GetAuthenticationDetailsFetchRequest) => {
                if (fetchResult.rowCount <= 0) {
                    return res(false);
                }
                return res(true);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_LOGIN_USER))
            })
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_LOGIN_USER))
        })
    });
}