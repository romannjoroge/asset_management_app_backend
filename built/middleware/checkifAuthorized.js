"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_users_js_1 = __importDefault(require("../src/Users/db_users.js"));
const constants_js_1 = require("../src/utility/constants.js");
const db2_js_1 = __importDefault(require("../db2.js"));
exports.default = (role) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.authenticated) {
            return res.status(400).json({ message: constants_js_1.Errors[28] });
        }
        // Extract username from request
        const username = req.username;
        // Check if user has required role
        db2_js_1.default.query(db_users_js_1.default.isUserAuthorized, [role, username]).then(data => {
            // Return error if user does not have role
            if (data.rowCount <= 0) {
                return res.status(400).json({ message: constants_js_1.Errors[28] });
            }
            req.authorized = true;
            next();
        });
    };
};
