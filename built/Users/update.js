import User from "./users.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import userTable from "./db_users.js";
import bcrypt from 'bcrypt';
export function updateUser(username, updateJSON) {
    return new Promise((res, rej) => {
        // Check that user exists
        User.checkIfUserExists(username).then(exists => {
            if (exists === false) {
                return rej(new MyError(Errors[30]));
            }
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
        // Verify each item in updateJSON
        let promises = [];
        Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({ [key2]: value }, username)));
        Promise.all(promises).then(() => {
            // Update Each item
            let promises2 = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(username, { [key2]: value })));
            Promise.all(promises2).then(() => {
                return res();
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(Errors[9]));
                }
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            }
            else {
                return rej(new MyError(Errors[9]));
            }
        });
    });
}
function _verify(updateDetails, username) {
    return new Promise((res, rej) => {
        if (updateDetails.fname) {
            if (updateDetails.fname.length > 50) {
                return rej(new MyError(Errors[64]));
            }
            return res();
        }
        if (updateDetails.lname) {
            if (updateDetails.lname.length > 50) {
                return rej(new MyError(Errors[64]));
            }
            return res();
        }
        if (updateDetails.email) {
            pool.query(userTable.checkIfEmailIsTaken, [updateDetails.email]).then((data) => {
                if (data.rowCount > 0) {
                    return rej(new MyError(Errors[64]));
                }
                else {
                    return res();
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[64]));
            });
        }
        if (updateDetails.password) {
            return res();
        }
        if (updateDetails.roles) {
            function verifyRole(role) {
                return new Promise((res2, rej2) => {
                    pool.query(userTable.getRole, [role]).then((data) => {
                        if (data.rowCount > 0) {
                            return res2();
                        }
                        else {
                            return rej2(new MyError(Errors[64]));
                        }
                    }).catch(err => {
                        console.log(err);
                        return rej2(new MyError(Errors[64]));
                    });
                });
            }
            let promises = [];
            updateDetails.roles.forEach(role => promises.push(verifyRole(role)));
            Promise.all(promises).then(() => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[64]));
            });
        }
    });
}
function _updateInDb(username, updateDetails) {
    return new Promise((res, rej) => {
        let updateQuery;
        if (updateDetails.fname) {
            updateQuery = "UPDATE User2 SET fname = $1 WHERE username = $2";
            pool.query(updateQuery, [updateDetails.fname, username]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }
        if (updateDetails.lname) {
            updateQuery = "UPDATE User2 SET lname = $1 WHERE username = $2";
            pool.query(updateQuery, [updateDetails.lname, username]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }
        if (updateDetails.email) {
            updateQuery = "UPDATE User2 SET email = $1 WHERE username = $2";
            pool.query(updateQuery, [updateDetails.email, username]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }
        if (updateDetails.password) {
            updateQuery = "UPDATE User2 SET password = $1 WHERE username = $2";
            // Hash the password
            bcrypt.hash(updateDetails.password, 10).then(hashedPasswd => {
                pool.query(updateQuery, [hashedPasswd, username]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[65]));
                });
            });
        }
        // if(updateDetails.roles) {
        //     function addRole(role: string, username: string): Promise<void | never> {
        //         return new Promise((res2, rej2) => {
        //             pool.query(userTable.addUserRole, [username, role]).then(_ => {
        //                 return res2();
        //             }).catch(err => {
        //                 console.log(err);
        //                 return rej2(new MyError(Errors[65]));
        //             });
        //         });
        //     }
        //     let promises: Promise<void | never>[] = [];
        //     updateDetails.roles.forEach(role => promises.push(addRole(role, username)));
        //     pool.query(userTable.deleteUserRoles, [username]).then(_ => {
        //         Promise.all(promises).then(() => {
        //             return res();
        //         }).catch(err => {
        //             console.log(err);
        //             return rej(new MyError(Errors[65]));
        //         });
        //     }).catch(err => {
        //         console.log(err);
        //         return rej(new MyError(Errors[65]));
        //     });
        // }
    });
}
//# sourceMappingURL=update.js.map