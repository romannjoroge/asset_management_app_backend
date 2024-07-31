var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
const router = express.Router();
import userTable from '../Users/db_users.js';
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import pool from '../../db2.js';
import { updateUser } from '../Users/update.js';
import MyError from '../utility/myError.js';
import gatepasstable from '../GatePass/db_gatepass.js';
import bcrypt from 'bcrypt';
import { Log } from '../Log/log.js';
import getRolesFromDB from '../Users/roles.js';
import getEventsFromDatabase from '../Log/events.js';
import generateDepreciatedAssetsInMonth from '../Mail/generateDepreciatedAssetsMail.js';
import { Lama } from '../Lama/lama.js';
import handleError from '../utility/handleError.js';
import multer from 'multer';
import { getDataFromExcel } from '../Excel/getDataFromExcelFile.js';
import getResultsFromDatabase from '../utility/getResultsFromDatabase.js';
import User from '../Users/users.js';
import checkifAuthorized from '../../middleware/checkifAuthorized.js';
const upload = multer({ dest: './attachments' });
router.post('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    try {
        // @ts-ignore
        let userID = req.id;
        if (username) {
            yield pool.query("UPDATE User2 SET username = $1 WHERE id = $2", [username, userID]);
        }
        if (password) {
            let hashedPassword = yield bcrypt.hash(password, 10);
            yield pool.query("UPDATE User2 SET password = $1 WHERE id = $2", [hashedPassword, userID]);
        }
        return res.status(201).json({ message: Success2.UPDATE_ACCOUNT });
    }
    catch (err) {
        let { errorMessage, errorCode } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
    }
}));
router.post('/bulkAdd', checkifAuthorized('User Manager'), upload.single("excel"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let file = req.file;
        if (file) {
            let data = getDataFromExcel(file.path);
            let promises = [];
            //@ts-ignore
            let company = yield User.getCompanyName(req.id);
            function addUser(data) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        console.log(data);
                        let hash = yield bcrypt.hash(data.password, 10);
                        let results = yield getResultsFromDatabase(userTable.doesUserExist, [data.email, data.username]);
                        if (results.length > 0) {
                            throw new MyError(MyErrors2.USER_ALREADY_EXISTS);
                        }
                        yield pool.query(userTable.addUser, [data.name, data.email, hash, data.username, company]);
                        let idResults = yield getResultsFromDatabase(userTable.getLatestUserID, [data.username]);
                        let id = idResults[0].id;
                        //@ts-ignore
                        yield Log.createLog(req.ip, req.id, Logs.CREATE_USER);
                    }
                    catch (err) {
                        console.log(err);
                        throw new MyError(MyErrors2.NOT_CREATE_USER);
                    }
                });
            }
            for (let d of data) {
                //@ts-ignore
                promises.push(addUser(d));
            }
            yield Promise.all(promises);
            return res.status(201).json({ message: Success2.BULK_CREATE_USER });
        }
        else {
            res.status(500).json({ message: MyErrors2.NOT_PROCESS_EXCEL_FILE });
        }
    }
    catch (err) {
        let { errorMessage, errorCode } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
    }
}));
router.get('/getUsers', checkifAuthorized('User Manager'), (req, res) => {
    pool.query(userTable.getUsers, []).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[14],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9],
        });
    });
});
router.get('/getNames', checkifAuthorized('User Manager'), (req, res) => {
    // Send data from DB
    pool.query(userTable.getNames, []).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: Errors[14],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(501).json({
            message: Errors[9],
        });
    });
});
router.get('/userTable', checkifAuthorized('User Manager'), (req, res) => {
    // Get username, email, name and id
    pool.query(userTable.nameEmail, []).then((data) => {
        // If data is empty return an error
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: Errors[22] });
        }
        // Return data
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    });
});
router.get('/user/:id', checkifAuthorized('User Manager'), upload.array('attachments', 12), (req, res) => {
    // Get id of user
    const id = req.params.id;
    // Get email of user
    pool.query("SELECT email FROM User2 WHERE id=$1 AND deleted = false", [id]).then((data) => {
        // Return an error if data is empty
        if (data.rowCount == 0) {
            return res.status(400).json({ message: Errors[22] });
        }
        let email = data.rows[0]['email'];
        // Get roles
        pool.query(userTable.userRoles, [id]).then((data) => {
            // Return an error if data is empty
            if (data.rowCount == 0) {
                return res.status(400).json({ message: Errors[22] });
            }
            // Extract roles
            let roles = data.rows.map(row => {
                return row['name'];
            });
            // Send roles and email
            return res.json({ email, roles });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: Errors[9] });
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: Errors[9] });
    });
});
// Route To Add A User To A Company
router.post('/addUser', checkifAuthorized('User Manager'), (req, res) => {
    // Get User Details And Roles From Frontend
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let companyName = req.body.companyName;
    let gatepasslocation = Number.parseInt(req.body.gatepasslocation);
    let roles = req.body.roles;
    function addUserRole(id, role) {
        return new Promise((res, rej) => {
            pool.query(userTable.addUserRole, [id, role]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            });
        });
    }
    bcrypt.hash(password, 10).then(hash => {
        // Check if user with email already exists
        pool.query(userTable.doesUserExist, [email, username]).then(fetchResult => {
            // If the rows returned are not empty return an error
            if (fetchResult.rowCount > 0) {
                return res.status(400).json({ message: Errors[24] });
            }
            // Add user if doesn't exist
            pool.query(userTable.addUser, [name, email, hash, username, companyName]).then(_ => {
                // Get id of created user
                pool.query(userTable.getLatestUserID, [username]).then((data) => {
                    if (data.rowCount <= 0) {
                        // return an error if no data was returned
                        return res.status(400).json({ message: Errors[24] });
                    }
                    const id = data.rows[0]['id'];
                    // Add user roles
                    let promises = [];
                    roles.forEach(role => promises.push(addUserRole(id, role)));
                    Promise.all(promises).then(_ => {
                        if (gatepasslocation) {
                            // Add user as gatepass authorizer for location
                            pool.query(gatepasstable.addApprover, [id, gatepasslocation]).then(_ => {
                                // Add log
                                Log.createLog(req.ip, req.id, Logs.CREATE_USER).then((_) => {
                                    return res.json({ message: Succes[4] });
                                }).catch((err) => {
                                    return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
                                });
                            }).catch(err => {
                                console.log(err);
                                return res.status(501).json({ message: Errors[9] });
                            });
                        }
                        else {
                            // Add log
                            Log.createLog(req.ip, req.id, Logs.CREATE_USER).then((_) => {
                                return res.json({ message: Succes[4] });
                            }).catch((err) => {
                                return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
                            });
                        }
                    }).catch(err => {
                        console.log(3);
                        console.log(err);
                        return res.status(501).json({ message: Errors[9] });
                    });
                }).catch(err => {
                    return res.status(501).json({ message: Errors[9] });
                });
            }).catch(err => {
                console.log(2);
                console.log(err);
                return res.status(501).json({ message: Errors[9] });
            });
        }).catch(err => {
            console.log(1);
            console.log(err);
            return res.status(501).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.post('/setTimeout', checkifAuthorized('User Manager'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settingsStore = yield Lama.init("settings");
        const { newTimeoutInMinutes } = req.body;
        yield settingsStore.put("timeout", newTimeoutInMinutes.toString());
        return res.status(201).json({ message: Success2.SET_TIMEOUT });
    }
    catch (err) {
        console.log(err, "OHH SHIT");
        const { errorMessage, errorCode } = handleError(err);
        return res.status(errorCode).json({ message: errorMessage });
    }
}));
router.get('/test', (req, res) => {
    generateDepreciatedAssetsInMonth();
    return res.send("Done");
});
router.get('/getRoles', checkifAuthorized('User Manager'), (req, res) => {
    getRolesFromDB().then(roles => {
        return res.json(roles);
    }).catch((err) => {
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
    });
});
router.get('/getEvents', checkifAuthorized('User Manager'), (req, res) => {
    getEventsFromDatabase().then(events => {
        return res.json(events);
    }).catch((err) => {
        if (err instanceof MyError) {
            return res.status(400).json({ message: err.message });
        }
        else {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        }
    });
});
router.get('/', checkifAuthorized('User Manager'), (req, res) => {
    // Return id and username of all users
    pool.query(userTable.getUserDetails, []).then((fetchResult) => {
        // If result is empy return an error
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({ message: MyErrors2['NO_USERS'] });
        }
        else {
            return res.json(fetchResult.rows);
        }
    });
});
router.get('/getCompany/:username', checkifAuthorized('User Manager'), (req, res) => {
    // Check if username exits
    pool.query(userTable.doesUsernameExist, [req.params.username]).then(fetchResult => {
        // If nothing is returned the user does not exist
        if (fetchResult.rowCount <= 0) {
            return res.status(404).json({ message: Errors[24] });
        }
        // Return company
        pool.query(userTable.getCompany, [req.params.username]).then(fetchResult => {
            // If nothing is returned returned error
            if (fetchResult.rowCount <= 0) {
                return res.status(400).json({ message: Errors[31] });
            }
            // Return company
            return res.json(fetchResult.rows[0]);
        }).catch(err => {
            console.log(err);
            return res.status(501).json({ message: Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.get('/getNameEmails/:id', (req, res) => {
    const userid = Number.parseInt(req.params.id);
    pool.query(userTable.getNameEmail, [userid]).then((data) => {
        if (data.rowCount <= 0) {
            return res.status(404).json({ message: Errors[14] });
        }
        return res.status(200).json(data.rows[0]);
    }).catch((err) => {
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});
router.post('/update', (req, res) => {
    let userid = Number.parseInt(req.body.id);
    let updateBody = {};
    if (req.body.name) {
        updateBody.name = req.body.name;
    }
    if (req.body.email) {
        updateBody.email = req.body.email;
    }
    if (req.body.password) {
        updateBody.password = req.body.password;
    }
    if (req.body.roles) {
        updateBody.roles = req.body.roles;
    }
    // Update user
    updateUser(userid, updateBody).then(_ => {
        // Add log
        Log.createLog(req.ip, req.id, Logs.UPDATE_USER, userid).then((_) => {
            return res.json({ message: Succes[17] });
        }).catch((err) => {
            return res.status(500).json({ message: MyErrors2.INTERNAL_SERVER_ERROR });
        });
    }).catch(err => {
        console.log(err);
        if (err instanceof MyError) {
            return res.status(501).json({ message: err.message });
        }
        else {
            return res.status(501).json({ message: Errors[9] });
        }
    });
});
export default router;
//# sourceMappingURL=users.js.map