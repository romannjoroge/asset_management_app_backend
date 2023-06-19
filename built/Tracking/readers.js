import pool from "../../db2.js";
import locationTable from "./db_location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import Location from "./location.js";
export const createReader = function (hardwareKey, locationID, noantennae) {
    return new Promise((res, rej) => {
        // Check if reader already exists
        pool.query(locationTable.getReader, [hardwareKey]).then((result) => {
            if (result.rowCount > 0) {
                return rej(new MyError(Errors[39]));
            }
            else {
                // Create Reader
                pool.query(locationTable.createReader, [locationID, hardwareKey, noantennae]).then(_ => {
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
export function updateReader(readerID, updateJSON) {
    return new Promise((res, rej) => {
        // Check that reader exists
        pool.query(locationTable.getReaderFromID, [readerID]).then((result) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[56]));
            }
            // Verify each item in updateJSON
            let promises = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({ [key2]: value }, readerID)));
            Promise.all(promises).then(() => {
                // Update Each item
                let promises2 = [];
                Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(readerID, { [key2]: value })));
                Promise.all(promises2).then(() => {
                    return res();
                }).catch(err => {
                    if (err instanceof MyError) {
                        return rej(err);
                    }
                    else {
                        return rej(new MyError(Errors[9]));
                    }
                });
            }).catch(err => {
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(Errors[9]));
                }
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}
function _verify(updateDetails, readerID) {
    return new Promise((res, rej) => {
        // Check if hardware key exists
        if (updateDetails.hardwarekey) {
            pool.query(locationTable.getReader, [updateDetails.hardwarekey]).then((result) => {
                if (result.rowCount > 0) {
                    return rej(new MyError(Errors[39]));
                }
                else {
                    return res();
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }
        if (updateDetails.locationid) {
            Location.verifyLocationID(updateDetails.locationid).then((exists) => {
                if (exists == false) {
                    return rej(new MyError(Errors[3]));
                }
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[61]));
            });
        }
        if (updateDetails.noantennae) {
            return res();
        }
    });
}
function _updateInDb(readerID, updateDetails) {
    return new Promise((res, rej) => {
        let updateQuery;
        if (updateDetails.hardwarekey) {
            updateQuery = "UPDATE RFIDReader SET hardwarekey = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.hardwarekey, readerID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[63]));
            });
        }
        if (updateDetails.locationid) {
            updateQuery = "UPDATE RFIDReader SET locationid = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.locationid, readerID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[63]));
            });
        }
        if (updateDetails.noantennae) {
            updateQuery = "UPDATE RFIDReader SET noantennae = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.noantennae, readerID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[63]));
            });
        }
    });
}
//# sourceMappingURL=readers.js.map