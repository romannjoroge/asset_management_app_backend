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
    userid: number;
    date: Date;
    fromLocation: number;
    toLocation: number;
    barcode: string;
    reason: string;
}

export function requestForGatepass(gatePass: GatePass, users: number[]): Promise<void | never> {
    return new Promise((res, rej) => {
        // Confirm users exist
        let promises: Promise<boolean>[] = [];
        users.forEach(user => promises.push(User.checkIfUserIDExists(user)));

        Promise.all(promises).then(results => {
            // Assert all users exist
            if (results.includes(false)) {
                return rej(new MyError(Errors[30]));
            }

            // Create GatePass
            let gatePassID: number;
            assignGatePass(gatePass).then(id => {
                gatePassID = id;
                // Add Authorizers
                let promises: Promise<void | never>[] = [];
                users.forEach(user => promises.push(addAuthorizer(user, gatePassID)));

                Promise.all(promises).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            }).catch(err => {
                if (err instanceof MyError) {
                    return rej(err);
                } else {
                    return rej(new MyError(Errors[9]));
                }
            });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}

function addAuthorizer(userid: number, gatePassID: number): Promise<void | never> {
    return new Promise((res, rej) => {
        // Add Authorizer
        pool.query(gatePassTable.addGateAuthorizer, [userid, gatePassID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
    });
}

export function assignGatePass(gatePass: GatePass): Promise<number | never> {
    return new Promise((res, rej) => {
        // Check if user exists
        User.checkIfUserIDExists(gatePass.userid).then(userExist => {
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
                        pool.query(gatePassTable.createGatePass, [gatePass.reason, gatePass.userid, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(_ => {
                            // Get Created GatePassID
                            pool.query(gatePassTable.getGatePass, [gatePass.reason, gatePass.userid, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(data => {
                                if (data.rowCount === 0) {
                                    return rej(new MyError(Errors[9]));
                                }
                                let gatePassID = data.rows[0].id;
                                // Create GatePassAsset
                                insertGatePassEntry(assetid, gatePassID).then(_ => {
                                    return res(gatePassID);
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