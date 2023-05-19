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
import utility from '../utility/utility.js';

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

router.get('/missing/:id', (req, res) => {
    // Get location id from request params
    let id = Number.parseInt(req.params.id);

    // Get all locations that are in the location id
    let locationIDs = [];
    if (id){
        locationIDs.push(id);
    }

    // Find all child locations
    function findChildLocations(id) {
        return new Promise((res, rej) => {
            // Get the child locations of the location with id ID
            pool.query(reportsTable.getChildLocations, [id]).then(data => {
                if (data.rowCount > 0) {
                    // Add each location to locationIDs and call findChildLocations on each location
                    for (let i in data.rows) {
                        locationIDs.push(data.rows[i]['id']);

                        // Resolve so that recursive call can end
                        res(findChildLocations(data.rows[i]['id']));
                    }
                }
                // Base Case, function should do nothing if location has no children 
                else {
                    res(locationIDs);
                }
            }).catch(err => {
                console.log(err);
                rej(Errors[9]);
            })
        });
    }

    // Call findChildLocations on the location id
    findChildLocations(id).then(locations => {
        // Get the stock take that is the closest to chosen date for each location
        let date = utility.checkIfValidDate(req.query.date, "Invalid Date");
        let stockTakes = [];
        let promises = [];

        // Function returns a stock take id if one is found
        function getStockTakes(location) {
            return new Promise((res, rej) => {
                pool.query(reportsTable.getClosestStockTake, [date, location]).then(data => {
                    if (data.rowCount > 0) {
                        res(data.rows[0].id)
                    } else {
                        res(0)
                    }
                }).catch(err => {
                    console.log(err);
                    rej(Errors[9]);
                })
            });
        }

        // Creates a list of promises that need to be all evaluated
        for (var i in locations) {
            promises.push(getStockTakes(locations[i]));
        }

        Promise.all(promises).then(data => {
            // Filtering out repeats and 0 from the returned stockTakes
            stockTakes = data.filter((value, index, arr) => arr.indexOf(value) === index && value != 0);

            if (stockTakes.length == 0) {
                return res.status(404).json({
                    message: Errors[45]
                })
            }

            // Get the assets that are in the asset register but not in the stock takes
            pool.query(reportsTable.getAssetsInStockTakes, [stockTakes]).then(data => {
                res.send(data.rows[0].missing);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    message: Errors[9]
                })
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: Errors[9]
            })
        });

    }).catch(err => {
        return res.status(500).json({
            message: err
        })
    });
      
    // Return the assets
})


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