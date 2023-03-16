import express from 'express';
const router = express.Router();
import pool from '../db2.js';
import locationTable from '../src/Tracking/db_location.js';
import { Errors } from '../utility/constants.js';

// Route to send all locations and their ids
router.get('/getLocations', (req, res) => {
    console.log("I have entered the request");
    pool.query(locationTable.getLocations, []).then((data) => {
        if (data.rowCount <= 0){
            return res.status(404).json({
                message: Errors[13]
            });
        }
        return res.status(200).json(data.rows);
    }).catch((e) => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9]
        })
    })
})

router.route('*', (req, res)=>{
    res.status(404).json({data:'Resource not found'})
})

export default router;
