import express from 'express';
const router = express.Router();
import assetTable from '../Allocation/Asset/db_assets.js';
import pool from '../../db2.js';
import { Errors } from '../utility/constants.js';
router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let { commandCode, hardwareKey, tagRecNums, tagRecords } = req.body;
    console.log(hardwareKey, tagRecords);
    // Add tag to database
    for (var i in tagRecords) {
        let tag = tagRecords[i];
        console.log(tag);
        pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, tag.antNo, tag.pc, tag.epcID, tag.crc]).then(_ => {
            // Add an entry to log.csv file
            // let csvData = [{
            //     commandCode,
            //     hardwareKey,
            //     tagRecNums,
            //     antNo: tag.antNo,
            //     pc: tag.pc,
            //     epcID: tag.epcID,
            //     crc: tag.crc
            // }];
            // let csvFromData = convertArrayToCSV(csvData);
            // fs.appendFile(path.join(__dirname, 'tags.log'), `${new Date().toISOString()},${commandCode},${hardwareKey},${tagRecNums},${tag.antNo},${tag.pc},${tag.epcID},${tag.crc}\n`).then(_ => {
            // }).catch(e => {
            //     console.log(e);
            //     return res.status(500).json({
            //         message: Errors[9],
            //     })
            // });
            res.send("Done");
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: Errors[9] });
        });
    }
    res.send("Done");
});
router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});
export default router;
//# sourceMappingURL=tags.js.map