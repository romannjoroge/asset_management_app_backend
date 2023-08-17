import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import db_gatepass from "./db_gatepass.js";
/**
 *
 * @param assetID The id of the asset to test for
 * @param scannedTime The time that the asset was found moving, will be used to confirm if it has a gatepass for that date.
 * @param fromLocation The location the asset should be leaving from. It is optional.
 * @param toLocation The location the asset should be going to. It is optional.
 * @returns whether the asset has a gatepass or not.
 */
export function doesAssetHaveGatepass(assetID, scannedTime, fromLocation, toLocation) {
    return new Promise((res, rej) => {
        // Check if assetid exists
        Asset._doesAssetIDExist(assetID).then(doesExist => {
            if (doesExist == false) {
                return res(false);
            }
            // Check if location is valid
            checkIfGatepassValid(scannedTime, assetID, fromLocation, toLocation).then(isValid => {
                return res(isValid);
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
                }
            });
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
        });
    });
}
function checkIfGatepassValid(scannedTime, assetID, fromLocation, toLocation) {
    return new Promise((res, rej) => {
        let beforeDate = new Date(scannedTime.getFullYear(), scannedTime.getMonth(), scannedTime.getDate(), 0, 0, 0);
        let afterDate = new Date(scannedTime.getFullYear(), scannedTime.getMonth(), scannedTime.getDate() + 1, 23, 59, 59);
        if (fromLocation != null && toLocation != null) {
            pool.query(db_gatepass.getGatepassWithLocationAndScannedTime, [assetID, beforeDate, afterDate, fromLocation]).then((result) => {
                if (result.rowCount <= 0) {
                    return res(false);
                }
                pool.query(db_gatepass.getGatepassWithLocationAndScannedTime, [assetID, beforeDate, afterDate, toLocation]).then((result2) => {
                    if (result2.rowCount <= 0) {
                        return res(false);
                    }
                    return res(true);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
            });
        }
        else if (fromLocation != null) {
            pool.query(db_gatepass.getGatepassWithLocationAndScannedTime, [assetID, beforeDate, afterDate, fromLocation]).then((result) => {
                if (result.rowCount <= 0) {
                    return res(false);
                }
                return res(true);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
            });
        }
        else if (toLocation != null) {
            pool.query(db_gatepass.getGatepassWithLocationAndScannedTime, [assetID, beforeDate, afterDate, toLocation]).then((result) => {
                if (result.rowCount <= 0) {
                    return res(false);
                }
                return res(true);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_GATEPASS));
            });
        }
    });
}
//# sourceMappingURL=hasGatepass.js.map