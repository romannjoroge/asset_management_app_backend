const selectUserLogs = "SELECT timestamp, logdescription FROM Log WHERE username = $1 AND timestamp BETWEEN $2 AND $3 AND eventType = $4";
const create_log = "INSERT INTO Log (timestamp, ipaddress, userid, itemid, eventid) VALUES ($1, $2, (SELECT id FROM User2 WHERE username = $3 LIMIT 1), $4, (SELECT id FROM Events WHERE description = $5 LIMIT 1))"

export default {
    selectUserLogs,
    create_log
}