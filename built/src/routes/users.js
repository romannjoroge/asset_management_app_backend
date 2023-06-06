"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_users_js_1 = __importDefault(require("../Users/db_users.js"));
const asset2_js_1 = __importDefault(require("../Allocation/Asset/asset2.js"));
const constants_js_1 = require("../utility/constants.js");
const db2_js_1 = __importDefault(require("../../db2.js"));
router.get('/getUsers', (req, res) => {
    db2_js_1.default.query(db_users_js_1.default.getUsers, []).then(data => {
        if (data.rowCount <= 0) {
            return res.status(404).json({
                message: constants_js_1.Errors[14],
            });
        }
        return res.status(200).json(data.rows);
    }).catch(e => {
        console.log(e);
        return res.status(501).json({
            message: constants_js_1.Errors[9],
        });
    });
});
router.get('/userTable', (req, res) => {
    // Get usernames and emails from database
    db2_js_1.default.query(db_users_js_1.default.nameEmail, []).then(data => {
        // If data is empty return an error
        if (data.rowCount <= 0) {
            return res.status(400).json({ message: constants_js_1.Errors[22] });
        }
        // Return data
        return res.json(data.rows);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
router.get('/user/:id', (req, res) => {
    // Get username
    const username = req.params.id;
    // Get email of user
    db2_js_1.default.query("SELECT email FROM User2 WHERE username=$1", [username]).then(data => {
        // Return an error if data is empty
        if (data.rowCount == 0) {
            return res.status(400).json({ message: constants_js_1.Errors[22] });
        }
        let email = data.rows[0]['email'];
        // console.log(email);
        // return res.send("OK");
        // Get roles
        db2_js_1.default.query(db_users_js_1.default.userRoles, [username]).then(data => {
            // Return an error if data is empty
            if (data.rowCount == 0) {
                return res.status(400).json({ message: constants_js_1.Errors[22] });
            }
            // Extract roles
            let roles = data.rows.map(row => {
                return row['name'];
            });
            // Send roles and email
            return res.json({ email, roles });
        }).catch(e => {
            console.log(e);
            return res.status(500).json({ message: constants_js_1.Errors[9] });
        });
    }).catch(e => {
        console.log(e);
        return res.status(500).json({ message: constants_js_1.Errors[9] });
    });
});
// Route To Add A User To A Company
router.post('/addUser', (req, res) => {
    // Get User Details And Roles From Frontend
    let { fname, lname, email, password, username, companyName, roles } = req.body;
    // Check if user with email already exists
    db2_js_1.default.query(db_users_js_1.default.doesUserExist, [email, username]).then(fetchResult => {
        // If the rows returned are not empty return an error
        if (fetchResult.rowCount > 0) {
            return res.status(400).json({ message: constants_js_1.Errors[24] });
        }
        // Add user if doesn't exist
        db2_js_1.default.query(db_users_js_1.default.addUser, [fname, lname, email, password, username, companyName]).then(_ => {
            // Add user roles
            for (var i = 0; i < roles.length; i++) {
                if (i == roles.length - 1) {
                    db2_js_1.default.query(db_users_js_1.default.addUserRole, [username, roles[i]]).then(_ => {
                        return res.json({ message: "User Created" });
                    }).catch(err => {
                        console.log(err);
                        return res.status(501).json({ message: constants_js_1.Errors[9] });
                    });
                }
                else {
                    db2_js_1.default.query(db_users_js_1.default.addUserRole, [username, roles[i]]).catch(err => {
                        console.log(err);
                        return res.status(501).json({ message: constants_js_1.Errors[9] });
                    });
                }
            }
        }).catch(err => {
            console.log(err);
            return res.status(501).json({ message: constants_js_1.Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: constants_js_1.Errors[9] });
    });
});
router.get('/getCompany/:username', (req, res) => {
    // Check if username exits
    db2_js_1.default.query(db_users_js_1.default.doesUsernameExist, [req.params.username]).then(fetchResult => {
        // If nothing is returned the user does not exist
        if (fetchResult.rowCount <= 0) {
            return res.status(404).json({ message: constants_js_1.Errors[24] });
        }
        // Return company
        db2_js_1.default.query(db_users_js_1.default.getCompany, [req.params.username]).then(fetchResult => {
            // If nothing is returned returned error
            if (fetchResult.rowCount <= 0) {
                return res.status(400).json({ message: constants_js_1.Errors[31] });
            }
            // Return company
            return res.json(fetchResult.rows[0]);
        }).catch(err => {
            console.log(err);
            return res.status(501).json({ message: constants_js_1.Errors[9] });
        });
    }).catch(err => {
        console.log(err);
        return res.status(501).json({ message: constants_js_1.Errors[9] });
    });
});
exports.default = router;
