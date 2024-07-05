import express from 'express';
import pool from '../../db2.js';
const router = express.Router();
import reportsTable from '../Reports/db_reports.js';
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import path from 'path';
import { fileURLToPath } from 'url';
import logTable from '../Log/db_log.js';
import userTable from '../Users/db_users.js';
import checkifAuthenticated from '../../middleware/checkifAuthenticated.js';
import checkifAuthorized from '../../middleware/checkifAuthorized.js';
import utility from '../utility/utility.js';
import locationTable from '../Tracking/db_location.js';
import _ from 'lodash';
import { getTaggedAssets } from '../Reports/tagged_assets.js';
import MyError from '../utility/myError.js';
import { createDeprecaitonScheduleEntries } from '../Allocation/Asset/depreciations.js';
import { Log } from '../Log/log.js';
import getAuditTrail from '../Reports/audit_trail.js';
import { getAssetRegister } from '../Reports/asset_register.js';
import { getAssetDisposalReport } from '../Reports/asset_disposal.js';
import { assetsNotInRegister, assetsPresentInRegister } from '../Reports/state_physical_valuation.js';
import { getChainOfCustody } from '../Reports/chain_custody.js';
import { assetMovementReport } from '../Reports/asset_movement.js';
import { assetsInLocation } from '../Reports/location_asset_value.js';
import { assetAcquisition } from '../Reports/asset_acquisition.js';
import { getDepreciationDetails } from '../Reports/asset_depreciation.js';
import { getGatepassReport } from '../Reports/gatepass_report.js';
import { UserRoles } from '../Users/users.js';
import { categoryReport } from '../Reports/category_report.js';
import { getCategoryDepreciation } from '../Reports/category_depreciation.js';
import depreciateAssetPerCategory from '../Reports/depreciation_per_category.js';
import { getAdditionalAssetsInInventory, getAssetsMissingInInventory, getAssetsPresentInInventory } from '../Reports/inventory.js';
import schedule from 'node-schedule';
import generateDepreciatedAssetsInMonth from '../Mail/generateDepreciatedAssetsMail.js';
import { storeGenerateReportStatement } from '../Reports/generateReport.js';
import handleError from '../utility/handleError.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';
import createMailSubscription from '../Mail/createMailSubscription.js';
import { getGeneratedReports } from '../Reports/get_generated_reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var rule = new schedule.RecurrenceRule();
rule.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
rule.date = 1;
rule.hour = 0;
rule.minute = 0;

var j = schedule.scheduleJob(rule, generateDepreciatedAssetsInMonth);

/**
 * Route for testing stuff
 */
router.get('/test', async (req, res) => {
    try {
        // Testing
        // let assetRegister = await getAssetDisposalReport(new Date(2023, 7, 12), new Date(2023, 7, 15));
        // console.log(assetRegister);
        // return res.json(assetRegister);

        // let assetRegister = await assetAcquisition(new Date(2023, 4, 1), new Date(2023, 7, 1), 3);
        // console.log(assetRegister);
        // return res.json(assetRegister);

        // let assetRegister = await getDepreciationDetails('AUA1002');
        // console.log(assetRegister);
        // return res.json(assetRegister);

        // let assetRegister = await assetMovementReport('AUA1000');
        // console.log(assetRegister);
        // return res.json(assetRegister);

        let data = await getGatepassReport('010200000150');
        console.log(data);
        return res.json(data);

        // let data = await ReportDatabase.getAcquiredAssetsInLocation(new Date(2023, 4, 1), new Date(2023, 7, 1), 3);
        // console.log(data);
        // return res.json(data);
    } catch(err) {
        console.log(err);
        return res.status(500).send("Shit Went Down!")
    }
});

router.get("/genertedReports", async (req, res) => {
    try {
        return res.json(await getGeneratedReports());
    } catch(err) {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
})

// Route to store generate report stuff
router.post('/storeGen', async (req, res) => {
    let {
        fields,
        name,
        frequency,
    } = req.body;

    try {
        await storeGenerateReportStatement({
            name,
            frequency,
            fields,
            creator: req.id
        });
        return res.status(200).json({message: Success2.CUSTOM_REPORT});
    } catch(err) {
        const {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
});

interface StoredReports {
    name: string,
    frequency: {
        minutes: string,
        hours: string,
        dayMonth: string,
        dayWeek: string,
        month: string
    },
    creator: string,
    fields: {
        jsonName: string,
        name: string,
        description: string | undefined,
        from: any,
        to: any
    }[],
}

// Get stored generated reports
router.get('/storedReports', async (req, res) => {
    try {
        let query = "SELECT g.name, u.username, report FROM GenerateReports g INNER JOIN User2 u ON u.id = g.creator_id WHERE g.deleted = false;";
        let dbResutls = await getResultsFromDatabase<{name: string, username: string, report: Record<string, any>}>(query, []);
        
        let resultsToReturn: StoredReports[] = [];
        dbResutls.forEach((res) => {
            resultsToReturn.push({
                name: res.name,
                creator: res.username,
                fields: res.report['fields'] ?? [],
                frequency: res.report['frequency'] ?? {},
            })
        })
        return res.json(resultsToReturn);
    } catch(err) {
        console.log(err);
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
});

router.get('/inventory/:type', (req, res) => {
    let type = req.params.type
    let inventoryID = Number.parseInt(req.query.inventoryID);

    if (type === "present") {
        getAssetsPresentInInventory(inventoryID).then(results => {
            res.json(results);
        }).catch((err: MyError) => {
            return res.status(500).json({message: Errors[9]})
        });

    }
    else if (type == 'missing') {
        getAssetsMissingInInventory(inventoryID).then(results => {
            res.json(results);
        }).catch((err: MyError) => {
            return res.status(500).json({message: Errors[9]})
        });
    }
    else if (type == 'additional') {
        getAdditionalAssetsInInventory(inventoryID).then(results => {
            res.json(results);
        }).catch((err: MyError) => {
            return res.status(500).json({message: Errors[9]})
        });
    }
});

// Enum To Store Types Of Reports
enum ReportType {
    "FIXED_ASSET_REGISTER" = "register",
    "PHYSICAL_VERIFICATION" = "physical",
    "AUDIT_TRAIL" = "audit",
    "ASSET_DISPOSAL" = "disposal",
    "MISSING_ASSETS" = "missing",
    "UNACCOUNTED_ASSETS" = "unaccounted",
    "STATE_PHYSICAL_VERIFICATION_MISSING" = "state_missing",
    "STATE_PHYSICAL_VERIFICATION_PRESENT" = "state_present",
    "CHAIN_OF_CUSTODY" = "chain",
    "ASSET_MOVEMENT_REPORT" = "movement",
    "GATEPASS_REPORT" = "gatepass",
    "LOCATION_ASSET_VALUE_REPORT" = "value",
    "ASSET_ACQUISITION" = "acquisiton",
    "ASSET_DEPRECIATION" = "depreciation",
    "ASSET_CATEGORY" = "category",
    "TAGGED_ASSETS" = "tagged",
    "UNTAGGED_ASSETS" = "untagged",
    "CATEGORY_DEPRECIATION_REPORT" = "categdepreciation",
    "ASSET_CATEGORY_DEPRECIATION_REPORT" = "assetcategdep"
}

router.get('/report/:type', checkifAuthorized(UserRoles.REPORT_GEN), (req, res) => {
    // Get report type from request params
    let reportType = req.params.type;
    let startDate: Date;
    let endDate: Date;
    let locationid: number;
    let barcode: string;
    let userid: number;
    let eventtype: string;
    let categoryid: number;

    if (reportType === ReportType.ASSET_ACQUISITION) {
        // Get fields of report
        startDate = utility.checkIfValidDate(req.query.startDate, "Invalid Date");
        endDate = utility.checkIfValidDate(req.query.endDate, "Invalid Date");
        locationid = Number.parseInt(req.query.locationid);

        // Generate report
        assetAcquisition(startDate, endDate, locationid).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_ACQUISITION_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
            
        });
    } 
    else if (reportType === ReportType.ASSET_CATEGORY) {
        locationid = Number.parseInt(req.query.locationid);

        categoryReport(locationid).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_CATEGORY_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                console.log(err);
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            console.log(err);
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        });
    }
    else if (reportType === ReportType.ASSET_DEPRECIATION) {
        barcode = req.query.barcode;

        getDepreciationDetails(barcode).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_DEPRECIATION_SCHEDULE_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        });
    }
    else if (reportType === ReportType.ASSET_DISPOSAL) {
        // Get fields of report
        startDate = utility.checkIfValidDate(req.query.startDate, "Invalid Date");
        endDate = utility.checkIfValidDate(req.query.endDate, "Invalid Date");

        getAssetDisposalReport(startDate, endDate).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_DISPOSAL_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        });
    }
    else if (reportType === ReportType.ASSET_MOVEMENT_REPORT) {
        // Get fields of report
        barcode = req.query.barcode;

        assetMovementReport(barcode).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.MOVEMENT_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        });
    }
    else if (reportType === ReportType.AUDIT_TRAIL) {
        // Get fields of report
        userid = Number.parseInt(req.query.userid);
        eventtype = req.query.eventtype;
        startDate = utility.checkIfValidDate(req.query.startDate, "Invalid Date");
        endDate = utility.checkIfValidDate(req.query.endDate, "Invalid Date");

        getAuditTrail(userid, eventtype, startDate, endDate).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.AUDIT_TRAIL_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.CHAIN_OF_CUSTODY) {
        // Get fields of report
        barcode = req.query.barcode;

        getChainOfCustody(barcode).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.CHAIN_OF_CUSTODY_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.FIXED_ASSET_REGISTER) {
        getAssetRegister().then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_REGISTER_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.GATEPASS_REPORT) {
        // Get fields of report
        barcode = req.query.barcode;

        getGatepassReport(barcode).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.GATEPASS_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.LOCATION_ASSET_VALUE_REPORT) {
        // Get fields of report
        locationid = Number.parseInt(req.query.locationid);

        assetsInLocation(locationid).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.ASSET_DEPRECIATION_SCHEDULE_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.STATE_PHYSICAL_VERIFICATION_MISSING) {
        assetsNotInRegister().then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.STATE_PHYSICAL_VERIFICATION_MISSING).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.STATE_PHYSICAL_VERIFICATION_PRESENT) {
        assetsPresentInRegister().then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.STATE_PHYSICAL_VERIFICATION_PRESENT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
        })
    }
    else if (reportType === ReportType.TAGGED_ASSETS) {
        getTaggedAssets(true).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.TAGGED_ASSETS).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        })
    }
    else if (reportType === ReportType.UNTAGGED_ASSETS) {
        getTaggedAssets(false).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.TAGGED_ASSETS).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        })
    }
    else if (reportType == ReportType.CATEGORY_DEPRECIATION_REPORT) {
        getCategoryDepreciation().then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.CATEGORY_DERECIATION_CONFIGURATION_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        })
    }
    else if (reportType == ReportType.ASSET_CATEGORY_DEPRECIATION_REPORT) {
        categoryid = Number.parseInt(req.query.categoryid);
        startDate = utility.checkIfValidDate(req.query.startDate, "Invalid Date");
        endDate = utility.checkIfValidDate(req.query.endDate, "Invalid Date");

        depreciateAssetPerCategory(categoryid, startDate, endDate).then(results => {
            // Add log entry
            Log.createLog(req.ip, req.id, Logs.CATEGORY_DERECIATION_CONFIGURATION_REPORT).then(_ => {
                return res.json(results);
            }).catch((err: MyError) => {
                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR})
            })
        })
    }
    else {
        return res.status(400).json({message: MyErrors2.REPORT_NOT_SUPPPORTED});
    }
});

router.get('/depSchedule/:barcode', (req, res) => {
    let barcode = req.params.barcode;
    console.log(barcode);

    let query = reportsTable.depSchedule;
    pool.query("SELECT assetID FROM Asset WHERE barcode = $1", [barcode]).then(data => {
        let assetID = data.rows[0].assetid;

        // Create depreciation schedule
        createDeprecaitonScheduleEntries(assetID).then(entries => {
            var returnedData: {year: number, openingbookvalue: number}[] = [];
            entries.map((entry) => {
                returnedData.push({year: entry.year, openingbookvalue: entry.openingbookvalue})
            })
            
            // Add log
            // Log.createLog(req.ip, req.id , Logs.ASSET_DEPRECIATION_SCHEDULE_REPORT).then((_: any) => {
            //     return res.json(returnedData)
            // }).catch((err: MyError) => {
            //     return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
            // })
            return res.json(returnedData)
        })
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
        console.log(`Top Location is : ${id}`);
        return new Promise((resolve, reject) => {
            // Get all locations that are in the location id
            console.log(1);
            let locationIDs = [];
            if (id) {
                locationIDs.push(id);
            }

            // Find all child locations
            function findChildLocations(id) {
                console.log(2);
                return new Promise((res, rej) => {
                    console.log(3);
                    // Get the child locations of the location with id ID
                    pool.query(reportsTable.getChildLocations, [id]).then(data => {
                        console.log(`THE CHILDREN OF LOCATION ${id} ARE:`);
                        console.log(data.rows);
                        console.log(4);
                        if (data.rowCount > 0) {
                            // Add each location to locationIDs and call findChildLocations on each location
                            for (let i in data.rows) {
                                console.log(5);
                                locationIDs.push(data.rows[i]['id']);

                                // Resolve so that recursive call can end
                                res(findChildLocations(data.rows[i]['id']));
                            }
                        }
                        // Base Case, function should do nothing if location has no children 
                        else {
                            console.log(6);
                            res(locationIDs);
                        }
                    }).catch(err => {
                        console.log(7);
                        console.log(err);
                        rej(Errors[9]);
                    })
                });
            }

            // Call findChildLocations on the location id
            findChildLocations(id).then(locations => {
                console.log(locations);
                if (reportType == "category") {
                    console.log(8);
                    function groupAssetsByCategory(locationID){
                        console.log("Function Entered");
                        return new Promise((res, rej) => {
                            let returnData = {};
                            // Get name of location
                            pool.query(locationTable.getLocation, [locationID]).then(data => {
                                console.log(11);
                                // Group assets in location by category
                                let locationName = data.rows[0].name;
                                pool.query(reportsTable.assetsInLocationByCategory, [locationID]).then(data => {
                                    console.log(12);
                                    console.log(`THE FOUND GROUPINGS FOR LOCATION ${locationID} ARE:`);
                                    console.log(data.rows);
                                    if (data.rowCount > 0) {
                                        console.log(13);
                                        returnData['name'] = locationName;
                                    

                                        // Create a dictionary of category names and the number of assets in each category
                                        for (var i in data.rows) {
                                            if (data.rows[i].count) {
                                                returnData[data.rows[i].name] = Number.parseInt(data.rows[i].count);
                                            } else {
                                                returnData[data.rows[i].name] = 0;
                                            }
                                        }
                                        console.log(`THE GROUPED ASSETS FOR LOCATION ${returnData['name']} ARE:`);
                                        console.log(returnData);
                                        console.log("Function Left");
                                        res(returnData);
                                    } else {
                                        console.log("Function Left");
                                        res({[locationName]: "No Assets Found"});
                                    }
                                }).catch(err => {
                                    console.log('Error 1');
                                    console.log(err);
                                    rej(Errors[9]);
                                });
                            }).catch(err => {
                                console.log('Error 2');
                                console.log(err);
                                rej(Errors[9])
                            });
                        });
                    }
                    let promises = [];

                    // Group Assets by categories for every location
                    for (var i in locations) {
                        console.log(9)
                        console.log(locations[i]);
                        promises.push(groupAssetsByCategory(locations[i]));
                    }
                    let returnedObject = {};
                    Promise.all(promises).then(data => {
                        console.log(10);
                        console.log("THE RETURNED DATA FROM GROUP ASSETS BY CATEGORY:");
                        console.log(data);
                        for (var i in data){
                            let objectKeys = Object.keys(data[i]);
                            for (var j in objectKeys) {
                                if(objectKeys[j] !== 'name') {
                                    console.log(`THE ADDITION OF ${returnedObject[objectKeys[j]]} AND ${data[i][objectKeys[j]]} is ${data[i][objectKeys[j]] + returnedObject[objectKeys[j]]} for ${objectKeys[j]}`);
                                    if (returnedObject[objectKeys[j]]) {
                                        returnedObject[objectKeys[j]] += data[i][objectKeys[j]];
                                    } else {
                                        returnedObject[objectKeys[j]] = data[i][objectKeys[j]];
                                    }
                                } else {
                                    if(returnedObject['name'] == null) {
                                        returnedObject['name'] = data[i]['name'];
                                    }
                                }
                            }
                        }
                        console.log("THE END PRODUCT OF ADDING IS: ")
                        console.log(returnedObject);
                        resolve(returnedObject);
                    }).catch(err => {
                        console.log(11);
                        console.log(err);
                        reject(Errors[9])
                    });

                }
                    // Asset Acquistion Report
                else if (reportType == 'acquisition') {
                    // Get to and from dates
                    let to = utility.checkIfValidDate(req.query.to, "Invalid To Date");
                    let from = utility.checkIfValidDate(req.query.from, "Invalid From Date");

                    function getAccumulatedAcquisitionCost(locationID) {
                        return new Promise((res, rej) => {
                            // Get name of location
                            pool.query(locationTable.getLocation, [locationID]).then(data => {
                                let locationName = data.rows[0].name;
                                // Get total acquisition for each location
                                pool.query(reportsTable.getAccumulatedAcquisitionCost, [locationID, from, to]).then(data => {
                                    // Stored sum
                                    let sum;
                                    if (data.rowCount <= 0) {
                                        sum = "No Assets In This Location"
                                    } else {
                                        sum = data.rows[0].sum;
                                    }

                                    res({ name: locationName, sum: sum });
                                }).catch(err => {
                                    console.log('Error 1');
                                    console.log(err);
                                    rej(Errors[9]);
                                });
                            }).catch(err => {
                                console.log('Error 2');
                                console.log(err);
                                rej(Errors[9])
                            });
                        });
                    }

                    // Get acquisition details for all locations
                    let promises = [];

                    for (var i in locations) {
                        promises.push(getAccumulatedAcquisitionCost(locations[i]));
                    }

                    let returnedObject = {};
                    Promise.all(promises).then(data => {
                        let name = ''
                        for (var i in data) {
                            if (i == 0) {
                                returnedObject.name = data[i].name;
                                if (data[i].sum) {
                                    returnedObject.sum = data[i].sum;
                                } else {
                                    returnedObject.sum = 0;
                                }
                            } else {
                                returnedObject.sum += data[i].sum;
                            }
                        }
                        resolve(returnedObject);
                    }).catch(err => {
                        console.log(err);
                        reject(Errors[9])
                    });
                }
                // Missing assets report
                else {
                    // Get the stock take that is the closest to chosen date for each location
                    let from = utility.checkIfValidDate(req.query.from, "Invalid Date");
                    let to = utility.checkIfValidDate(req.query.to, "Invalid Date");
                    let stockTakes = [];
                    let promises = [];

                    // Function returns a stock take id if one is found
                    function getStockTakes(location) {
                        return new Promise((res, rej) => {
                            pool.query(reportsTable.getClosestStockTakeM, [from, to, location]).then(data => {
                                if (data.rowCount > 0) {
                                    res(data.rows[0].id)
                                } else {
                                    res(0)
                                }
                            }).catch(err => {
                                console.log('Error 3');
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
                                // resolve({ [data.rows[0].name]: missing });
                                resolve({
                                    name: data.rows[0].name,
                                    missing: missing
                                })
                            }).catch(err => {
                                console.log(err);
                                reject(Errors[9])
                            });
                        }

                        // Get the assets that are in the asset register but not in the stock takes
                        pool.query(stockTakesQuery, [stockTakes]).then(data => {
                            let missing = data.rows[0].missing;
                            let amount = data.rows[0].amount; 
                            pool.query(locationTable.getLocation, [id]).then(data => {
                                // resolve({ [data.rows[0].name]: missing });
                                resolve({
                                    name: data.rows[0].name,
                                    missing: missing,
                                })
                            }).catch(err => {
                                console.log('Error 4');
                                console.log(err);
                                reject(Errors[9])
                            });
                        }).catch(err => {
                            console.log('Error 5');
                            console.log(err);
                            reject(Errors[9])
                        });
                    }).catch(err => {
                        console.log('Error 6');
                        console.log(err);
                        reject(Errors[9])
                    });
                }

            }).catch(err => {
                console.log('Error 7');
                console.log(err);
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
    }
    // Physical Report
    else if (reportType === "physical") {
        stockTakesQuery = reportsTable.numOfAssetsInStockTakes;
    }
    // Category Report
    else if (reportType == 'category'){
        stockTakesQuery = '';
    }
    // Acquisition Report
    else if (reportType == 'acquisition'){
        stockTakesQuery = '';
    }
    else {
        return res.status(404).json({
            message: Errors[0]
        });
    }

    if (id == 0) {
        databaseQuery = 'SELECT name, id FROM Location WHERE parentLocationID IS NULL';
        arguements = [];
    } else {
        databaseQuery = reportsTable.getChildLocations;
        arguements = [id];
    }

    // Get all locations with parent id of id
    pool.query(databaseQuery, arguements).then(childLocations => {
        // If there are no children locations, return data for said location and a flag that indicates that there are no children
        if (childLocations.rowCount == 0) {
            getNumberOfMissingItemsForEachLocation(id, stockTakesQuery).then(data => {
                return res.json({ ...data, children: false });
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
});

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
