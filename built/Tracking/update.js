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
            // Update each value in the updateJSON
            let promises = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises.push(updateItems({ [key2]: value })));
            Promise.all(promises).then(() => {
                return res();
            }).catch(err => {
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(Errors[9]));
                }
            });
            function updateItems(props) {
                return new Promise((res, rej) => {
                    if ("name" in props) {
                        if (props.name === undefined) {
                            return rej(new MyError(Errors[53]));
                        }
                        _updateLocationName(props.name, locationID).then(() => {
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
                    if ("parentlocationid" in props) {
                        if (props.parentlocationid === undefined) {
                            return rej(new MyError(Errors[53]));
                        }
                        _updateParentLocation(props.parentlocationid, locationID).then(() => {
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
        }).catch((err) => {
            return rej(err);
        });
    });
}
function _updateLocationName(name, locationID) {
    return new Promise((res, rej) => {
        // Check if location name already exists in the parent location
        pool.query(locationTable.doesLocationNameExist, [name, locationID]).then((result) => {
            if (result.rowCount > 0) {
                return rej(new MyError(Errors[32]));
            }
            // Update location name
            _updateInDb(locationID, { name }).then(() => {
                return res();
            }).catch(err => {
                return rej(err);
            });
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
function _updateInDb(locationID, updateJSON) {
    return new Promise((res, rej) => {
        let updateQuery;
        let inputs;
        if ('name' in updateJSON) {
            updateQuery = "UPDATE Location SET name = $1 WHERE id = $2";
            inputs = [updateJSON.name, locationID];
        }
        else if ('parentlocationid' in updateJSON) {
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
function _updateParentLocation(parentLocationID, locationID) {
    return new Promise((res, rej) => {
        // Check if parent location exists
        Location.verifyLocationID(parentLocationID).then(exist => {
            if (exist === false) {
                return rej(new MyError(Errors[3]));
            }
            // Update database
            _updateInDb(locationID, { parentlocationid: parentLocationID }).then(() => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        }).catch(err => {
            return rej(new MyError(Errors[9]));
        });
    });
}
//# sourceMappingURL=update.js.map