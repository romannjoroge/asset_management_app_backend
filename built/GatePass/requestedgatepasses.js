import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js';
export function getRequestedGatePasses(username) {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserExists(username).then(exists => {
            if (exists === false) {
                return rej(new MyError(Errors[30]));
            }
            // Get requested requests
            pool.query(gatePassTable.getRequestedGatePasses, [username]).then((data) => {
                return res(data.rows);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}
//# sourceMappingURL=requestedgatepasses.js.map