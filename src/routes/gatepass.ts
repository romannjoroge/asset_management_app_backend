import express from 'express';
import utility from '../utility/utility.js';
import { Errors, Succes } from '../utility/constants.js';
const router = express.Router();
import pool from '../../db2.js';
import { assignGatePass } from '../GatePass/assignGatepass.js';

router.get('/movements', (req, res) => {
    let {
        from,
        to
    } = req.query;

    // Check if they are valid dates
    try {
        from = utility.checkIfValidDate(from, "Invalid From Date");
        to = utility.checkIfValidDate(to, "Invalid To Date");
    } catch(err) {
        console.log(err);
        return res.status(400).json({message: Errors[37]});
    }

    // Get all movements between the dates
    pool.query(gatepass.getTags, [from, to]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(400).json({message: Errors[38]})
        }
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({message: Errors[9]})
    })
});

// Route for creating a gatepass
router.post('/create', (req, res) => {
    let assetIDs: string[] = req.body.assetIDs;
    let username: string = req.body.username;
    let reason: string = req.body.reason;
    let leavingTime: string = req.body.leavingTime;
    let returnTime: string = req.body.returnTime;
    let entry: boolean = req.body.entry;

    let assetIDsToAdd: number[];
    let leavingTimeToAdd: Date;
    let returnTimeToAdd: Date;

    try {
        // Convert Types to valid types
        assetIDsToAdd = assetIDs.map((elem) => parseInt(elem));
        leavingTimeToAdd = utility.checkIfValidDate(leavingTime, "Invalid Leaving Time");
        returnTimeToAdd = utility.checkIfValidDate(returnTime, "Invalid Return Time");
    } catch(err) {
        console.log(err);
        return res.status(400).json({message: err.message});
    }

    // Add GatePass
    assignGatePass(assetIDsToAdd, username, reason, leavingTimeToAdd, returnTimeToAdd, entry).then(_ => {
        return res.json({message: Succes[13]});
    }).catch(err => {
        console.log(err);
        return res.status(400).json({message: err.message});
    });
});

export default router;