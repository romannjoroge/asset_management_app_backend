import userTable from "../built/Users/db_users.js";
import { Errors } from "../built/utility/constants.js";
import pool from "../db2.js";

export default (role) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if(!req.authenticated) {
            return res.status(400).json({message:Errors[28]});
        }

        // Extract id from request
        const id = req.id

        // Check if user has required role
        pool.query(userTable.isUserAuthorized, [role, id]).then(data => {
            // Return error if user does not have role
            if(data.rowCount <= 0) {
                return res.status(400).json({message:Errors[28]});
            }

            req.authorized = true;

            // Get ip of user
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            req.ip = ip;

            next();
        })
    }
}