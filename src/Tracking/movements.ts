import pool from "../../db2.js";
import { Errors } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";

interface movement {
    barcode: string;
    scannedtime: Date;
    gatepassdate: Date;
    description: string;
    condition: string;
    category: string;
    serialnumber: string;
    responsibleuser: string;
    authorized: boolean;
}

interface movementDBRequest {
    rows: movement[];
    rowCount: number;
}

function assetsLeavingLocationAndIfAuthorized(locationID: number): Promise<movement[]> {
    return new Promise((res, rej) => {
        // Get all assets leaving a location and join with gatepass
        pool.query(locationTable.getAllAssetsLeavingLocationAndIfAuthorized, [locationID]).then((result: movementDBRequest) => {
            res(result.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[74]));
        });
    });
}

function updateApprovedStatusOfMovement(movement:movement): movement {
    let gatepassdatestring = movement.gatepassdate.toDateString();
    let scannedtimestring = movement.scannedtime.toDateString();

    if (gatepassdatestring == scannedtimestring) {
        movement.authorized = true;
    } else {
        movement.authorized = false;
    }

    return movement;
}

export function getAssetsLeavingLocationAndIfAuthorized(locationID: number): Promise<movement[]> {
    return new Promise((res, rej) => {
        assetsLeavingLocationAndIfAuthorized(locationID).then(movements => {
            let updatedMovements: movement[] = [];
            movements.forEach(movement => {
                updatedMovements.push(updateApprovedStatusOfMovement(movement));
            });
            return res(updatedMovements);
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {    
                return rej(new MyError(Errors[74]));
            }
        });
    });
}