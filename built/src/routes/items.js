"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const asset2_js_1 = __importDefault(require("../Allocation/Asset/asset2.js"));
const constants_js_1 = require("../utility/constants.js");
const db2_js_1 = __importDefault(require("../../db2.js"));
const db_assets_js_1 = __importDefault(require("../Allocation/Asset/db_assets.js"));
const checkifAuthorized_js_1 = __importDefault(require("../../middleware/checkifAuthorized.js"));
const checkifAuthenticated_js_1 = __importDefault(require("../../middleware/checkifAuthenticated.js"));
const convert_array_to_csv_1 = require("convert-array-to-csv");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const category2_js_1 = __importDefault(require("../Allocation/Category/category2.js"));
const db_users_js_1 = __importDefault(require("../Users/db_users.js"));
const location_js_1 = __importDefault(require("../Tracking/location.js"));
const myError_js_1 = __importDefault(require("../utility/myError.js"));
const users_js_1 = __importDefault(require("../Users/users.js"));
const utility_js_1 = __importDefault(require("../utility/utility.js"));
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
// router.get('/', test)
router.post('/add', checkifAuthenticated_js_1.default, (0, checkifAuthorized_js_1.default)('Asset Administrator'), (req, res) => {
    // Get asset values from request
    let { barcode, locationID, noInBuilding, code, description, categoryName, usefulLife, serialNumber, condition, responsibleUsername, acquisitionDate, acquisitionCost, residualValue, depreciationType, depreciationPercent, attachments } = req.body;
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
    location_js_1.default.verifyLocationID(locationID).then(data => {
        // If location does not exist return error
        if (!data) {
            return res.status(400).json({ message: constants_js_1.Errors[3] });
        }
        // Validate acquisition date
        acquisitionDateToAdd = utility_js_1.default.checkIfValidDate(acquisitionDate, constants_js_1.Errors[37]);
        // Check if category exists
        category2_js_1.default._doesCategoryExist(categoryName).then(doesExist => {
            if (doesExist) {
                // Get ID of category
                category2_js_1.default._getCategoryID(categoryName).then(categoryID => {
                    // Check if user exists
                    users_js_1.default.checkIfUserExists(responsibleUsername, constants_js_1.Errors[30]).then(_ => {
                        console.log(`DEP 2: ${depreciationType}`);
                        // Validate depreciation type if exists
                        if (depreciationType) {
                            category2_js_1.default.verifyDepreciationDetails(depreciationType, depreciationPercent).then(_ => {
                                // Set values of depreciation details to add
                                depTypeToAdd = depreciationType;
                                percToAdd = depreciationPercent;
                            }).catch(e => {
                                if (e instanceof myError_js_1.default) {
                                    return res.status(400).json({ message: e.message });
                                }
                                else {
                                    console.log(e);
                                    return res.status(500).json({ message: constants_js_1.Errors[9] });
                                }
                            });
                        }
                        else {
                            depTypeToAdd = null;
                            percToAdd = null;
                        }
                        console.log(`DEP 3: ${depTypeToAdd}`);
                        // Create Asset
                        db2_js_1.default.query(db_assets_js_1.default.addAssetToAssetRegister, [barcode, noInBuilding, code, description, serialNumber,
                            acquisitionDateToAdd, locationID, residualValue, condition, responsibleUsername, acquisitionCost, categoryID, usefulLife,
                            depTypeToAdd, percToAdd]).then(_ => {
                            // Get id of created asset
                            db2_js_1.default.query(db_assets_js_1.default.getAssetID, [barcode]).then(data => {
                                if (data.rowCount <= 0) {
                                    return res.status(400).json({ message: constants_js_1.Errors[1] });
                                }
                                let assetID = data.rows[0].assetid;
                                let depType;
                                let perc;
                                // Get Depreciation Details
                                if (depTypeToAdd === null || depTypeToAdd === undefined) {
                                    category2_js_1.default._getDepreciationDetails(categoryName).then(data => {
                                        console.log(data);
                                        depType = data.depType;
                                        perc = data.perc;
                                        // Create Asset Depreciation Schedule
                                        asset2_js_1.default.createDepreciationSchedule(depType, assetID, usefulLife, acquisitionCost, acquisitionDateToAdd, residualValue, perc).then(_ => {
                                            return res.json({ message: constants_js_1.Succes[1] });
                                        }).catch(e => {
                                            if (e instanceof myError_js_1.default) {
                                                return res.status(400).json({ message: e.message });
                                            }
                                            else {
                                                console.log(e);
                                                return res.status(500).json({ message: constants_js_1.Errors[9] });
                                            }
                                        });
                                    }).catch(er => {
                                        console.log(er);
                                        return res.status(500).json({ message: constants_js_1.Errors[9] });
                                    });
                                }
                                else {
                                    depType = depTypeToAdd;
                                    perc = percToAdd;
                                    console.log(`DEP 4: ${depType}`);
                                    // Create Asset Depreciation Schedule
                                    asset2_js_1.default.createDepreciationSchedule(depType, assetID, usefulLife, acquisitionCost, acquisitionDateToAdd, residualValue, perc).then(_ => {
                                        return res.json({ message: constants_js_1.Succes[1] });
                                    }).catch(e => {
                                        if (e instanceof myError_js_1.default) {
                                            return res.status(400).json({ message: e.message });
                                        }
                                        else {
                                            console.log(e);
                                            return res.status(500).json({ message: constants_js_1.Errors[9] });
                                        }
                                    });
                                }
                            }).catch(e => {
                                if (e instanceof myError_js_1.default) {
                                    return res.status(400).json({ message: e.message });
                                }
                                else {
                                    console.log(e);
                                    return res.status(500).json({ message: constants_js_1.Errors[9] });
                                }
                            });
                        }).catch(e => {
                            console.log(e);
                            return res.status(500).json({ message: constants_js_1.Errors[9] });
                        });
                    }).catch(e => {
                        if (e instanceof myError_js_1.default) {
                            return res.status(400).json({ message: e.message });
                        }
                        else {
                            console.log(e);
                            return res.status(500).json({ message: constants_js_1.Errors[9] });
                        }
                    });
                }).catch(e => {
                    if (e instanceof myError_js_1.default) {
                        return res.status(400).json({ message: e.message });
                    }
                    else {
                        console.log(e);
                        return res.status(500).json({ message: constants_js_1.Errors[9] });
                    }
                });
            }
            else {
                return res.status(400).json({ message: constants_js_1.Errors[5] });
            }
        }).catch(e => {
            if (e instanceof myError_js_1.default) {
                return res.status(400).json({ message: e.message });
            }
            else {
                console.log(e);
                return res.status(500).json({ message: constants_js_1.Errors[9] });
            }
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.post('/update/:id', checkifAuthenticated_js_1.default, (0, checkifAuthorized_js_1.default)('Asset Administrator'), (req, res) => {
    // Get barcode from request
    let assetID = req.params.id;
    console.log(req.body);
    const updatableItems = ["barcode", "locationID", "noInBuilding", "code", "description", "categoryID", "usefulLife", "serialNumber", "condition", "responsibleUsername",
        "acquisitionDate", "acquisitionCost", "residualValue", "depreciationType"];
    const requestParams = Object.keys(req.body);
    console.log("THE REQUEST PARAMS: ", requestParams);
    // Loop through the keys of request body to get aspects of item to update
    for (var i in requestParams) {
        console.log("Loop entered");
        // Check if item is a valid parameter to update
        if (updatableItems.includes(requestParams[i])) {
            // Run update query
            console.log(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`);
            db2_js_1.default.query(`UPDATE Asset SET ${requestParams[i]} = $1 WHERE assetID = $2`, [req.body[requestParams[i]], assetID]).then(fetchResult => {
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: constants_js_1.Errors[9] });
            });
        }
        else {
            // What to do if item not in possible items to update
            return res.status(404).json({ message: constants_js_1.Errors[43] });
        }
    }
    return res.json({ message: constants_js_1.Succes[11] });
});
router.get('/view', checkifAuthenticated_js_1.default, (0, checkifAuthorized_js_1.default)('Asset Administrator'), (req, res) => {
    asset2_js_1.default.displayAllAssetTags().then(data => {
        res.status(200).json(data);
    }).catch(e => {
        console.log(e);
        res.status(500).json({
            message: constants_js_1.Errors[2],
        });
    });
});
router.get('/view/:id', checkifAuthenticated_js_1.default, (0, checkifAuthorized_js_1.default)('Asset User'), (req, res) => {
    // Get asset tag from request params
    let assetTag = req.params.id;
    // Query database for details of asset with given assettag
    db2_js_1.default.query(db_assets_js_1.default.getAssetDetails, [assetTag]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            res.status(404).json({
                message: constants_js_1.Errors[8],
            });
        }
        else {
            res.status(200).json(fetchResult.rows[0]);
        }
    }).catch(e => {
        res.status(500).json({
            message: constants_js_1.Errors[9]
        });
    });
});
router.get('/get/:item', (req, res) => {
    let item = req.params.item;
    let query;
    let arguements;
    let errorMessage;
    if (item === "assetCategory") {
        query = db_assets_js_1.default.assetCategories;
        arguements = [];
        errorMessage = constants_js_1.Errors[22];
    }
    else if (item === "assets") {
        query = db_assets_js_1.default.getAllAssets;
        arguements = [];
        errorMessage = constants_js_1.Errors[8];
    }
    else {
        return res.status(400).json({ message: constants_js_1.Errors[0] });
    }
    // Return category name with the number of assets in it
    db2_js_1.default.query(query, arguements).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: errorMessage });
        }
        return res.json(fetchResult.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.get('/assetData', (req, res) => {
    // Fetch asset net value and total number of assets
    db2_js_1.default.query(db_assets_js_1.default.getAssetNetAndTotal).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[8] });
        }
        let netValTotal = fetchResult.rows[0];
        // Fetch number of assets added in the last 12 months
        db2_js_1.default.query(db_assets_js_1.default.getAssetAddedInLast12Months).then(fetchResult2 => {
            if (fetchResult2.rowCount <= 0) {
                return res.status(400).json({ message: constants_js_1.Errors[8] });
            }
            let assetsAdded = fetchResult2.rows[0];
            // Get number of users
            db2_js_1.default.query(db_users_js_1.default.getNumberOfUsers).then(fetchResult3 => {
                if (fetchResult3.rowCount <= 0) {
                    return res.status(400).json({ message: constants_js_1.Errors[8] });
                }
                let users = fetchResult3.rows[0];
                // Combine all data
                let data = Object.assign(Object.assign(Object.assign({}, netValTotal), assetsAdded), users);
                console.log(data);
                res.json(data);
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: constants_js_1.Errors[9] });
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: constants_js_1.Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.delete('/delete/:barcode', (req, res) => {
    let barcode = req.params.barcode;
    // Run query
    db2_js_1.default.query(db_assets_js_1.default.deleteAsset, [barcode]).then(fetchResult => {
        return res.json({ message: constants_js_1.Succes[7] });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.post('/tags', (req, res) => {
    console.log(req.body);
    // Get values from req.body
    let { commandCode, hardwareKey, tagRecNums, tagRecords } = req.body;
    // Add tag to database
    for (var i in tagRecords) {
        let tag = tagRecords[i];
        console.log(tag);
        db2_js_1.default.query(db_assets_js_1.default.insertAssetTag, [commandCode, hardwareKey, tagRecNums, tag.antNo, tag.pc, tag.epcID, tag.crc]).then(_ => {
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
            let csvFromData = (0, convert_array_to_csv_1.convertArrayToCSV)(csvData);
            promises_1.default.appendFile(path_1.default.join(__dirname, 'tags.log'), `${new Date().toISOString()},${commandCode},${hardwareKey},${tagRecNums},${tag.antNo},${tag.pc},${tag.epcID},${tag.crc}\n`).then(_ => {
            }).catch(e => {
                console.log(e);
                return res.status(500).json({
                    message: constants_js_1.Errors[9],
                });
            });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: constants_js_1.Errors[9] });
        });
    }
    res.send("Done");
});
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
    db2_js_1.default.query(db_assets_js_1.default.searchForAsset, [query]).then(fetchResult => {
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[44] });
        }
        return res.json(fetchResult.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.route('*', (req, res) => {
    res.status(404).json({ data: 'Resource not found' });
});
exports.default = router;
