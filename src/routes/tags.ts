import express from 'express';
const router = express.Router();
import assetTable from '../Allocation/Asset/db_assets.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import { addProcessedTag } from '../Tracking/tags.js';
import { rawTag } from '../Tracking/tags.js';
import schedule from 'node-schedule';

interface tagEntry  {
    commandCode: string;
    hardwareKey: string;
    tagRecNums: string;
    tagRecords: tagRecords[]
}

interface tagRecords {
    antNo: string;
    pc:  string;
    epcID: string;
    crc: string;
}

// Create set for tags
let tags: Set<string> = new Set();

// Create job for adding tags to database
schedule.scheduleJob('*/1 * * * * *', () => {
    addProcessedTag(tags).then(_ => {
        console.log("Added tags to database");
        console.log(tags);
        tags.clear();
    }).catch(err => {
        console.log(err);
        tags.clear();
    });
});



router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let commandCode:string = req.body.commandCode;
    let hardwareKey:string = req.body.hardwareKey;
    let tagRecNums:string = req.body.tagRecNums;
    let tagRecords:tagRecords[] = req.body.tagRecords;


    // Add tag to database
    function addTag(
        commandCode: string, hardwareKey: string, tagRecNums: string, antNo: number, pc:string, epcID: string, crc: string
        ): Promise<void | never> {
        return new Promise((res, rej) => {
            pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, antNo, pc, epcID, crc]).then(_ => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[73]));
            })
        });
    }

    let promises: Promise<void | never>[] = [];

    for (var i in tagRecords) {
        let antNo = Number.parseInt(tagRecords[i].antNo);
        let tag: rawTag = {commandCode, hardwareKey, tagRecNums, antNo: tagRecords[i].antNo, pc: tagRecords[i].pc, epcID: tagRecords[i].epcID, crc: tagRecords[i].crc}
        tags.add(JSON.stringify(tag));
        promises.push(addTag(commandCode, hardwareKey, tagRecNums, antNo, tagRecords[i].pc, tagRecords[i].epcID, tagRecords[i].crc));
    }

    Promise.all(promises).then(_ => {
        res.send("Done");
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[73]});
    });
});

router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});



export default router;