import express from 'express';
const router = express.Router();
import assetTable from '../Allocation/Asset/db_assets.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors } from '../utility/constants.js';
import { addProcessedTag } from '../Tracking/tags.js';
import schedule from 'node-schedule';
import { convertHexToASCII } from '../Tracking/tags.js';
// Create set for tags
let tags = new Set();
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
    let commandCode = req.body.commandCode;
    let hardwareKey = req.body.hardwareKey;
    let tagRecNums = req.body.tagRecNums;
    let tagRecords = req.body.tagRecords;
    // Add tag to database
    function addTag(commandCode, hardwareKey, tagRecNums, antNo, pc, epcID, crc) {
        return new Promise((res, rej) => {
            pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, antNo, pc, epcID, crc]).then(_ => {
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[73]));
            });
        });
    }
    let promises = [];
    for (var i in tagRecords) {
        let antNo = Number.parseInt(tagRecords[i].antNo);
        let epcIDToAdd = convertHexToASCII(tagRecords[i].epcID);
        let tag = { commandCode, hardwareKey, tagRecNums, antNo: tagRecords[i].antNo, pc: tagRecords[i].pc, epcID: epcIDToAdd, crc: tagRecords[i].crc };
        tags.add(JSON.stringify(tag));
        promises.push(addTag(commandCode, hardwareKey, tagRecNums, antNo, tagRecords[i].pc, epcIDToAdd, tagRecords[i].crc));
    }
    Promise.all(promises).then(_ => {
        res.send("Done");
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[73] });
    });
});
router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});
export default router;
//# sourceMappingURL=tags.js.map