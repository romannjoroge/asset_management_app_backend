import bcrypt from 'bcrypt';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';
import pool from '../../db2.js';
import authTable from './db.js';

interface GetEncryptedPasswordFetchRequest{
    rowCount: number;
    rows: {password: string}[]
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
            pool.query(authTable.get_encrypted_password, [username]).then((fetchResult: GetEncryptedPasswordFetchRequest) => {
                if (fetchResult.rowCount <= 0) {
                    return res(false);
                }
                bcrypt.compare(password, fetchResult.rows[0].password).then(isSame => {
                    return res(isSame);
                })
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_LOGIN_USER))
            })
        }).catch((err: any) => {
            return rej(new MyError(MyErrors2.NOT_LOGIN_USER))
        })
    });
}