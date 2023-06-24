import User from "./users.js";
import MyError from "../utility/myError.js";
import { Errors } from "../utility/constants.js";
import pool from "../../db2.js";
import userTable from "./db_users.js";
import bcrypt from 'bcrypt';

export interface UpdateUser {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[];
}

interface UserFromDB {
    fname? : string;
    lname? : string;
    email? : string;
    password? : string;
    username? : string;
    companyname? : string;
    usertype? : number;
    deleted? : boolean;
}

interface RoleFromDB {
    id? : number;
    name? : string;
    deleted? : boolean;
}

interface RoleFetchResult {
    rowCount: number;
    rows: RoleFromDB[]
}

export interface UserFetchResult {
    rowCount: number;
    rows: UserFromDB[]
}

export function updateUser(username: string, updateJSON: UpdateUser): Promise<void | never> {
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
        let promises: Promise<void | never>[] = [];
        Object.entries(updateJSON).forEach(([key2, value]) => promises.push(_verify({[key2]: value}, username)));

        Promise.all(promises).then(() => {
            // Update Each item
            let promises2: Promise<void | never>[] = [];
            Object.entries(updateJSON).forEach(([key2, value]) => promises2.push(_updateInDb(username, {[key2]: value})));

            Promise.all(promises2).then(() => {
                return res();
            }).catch(err => {
                console.log(err);
                if (err instanceof MyError) {
                    return rej(err);
                } else {
                    return rej(new MyError(Errors[9]));
                }
            });
        }).catch(err => {
            console.log(err);
            if (err instanceof MyError) {
                return rej(err);
            } else {
                return rej(new MyError(Errors[9]));
            }
        });
    });
}

function _verify(updateDetails: UpdateUser, username: string): Promise<void | never> {
    return new Promise((res, rej) => {
        if(updateDetails.name) {
            if (updateDetails.name.length > 50) {
                return rej(new MyError(Errors[64]));
            }
            return res();
        }

        if(updateDetails.email) {
            pool.query(userTable.checkIfEmailIsTaken, [updateDetails.email]).then((data: UserFetchResult) => {
                if (data.rowCount > 0) {
                    return rej(new MyError(Errors[64]));
                } else {
                    return res();
                }
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[64]));
            });
        }

        if(updateDetails.password) {
            return res();
        }

        if(updateDetails.roles) {
            function verifyRole(role: string): Promise<void | never> {
                return new Promise((res2, rej2) => {
                    pool.query(userTable.getRole, [role]).then((data: RoleFetchResult) => {
                        if (data.rowCount > 0) {
                            return res2();
                        } else {
                            return rej2(new MyError(Errors[64]));
                        }
                    }).catch(err => {
                        console.log(err);
                        return rej2(new MyError(Errors[64]));
                    });
                });
            }

            let promises: Promise<void | never>[] = [];
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

function _updateInDb(username: string, updateDetails: UpdateUser): Promise<void | never> {
    return new Promise((res, rej) => {
        let updateQuery: string;
        if(updateDetails.name) {
            updateQuery = "UPDATE User2 SET fname = $1 WHERE username = $2";
            pool.query(updateQuery, [updateDetails.name, username]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }

        if(updateDetails.email) {
            updateQuery = "UPDATE User2 SET email = $1 WHERE username = $2";
            pool.query(updateQuery, [updateDetails.email, username]).then(_ => {
                return res();
            }).catch(err => {
                console.log(err);
                return rej(new MyError(Errors[65]));
            });
        }

        if(updateDetails.password) {
            updateQuery = "UPDATE User2 SET password = $1 WHERE username = $2";
            // Hash the password
            bcrypt.hash(updateDetails.password, 10).then(hashedPasswd => {
                pool.query(updateQuery, [hashedPasswd, username]).then(_ => {
                    return res();
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[65]));
                });
            })
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