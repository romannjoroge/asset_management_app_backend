import locationTable from "./db_location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
export const createAntennae = function (antennaeno, readerID, entry) {
    return new Promise((res, rej) => {
        // Check if reader exists
        pool.query(locationTable.getReaderFromID, [readerID]).then((readerResult) => {
            if (readerResult.rowCount <= 0) {
                return rej(new MyError(Errors[56]));
            }
            // Check if antennae already exists
            pool.query(locationTable.doesAntennaeExist, [antennaeno, readerID]).then((result) => {
                if (result.rowCount > 0) {
                    return rej(new MyError(Errors[40]));
                }
                // Check if antennae number is valid
                if (antennaeno < 1 || antennaeno > readerResult.rows[0].noantennae) {
                    return rej(new MyError(Errors[57]));
                }
                // Create Antennae
                pool.query(locationTable.createAntennae, [antennaeno, readerID, entry]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[58]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
};
//# sourceMappingURL=antennae.js.map