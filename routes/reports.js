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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/physical-verification/:stockTake', (req, res) => {
    // Get stock take id from app
    let stockTakeID = req.params.stockTake;
    stockTakeID = Number.parseInt(stockTakeID);
    // Get assets associated with stock take
    pool.query(reportsTable.physical_valuation, [stockTakeID]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[15],
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
                    console.log(__dirname);
                    console.log(err);
                    return res.status(500).json({
                        message: Errors[17],
                    });
                }
                // return res.status(200).json({
                //     message: Succes[2]
                // })
            })
        }).catch(e => {
            console.log(e);
            return res.status(500).json({
                message: Errors[16],
            })
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[9]
        })
    });
});

router.get('/audit-trail/:username', (req, res) => {
    // Get username from paramns
    let username = req.params.username;
    console.log(username);

    // Get logs from database
    pool.query(logTable.selectUserLogs, [username]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[18]
            });
        }
        console.log(data.rows);
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[9]
        });
    });
});

router.get('/missing-assets/:stockTake', (req, res) => {
    // Get stock take id
    let stockTakeID = req.params.stockTake;
    stockTakeID = Number.parseInt(stockTakeID);

    pool.query(reportsTable.missingAssets, [stockTakeID]).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[19]
            })
        }

        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(500).json({
            message: Errors[9]
        })
    })
});

router.get('/report/:type', (req, res) => {
    // Get report type from request params
    let reportType = req.params.type;
    let query;
    let inputs;

    if (reportType == "chain") {
        query = reportsTable.chainOfCustody;
        inputs = [req.body.assettag];
    } else if (reportType == "movement") {
        query = reportsTable.movements
        inputs = [req.body.assettag];
    } else if(reportType == 'category') {
        query = reportsTable.categoryCount;
        inputs = []
    } else if (reportType == 'depreciation') {
        query = reportsTable.depreciationValues;
        inputs = [req.body.assettag];
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
        return res.status(200).json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: Errors[9]
        })
    });
});

router.get('/stockTakes', (req, res) => {
    // Send all stock takes
    pool.query(reportsTable.getStockTakes, []).then(data => {
        if (data.rowCount == 0) {
            return res.status(404).json({
                message: Errors[22]
            })
        }
        return res.status(200).json(data.rows);
    })
})

router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' })
})

export default router;