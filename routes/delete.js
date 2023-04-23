/*
    This route deals with deleting items in the database
*/
import express from 'express';
import pool from '../db2.js';
const router = express.Router();
import { Errors, Succes } from '../utility/constants.js';

router.delete('/delete/:item', (req, res) => {

})

export default router;

