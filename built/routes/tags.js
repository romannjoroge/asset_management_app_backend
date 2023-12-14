var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
const router = express.Router();
import assetTable from '../Allocation/Asset/db_assets.js';
import pool from '../../db2.js';
import MyError from '../utility/myError.js';
import { MyErrors2 } from '../utility/constants.js';
import { addProcessedTag, testEmitFromDifferentFile } from '../Tracking/tags.js';
import schedule from 'node-schedule';
import { convertHexToASCII } from '../Tracking/tags.js';
import expressws from 'express-ws';
var ExpressWs = expressws(express());
import events from 'events';
const eventEmitter = new events.EventEmitter();
// Create set for tags
let tags = new Set();
// Create job for adding tags to database
schedule.scheduleJob('*/1 * * * * *', () => {
    addProcessedTag(tags, eventEmitter).then(_ => {
        console.log("Added tags to database");
        console.log(tags);
        tags.clear();
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            eventEmitter.emit('error', { message: err.message });
        }
        else {
            eventEmitter.emit('error', { message: MyErrors2.NOT_PROCESS_TAG });
        }
        tags.clear();
    });
});
router.ws('/test', (ws, req) => {
    console.log("req.query is: ");
    console.log(req.query);
    let locationID = req.query.locationID;
    ws.send(`Location ${locationID} connected`);
    // React to an event
    eventEmitter.on('location', (data) => {
        if (data.location == locationID) {
            ws.send(JSON.stringify(data.data));
        }
        else {
            ws.send("Not this location");
        }
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
        ws.send(JSON.stringify({ data: "Hello from server" }));
    });
});
router.post('/test2', (req, res) => {
    // This route emits an event when it is reached
    testEmitFromDifferentFile(eventEmitter).then(_ => {
        res.send("Done");
    }).catch(err => {
        res.send(err.message);
    });
});
router.ws('/test3', (ws, req) => {
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        ws.send(JSON.stringify({ data: Math.random() }));
    }), 1000);
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
        ws.send(JSON.stringify({ data: "Hello from server" }));
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
                console.log(err);
                return rej(new MyError(MyErrors2.NOT_READ_TAG));
            });
        });
    }
    let promises = [];
    for (var i in tagRecords) {
        let antNo = tagRecords[i].antNo;
        let epcIDToAdd = convertHexToASCII(tagRecords[i].epcID);
        let tag = { commandCode, hardwareKey, tagRecNums, antNo: tagRecords[i].antNo, pc: tagRecords[i].pc, epcID: epcIDToAdd, crc: tagRecords[i].crc };
        tags.add(JSON.stringify(tag));
        promises.push(addTag(commandCode, hardwareKey, tagRecNums, antNo, tagRecords[i].pc, epcIDToAdd, tagRecords[i].crc));
    }
    Promise.all(promises).then(_ => {
        res.send("Done");
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: MyErrors2.NOT_READ_TAG });
    });
});
router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});
export default router;
//# sourceMappingURL=tags.js.map