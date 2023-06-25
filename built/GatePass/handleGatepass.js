import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js';
export function handleRequest(accept, comment, gatepassid) {
    return new Promise((res, rej) => {
        // Check if gatepass exists
        pool.query(gatePassTable.doesGatePassExist, [gatepassid]).then((data) => {
            if (data.rowCount <= 0) {
                return rej(new MyError(Errors[31]));
            }
            // Handle request
            pool.query(gatePassTable.handleGatePass, [accept, comment, gatepassid]).then(_ => {
                return res();
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
//# sourceMappingURL=handleGatepass.js.map