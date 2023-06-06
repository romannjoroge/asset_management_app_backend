import userTable from "../src/Users/db_users.js";
import { Errors } from "../utility/constants.js";
import pool from "../db2.js";
export default (role) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.authenticated) {
            return res.status(400).json({ message: Errors[28] });
        }
        // Extract username from request
        const username = req.username;
        // Check if user has required role
        pool.query(userTable.isUserAuthorized, [role, username]).then(data => {
            // Return error if user does not have role
            if (data.rowCount <= 0) {
                return res.status(400).json({ message: Errors[28] });
            }
            req.authorized = true;
            next();
        });
    };
};
