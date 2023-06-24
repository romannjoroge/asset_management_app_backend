const createGatePass = `INSERT INTO GatePass (reason, name, fromlocation, tolocation, date) VALUES ($1, $2, $3, $4, $5)`
const createGatePassAsset = "INSERT INTO GatePassAsset (gatePassID, assetid) VALUES ($1, $2)";
const getGatePass = "SELECT id FROM Gatepass WHERE reason = $1 AND name = $2 AND fromlocation = $3 AND tolocation = $4 AND date = $5 ORDER BY id DESC LIMIT 1";
const checkIfUserExists = "SELECT * FROM User2 WHERE CONCAT(fname, ' ', lname) = $1 AND deleted = false";
const getLocationID = "SELECT id FROM Location WHERE name = $1";
const getApprovers = `SELECT u.username, u.name FROM User2 u JOIN GatePassAuthorizers g ON g.username = u.username WHERE g.locationid = $1`;
const addGateAuthorizer = 'INSERT INTO AuthorizeGatepass (username, gatepassid) VALUES ($1, $2)';

export default {
    addGateAuthorizer,
    getApprovers,
    getLocationID,
    checkIfUserExists,
    getGatePass,
    createGatePassAsset,
    createGatePass
}