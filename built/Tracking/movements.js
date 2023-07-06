import pool from "../../db2.js";
import { Errors } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
function assetsLeavingLocationAndIfAuthorized(locationID) {
    return new Promise((res, rej) => {
        // Get all assets leaving a location and join with gatepass
        pool.query(locationTable.getAllAssetsLeavingLocationAndIfAuthorized, [locationID]).then((result) => {
            res(result.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[74]));
        });
    });
}
function updateApprovedStatusOfMovement(movement) {
    let gatepassdatestring = movement.gatepassdate.toDateString();
    let scannedtimestring = movement.scannedtime.toDateString();
    if (gatepassdatestring == scannedtimestring) {
        movement.authorized = true;
    }
    else {
        movement.authorized = false;
    }
    return movement;
}
export function getAssetsLeavingLocationAndIfAuthorized(locationID) {
    return new Promise((res, rej) => {
        assetsLeavingLocationAndIfAuthorized(locationID).then(movements => {
            let updatedMovements = [];
            movements.forEach(movement => {
                updatedMovements.push(updateApprovedStatusOfMovement(movement));
            });
            return res(updatedMovements);
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(Errors[74]));
            }
        });
    });
}
//# sourceMappingURL=movements.js.map