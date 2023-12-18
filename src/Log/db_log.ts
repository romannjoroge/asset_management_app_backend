const selectUserLogs = "SELECT timestamp, logdescription FROM Log WHERE username = $1 AND timestamp BETWEEN $2 AND $3 AND eventType = $4";
const insertLog = "INSERT INTO Log(ipaddress, userid, itemid, eventid) VALUES ($1, $2, $3, $4)"

export default {
    selectUserLogs,
    insertLog
}