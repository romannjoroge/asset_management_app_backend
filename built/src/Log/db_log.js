"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selectUserLogs = "SELECT timestamp, logdescription FROM Log WHERE username = $1 AND timestamp BETWEEN $2 AND $3 AND eventType = $4";
exports.default = {
    selectUserLogs
};
