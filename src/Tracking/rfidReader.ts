// If this doesn't show up then I don't know
import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
import Location from "./location.js";

interface getReaderDevice {
    id: number,
    entry: boolean,
    readerdeviceid: string,
    location: string,
}

interface getReaderDeviceFetchResult {
    rows: getReaderDevice[];
    rowCount: number
}

export interface editReaderDevice {
    readerdeviceid?: string;
    entry?: boolean;
    locationid?: number;
}

export function editReaderDevice(deviceID: number, props: editReaderDevice): Promise<void> {
    return new Promise((res, rej) => {
        // Check if provided device exists
        doesReaderDeviceIDExist(deviceID).then(doesExist => {
            if (doesExist == false) {
                return rej(new MyError(MyErrors2.READER_DOESNT_EXIST));
            }

            // Verify provided reader details
            verifyReaderDeviceDetails(props).then(isValid => {
                if (isValid == false) {
                    return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
                }

                // Update Details
                let promises: Promise<void>[] = [];
                Object.entries(props).forEach(([key2, value]) => promises.push(updateReader(deviceID, {[key2]: value})));

                Promise.all(promises).then(() => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        return rej(err);
                    } else {
                        return rej(new MyError(MyErrors2.NOT_EDIT_READER));
                    }
                });
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                } else {
                    return rej(new MyError(MyErrors2.NOT_EDIT_READER));
                }
            })
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            }
        })
    })
}

function updateReader(deviceID: number, props: editReaderDevice): Promise<void> {
    return new Promise((res, rej) => {
        if (props.entry != null) {
            updateReaderEntry(props.entry, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            })
        } 
        
        else if (props.locationid) {
            updateReaderLocation(props.locationid, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            })
        }
        
        else if (props.readerdeviceid) {
            updateReaderReaderDeviceID(props.readerdeviceid, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            })
        } 

        else {
            return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
        }
    });
}

function updateReaderLocation(locationID: number, deviceID: number): Promise<void> {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET locationid = $1 WHERE id = $2", [locationID, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        })
    });
}

function updateReaderEntry(enty: boolean, deviceID: number): Promise<void> {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET entry = $1 WHERE id = $2", [enty, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        })
    });
}

function updateReaderReaderDeviceID(readerdeviceid: string, deviceID: number): Promise<void> {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET readerdeviceid = $1 WHERE id = $2", [readerdeviceid, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        })
    });
}

export function getReaderDevices(): Promise<getReaderDevice[]> {
    return new Promise((res, rej) => {
        // Run database query
        pool.query(locationTable.getReaderDevices).then((fetchResult: getReaderDeviceFetchResult) => {
            return res(fetchResult.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GET_READERS));
        })
    });
}

export function createReaderDevice(readerdeviceid: string, locationid: number, entry: boolean): Promise<void> {
    return new Promise((res, rej) => {
        // Check if reader exists
        checkIfReaderDeviceExists(readerdeviceid).then(doesExist => {
            if (doesExist == true) {
                return rej(new MyError(MyErrors2.READER_EXISTS));
            }

            // Verify reader details
            verifyReaderDeviceDetails({locationid}).then(isValid => {
                if (isValid == false) {
                    return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
                }

                // Create reader
                createReaderDeviceDB(readerdeviceid, locationid, entry).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        return rej(err);
                    } else {
                        return rej(new MyError(MyErrors2.NOT_CREATE_READER));
                    }
                });
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                } else {
                    return rej(new MyError(MyErrors2.NOT_CREATE_READER));
                }
            })
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_CREATE_READER));
            }
        })
    });
}

interface SelectReaderDeviceResult {
    locationid: number;
    readerdeviceid: string;
    deleted: boolean;
    entry: boolean;
    id: number
}

interface SelecteReaderDeviceFetchResult {
    rows: SelectReaderDeviceResult[];
    rowCount: number;
}

export function verifyReaderDeviceDetails(props: editReaderDevice): Promise<boolean> {
    return new Promise((res, rej) => {
        if (props.locationid) {
            Location.verifyLocationID(props.locationid).then(doesExist => {
                if (doesExist == false) {
                    return res(false);
                }
    
                return res(true);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
            })
        }

        else {
            return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
        }
    });
}

export function createReaderDeviceDB(readerdeviceid: string, locationid: number, entry: boolean): Promise<void> {
    return new Promise((res, rej) => {
        // Run db query
        pool.query(locationTable.createReaderDevice, [readerdeviceid, locationid, entry]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_CREATE_READER));
        })
    });
}

export function doesReaderDeviceIDExist(deviceID: number): Promise<boolean> {
    return new Promise((res, rej) => {
        pool.query(locationTable.doesReaderIDExist, [deviceID]).then((data: SelecteReaderDeviceFetchResult) => {
            if (data.rowCount <= 0) {
                return res(false);
            } else {
                return res(true);
            }
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
        })
    });
}

export function checkIfReaderDeviceExists(readerdeviceid: string): Promise<boolean> {
    return new Promise((res, rej) => {
        // Run check if reader device exists query
        pool.query(locationTable.doesReaderDeviceExist, [readerdeviceid]).then((fetchResult: SelecteReaderDeviceFetchResult) => {
            if (fetchResult.rowCount <= 0) {
                return res(false);
            } 
            return res(true);
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
        })
    });
}