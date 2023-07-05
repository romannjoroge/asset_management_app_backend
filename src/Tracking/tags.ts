import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import { Errors } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import locationTable from "./db_location.js";
import _ from 'lodash';

interface processedTag {
    scannedTime: Date;
    assetID: number;
    readerDeviceID: string;
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


function convertRawTagToProcessedTag(rawTag: rawTag): Promise<processedTag> {
    return new Promise((res, rej) => {
        let readerDeviceID = rawTag.hardwareKey + rawTag.antNo;
        let scannedTime = new Date();
        Asset._getAssetID(rawTag.epcID).then(assetID => {
            return res({scannedTime, assetID, readerDeviceID});
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}

function addProcessedTagToDB(processedTag: processedTag): Promise<void> {
    return new Promise((res, rej) => {
        pool.query(locationTable.addProcessedTag, [processedTag.scannedTime, processedTag.assetID, processedTag.readerDeviceID]).then(_ => {
            return res();
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[73]));
        });
    });
}

export function addProcessedTag(tags: Set<string>): Promise<void> {
    return new Promise((res, rej) => {
        if (tags.size == 0) {
            return res();
        } else {
            let promises: Promise<void>[] = [];
            tags.forEach(tag => {
                let newTag:rawTag = JSON.parse(tag);
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