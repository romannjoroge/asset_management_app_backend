import { Errors } from "../built/utility/constants.js";
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

export default (req, res, next) => {
    // Extract token from header
    const token = req.header('x-auth-token');

    // If token does not exist return an error
    if(!token) {
        return res.status(400).json({message:Errors[27]});
    }

    // Check if the token is valid
    try {
        const payload = JWT.verify(token, process.env.TOKEN_SECRET);

        // Add username to req
        req.username = payload.username;
        req.authenticated = true;
        next();
    } catch(err) {
        return res.status(400).json({message:Errors[27]});
    }
}