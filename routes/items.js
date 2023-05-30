import express from 'express';
const router = express.Router();
import Asset from '../src/Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';
import pool from '../db2.js';
import assetTable from '../src/Allocation/Asset/db_assets.js';
import checkifAuthorized from '../middleware/checkifAuthorized.js';
import checkifAuthenticated from '../middleware/checkifAuthenticated.js';
import { convertArrayToCSV } from 'convert-array-to-csv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../src/Allocation/Category/category2.js';
import userTable from '../src/Users/db_users.js';
import Location from '../src/Tracking/location.js';
import MyError from '../utility/myError.js';
import User from '../src/Users/users.js';
import utility from '../utility/utility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// router.get('/', test)
router.post('/add', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    // Get asset values from request
    let {
        barcode,
        locationID,
        noInBuilding,
        code,
        description,
        categoryName,
        usefulLife,
        serialNumber,
        condition,
        responsibleUsername,
        acquisitionDate,
        acquisitionCost,
        residualValue,
        depreciationType,
        depreciationPercent,
        attachments
    } = req.body;
    console.log(`DEP 1: ${depreciationType}`);

    let depTypeToAdd;
    let percToAdd;

    // Convert values to right type
    noInBuilding = Number.parseInt(noInBuilding);
    usefulLife = Number.parseInt(usefulLife);
    acquisitionCost = Number.parseFloat(acquisitionCost);
    residualValue = Number.parseFloat(residualValue);

    if (depreciationPercent) {
        depreciationPercent = Number.parseFloat(depreciationPercent);
    }

    let acquisitionDateToAdd;

    // Validate inputs
    // Check if location exists
    Location.verifyLocationID(locationID).then(data => {
        // If location does not exist return error
        if (!data) {
            return res.status(400).json({message: Errors[3]});
        } 

        // Validate acquisition date
        acquisitionDateToAdd = utility.checkIfValidDate(acquisitionDate, Errors[37]);

        // Check if category exists
        Category._doesCategoryExist(categoryName).then(doesExist => {
            if (doesExist) {
                // Get ID of category
                Category._getCategoryID(categoryName).then(categoryID => {
                    // Check if user exists
                    User.checkIfUserExists(responsibleUsername, Errors[30]).then(_ => {
                        console.log(`DEP 2: ${depreciationType}`);
                        // Validate depreciation type if exists
                        if (depreciationType) {
                            Category.verifyDepreciationDetails(depreciationType, depreciationPercent).then(_ => {
                                // Set values of depreciation details to add
                                depTypeToAdd = depreciationType;
                                percToAdd = depreciationPercent;
                            }).catch(e => {
                                if (e instanceof MyError) {
                                    return res.status(400).json({message: e.message});
                                } else {
                                    console.log(e);
                                    return res.status(500).json({message: Errors[9]});
                                }
                            });
                        } else {
                            depTypeToAdd = null;
                            percToAdd = null;
                        }
                        console.log(`DEP 3: ${depTypeToAdd}`);
                        // Create Asset
                        pool.query(assetTable.addAssetToAssetRegister, [barcode, noInBuilding, code, description, serialNumber, 
                            acquisitionDateToAdd, locationID, residualValue, condition, responsibleUsername, acquisitionCost, categoryID, usefulLife, 
                            depTypeToAdd, percToAdd]).then(_ => {
                                // Get id of created asset
                                pool.query(assetTable.getAssetID, [barcode]).then(data => {
                                    if (data.rowCount <= 0) {
                                        return res.status(400).json({message: Errors[1]});
                                    }
                                    let assetID = data.rows[0].assetid;
                                    let depType;
                                    let perc;
                                    // Get Depreciation Details
                                    if (depTypeToAdd === null || depTypeToAdd === undefined) {
                                        Category._getDepreciationDetails(categoryName).then(data => {
                                            console.log(data)
                                            depType = data.depType;
                                            perc = data.perc;

                                            // Create Asset Depreciation Schedule
                                            Asset.createDepreciationSchedule(depType, assetID, usefulLife, acquisitionCost, acquisitionDateToAdd, residualValue, perc).then(_ => {
                                                return res.json({message: Succes[1]});
                                            }).catch(e => {
                                                if (e instanceof MyError) {
                                                    return res.status(400).json({message: e.message});
                                                } else {
                                                    console.log(e);
                                                    return res.status(500).json({message: Errors[9]});
                                                }
                                            });
                                        }).catch(er => {
                                            console.log(er);
                                            return res.status(500).json({message: Errors[9]});
                                        })
                                    } else {
                                        depType = depTypeToAdd;
                                        perc = percToAdd;

                                        console.log(`DEP 4: ${depType}`);
                                        // Create Asset Depreciation Schedule
                                        Asset.createDepreciationSchedule(depType, assetID, usefulLife, acquisitionCost, acquisitionDateToAdd, residualValue, perc).then(_ => {
                                            return res.json({message: Succes[1]});
                                        }).catch(e => {
                                            if (e instanceof MyError) {
                                                return res.status(400).json({message: e.message});
                                            } else {
                                                console.log(e);
                                                return res.status(500).json({message: Errors[9]});
                                            }
                                        });
                                    }
                                    
                                    }).catch(e => {
                                        if (e instanceof MyError) {
                                            return res.status(400).json({message: e.message});
                                        } else {
                                            console.log(e);
                                            return res.status(500).json({message: Errors[9]});
                                        }
                                    });
                            }).catch(e => {
                                console.log(e);
                                return res.status(500).json({message: Errors[9]});
                            });
                    }).catch(e => {
                        if (e instanceof MyError) {
                            return res.status(400).json({message: e.message});
                        } else {
                            console.log(e);
                            return res.status(500).json({message: Errors[9]});
                        }
                    });
                }).catch(e => {
                    if (e instanceof MyError) {
                        return res.status(400).json({message: e.message});
                    } else {
                        console.log(e);
                        return res.status(500).json({message: Errors[9]});
                    }
                });
            } else {
                return res.status(400).json({message: Errors[5]});
            }
        }).catch(e => {
            if (e instanceof MyError) {
                return res.status(400).json({message: e.message});
            } else {
                console.log(e);
                return res.status(500).json({message: Errors[9]});
            }
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({message: Errors[9]});
    });
});

router.post('/update/:id', checkifAuthenticated, checkifAuthorized('Asset Administrator'), (req, res) => {
    // Get barcode from request
    let assetID = req.params.id;
    console.log(req.body);

    const updatableItems = ["barcode", "locationID", "noInBuilding", "code", "description", "categoryID", "usefulLife", "serialNumber", "condition", "responsibleUsername",
        "acquisitionDate", "acquisitionCost", "residualValue", "depreciationType"]
    const requestParams = Object.keys(req.body);
    console.log("THE REQUEST PARAMS: ", requestParams);

    // Loop through the keys of request body to get aspects of item to update
    for (var i in requestParams) {
        console.log("Loop entered")
        // Check if item is a valid parameter to update
        if (updatableItems.includes(requestParams[i])) {
            // Run update query
            console.log(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`);
            pool.query(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`, [req.body[requestParams[i]], assetID]).then(fetchResult => {
                
            }).catch(err => {
                console.log(err);
                return res.status(500).json({message: Errors[9]})
            });
        }else {
            // What to do if item not in possible items to update
            return res.status(404).json({message: Errors[43]})
        }
    }

    return res.json({message: Succes[11]})
});


router.get('/view', checkifAuthenticated,  checkifAuthorized('Asset Administrator'), (req, res) => {
    Asset.displayAllAssetTags().then(data => {
        res.status(200).json(data);
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: Errors[2],
        })
    });
})

router.get('/view/:id', checkifAuthenticated, checkifAuthorized('Asset User'), (req, res) => {
    // Get asset tag from request params
    let assetTag = req.params.id;

    // Query database for details of asset with given assettag
    pool.query(assetTable.getAssetDetails, [assetTag]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            res.status(404).json({
                message: Errors[8],
            })
        }else{
            res.status(200).json(fetchResult.rows[0]);
        }
    }).catch(e => {
        res.status(500).json({
            message: Errors[9]
        })
    });
});

router.get('/get/:item', (req, res) => {
    let item = req.params.item;
    let query;
    let arguements;
    let errorMessage;

    if (item === "assetCategory") {
        query = assetTable.assetCategories;
        arguements = [];
        errorMessage = Errors[22];
    } else if (item === "assets") {
        query = assetTable.getAllAssets;
        arguements = [];
        errorMessage = Errors[8];
    } else {
        return res.status(400).json({message: Errors[0]})
    }

    // Return category name with the number of assets in it
    pool.query(query, arguements).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: errorMessage})
        }
        return res.json(fetchResult.rows)
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
});

router.get('/assetData', (req, res) => {
    // Fetch asset net value and total number of assets
    pool.query(assetTable.getAssetNetAndTotal).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: Errors[8]})
        }
        let netValTotal = fetchResult.rows[0];
        // Fetch number of assets added in the last 12 months
        pool.query(assetTable.getAssetAddedInLast12Months).then(fetchResult2 => {
            if(fetchResult2.rowCount <= 0) {
                return res.status(400).json({message: Errors[8]})
            }
            let assetsAdded = fetchResult2.rows[0];
            
            // Get number of users
            pool.query(userTable.getNumberOfUsers).then(fetchResult3 => {
                if(fetchResult3.rowCount <= 0) {
                    return res.status(400).json({message: Errors[8]})
                }
                let users = fetchResult3.rows[0];
                // Combine all data
                let data = {...netValTotal, ...assetsAdded, ...users};
                console.log(data);
                res.json(data);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({message: Errors[9]})
            })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({message: Errors[9]})
        });
        
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
})

router.delete('/delete/:barcode', (req, res) => {
    let barcode = req.params.barcode

    // Run query
    pool.query(assetTable.deleteAsset, [barcode]).then(fetchResult => {
        return res.json({message: Succes[7]})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    })
})

router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let {
        commandCode, 
        hardwareKey,
        tagRecNums,
        tagRecords
    } = req.body;
    // Add tag to database
    for (var i in tagRecords) {
        let tag = tagRecords[i];
        console.log(tag);
        pool.query(assetTable.insertAssetTag, [commandCode, hardwareKey, tagRecNums, tag.antNo, tag.pc, tag.epcID, tag.crc]).then(_ => {
            // Add an entry to log.csv file
            let csvData = [{
                commandCode,
                hardwareKey,
                tagRecNums,
                antNo: tag.antNo,
                pc: tag.pc,
                epcID: tag.epcID,
                crc: tag.crc
            }];
            let csvFromData = convertArrayToCSV(csvData);
            fs.appendFile(path.join(__dirname, 'tags.log'), `${new Date().toISOString()},${commandCode},${hardwareKey},${tagRecNums},${tag.antNo},${tag.pc},${tag.epcID},${tag.crc}\n`).then(_ => {
                
            }).catch(e => {
                console.log(e);
                return res.status(500).json({
                    message: Errors[9],
                })
            });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({message: Errors[9]})
        })
    }
    res.send("Done");
})

// 192.168.0.180:80

router.post('/heartBeats', (req, res) => {
    console.log("Heart Beat...");
    console.log(req);
    res.send("Done");
});

router.get('/search', (req, res) => {
    // // Get arguements from request
    // let query = req.query.query;

    // // Split query term into individual words
    // let queryTerms = query.split(",");
    // console.log(queryTerms);

    // // Removing all items that have a space
    // for (var i in queryTerms) {
    //     // Check if ith item has a space
    //     if(queryTerms[i].includes(" ")) {
    //         // Split item by the space and add to the list
    //         let newTerms = queryTerms[i].split(" ");
    //         queryTerms.push(...newTerms);

    //         // Remove the split item from list to avoid having duplicates
    //         queryTerms.splice(i, 1);
    //     } 
    // }

    // // Create query term from query terms
    // let queryString = queryTerms.join(" & ");

    // // Search database with query
    // pool.query(assetTable.searchForAsset, [queryString]).then(fetchResult => {
    //     if(fetchResult.rowCount <= 0) {
    //         return res.status(400).json({message: Errors[44]})
    //     }
    //     console.log(fetchResult.rows);
    //     return res.json(fetchResult.rows)
    // }).catch(err => {
    //     console.log(err);
    //     return res.status(500).json({message: Errors[9]})
    // });

    const query = req.query.query;

    // Search database with query
    pool.query(assetTable.searchForAsset, [query]).then(fetchResult => {
        if(fetchResult.rowCount <= 0) {
            return res.status(400).json({message: Errors[44]})
        }
        
        return res.json(fetchResult.rows)
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: Errors[9]})
    });
});


router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' })
})

export default router;