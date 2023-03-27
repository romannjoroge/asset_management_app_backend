import express from 'express';
import pool from '../db2.js';
const router = express.Router();
import reportsTable from '../src/Reports/db_reports.js';
import { Errors, Succes } from '../utility/constants.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logTable from '../src/Log/db_log.js';
import userTable from '../src/Users/db_users.js';
import checkifAuthenticated from '../middleware/checkifAuthenticated.js';
import checkifAuthorized from '../middleware/checkifAuthorized.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/report/:type', (req, res) => {
    // Get report type from request params
    let reportType = req.params.type;
    let query;
    let inputs;

    if (reportType == "chain") {
        query = reportsTable.chainOfCustody;
        inputs = [req.query.assettag];
    } else if (reportType == "movement") {
        query = reportsTable.movements
        inputs = [req.query.assettag];
    } else if(reportType == 'category') {
        query = reportsTable.categoryCount;
        inputs = []
    } else if (reportType == 'audit') {
        query = logTable.selectUserLogs;
        inputs = [req.query.username];
    } else if (reportType == "missing") {
        query = reportsTable.missingAssets;
        inputs = [req.query.stockTake];
    } else if (reportType == 'physical') {
        query = reportsTable.physical_valuation;
        inputs = [req.query.stockTake];
    } else if (reportType == 'acquisition') {
        query = reportsTable.acquisitionReport;
        var year = Number.parseInt(req.query.year);
        inputs = [new Date(year, 0, 1), new Date(year + 1, 0, 1)];
    } else if (reportType == 'depreciationreport') {
        query = reportsTable.depreciationReport;
        inputs = [req.query.assettag];
    }
    else {
        return res.status(404).json({
            message: Errors[0]
        });
    }

    // Get all log entries that have asset tag and allocate asset event
    pool.query(query, inputs).then(data => {
        console.log(inputs);
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[22]
            })
        }
        
        // Create a csv file from returned data
        let csvData = data.rows;
        let csvFromData = convertArrayToCSV(csvData);
        fs.writeFile(path.join(__dirname, 'output.csv'), csvFromData).then(data => {
            const options = {
                root: path.join(__dirname),
            }
            res.sendFile('output.csv', options, err => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: Errors[17],
                    });
                }

                fs.unlink(path.join(__dirname, 'output.csv'), err => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: Errors[23],
                        })
                    }
                })
            })
        }).catch(e => {
            console.log(e);
            return res.status(500).json({
                message: Errors[16],
            })
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: Errors[9]
        })
    });
});

router.get("/data/:data", checkifAuthenticated, checkifAuthorized('Company Administrator'), (req, res) => {
    let dataType = req.params.data;
    let query;
    let inputs = [];

    if (dataType == "stocktake") {
        query = reportsTable.getStockTakes;
    } else if (dataType == "username"){
        query = userTable.getUsers;
    } else {
        return res.status(404).json({
            message: Errors[0]
        });
    }

    pool.query(query, inputs).then(data => {
        if (data.rowCount == 0) {
            return res.status(404).json({
                message: Errors[22]
            })
        }
        return res.status(200).json(data.rows);
    });
})

router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' })
})

export default router;