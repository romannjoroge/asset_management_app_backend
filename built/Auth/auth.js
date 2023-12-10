var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Auth_storeOtp, _Auth_generateOTPString;
import pool from "../../db2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
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
                    return res();
                });
            }).catch(err => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_OTP));
            });
        });
    }
}
_a = Auth, _Auth_storeOtp = function _Auth_storeOtp(otp, userid, generated_time) {
    return new Promise((res, rej) => {
        // Add the provided details to the database
        pool.query(authQueries, [userid, otp, generated_time]).then((_) => {
            return res();
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_OTP));
        });
    });
}, _Auth_generateOTPString = function _Auth_generateOTPString() {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return randomNumber.toString();
};
export default Auth;
//# sourceMappingURL=auth.js.map