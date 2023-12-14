var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Auth_storeOtp, _Auth_generateOTPString, _Auth_getOTPDetails, _Auth_deleteOTPFromDB;
import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
import utility from "../utility/utility.js";
class Auth {
    static generateOTP(userid) {
        return new Promise((res, rej) => {
            // If user does not exist throw error
            User.checkIfUserIDExists(userid).then(userExists => {
                if (userExists === false) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                // Generate the random OTP
                const otp = __classPrivateFieldGet(this, _a, "m", _Auth_generateOTPString).call(this);
                // Store details
                __classPrivateFieldGet(this, _a, "m", _Auth_storeOtp).call(this, otp, userid, new Date()).then(_ => {
                    return res(otp);
                });
            }).catch(err => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_OTP));
            });
        });
    }
    static verifyOTP(userid, otp) {
        return new Promise((res, rej) => {
            // Check if user exists
            User.checkIfUserIDExists(userid).then(userExists => {
                // IF user does not exist false is returned
                if (userExists === false) {
                    return res(false);
                }
                // Check if there is an OTP for the user
                __classPrivateFieldGet(this, _a, "m", _Auth_getOTPDetails).call(this, userid).then(otpDetails => {
                    if (!otpDetails) {
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
                    __classPrivateFieldGet(this, _a, "m", _Auth_deleteOTPFromDB).call(this, otpDetails.id).then((_) => {
                        return res(true);
                    });
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_VERIFY_OTP));
            });
        });
    }
}
_a = Auth, _Auth_storeOtp = function _Auth_storeOtp(otp, userid, generated_time) {
    return new Promise((res, rej) => {
        // Add the provided details to the database
        pool.query(authQueries.store_otp_in_database, [userid, otp, generated_time]).then((_) => {
            return res();
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_OTP));
        });
    });
}, _Auth_generateOTPString = function _Auth_generateOTPString() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
}, _Auth_getOTPDetails = function _Auth_getOTPDetails(userid) {
    return new Promise((res, rej) => {
        // Get otp details
        pool.query(authQueries.get_user_otp_details, [userid]).then((data) => {
            return res(data.rows[0]);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_OTP));
        });
    });
}, _Auth_deleteOTPFromDB = function _Auth_deleteOTPFromDB(otpid) {
    return new Promise((res, rej) => {
        pool.query(authQueries.delete_otp_record, [otpid]).then((_) => {
            return res();
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_DELETE_OTP));
        });
    });
};
export default Auth;
//# sourceMappingURL=auth.js.map