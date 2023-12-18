import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
import utility from "../utility/utility.js";

interface OTPDetails {
    id: number
    userid: number,
    otp: string,
    created_time: Date
}

interface OTPDetailsFetchResult {
    rowCount: number;
    rows: OTPDetails[]
}
export default class Auth {
    static #storeOtp(otp: string, userid: number, generated_time: Date): Promise<void> {
        return new Promise((res, rej) => {
            // Add the provided details to the database
            pool.query(authQueries.store_otp_in_database, [userid, otp, generated_time]).then((_: any) => {
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

    static generateOTP(userid: number): Promise<string> {
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
                    return res(otp);
                }).catch((err: MyError) => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_GENERATE_OTP));
                })
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_GENERATE_OTP))
            })
        });
    }

    static #getOTPDetails(userid: number): Promise<OTPDetails | void> {
        return new Promise((res, rej) => {
            // Get otp details
            pool.query(authQueries.get_user_otp_details, [userid]).then((data: OTPDetailsFetchResult) => {
                return res(data.rows[0]);
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_GET_OTP))
            })
        })
    }

    static #deleteOTPFromDB(otpid: number): Promise<void> {
        return new Promise((res, rej) => {
            pool.query(authQueries.delete_otp_record, [otpid]).then((_: any) => {
                return res()
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_DELETE_OTP))
            })
        });
    }

    static verifyOTP(userid: number, otp: string): Promise<boolean> {
        return new Promise((res, rej) => {
            // Check if user exists
            User.checkIfUserIDExists(userid).then(userExists => {
                // IF user does not exist false is returned
                if (userExists === false) {
                    return res(false)
                }

                // Check if there is an OTP for the user
                this.#getOTPDetails(userid).then(otpDetails => {
                    if(!otpDetails) {
                        return res(false);
                    }
                    
                    // Check if returned OTP is wrong
                    if (otpDetails.otp !== otp) {
                        return res(false);
                    }

                    const timeDifference = (utility.getTimeDifferenceInSeconds(otpDetails.created_time, new Date())) / 60;
                    // Check if OTP has expired
                    if (timeDifference > 10) {
                        return res(false);
                    }

                    // Delete OTP
                    this.#deleteOTPFromDB(otpDetails.id).then((_: any) => {
                        return res(true);
                    })
                })
            }).catch((err: any) => {
                return rej(new MyError(MyErrors2.NOT_VERIFY_OTP))
            })
        });
    }
}