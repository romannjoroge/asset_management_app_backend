const createGatePass = `INSERT INTO GatePass (reason, name, fromlocation, tolocation, date) VALUES 
                        ($1, (SELECT username FROM User2 WHERE $2 = CONCAT(fname, ' ', lname) LIMIT 1), $3, 
                        $4, $5)`;
const createGatePassAsset = "INSERT INTO GatePassAsset (gatePassID, assetid) VALUES ($1, $2)";
const getGatePass = "SELECT id FROM Gatepass WHERE reason = $1 AND name = $2 AND fromlocation = $3 AND tolocation = $4 AND date = $5";
const checkIfUserExists = "SELECT * FROM User2 WHERE CONCAT(fname, ' ', lname) = $1 AND deleted = false";
const getLocationID = "SELECT id FROM Location WHERE name = $1";
export default {
    getLocationID,
    checkIfUserExists,
    getGatePass,
    createGatePassAsset,
    createGatePass
};
//# sourceMappingURL=db_gatepass.js.map