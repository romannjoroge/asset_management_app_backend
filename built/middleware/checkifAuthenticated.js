"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_js_1 = require("../src/utility/constants.js");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = (req, res, next) => {
    // Extract token from header
    const token = req.header('x-auth-token');
    // If token does not exist return an error
    if (!token) {
        return res.status(400).json({ message: constants_js_1.Errors[27] });
    }
    // Check if the token is valid
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        // Add username to req
        req.username = payload.username;
        req.authenticated = true;
        next();
    }
    catch (err) {
        return res.status(400).json({ message: constants_js_1.Errors[27] });
    }
};
