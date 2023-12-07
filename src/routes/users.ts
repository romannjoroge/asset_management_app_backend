import express from 'express';
const router = express.Router();
import userTable from '../Users/db_users.js';
import Asset from '../Allocation/Asset/asset2.js';
import { Errors, MyErrors2, Succes } from '../utility/constants.js';
import pool from '../../db2.js';
import { updateUser, UpdateUser } from '../Users/update.js';
import MyError from '../utility/myError.js';
import gatepasstable from '../GatePass/db_gatepass.js';
import bcrypt from 'bcrypt';

router.get('/getUsers', (req, res) => {
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

router.get('/getNames', (req, res) => {
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

router.get('/userTable', (req, res) => {
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

router.get('/user/:id', (req, res) => {
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
router.post('/addUser', (req, res) => {
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
                                return res.json({message: Succes[4]});
                            }).catch(err => {
                                console.log(err);
                                return res.status(501).json({message: Errors[9]});
                            });
                        } else {
                            return res.json({message: Succes[4]});
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

router.get('/', (req, res) => {
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

router.get('/getCompany/:username', (req, res) => {
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
        return res.json({message: Succes[17]});
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