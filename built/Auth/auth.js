var _a, _Auth_store_otp;
import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import authQueries from './db.js';
export class Auth {
}
_a = Auth, _Auth_store_otp = function _Auth_store_otp(otp, userid, generated_time) {
    return new Promise((res, rej) => {
        // Add the provided details to the database
        pool.query(authQueries, [userid, otp, generated_time]).then((_) => {
            return res();
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_OTP));
        });
    });
};
//# sourceMappingURL=auth.js.map