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
            verifyReaderDeviceDetails(locationid).then(isValid => {
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

export function verifyReaderDeviceDetails(locationid: number): Promise<boolean> {
    return new Promise((res, rej) => {
        Location.verifyLocationID(locationid).then(doesExist => {
            if (doesExist == false) {
                return res(false);
            }

            return res(true);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
        })
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