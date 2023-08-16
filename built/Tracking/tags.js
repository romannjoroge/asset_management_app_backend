import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors, MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
import _ from 'lodash';
import events from 'events';
const eventEmitter = new events.EventEmitter();
export function syncTags(tags) {
    return new Promise((res, rej) => {
        console.log(1);
        let promises = [];
        let missingAssets = [];
        // Sync every tag
        tags.forEach((tag) => promises.push(syncTag(tag, missingAssets)));
        Promise.all(promises).then(_ => {
            console.log(2);
            return res(missingAssets);
        }).catch(err => {
            console.log(3);
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        });
    });
}
/**
 *
 * @param tag The details of the asset that is being marked as converted or tagged
 * @param missingAssets A list that I will return that indicates which assets were not found in the database but were written by the reader
 * @returns list of missing assets
 * @description This function takes the details of an asset that includes the barcode and the timestamp and marks the asset as converted or tagged. If the barcode is cuurently not in the database, it will be added to the missingAssets list and sent back to the reader
 */
export function syncTag(tag, missingAssets) {
    return new Promise((res, rej) => {
        // Check if asset exist
        Asset._doesBarCodeExist(tag.barcode).then(doesExist => {
            if (doesExist == false) {
                // return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
                // No longer throwing an error since someone could have written a wrong barcode by mistake and we don't want to stop the whole process
                missingAssets.push(tag.barcode);
                return res();
            }
            let timestamp = new Date(tag.timestamp);
            // Convert date to ISO string
            let dateToAdd = timestamp.toISOString();
            Asset._getAssetID(tag.barcode).then(assetID => {
                pool.query(locationTable.syncItem, [dateToAdd, true, true, assetID]).then(() => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        });
    });
}
function convertRawTagToProcessedTag(rawTag) {
    return new Promise((res, rej) => {
        let readerDeviceID = rawTag.hardwareKey + rawTag.antNo;
        let scannedTime = new Date();
        Asset._getAssetID(rawTag.epcID).then(assetID => {
            return res({ scannedTime, assetID, readerDeviceID, barcode: rawTag.epcID });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}
function addProcessedTagToDB(processedTag) {
    return new Promise((res, rej) => {
        console.log("Something Is Added To DB!");
        pool.query(locationTable.addProcessedTag, [processedTag.scannedTime, processedTag.assetID, processedTag.readerDeviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}
function convertAndAddTag(rawTag, processedTags) {
    return new Promise((res, rej) => {
        convertRawTagToProcessedTag(rawTag).then(processedTag => {
            processedTags.push(processedTag);
            addProcessedTagToDB(processedTag).then(_ => {
                return res();
            }).catch(err => {
                return rej(err);
            });
        }).catch(err => {
            return rej(err);
        });
    });
}
/**
 *
 * @param processedTag A tag that has been read by a reader and processed by system
 * @returns true if the previous entry is different so the asset has entered or left the building. false if there is no difference
 */
function isPreviousEntryInDBDifferent(processedTag) {
    return new Promise((res, rej) => {
        // Get the previous entries of the asset in the processed tags table
        pool.query(locationTable.getPreviousEntry, [processedTag.assetID, processedTag.scannedTime]).then((fetchResult) => {
            // If nothing is returned then its not different
            if (fetchResult.rowCount <= 0) {
                return res(false);
            }
            let previousEntry = fetchResult.rows[0];
            // Check if previous entry has a different reader id
            if (previousEntry.readerdeviceid !== processedTag.readerDeviceID) {
                // If the previous entry has a different reader device id return true
                return res(true);
            }
            else {
                // Else return false
                return res(false);
            }
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
        });
    });
}
function orderReaders(readers) {
    return _.orderBy(readers, ['scannedTime'], ['desc']);
}
function emitSignal(isEntering, processedTag) {
    return new Promise((res, rej) => {
        // If the asset is entering get the location of the processed tag
        if (isEntering == true) {
            // Get the location of readerid in processed tag
            pool.query(locationTable.getLocationOfReaderDevice, [processedTag.readerDeviceID]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                }
                let location = fetchResult.rows[0].locationid;
                // Combine with isEntering and emit
                return res({ isEntering, location, barcode: processedTag.barcode });
            }).catch(err => {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            });
        }
        // Otherwise get the location of the previous occurence 
        else {
            // Get previous occurence
            pool.query(locationTable.getPreviousEntry, [processedTag.assetID, processedTag.scannedTime]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                }
                let previousEntry = fetchResult.rows[0];
                // Get location of readerid in previous occurence
                pool.query(locationTable.getLocationOfReaderDevice, [previousEntry.readerdeviceid]).then((fetchResult) => {
                    if (fetchResult.rowCount <= 0) {
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    }
                    let location = fetchResult.rows[0].locationid;
                    // Combine with isEntering and emit
                    return res({ isEntering, location, barcode: processedTag.barcode });
                }).catch(err => {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                });
            }).catch(err => {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            });
        }
    });
}
/**
 *
 * @param processedTag A tag that has been read by a reader and processed by system and is different from previous entry
 * @returns true if the asset is entering the building. false if the asset is leaving the building
 */
function isAssetLeavingOrEntering(processedTag) {
    return new Promise((res, rej) => {
        // Assume that the 2 previous entries for the asset have different readers
        // To determine whether the asset entered or not we see the order of reader
        // Get previous readers and if entering or leaving
        pool.query(locationTable.getPreviousReaderDevices, [processedTag.assetID]).then((fetchResult) => {
            if (fetchResult.rowCount <= 0) {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            }
            let orderedReaders = orderReaders(fetchResult.rows);
            // If first reader is an entry then exit then item is entering
            if (orderedReaders[1].entry == true && orderedReaders[0].entry == false) {
                return res(true);
            }
            else {
                // Else it is leaving
                return res(false);
            }
        }).catch(err => {
            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
        });
    });
}
/**
 *
 * @param processedTag A tag that has been read by a reader and processed by system
 * @returns Nothing. It just emits if the item has entered or left the building
 * @description This function takes a processed tag and checks if the item has entered or left the building. If it has, it emits an event to the location dashboard
 */
function processPreviousEntries(processedTag, eventEmitter) {
    return new Promise((res, rej) => {
        // See if previous tag is different
        isPreviousEntryInDBDifferent(processedTag).then(isDifferent => {
            console.log("Is it different: ");
            console.log(isDifferent);
            // If they are different determine whether asset is entering or leaving
            if (isDifferent == true) {
                isAssetLeavingOrEntering(processedTag).then(isEntering => {
                    console.log("Is it entering: ");
                    console.log(isEntering);
                    // Emit a signal
                    emitSignal(isEntering, processedTag).then(signal => {
                        eventEmitter.emit('location', signal);
                        return res();
                    }).catch(err => {
                        console.log(err);
                        if (err instanceof MyError) {
                            return rej(err);
                        }
                        else {
                            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                        }
                    });
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        return rej(err);
                    }
                    else {
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    }
                });
            }
            else {
                // Else stop
                return res();
            }
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            }
        });
    });
}
export function testEmitFromDifferentFile(eventEmitter) {
    return new Promise((res, rej) => {
        try {
            function myFunc() {
                return new Promise((res, rej) => {
                    setTimeout(() => {
                        eventEmitter.emit('location', { location: 4, data: "Hello" });
                        return res();
                    }, 1000);
                });
            }
            function throwError(i, max) {
                return new Promise((res, rej) => {
                    if (i == max) {
                        return rej(new MyError("Some Error"));
                    }
                    else {
                        eventEmitter.emit('location', { location: i, data: "Hello" });
                        res();
                    }
                });
            }
            var promises = [];
            for (let i = 0; i <= 5; i++) {
                promises.push(throwError(i, 4));
            }
            Promise.all(promises).then(_ => {
                res();
            }).catch(err => {
                eventEmitter.emit('error', { error: err.message });
                return rej(err);
            });
        }
        catch (err) {
            if (err instanceof MyError) {
                eventEmitter.emit('error', { error: err.message });
            }
            else {
                eventEmitter.emit('error', { error: "Some Error" });
            }
            return rej(err);
        }
    });
}
export function addProcessedTag(tags, eventEmitter) {
    return new Promise((res, rej) => {
        let processedTags = [];
        if (tags.size == 0) {
            return res();
        }
        else {
            let promises = [];
            tags.forEach(tag => {
                console.log(tag);
                let newTag = JSON.parse(tag);
                promises.push(convertAndAddTag(newTag, processedTags));
            });
            Promise.all(promises).then(_ => {
                // Update event if entry of exit is detected
                let promises2 = [];
                processedTags.forEach(processedTag => {
                    promises2.push(processPreviousEntries(processedTag, eventEmitter));
                });
                Promise.all(promises2).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        eventEmitter.emit('error', { error: err.message });
                        return rej(err);
                    }
                    else {
                        eventEmitter.emit('error', { error: MyErrors2.NOT_PROCESS_TAG });
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    }
                });
            }).catch(err => {
                console.log(err);
                eventEmitter.emit('error', { error: Errors[73] });
                return rej(new MyError(Errors[73]));
            });
        }
    });
}
export function convertHexToASCII(hexStr) {
    let asciiStr = '';
    for (let i = 0; i < hexStr.length; i += 2) {
        asciiStr += String.fromCharCode(parseInt(hexStr.substring(i, i + 2), 16));
    }
    return asciiStr;
}
//# sourceMappingURL=tags.js.map