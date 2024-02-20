var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2.js';
// Importing custom classes
import userTable from './db_users.js';
import MyError from '../utility/myError.js';
import { Errors, MyErrors2 } from '../utility/constants.js';
export var UserRoles;
(function (UserRoles) {
    UserRoles["COMPANY_ADMIN"] = "Company Administrator";
    UserRoles["USER_MANAGER"] = "User Manager";
    UserRoles["ASSET_ADMIN"] = "Asset Administrator";
    UserRoles["ASSET_RECONCILER"] = "Asset Reconciler";
    UserRoles["RFID_READER"] = "RFID Reader";
    UserRoles["ASSET_USER"] = "Asset User";
    UserRoles["GATEPASS_AUTH"] = "GatePass Authorizer";
    UserRoles["REPORT_GEN"] = "Report Generator";
})(UserRoles || (UserRoles = {}));
class User {
    constructor() { }
    static getName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(userTable.getName, [username]).then((data) => {
                    if (data.rowCount > 0) {
                        return res(data.rows[0]['name']);
                    }
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            });
        });
    }
    static checkIfUserExists(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(userTable.checkIfUserInDB, [username]).then((data) => {
                    if (data.rowCount > 0) {
                        res(true);
                    }
                    else {
                        res(false);
                    }
                }).catch(err => {
                    console.log(err);
                    res(false);
                });
            });
        });
    }
    static checkIfUserIDExists(userID) {
        return new Promise((res, rej) => {
            console.log(11);
            pool.query(userTable.checkIfUserIDExists, [userID]).then((data) => {
                if (data.rowCount > 0) {
                    console.log(12);
                    res(true);
                }
                else {
                    console.log(13);
                    res(false);
                }
            }).catch(_ => {
                rej(new MyError(MyErrors2.USER_NOT_EXIST));
            });
        });
    }
    static checkIfUserNameExists(username) {
        return new Promise((res, rej) => {
            pool.query(userTable.checkIfNameExists, [username]).then((data) => {
                if (data.rowCount > 0) {
                    res(true);
                }
                else {
                    res(false);
                }
            }).catch((err) => {
                console.log(err);
                res(false);
            });
        });
    }
    /**
     *
     * @param username Username of user
     * @description Gets the id of the user from their username
     */
    static getUserID(username) {
        return new Promise((res, rej) => {
            pool.query(userTable.getUserID, [username]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                return res(fetchResult.rows[0].id);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_USER_ID));
            });
        });
    }
    /**
     *
     * @param userid id of the user to get username of
     * @returns username of the user
     */
    static getUsername(userid) {
        return new Promise((res, rej) => {
            pool.query(userTable.getUsername, [userid]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                return res(fetchResult.rows[0].username);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.USER_NOT_EXIST));
            });
        });
    }
    /**
     *
     * @param userid ID of the user to get email of
     * @returns Email of user
     * @description Returns the email of user with given ID
     */
    static getEmail(userid) {
        return new Promise((res, rej) => {
            pool.query(userTable.getEmail, [userid]).then((fetchResult) => {
                if (fetchResult.rowCount <= 0) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                return res(fetchResult.rows[0].email);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.USER_NOT_EXIST));
            });
        });
    }
}
export default User;
//# sourceMappingURL=users.js.map