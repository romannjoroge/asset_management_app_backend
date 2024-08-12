import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors, MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import utility from "../utility/utility.js";
import locationTable from "./db_location.js";
import _ from 'lodash';
import events from 'events';
import { doesAssetHaveGatepass } from "../GatePass/hasGatepass.js";
import db_gatepass from "../GatePass/db_gatepass.js";
const eventEmitter = new events.EventEmitter();

interface processedTag {
    scannedTime: Date;
    assetID: number;
    readerDeviceID: number;
    barcode: string;
    pc: string;
}

interface assetFromTag {
    isEntering: boolean;
    scannedTime: Date;
    assetid: number;
    location: number;
    barcode: string;
    serialnumber: string;
    description: string;
    condition: string;
    category: string;
    user: string;
    hasgatepass: boolean;
}

interface movement {
    locationid: number;
    assetid: number;
    entry: boolean;
}

export interface rawTag {
    commandCode: string;
    hardwareKey: string;
    tagRecNums: string;
    antNo: string;
    pc:  string;
    epcID: string;
    crc: string;
}

interface ProcessedTagQuery {
    id: number;
    scannedtime: Date;
    assetid: number;
    readerdeviceid: string;
    deleted: boolean;
}

interface ProcessedTagQueryFetchResult {
    rows: ProcessedTagQuery[];
    rowCount: number;
}

export interface SyncItem {
    barcode: string;
    timestamp: string;
}

export function syncTags(tags: SyncItem[]): Promise<string[]> {
    return new Promise((res, rej) => {
        console.log(1);
        let promises: Promise<void>[] = [];
        let missingAssets: string[] = [];

        // Sync every tag
        tags.forEach((tag) => promises.push(syncTag(tag, missingAssets),));

        Promise.all(promises).then(_ => {
            console.log(2);
            return res(missingAssets);
        }).catch(err => {
            console.log(3);
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        })
    });
}
/**
 * 
 * @param tag The details of the asset that is being marked as converted or tagged
 * @param missingAssets A list that I will return that indicates which assets were not found in the database but were written by the reader
 * @returns list of missing assets
 * @description This function takes the details of an asset that includes the barcode and the timestamp and marks the asset as converted or tagged. If the barcode is cuurently not in the database, it will be added to the missingAssets list and sent back to the reader
 */
export function syncTag(tag: SyncItem, missingAssets: string[]): Promise<void> {
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
                })
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_STORE_CONVERTED));
            }
        })
    });
}

interface ReaderDeviceIDFetchResult {
    rowCount: number;
    rows: {id: number}[]
}

function convertRawTagToProcessedTag(rawTag: rawTag): Promise<processedTag> {
    return new Promise((res, rej) => {
        let readerDeviceID = rawTag.hardwareKey + rawTag.antNo;
        let scannedTime = new Date();
        Asset._getAssetID(rawTag.epcID).then(assetID => {
            // Get ID of reader device from DB
            pool.query(db_gatepass.getReaderID, [readerDeviceID]).then((fetchResult: ReaderDeviceIDFetchResult) => {
                return res({scannedTime, assetID, readerDeviceID: fetchResult.rows[0].id, barcode: rawTag.epcID, pc: rawTag.pc});
            }).catch((err: any) => {
                console.log("Reader ID does not exist")
                return rej(new MyError(Errors[73]))
            })
        }).catch(err => {
            console.log(err, "EPC ID does not belong to an asset");
            return rej(new MyError(Errors[73]));
        });
    });
}

interface BuildAssetFromTagDetails {
    serialnumber: string;
    description: string;
    condition: string;
    category: string;
    user: string;
}

interface BuildAssetFromTagDetailsFetchResult {
    rows: BuildAssetFromTagDetails[];
    rowCount: number;
}

function convertProcessedTagToAsset(processedTag: processedTag, isEntering: boolean, location: number): Promise<assetFromTag> {
    return new Promise((res, rej) => {
        let createdAssetTag: assetFromTag;
        // Get serial number, description, condition, category, user to processed tag
        pool.query(locationTable.buildAssetFromTagDetails, [processedTag.assetID]).then((result: BuildAssetFromTagDetailsFetchResult) => {
            if(result.rowCount <= 0) {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            }

            let assetDetails = result.rows[0];
            // Get has gatepass to processed tag
            if (isEntering == true) {
                // The location from processed tag is the from location
                doesAssetHaveGatepass(processedTag.assetID, processedTag.scannedTime, location).then(hasGatepass => {
                    // Fill createdAssetTag with correct details
                    createdAssetTag = {
                        scannedTime: processedTag.scannedTime,
                        assetid: processedTag.assetID,
                        location: location,
                        barcode: processedTag.barcode,
                        serialnumber: assetDetails.serialnumber,
                        description: assetDetails.description,
                        condition: assetDetails.condition,
                        category: assetDetails.category,
                        user: assetDetails.user,
                        hasgatepass: hasGatepass,
                        isEntering: isEntering
                    };

                    return res(createdAssetTag);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                });
            } else {
                doesAssetHaveGatepass(processedTag.assetID, processedTag.scannedTime, undefined, location).then(hasGatepass => {
                    // Fill createdAssetTag with correct details
                    createdAssetTag = {
                        scannedTime: processedTag.scannedTime,
                        assetid: processedTag.assetID,
                        location: location,
                        barcode: processedTag.barcode,
                        serialnumber: assetDetails.serialnumber,
                        description: assetDetails.description,
                        condition: assetDetails.condition,
                        category: assetDetails.category,
                        user: assetDetails.user,
                        hasgatepass: hasGatepass,
                        isEntering: isEntering
                    };

                    return res(createdAssetTag);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                });
            }
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
        });
    })
}

function addProcessedTagToDB(processedTag: processedTag): Promise<void> {
    return new Promise((res, rej) => {
        console.log(`Something Is Added To DB!`);
        pool.query(locationTable.addProcessedTag, [processedTag.scannedTime, processedTag.assetID, processedTag.readerDeviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_READ_TAG));
        });
    });
}

function convertAndAddTag(tags: Set<string>, rawTag: rawTag, processedTags: processedTag[]): Promise<void> {
    return new Promise((res, rej) => {
        convertRawTagToProcessedTag(rawTag).then(processedTag => {
            processedTags.push(processedTag);
            addProcessedTagToDB(processedTag).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(err);
            });
        }).catch(err => {
            console.log(err);
            tags.delete(JSON.stringify(rawTag));
            return rej(err);
        });
    });
}

/**
 * 
 * @param processedTag A tag that has been read by a reader and processed by system
 * @returns true if the previous entry is different so the asset has entered or left the building. false if there is no difference
 */
function isPreviousEntryInDBDifferent(processedTag: processedTag): Promise<boolean> {
    return new Promise((res, rej) => {
        // Get the previous entries of the asset in the processed tags table
        pool.query(locationTable.getPreviousEntry, [processedTag.assetID, processedTag.scannedTime]).then((fetchResult: ProcessedTagQueryFetchResult) => {
            // If nothing is returned then its not different
            if (fetchResult.rowCount <= 0) {
                return res(false);
            }
            let previousEntry: ProcessedTagQuery = fetchResult.rows[0];
            // Check if previous entry has a different reader id
            if (previousEntry.readerdeviceid !== processedTag.readerDeviceID) {
                // If the previous entry has a different reader device id return true
                return res(true);
            } else {
                // Else return false
                return res(false);
            }
        }).catch(err => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
        });
    });
}

interface PreviousReaderQuery {
    readerdeviceid: string;
    entry: boolean;
    scannedTime: Date;
}

interface PreviousReaderQueryFetchResult {
    rows: PreviousReaderQuery[];
    rowCount: number;
}

function orderReaders(readers: PreviousReaderQuery[]): PreviousReaderQuery[] {
    return _.orderBy(readers, ['scannedTime'], ['desc']);
}

interface GetLocationOfReaderDeviceQuery {
    locationid: number;
}

interface GetLocationOfReaderDeviceFetchResult {
    rows: GetLocationOfReaderDeviceQuery[];
    rowCount: number;
}
function emitSignal(isEntering: boolean, processedTag: processedTag): Promise<assetFromTag> {
    return new Promise((res, rej) => {
        // If the asset is entering get the details of the processed tag
        if (isEntering == true) {
            // Get the location of readerid in processed tag
            console.log(`Reader Device ID is ${processedTag.readerDeviceID}`);
            pool.query(locationTable.getLocationOfReaderDevice, [processedTag.readerDeviceID]).then((fetchResult: GetLocationOfReaderDeviceFetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                }
                let location = fetchResult.rows[0].locationid;
                
                // Get assetFromTag and send it
                convertProcessedTagToAsset(processedTag, isEntering, location).then(assetFromTag => {
                    return res(assetFromTag);
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            });
            
        }
        // Otherwise get the location of the previous occurence 
        else {
            // Get previous occurence
            pool.query(locationTable.getPreviousEntry, [processedTag.assetID, processedTag.scannedTime]).then((fetchResult: ProcessedTagQueryFetchResult) => {
                
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                }

                let previousEntry: ProcessedTagQuery = fetchResult.rows[0];
                // Get location of readerid in previous occurence
                pool.query(locationTable.getLocationOfReaderDevice, [previousEntry.readerdeviceid]).then((fetchResult: GetLocationOfReaderDeviceFetchResult) => {
                    if (fetchResult.rowCount <= 0) {
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    }
                    let location = fetchResult.rows[0].locationid;
                    // Get assetFromTag and send it
                    convertProcessedTagToAsset(processedTag, isEntering, location).then(assetFromTag => {
                        return res(assetFromTag);
                    }).catch(err => {
                        console.log(err);
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    });
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                });
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            });

        }
    });
}

interface IsReaderDeviceAtEntranceOrExitFetchResult {
    rowCount: number;
    rows: {entry: boolean}[]
}

/**
 * 
 * @param processedTag A tag that has been read by a reader and processed by system and is different from previous entry
 * @returns true if the asset is entering the building. false if the asset is leaving the building
 */
function isAssetLeavingOrEntering(processedTag: processedTag): Promise<boolean> {
    return new Promise((res, rej) => {
        // Assume that the 2 previous entries for the asset have different readers

        // To determine whether the asset entered or not we see the order of reader
        // Get previous readers and if entering or leaving
        pool.query(locationTable.getPreviousReaderDevices, [processedTag.assetID]).then((fetchResult: PreviousReaderQueryFetchResult) => {
            if (fetchResult.rowCount <= 0) {
                // Return whether the reader device is on entry or exit
                pool.query(locationTable.isReaderDeviceAtEntryOrExit, [processedTag.readerDeviceID]).then((fetchResult: IsReaderDeviceAtEntranceOrExitFetchResult) => {
                    return res(fetchResult.rows[0].entry);
                }).catch((err: any) => {
                    return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                })
            } 

            let orderedReaders = orderReaders(fetchResult.rows);
            if(orderReaders.length >= 2) {
                // If first reader is an entry then exit then item is entering
                if (orderedReaders[1].entry == true && orderedReaders[0].entry == false) {
                    return res(true);
                } else {
                    // Else it is leaving
                    return res(false);
                }
            } else {
                if(orderedReaders.length > 0) {
                    return res(orderedReaders[0].entry);
                } else {
                    return res(false);
                }
            }
        }).catch(err => {
            console.log(err);
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
function processPreviousEntries(processedTag: processedTag, eventEmitter: events.EventEmitter): Promise<void> {
    return new Promise((res, rej) => {
        // See if previous tag is different
        isPreviousEntryInDBDifferent(processedTag).then(isDifferent => {
            console.log("Is it different: ");
            console.log(isDifferent);

            // If they are different determine whether asset is entering or leaving
            if (isDifferent == true) {
                isAssetLeavingOrEntering(processedTag).then(isEntering => {
                    console.log("Is it entering: ")
                    console.log(isEntering);

                    // Emit a signal
                    emitSignal(isEntering, processedTag).then(signal => {
                        eventEmitter.emit('location', signal);
                        return res();
                    }).catch(err => {
                        console.log(err);
                        if (err instanceof MyError) {
                            return rej(err);
                        } else {
                            return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                        }
                    });    
                }).catch(err => {
                    console.log(err);
                    if (err instanceof MyError) {
                        return rej(err);
                    } else {
                        return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
                    }
                });
            } else {
                // Else stop
                return res();
            }
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(MyErrors2.NOT_PROCESS_TAG));
            }
        });
    });
}

export function testEmitFromDifferentFile(eventEmitter: events.EventEmitter): Promise<void> {
    return new Promise((res, rej) => {
        try {
            function myFunc(): Promise<void | never> {
                return new Promise((res, rej) => {
                    setTimeout(() => {
                        eventEmitter.emit('location', {location: 4, data: "Hello"});
                        return res();
                    }, 1000);
                });
            }

            function throwError(i: number, max: number): Promise<void> {
                return new Promise((res, rej) => {
                    if (i == max) {
                        return rej(new MyError("Some Error"));
                    } else {
                        eventEmitter.emit('location', {location: i, data: "Hello"});
                        res();
                    }
                });
            }
            var promises: Promise<void | never>[] = [];
            for (let i = 0; i <= 5; i ++) {
                promises.push(throwError(i, 4));
            }
            Promise.all(promises).then(_ => {
                res();
            }).catch(err => {
                return rej(err);
            }) 
        } catch(err) {
            return rej(err);
        }
    });
}

export function addProcessedTag(tags: Set<string>, eventEmitter: events.EventEmitter): Promise<void> {
    return new Promise((res, rej) => {
        let processedTags: processedTag[] = [];
        if (tags.size == 0) {
            return res();
        } else {
            let promises: Promise<void>[] = [];
            tags.forEach(tag => {
                console.log(tag);
                let newTag:rawTag = JSON.parse(tag);
                promises.push(convertAndAddTag(tags, newTag, processedTags));
            });
            Promise.all(promises).then(_ => {
                // Update event if entry of exit is detected
                let promises2: Promise<void>[] = [];
                processedTags.forEach(processedTag => {
                    promises2.push(processPreviousEntries(processedTag, eventEmitter));
                });

                Promise.all(promises2).then(_ => {
                    return res();
                }).catch(err => {
                    eventEmitter.emit('error', {message: err.message ?? MyErrors2.NOT_READ_TAG})
                });    
            }).catch(err => {
                console.log(err);
                eventEmitter.emit('error', {message: err.message ?? MyErrors2.NOT_READ_TAG})
            });
        }
    });
}

export function convertHexToASCII(hexStr: string): string {
    let asciiStr = '';
    for (let i = 0; i < hexStr.length; i += 2) {
        asciiStr += String.fromCharCode(parseInt(hexStr.substring(i, i+2), 16));
    }
    return asciiStr;
}