import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
export class Auth {
    static #store_otp(otp: string, userid: number, generated_time: Date): Promise<void> {
        return new Promise((res, rej) => {
            // Add the provided details to the database
            pool.query(authQueries, [userid, otp, generated_time]).then((_: any) => {
                return res();
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_ADD_OTP))
            })
        })
    }
}