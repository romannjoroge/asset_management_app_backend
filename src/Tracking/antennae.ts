import locationTable from "./db_location.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import { ReaderFetchResult } from "./readers.js";

interface AntennaeFromDB {
    id: number;
    readerid: number;
    antennaeno: number;
    entry: boolean;
    deleted: boolean;
}

export interface AntennaeFetchResult {
    rowCount: number;
    rows: AntennaeFromDB[];
}


export const createAntennae = function(antennaeno: number, readerID: number, entry: boolean): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if reader exists
        pool.query(locationTable.getReaderFromID, [readerID]).then((readerResult: ReaderFetchResult) => {
            if (readerResult.rowCount <= 0) {
                return rej(new MyError(Errors[56]));
            }

            // Check if antennae already exists
            pool.query(locationTable.doesAntennaeExist, [antennaeno, readerID]).then((result: AntennaeFetchResult) => {
                if (result.rowCount > 0) {
                    return rej(new MyError(Errors[40]));
                }

                // Check if antennae number is valid
                if (antennaeno < 1 || antennaeno > readerResult.rows[0].noantennae) {
                    return rej(new MyError(Errors[57]));
                }

                // Create Antennae
                pool.query(locationTable.createAntennae, [antennaeno, readerID, entry]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[58]));
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

export interface AntennaeUpdateJSON {
    readerID?: number;
    antennaeno?: number;
    entry?: boolean;
}

export function updateAntennae(antennaeID: number, updateJSON: AntennaeUpdateJSON): Promise<void | never> {
    return new Promise((res, rej) => {
        // Check if antennae exists
        pool.query(locationTable.doesAntennaeIDExist, [antennaeID]).then((result: AntennaeFetchResult) => {
            if (result.rowCount <= 0) {
                return rej(new MyError(Errors[60]));
            }

            // Verify each item in updateJSON
            let promises: Promise<void | never>[] = [];
            
            // Make sure reader id is updated first
            if (updateJSON.readerID) {
                promises.push(_verify({readerID: updateJSON.readerID}, antennaeID));
            }
            if (updateJSON.entry) {
                promises.push(_verify({entry: updateJSON.entry}, antennaeID));
            }
            if (updateJSON.antennaeno) {
                if (updateJSON.readerID) {
                    promises.push(_verify({antennaeno: updateJSON.antennaeno}, antennaeID, updateJSON.readerID));
                } else {
                    promises.push(_verify({antennaeno: updateJSON.antennaeno}, antennaeID));
                }
            }

            Promise.all(promises).then(() => {
                // Update Each item
                let promises2: Promise<void | never>[] = [];
                Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(antennaeID, {[key2]: value})));

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

function _updateInDb(antennaeID: number, updateJSON: AntennaeUpdateJSON): Promise<void | never> {
    return new Promise((res, rej) => {
        // Update reader
        let updateQuery: string;
        if (updateJSON.readerID) {
            updateQuery = "UPDATE Antennae SET readerID = $1 WHERE id = $2";
            pool.query(updateQuery, [updateJSON.readerID, antennaeID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }

        if (updateJSON.entry) {
            updateQuery = "UPDATE Antennae SET entry = $1 WHERE id = $2";
            pool.query(updateQuery, [updateJSON.entry, antennaeID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }

        if (updateJSON.antennaeno) {
            updateQuery = "UPDATE Antennae SET antennaeno = $1 WHERE id = $2";
            pool.query(updateQuery, [updateJSON.antennaeno, antennaeID]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[40]));
            });
        }
    });
}

interface getNumberofAntennaes {
    noantennae: number
    id: number;
}

interface getNumberofAntennaesResult {
    rowCount: number;
    rows: getNumberofAntennaes[];
}

function _verify(updateDetails: AntennaeUpdateJSON, antennaeID: number ,newReaderID?: number): Promise<void | never> {
    return new Promise((res, rej) => {
        if (updateDetails.readerID) {
            // Verify that reader exists
            pool.query(locationTable.getReaderFromID, [updateDetails.readerID]).then((result: ReaderFetchResult) => {
                if (result.rowCount <= 0) {
                    return rej(new MyError(Errors[56]));
                }
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }

        if (updateDetails.entry) {
            return res();
        }

        if(updateDetails.antennaeno) {
            let antennaenoToCheck = updateDetails.antennaeno;
            if (newReaderID) {
                // Verify that antennae number is less than max number of antennae
                pool.query(locationTable.getNumberofAntennaes2, [newReaderID]).then((result: getNumberofAntennaesResult) => {
                    if(result.rowCount <= 0) {
                        return rej(new MyError(Errors[61]));
                    }
                    if (antennaenoToCheck > result.rows[0].noantennae) {
                        return rej(new MyError(Errors[57]));
                    }
                    let readerToCheck = newReaderID;
                    // Check that it isn't already taken
                    pool.query(locationTable.checkIfAntennaeNumberTaken, [readerToCheck, antennaenoToCheck]).then((result: AntennaeFetchResult) => {
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
            // Verify that antennae number is less than max number of antennae
            pool.query(locationTable.getNumberofAntennaes, [antennaeID]).then((result: getNumberofAntennaesResult) => {
                if(result.rowCount <= 0) {
                    return rej(new MyError(Errors[61]));
                }
                if (antennaenoToCheck > result.rows[0].noantennae) {
                    return rej(new MyError(Errors[57]));
                }
                let readerToCheck = result.rows[0].id;
                // Check that it isn't already taken
                pool.query(locationTable.checkIfAntennaeNumberTaken, [readerToCheck, antennaenoToCheck]).then((result: AntennaeFetchResult) => {
                    if (result.rowCount > 0) {
                        return rej(new MyError(Errors[40]));
                    }
                    return res();
                }).catch(err => {

                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[61]));
            });
        }
    });
}