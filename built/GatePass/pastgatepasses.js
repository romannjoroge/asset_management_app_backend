import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js';
export function getPastRequests(username) {
    return new Promise((res, rej) => {
        // Check if user exists
        console.log(username);
        User.checkIfUserExists(username).then(exists => {
            if (exists === false) {
                console.log(1);
                return rej(new MyError(Errors[30]));
            }
            // Get past requests
            pool.query(gatePassTable.getPreviousGatePasses, [username]).then((data) => {
                console.log(3);
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
//# sourceMappingURL=pastgatepasses.js.map