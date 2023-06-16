import Location from "./location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import locationTable from "./db_location.js";
import pool from "../../db2.js";
export function updateLocation(locationID, updateJSON) {
    return new Promise((res, rej) => {
        // Check that location exists
        Location.verifyLocationID(locationID).then((exists) => {
            if (exists === false) {
                return rej(new MyError(Errors[3]));
            }
            // Verify each item in updateJSON
            let promises = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({ [key2]: value }, locationID)));
            Promise.all(promises).then(() => {
                // Update Each item
                let promises2 = [];
                Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(locationID, { [key2]: value })));
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
        }).catch((err) => {
            return rej(err);
        });
    });
}
function _updateInDb(locationID, updateJSON) {
    return new Promise((res, rej) => {
        let updateQuery;
        let inputs;
        if (updateJSON.name) {
            updateQuery = "UPDATE Location SET name = $1 WHERE id = $2";
            inputs = [updateJSON.name, locationID];
        }
        else if (updateJSON.parentlocationid) {
            updateQuery = "UPDATE Location SET parentlocationid = $1 WHERE id = $2";
            inputs = [updateJSON.parentlocationid, locationID];
        }
        else {
            return rej(new MyError(Errors[43]));
        }
        // Run update query
        pool.query(updateQuery, inputs).then(() => {
            return res();
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
function _verify(updateDetails, locationID) {
    return new Promise((res, rej) => {
        if (updateDetails.name) {
            // Check if location name already exists in the parent location
            pool.query(locationTable.doesLocationNameExist, [updateDetails.name, locationID]).then((result) => {
                if (result.rowCount > 0) {
                    return rej(new MyError(Errors[32]));
                }
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }
        if (updateDetails.parentlocationid) {
            // Check if parent location exists
            Location.verifyLocationID(updateDetails.parentlocationid).then(exist => {
                if (exist === false) {
                    return rej(new MyError(Errors[3]));
                }
                return res();
            }).catch(err => {
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(Errors[9]));
                }
            });
        }
    });
}
//# sourceMappingURL=update.js.map