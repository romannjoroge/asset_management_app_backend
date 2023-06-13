import pool from "../../db2.js";
import locationTable from "./db_location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
export const createReader = function (hardwareKey, locationID) {
    return new Promise((res, rej) => {
        // Check if reader already exists
        pool.query(locationTable.getReader, [hardwareKey]).then((result) => {
            if (result.rowCount > 0) {
                return rej(new MyError(Errors[39]));
            }
            else {
                // Create Reader
                pool.query(locationTable.createReader, [locationID, hardwareKey]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[55]));
                });
            }
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
};
//# sourceMappingURL=readers.js.map