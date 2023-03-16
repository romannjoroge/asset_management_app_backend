import express from 'express';
const router = express.Router();
import userTable from '../src/Users/db_users.js';
import Asset from '../src/Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';
import pool from '../db2.js';

router.get('/getUsers', (req, res) => {
    pool.query(userTable.getUsers, []).then(data => {
        if(data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[14],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9],
        })
    })
});

export default router;