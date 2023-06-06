import express from 'express';
import utility from '../../utility/utility.js';
import { Errors } from '../../utility/constants.js';
const router = express.Router();
import gatepass from '../Tracking/db_location.js';
import pool from '../../db2.js';

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

export default router;