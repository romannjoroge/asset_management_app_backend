// If this doesn't show up then I don't know
import pool from "../../db2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
import Location from "./location.js";
export function editReaderDevice(deviceID, props) {
    return new Promise((res, rej) => {
        // Check if provided device exists
        doesReaderDeviceIDExist(deviceID).then(doesExist => {
            if (doesExist == false) {
                return rej(new MyError(MyErrors2.READER_DOESNT_EXIST));
            }
            // Verify provided reader details
            let promises = [];
            Object.entries(props).forEach(([key2, value]) => promises.push(verifyReaderDeviceDetails({ [key2]: value })));
            Promise.all(promises).then(isValid => {
                if (isValid.includes(false)) {
                    return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
                }
                // Update Details
                let promises2 = [];
                Object.entries(props).forEach(([key2, value]) => promises2.push(updateReader(deviceID, { [key2]: value })));
                Promise.all(promises2).then(() => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        return rej(err);
                    }
                    else {
                        return rej(new MyError(MyErrors2.NOT_EDIT_READER));
                    }
                });
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
                }
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            }
        });
    });
}
function updateReader(deviceID, props) {
    return new Promise((res, rej) => {
        if (props.entry !== null && props.entry !== undefined) {
            updateReaderEntry(props.entry, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            });
        }
        else if (props.locationid) {
            updateReaderLocation(props.locationid, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            });
        }
        else if (props.readerdeviceid) {
            updateReaderReaderDeviceID(props.readerdeviceid, deviceID).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_EDIT_READER));
            });
        }
        else {
            return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
        }
    });
}
function updateReaderLocation(locationID, deviceID) {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET locationid = $1 WHERE id = $2", [locationID, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        });
    });
}
function updateReaderEntry(enty, deviceID) {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET entry = $1 WHERE id = $2", [enty, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        });
    });
}
function updateReaderReaderDeviceID(readerdeviceid, deviceID) {
    return new Promise((res, rej) => {
        // Run Query
        pool.query("UPDATE ReaderDevice SET readerdeviceid = $1 WHERE id = $2", [readerdeviceid, deviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_EDIT_READER));
        });
    });
}
export function getReaderDevices() {
    return new Promise((res, rej) => {
        // Run database query
        pool.query(locationTable.getReaderDevices).then((fetchResult) => {
            return res(fetchResult.rows);
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GET_READERS));
        });
    });
}
export function createReaderDevice(readerdeviceid, locationid, entry) {
    return new Promise((res, rej) => {
        // Check if reader exists
        checkIfReaderDeviceExists(readerdeviceid).then(doesExist => {
            if (doesExist == true) {
                return rej(new MyError(MyErrors2.READER_EXISTS));
            }
            // Verify reader details
            verifyReaderDeviceDetails({ locationid }).then(isValid => {
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
                    }
                    else {
                        return rej(new MyError(MyErrors2.NOT_CREATE_READER));
                    }
                });
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(MyErrors2.NOT_CREATE_READER));
                }
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(MyErrors2.NOT_CREATE_READER));
            }
        });
    });
}
export function verifyReaderDeviceDetails(props) {
    return new Promise((res, rej) => {
        console.log(props);
        if (props.locationid) {
            Location.verifyLocationID(props.locationid).then(doesExist => {
                if (doesExist == false) {
                    return res(false);
                }
                return res(true);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
            });
        }
        else if (props.readerdeviceid) {
            checkIfReaderDeviceExists(props.readerdeviceid).then(doesExist => {
                if (doesExist == false) {
                    return res(true);
                }
                return res(false);
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
            });
        }
        else if (props.entry !== null && props.entry !== undefined) {
            return res(true);
        }
        else {
            return rej(new MyError(MyErrors2.INVALID_READER_DETAILS));
        }
    });
}
export function createReaderDeviceDB(readerdeviceid, locationid, entry) {
    return new Promise((res, rej) => {
        // Run db query
        pool.query(locationTable.createReaderDevice, [readerdeviceid, locationid, entry]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_CREATE_READER));
        });
    });
}
export function doesReaderDeviceIDExist(deviceID) {
    return new Promise((res, rej) => {
        pool.query(locationTable.doesReaderIDExist, [deviceID]).then((data) => {
            if (data.rowCount <= 0) {
                return res(false);
            }
            else {
                return res(true);
            }
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
        });
    });
}
export function checkIfReaderDeviceExists(readerdeviceid) {
    return new Promise((res, rej) => {
        // Run check if reader device exists query
        pool.query(locationTable.doesReaderDeviceExist, [readerdeviceid]).then((fetchResult) => {
            if (fetchResult.rowCount <= 0) {
                return res(false);
            }
            return res(true);
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_CONFIRM_READER));
        });
    });
}
//# sourceMappingURL=rfidReader.js.map