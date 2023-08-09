import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors, MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
export function syncTags(tags) {
    return new Promise((res, rej) => {
        let promises = [];
        // Sync every tag
        tags.forEach((tag) => promises.push(syncTag(tag)));
        Promise.all(promises).then(_ => {
            return res();
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
export function syncTag(tag) {
    return new Promise((res, rej) => {
        // Check if asset exist
        Asset._doesBarCodeExist(tag.barcode).then(doesExist => {
            if (doesExist == false) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }
            let timestamp = new Date(tag.timestamp);
            // Convert date to ISO string
            let dateToAdd = timestamp.toISOString();
            Asset._getAssetID(tag.barcode).then(assetID => {
                pool.query(locationTable.syncItem, [dateToAdd, true, assetID]).then(() => {
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
            return res({ scannedTime, assetID, readerDeviceID });
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}
function addProcessedTagToDB(processedTag) {
    return new Promise((res, rej) => {
        pool.query(locationTable.addProcessedTag, [processedTag.scannedTime, processedTag.assetID, processedTag.readerDeviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}
export function addProcessedTag(tags) {
    return new Promise((res, rej) => {
        if (tags.size == 0) {
            return res();
        }
        else {
            let promises = [];
            tags.forEach(tag => {
                let newTag = JSON.parse(tag);
                promises.push(convertRawTagToProcessedTag(newTag).then(processedTag => {
                    return addProcessedTagToDB(processedTag);
                }));
            });
            Promise.all(promises).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
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