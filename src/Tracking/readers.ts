import pool from "../../db2.js";
import locationTable from "./db_location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import Location from "./location.js";
import { AntennaeFetchResult } from "./antennae.js";

interface ReaderFromDB {
    id: number;
    hardwarekey: string;
    locationid: number;
    deleted: boolean;
    noantennae: number;
}

export interface ReaderFetchResult {
    rowCount: number;
    rows: ReaderFromDB[];
}

export const createReader = function (hardwareKey: string, locationID: number, noantennae: number): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if reader already exists
        pool.query(locationTable.getReader, [hardwareKey]).then((result: ReaderFetchResult) => {
            if (result.rowCount > 0) {
                return rej(new MyError(Errors[39]));
            } else {
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
}

export interface updateReaderJSON {
    hardwarekey?: string;
    locationid?: number;
    noantennae?: number;
}

export function updateReader(readerID: number, updateJSON: updateReaderJSON): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check that reader exists
        pool.query(locationTable.getReaderFromID, [readerID]).then((result: ReaderFetchResult) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[56]));
            }

            // Verify each item in updateJSON
            let promises: Promise<void | never>[] = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({[key2]: value}, readerID)));

            Promise.all(promises).then(() => {
                // Update Each item
                let promises2: Promise<void | never>[] = [];
                Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(readerID, {[key2]: value})));

                Promise.all(promises2).then(() => {
                    return res();
                }).catch(err => {
                    if (err instanceof MyError) {
                        return rej(err);
                    } else {
                        return rej(new MyError(Errors[9]));
                    }
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

function _verify(updateDetails: updateReaderJSON, readerID: number): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if hardware key exists
        if (updateDetails.hardwarekey) {
            pool.query(locationTable.getReader, [updateDetails.hardwarekey]).then((result: ReaderFetchResult) => {
                if (result.rowCount > 0) {
                    return rej(new MyError(Errors[39]));
                } else {
                    return res();
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }

        if (updateDetails.locationid) {
            Location.verifyLocationID(updateDetails.locationid).then((exists) => {
                if(exists == false) {
                    return rej(new MyError(Errors[3]));
                }
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[61]));
            });
        }

        if (updateDetails.noantennae) {
            let antenaeno = updateDetails.noantennae;
            pool.query(locationTable.getReaderFromID, [readerID]).then((result: ReaderFetchResult) => {
                if (result.rowCount <= 0) {
                    return rej(new MyError(Errors[56]));
                }

                if (antenaeno > result.rows[0].noantennae) {
                    return rej(new MyError(Errors[57]));
                }

                // Check that it isn't already taken
                pool.query(locationTable.checkIfAntennaeNumberTaken, [readerID, antenaeno]).then((result: AntennaeFetchResult) => {
                    if (result.rowCount > 0) {
                        return rej(new MyError(Errors[40]));
                    }
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[61]));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }
    });
}

function _updateInDb(readerID: number, updateDetails: updateReaderJSON): Promise<void | never>{
    return new Promise((res, rej) => {
        let updateQuery: string;
        if(updateDetails.hardwarekey) {
            updateQuery = "UPDATE RFIDReader SET hardwarekey = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.hardwarekey, readerID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[63]));
            });
        }

        if(updateDetails.locationid){
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