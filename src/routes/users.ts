import express from 'express';
const router = express.Router();
import userTable from '../Users/db_users.js';
import { Errors, Logs, MyErrors2, Succes, Success2 } from '../utility/constants.js';
import pool from '../../db2.js';
import { updateUser, UpdateUser } from '../Users/update.js';
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
const upload = multer({dest: './attachments'});

router.post('/update', async(req, res) => {
    let {username, password} = req.body;

    try {
        // @ts-ignore
        let userID = req.id;

        if(username) {
            await pool.query(
                "UPDATE User2 SET username = $1 WHERE id = $2",
                [username, userID]
            )
        }

        if(password) {
            let hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                "UPDATE User2 SET password = $1 WHERE id = $2",
                [hashedPassword, userID]
            )
        }
        return res.status(201).json({message: Success2.UPDATE_ACCOUNT})
    } catch(err) {

    }
})

router.post('/bulkAdd', checkifAuthorized('User Manager'), upload.single("excel"), async(req, res) => {
    try {
        let file = req.file;
        if(file) {
            let data = getDataFromExcel(file.path);
            let promises: Promise<void>[] = [];

            //@ts-ignore
            let company = await User.getCompanyName(req.id);

            async function addUser(data: {name: string, email: string, password: string, username: string}) {
                try {
                    console.log(data);
                    let hash = await bcrypt.hash(data.password, 10);
                    let results = await getResultsFromDatabase<{name: string}>(
                        userTable.doesUserExist,
                        [data.email, data.username]
                    );

                    if (results.length > 0) {
                        throw new MyError(MyErrors2.USER_ALREADY_EXISTS);
                    }

                    await pool.query(userTable.addUser, [data.name, data.email, hash, data.username, company]);
                    let idResults = await getResultsFromDatabase<{id: number}>(
                        userTable.getLatestUserID,
                        [data.username]
                    )
                    let id = idResults[0].id;

                    //@ts-ignore
                    await Log.createLog(req.ip, req.id , Logs.CREATE_USER)                    
                } catch(err) {
                    console.log(err);
                    throw new MyError(MyErrors2.NOT_CREATE_USER);
                }
            }

            for (let d of data) {
                //@ts-ignore
                promises.push(addUser(d));
            }

            await Promise.all(promises);
            return res.status(201).json({message: Success2.BULK_CREATE_USER});
        } else {
            res.status(500).json({message: MyErrors2.NOT_PROCESS_EXCEL_FILE});
        }
    } catch(err) {
        let {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
})

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
        })
    })
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
        })
    });
});

interface GetUserDetails {
    name: string;
    email: string;
    id: number;
    username: string;
}

interface GetUserDetailsFetchResults {
    rows: GetUserDetails[];
    rowCount: number
}

router.get('/userTable', checkifAuthorized('User Manager'), (req, res) => {
    // Get username, email, name and id
    pool.query(userTable.nameEmail, []).then((data: GetUserDetailsFetchResults) => {
        // If data is empty return an error
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: Errors[22] });
        }

        // Return data
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: Errors[9] });
    })
});

interface UserEmail {
    email: string
}

interface UserRole {
    name: string
}

interface UserRoleFetchResult {
    rows: UserRole[];
    rowCount: number;
}

interface UserEmailFetchResult {
    rowCount: number;
    rows: UserEmail[]
}

router.get('/user/:id', checkifAuthorized('User Manager'), upload.array('attachments', 12), (req, res) => {
    // Get id of user
    const id = req.params.id;

    // Get email of user
    pool.query("SELECT email FROM User2 WHERE id=$1 AND deleted = false", [id]).then((data: UserEmailFetchResult) => {
        // Return an error if data is empty
        if (data.rowCount == 0) {
            return res.status(400).json({ message: Errors[22] });
        }

        let email = data.rows[0]['email']

        // Get roles
        pool.query(userTable.userRoles, [id]).then((data: UserRoleFetchResult) => {
            // Return an error if data is empty
            if (data.rowCount == 0) {
                return res.status(400).json({ message: Errors[22] });
            }
            // Extract roles
            let roles: string[] = data.rows.map(row => {
                return row['name'];
            })
            // Send roles and email
            return res.json({email, roles})
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: Errors[9] });
        })
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: Errors[9] });
    })
});

interface GetUserID {
    id: number
}

interface GetUserIDFetchResults {
    rowCount: number;
    rows: GetUserID[]
}

// Route To Add A User To A Company
router.post('/addUser', checkifAuthorized('User Manager'), (req, res) => {
    // Get User Details And Roles From Frontend
    let name: string = req.body.name;
    let email: string = req.body.email;
    let password: string = req.body.password;
    let username: string = req.body.username;
    let companyName: string = req.body.companyName;
    let gatepasslocation: number = Number.parseInt(req.body.gatepasslocation);

    let roles: string[] = req.body.roles;

    function addUserRole(id: number, role: string): Promise<void | never> {
        return new Promise((res, rej) => {
            pool.query(userTable.addUserRole, [id, role]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[9]));
            }) 
        });
    }

    bcrypt.hash(password, 10).then(hash => {
        // Check if user with email already exists
        pool.query(userTable.doesUserExist, [email, username]).then(fetchResult => {
            // If the rows returned are not empty return an error
            if (fetchResult.rowCount > 0) {
                return res.status(400).json({message: Errors[24]});
            }
            // Add user if doesn't exist
            pool.query(userTable.addUser, [name, email, hash, username, companyName]).then(_ => {
                // Get id of created user
                pool.query(userTable.getLatestUserID, [username]).then((data: GetUserIDFetchResults) => {
                    if(data.rowCount <= 0) {
                        // return an error if no data was returned
                        return res.status(400).json({message: Errors[24]});
                    }
                    const id = data.rows[0]['id'];
                    // Add user roles
                    let promises: Promise<void | never>[] = [];
                    roles.forEach(role => promises.push(addUserRole(id, role)));
                    Promise.all(promises).then(_ => {
                        if (gatepasslocation) {
                            // Add user as gatepass authorizer for location
                            pool.query(gatepasstable.addApprover, [id, gatepasslocation]).then(_ => {
                                // Add log
                                Log.createLog(req.ip, req.id , Logs.CREATE_USER).then((_: any) => {
                                    return res.json({message: Succes[4]});
                                }).catch((err: MyError) => {
                                    return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
                                })
                            }).catch(err => {
                                console.log(err);
                                return res.status(501).json({message: Errors[9]});
                            });
                        } else {
                            // Add log
                            Log.createLog(req.ip, req.id , Logs.CREATE_USER).then((_: any) => {
                                return res.json({message: Succes[4]});
                            }).catch((err: MyError) => {
                                return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
                            })
                            
                        }
                    }).catch(err => {
                        console.log(3);
                        console.log(err);
                        return res.status(501).json({message: Errors[9]});
                    });
                }).catch(err => {
                    return res.status(501).json({message: Errors[9]})
                })
            }).catch(err => {
                console.log(2);
                console.log(err);
                return res.status(501).json({message: Errors[9]});
            })
        }).catch(err => {
            console.log(1);
            console.log(err);
            return res.status(501).json({message: Errors[9]});
        })
    }).catch(err => {
        console.log(err);
        return res.status(501).json({message: Errors[9]});
    });
});

interface UserDetails {
    name: string;
    id: number
}

interface UserDetailsFetch {
    rows: UserDetails[];
    rowCount: number
}

router.post('/setTimeout', checkifAuthorized('User Manager'), async (req, res) => {
    try {
        const settingsStore = await Lama.init("settings");
        const {newTimeoutInMinutes} = req.body;
        await settingsStore.put("timeout", newTimeoutInMinutes.toString());
        return res.status(201).json({message: Success2.SET_TIMEOUT});
    } catch(err) {
        console.log(err, "OHH SHIT");
        const {errorMessage, errorCode} = handleError(err);
        return res.status(errorCode).json({message: errorMessage});
    }
})

router.get('/test', (req, res) => {
    generateDepreciatedAssetsInMonth();
    return res.send("Done");
})

router.get('/getRoles', checkifAuthorized('User Manager'), (req, res) => {
    getRolesFromDB().then(roles => {
        return res.json(roles);
    }).catch((err) => {
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message})
        } else {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        }
    })
});

router.get('/getEvents', checkifAuthorized('User Manager'), (req, res) => {
    getEventsFromDatabase().then(events => {
        return res.json(events);
    }).catch((err) => {
        if (err instanceof MyError) {
            return res.status(400).json({message: err.message})
        } else {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        }
    })
})

router.get('/', checkifAuthorized('User Manager'), (req, res) => {
    // Return id and username of all users
    pool.query(userTable.getUserDetails, []).then((fetchResult: UserDetailsFetch) => {
        // If result is empy return an error
        if (fetchResult.rowCount <= 0) {
            return res.status(400).json({message: MyErrors2['NO_USERS']})
        } else {
            return res.json(fetchResult.rows);
        }
    })
});

router.get('/getCompany/:username', checkifAuthorized('User Manager'), (req, res) => {
    // Check if username exits
    pool.query(userTable.doesUsernameExist, [req.params.username]).then(fetchResult => {
        // If nothing is returned the user does not exist
        if(fetchResult.rowCount <= 0) {
            return res.status(404).json({message: Errors[24]});
        }

        // Return company
        pool.query(userTable.getCompany, [req.params.username]).then(fetchResult => {
            // If nothing is returned returned error
            if(fetchResult.rowCount <= 0) {
                return res.status(400).json({message: Errors[31]});
            }

            // Return company
            return res.json(fetchResult.rows[0]);
        }).catch(err => {
            console.log(err);
            return res.status(501).json({message: Errors[9]});
        })
    }).catch(err => {
        console.log(err);
        return res.status(501).json({message: Errors[9]});
    }) 
});

interface GetNameEmailsFetchResults {
    rowCount: number;
    rows: {name: string; email: string}[]
}

router.get('/getNameEmails/:id', (req, res) => {
    const userid = Number.parseInt(req.params.id);

    pool.query(userTable.getNameEmail, [userid]).then((data: GetNameEmailsFetchResults) => {
        if (data.rowCount <= 0) {
            return res.status(404).json({ message: Errors[14] });
        }
        return res.status(200).json(data.rows[0]);
    }).catch((err: any) => {   
        console.log(err);
        return res.status(501).json({ message: Errors[9] });
    });
});

router.post('/update', (req, res) => {
    let userid = Number.parseInt(req.body.id)
    let updateBody: UpdateUser = {};

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
        Log.createLog(req.ip, req.id , Logs.UPDATE_USER, userid).then((_: any) => {
            return res.json({message: Succes[17]});
        }).catch((err: MyError) => {
            return res.status(500).json({message: MyErrors2.INTERNAL_SERVER_ERROR});
        })
    }).catch(err => {
        console.log(err);
        if(err instanceof MyError) {
            return res.status(501).json({message: err.message});
        } else {
            return res.status(501).json({message: Errors[9]});
        }
    });
});

export default router;