import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
export default class Auth {
    static #storeOtp(otp: string, userid: number, generated_time: Date): Promise<void> {
        return new Promise((res, rej) => {
            // Add the provided details to the database
            pool.query(authQueries, [userid, otp, generated_time]).then((_: any) => {
                return res();
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_ADD_OTP))
            })
        })
    }

    static #generateOTPString(): string {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        return randomNumber.toString();
    }

    static generateOTP(userid: number): Promise<void> {
        return new Promise((res, rej) => {
            // If user does not exist throw error
            User.checkIfUserIDExists(userid).then(userExists => {
                if(userExists === false) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST))
                }

                // Generate the random OTP
                const otp = this.#generateOTPString();

                // Store details
                this.#storeOtp(otp, userid, new Date()).then(_ => {
                    return res();
                })
            }).catch(err => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_OTP))
            })
        });
    }
}