import User from "./users.js";
import MyError from "../utility/myError.js";
import { Errors, MyErrors2 } from "../utility/constants.js";
import pool from "../../db2.js";
import userTable from "./db_users.js";
import bcrypt from 'bcrypt';
export function updateUser(userid, updateJSON) {
    return new Promise((res, rej) => {
        // Check that user exists
        User.checkIfUserIDExists(userid).then(exists => {
            if (exists === false) {
                return rej(new MyError(Errors[30]));
            }
        }).catch(err => {
            console.log(err);
            return rej(new MyError(Errors[9]));
        });
        // Verify each item in updateJSON
        let promises = [];
        Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({ [key2]: value }, userid)));
        Promise.all(promises).then(() => {
            // Update Each item
            let promises2 = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(userid, { [key2]: value })));
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
// This function verifies if the details given to update the user are valid
// The checks include seeing if the new name is too long, checking if email is already taken, 
// and checking if the specified role already exists
function _verify(updateDetails, userid) {
    return new Promise((res, rej) => {
        if (updateDetails.name) {
            if (updateDetails.name.length > 50) {
                return rej(new MyError(MyErrors2.INVAILID_NAME));
            }
            return res();
        }
        if (updateDetails.email) {
            pool.query(userTable.checkIfEmailIsTaken, [updateDetails.email]).then((data) => {
                if (data.rowCount > 0) {
                    return rej(new MyError(MyErrors2.EMAIL_ALREADY_EXISTS));
                }
                else {
                    return res();
                }
            }).catch((err) => {
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
                    // Checks if the given role exists
                    pool.query(userTable.getRole, [role]).then((data) => {
                        if (data.rowCount > 0) {
                            return res2();
                        }
                        else {
                            return rej2(new MyError(MyErrors2.INVALID_ROLE));
                        }
                    }).catch((err) => {
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
                if (err instanceof MyError) {
                    return rej(err);
                }
                else {
                    return rej(new MyError(Errors[64]));
                }
            });
        }
    });
}
// This function updates the user's details in the backend
function _updateInDb(userid, updateDetails) {
    return new Promise((res, rej) => {
        let updateQuery;
        if (updateDetails.name) {
            updateQuery = "UPDATE User2 SET name = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.name, userid]).then((_) => {
                return res();
            }).catch((err) => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }
        if (updateDetails.email) {
            updateQuery = "UPDATE User2 SET email = $1 WHERE id = $2";
            pool.query(updateQuery, [updateDetails.email, userid]).then((_) => {
                return res();
            }).catch((err) => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }
        if (updateDetails.password) {
            updateQuery = "UPDATE User2 SET password = $1 WHERE id = $2";
            // Hash the password
            bcrypt.hash(updateDetails.password, 10).then(hashedPasswd => {
                pool.query(updateQuery, [hashedPasswd, userid]).then((_) => {
                    return res();
                }).catch((err) => {
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