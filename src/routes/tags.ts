import express from 'express';
const router = express.Router();
import assetTable from '../Allocation/Asset/db_assets.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
import { addProcessedTag, testEmitFromDifferentFile } from '../Tracking/tags.js';
import { rawTag } from '../Tracking/tags.js';
import schedule from 'node-schedule';
import { convertHexToASCII } from '../Tracking/tags.js';
import expressws from 'express-ws';
var ExpressWs = expressws(express());
import { getAssetsLeavingLocationAndIfAuthorized } from '../Tracking/movements.js';
import events from 'events';
const eventEmitter = new events.EventEmitter();

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
let tagsBeenProcessed = false;
// Create job for adding tags to database
schedule.scheduleJob('*/2 * * * * *', () => {
    if(tagsBeenProcessed) {
        console.log("Tags Currently been processed");
    } else {
        tagsBeenProcessed = true;
        addProcessedTag(tags, eventEmitter);
        tagsBeenProcessed = false;
        eventEmitter.on('error', () => {
            console.log("Oops something happened!");
        })
        tags.clear();
        eventEmitter.removeListener('error', () => {
            console.log("Listener removed")
        })
        
    }
});

router.ws('/locationDashboard', (ws, req) => {
    // React to an event
    eventEmitter.on('location', (data) => {
        ws.send(JSON.stringify(data));
    });

    // React to an error
    eventEmitter.on('error', (data) => {
        ws.send(JSON.stringify(data));
    });

    ws.on('message', (data) => {
        // Converts data to an object
        let json = JSON.parse(data.toString());

        // Logs the data
        console.log(json.data);

        // Sends data back to client
        ws.send(JSON.stringify({data: "Hello from server"}));
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
        commandCode: string, hardwareKey: string, tagRecNums: string, antNo: string, pc:string, epcID: string, crc: string
        ): Promise<void | never> {
        return new Promise((res, rej) => {
            pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, antNo, pc, epcID, crc]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_READ_TAG));
            })
        });
    }

    let promises: Promise<void | never>[] = [];

    for (var i in tagRecords) {
        let antNo = tagRecords[i].antNo;
        let epcIDToAdd = convertHexToASCII(tagRecords[i].epcID);
        let tag: rawTag = {commandCode, hardwareKey, tagRecNums, antNo, pc: tagRecords[i].pc, epcID: epcIDToAdd, crc: tagRecords[i].crc}
        tags.add(JSON.stringify(tag));
        promises.push(addTag(commandCode, hardwareKey, tagRecNums, antNo, tagRecords[i].pc, epcIDToAdd, tagRecords[i].crc));
    }

    Promise.all(promises).then(_ => {
        res.send("Done");
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: MyErrors2.NOT_READ_TAG});
    });
});

router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});



export default router;