import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js';
export function getPastRequests(userid) {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserIDExists(userid).then(exists => {
            if (exists === false) {
                console.log(1);
                return rej(new MyError(Errors[30]));
            }
            // Get past requests
            pool.query(gatePassTable.getPreviousGatePasses, [userid]).then((data) => {
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