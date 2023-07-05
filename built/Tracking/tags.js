import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
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