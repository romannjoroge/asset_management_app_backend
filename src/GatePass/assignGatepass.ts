import Asset from "../Allocation/Asset/asset2.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import User from "../Users/users.js";
import pool from "../../db2.js";
import gatePassTable from './db_gatepass.js'
import Location from "../Tracking/location.js";

interface GetGatePassFromDB {
    id: number;
}

interface GetGatePassFromDBResult {
    rowCount: number;
    rows: GetGatePassFromDB[]
}

interface GatePass {
    username: string;
    date: Date;
    fromLocation: number;
    toLocation: number;
    barcode: string;
    reason: string;
}

export function assignGatePass(gatePass: GatePass): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserExists(gatePass.username).then(userExist => {
            if(userExist === false){
                return rej(new MyError(Errors[30]));
            }

            // Validate Asset
            Asset._getAssetID(gatePass.barcode).then(assetid => {
                // Check if from location exists
                Location.verifyLocationID(gatePass.fromLocation).then(exists => {
                    if (exists == false) {
                        return rej(new MyError(Errors[3]));
                    }

                    // Check if to location exists
                    Location.verifyLocationID(gatePass.toLocation).then(exists => {
                        if (exists == false) {
                            return rej(new MyError(Errors[3]));
                        }

                        // Create GatePass
                        pool.query(gatePassTable.createGatePass, [gatePass.reason, gatePass.username, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(_ => {
                            // Get Created GatePassID
                            pool.query(gatePassTable.getGatePass, [gatePass.reason, gatePass.username, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(data => {
                                if (data.rowCount === 0) {
                                    return rej(new MyError(Errors[9]));
                                }
                                let gatePassID = data.rows[0].id;
                                // Create GatePassAsset
                                insertGatePassEntry(assetid, gatePassID).then(_ => {
                                    return res();
                                }).catch(err => {
                                    console.log(err);
                                    return rej(new MyError(Errors[9]));
                                });
                            }).catch(err => {
                                console.log(err);
                                return rej(new MyError(Errors[3]));
                            });
                        }).catch(err => {
                            console.log(err);
                            return rej(new MyError(Errors[9]));
                        });
                    }).catch(err => {
                        console.log(err);
                        return rej(new MyError(Errors[3]));
                    });
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[3]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[29]));
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}

export function insertGatePassEntry(assetID: number, gatePassID: number): Promise<void | never> {
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