import gatepassTable from './db_gatepass.js';
import { UserFetchResult } from '../Users/update.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import { insertGatePassEntry } from './assignGatepass.js';
import Asset from '../Allocation/Asset/asset2.js';

interface GatePass {
    name: string;
    fromLocation: string;
    toLocation: string;
    date: Date;
    reason: string;
    assets: string[];
}

export function createGatePass(gatePass: GatePass): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if user exists
        pool.query(gatepassTable.checkIfUserExists, [gatePass.name]).then((data: UserFetchResult) => {
            if (data.rowCount <= 0) {
                return rej(new MyError(Errors[30]));
            }
            var fromLocationID: number;
            var toLocationID: number;

            // Get Location
            pool.query(gatepassTable.getLocationID, [gatePass.fromLocation]).then(data => {
                if (data.rowCount === 0) {
                    return rej(new MyError(Errors[9]));
                }
                fromLocationID = data.rows[0].id;

                // Get Location
                pool.query(gatepassTable.getLocationID, [gatePass.toLocation]).then(data => {
                    if (data.rowCount === 0) {
                        return rej(new MyError(Errors[9]));
                    }
                    toLocationID = data.rows[0].id;

                    // Create GatePass
                    pool.query(gatepassTable.createGatePass, [gatePass.reason, gatePass.name, fromLocationID, toLocationID, gatePass.date]).then(_ => {
                        console.log(0);
                        // Get Created GatePassID
                        pool.query(gatepassTable.getGatePass, [gatePass.reason, gatePass.name, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(data => {
                            console.log(1);
                            if (data.rowCount === 0) {
                                console.log(2);
                                return rej(new MyError(Errors[9]));
                            }
                            console.log(3);
                            let gatePassID = data.rows[0].id;
                            // Create GatePassAsset
                            let promises: Promise<void>[] = [];
                            for (var i in gatePass.assets) {
                                promises.push(insertGatePassEntry2(gatePass.assets[i], gatePassID));
                            }
                            console.log(4);
                            Promise.all(promises).then(_ => {
                                console.log(5);
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
                rej(new MyError(Errors[9]));
            });

            // Create GatePass
            pool.query(gatepassTable.createGatePass, [gatePass.reason, gatePass.name, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(_ => {
                console.log(0);
                // Get Created GatePassID
                pool.query(gatepassTable.getGatePass, [gatePass.reason, gatePass.name, gatePass.fromLocation, gatePass.toLocation, gatePass.date]).then(data => {
                    console.log(1);
                    if (data.rowCount === 0) {
                        console.log(2);
                        return rej(new MyError(Errors[9]));
                    }
                    console.log(3);
                    let gatePassID = data.rows[0].id;
                    // Create GatePassAsset
                    let promises: Promise<void>[] = [];
                    for (var i in gatePass.assets) {
                        promises.push(insertGatePassEntry2(gatePass.assets[i], gatePassID));
                    }
                    console.log(4);
                    Promise.all(promises).then(_ => {
                        console.log(5);
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
    });
}

function insertGatePassEntry2(barcode: string, gatePassID: number): Promise<void | never> {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetID => {
            insertGatePassEntry(assetID, gatePassID).then(_ => {
                return res();
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

