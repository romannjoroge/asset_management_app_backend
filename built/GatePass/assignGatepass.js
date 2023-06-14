import Asset from "../Allocation/Asset/asset2.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js';
export function assignGatePass(assetIDs, username, reason, leavingTime, returnTime, entry) {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserExists(username).then(userExist => {
            if (userExist === false) {
                return rej(new MyError(Errors[30]));
            }
            // Validate Details
            if (returnTime < leavingTime) {
                return rej(new MyError(Errors[59]));
            }
            // Validate Assets
            let promises = [];
            for (var i in assetIDs) {
                promises.push(Asset._doesAssetIDExist(assetIDs[i]));
            }
            Promise.all(promises).then(doesExist => {
                let assetDoesNotExist = doesExist.some((elem) => elem === false);
                if (assetDoesNotExist === true) {
                    return rej(new MyError(Errors[29]));
                }
                // Create GatePass
                pool.query(gatePassTable.createGatePass, [leavingTime, returnTime, entry, username, reason]).then(_ => {
                    // Get Created GatePassID
                    pool.query(gatePassTable.getGatePass, [leavingTime, returnTime, entry, username, reason]).then((data) => {
                        if (data.rowCount === 0) {
                            return rej(new MyError(Errors[9]));
                        }
                        let gatePassID = data.rows[0].id;
                        // Create GatePassAsset
                        let promises = [];
                        for (var i in assetIDs) {
                            promises.push(insertGatePassEntry(assetIDs[i], gatePassID));
                        }
                        Promise.all(promises).then(_ => {
                            return res();
                        }).catch(err => {
                            console.log(err);
                            return rej(new MyError(Errors[9]));
                        });
                    }).catch(err => {
                        console.log(err);
                        return rej(new MyError(Errors[9]));
                    });
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
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
}
function insertGatePassEntry(assetID, gatePassID) {
    return new Promise((res, rej) => {
        // Insert into database
        console.log(gatePassID, assetID);
        pool.query(gatePassTable.createGatePassAsset, [gatePassID, assetID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}
//# sourceMappingURL=assignGatepass.js.map