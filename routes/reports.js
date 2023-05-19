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
import locationTable from '../src/Tracking/db_location.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/report/:type', (req, res) => {
    // Get report type from request params
    let reportType = req.params.type;
    let query;
    let inputs;

    if (reportType == "chain") {
        query = reportsTable.chainOfCustody;
        inputs = [req.query.barcode];
    } else if (reportType == "movement") {
        query = reportsTable.movements
        inputs = [req.query.barcode];
    } else if (reportType == 'category') {
        query = reportsTable.categoryCount;
        inputs = []
    } else if (reportType == 'audit') {
        try{
            query = logTable.selectUserLogs;
            let username = req.query.username;
            let to = utility.checkIfValidDate(req.query.to, "Invalid To Date");
            let from = utility.checkIfValidDate(req.query.from, "Invalid From Date");
            let eventtype = req.query.eventtype;
            inputs = [username, from, to, eventtype];
        }catch(err) {
            console.log(err);
            return res.status(400).json({message: Errors[9]})
        }
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

router.get('/location/:report/:id', (req, res) => {
    // Repeat for all locations with the parent location of id
    function getNumberOfMissingItemsForEachLocation(id, stockTakesQuery) {
        return new Promise((resolve, reject) => {
            // Get all locations that are in the location id
            let locationIDs = [];
            if (id) {
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
                        let missing = "No Stock Takes Found";
                        pool.query(locationTable.getLocation, [id]).then(data => {
                            resolve({ [data.rows[0].name]: missing });
                        }).catch(err => {
                            console.log(err);
                            reject(Errors[9])
                        });
                    }

                    // Get the assets that are in the asset register but not in the stock takes
                    pool.query(stockTakesQuery, [stockTakes]).then(data => {
                        let missing = data.rows[0].missing;
                        pool.query(locationTable.getLocation, [id]).then(data => {
                            resolve({ [data.rows[0].name]: missing });
                        }).catch(err => {
                            console.log(err);
                            reject(Errors[9])
                        });
                    }).catch(err => {
                        console.log(err);
                        reject(Errors[9])
                    });
                }).catch(err => {
                    console.log(err);
                    reject(Errors[9])
                });

            }).catch(err => {
                reject(Errors[9])
            });
        });
    }

    // Get location id from request params
    let id = Number.parseInt(req.params.id);
    let reportType = req.params.report;
    let databaseQuery;
    let arguements;
    let stockTakesQuery;

    // Missing assets report
    if (reportType === "missing") {
        stockTakesQuery = reportsTable.getAssetsInStockTakes;
        if(id == 0) {
            databaseQuery = 'SELECT name, id FROM Location WHERE parentLocationID IS NULL';
            arguements = [];
        } else {
            databaseQuery = reportsTable.getChildLocations;
            arguements = [id];
        }
    } 
    // Physical Report
    else if (reportType === "physical") {
        stockTakesQuery = reportsTable.numOfAssetsInStockTakes;
        if (id == 0){
            databaseQuery = 'SELECT name, id FROM Location WHERE parentLocationID IS NULL';
            arguements = [];
        } else {
            databaseQuery = reportsTable.getChildLocations;
            arguements = [id];
        }
    }
    
    else {
        return res.status(404).json({
            message: Errors[0]
        });
    }

    // Get all locations with parent id of id
    pool.query(databaseQuery, arguements).then(childLocations => {
        let returnedResponse = {};
        // If there are no children locations, return data for said location and a flag that indicates that there are no children
        if(childLocations.rowCount == 0) {
            getNumberOfMissingItemsForEachLocation(id, stockTakesQuery).then(data => {
                return res.json({...data, children: false});
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    message: err
                })
            });
        } else {
            let promises = [];

            for (var i in childLocations.rows) {
                promises.push(getNumberOfMissingItemsForEachLocation(childLocations.rows[i].id, stockTakesQuery));
                returnedResponse[childLocations.rows[i].name] = 0;
            }

            Promise.all(promises).then(data => {
                return res.json(data);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    message: err
                })
            });
        }
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: err
        })
    });
})


router.get("/data/:data", checkifAuthenticated, checkifAuthorized('Company Administrator'), (req, res) => {
    let dataType = req.params.data;
    let query;
    let inputs = [];

    if (dataType == "stocktake") {
        query = reportsTable.getStockTakes;
    } else if (dataType == "username") {
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