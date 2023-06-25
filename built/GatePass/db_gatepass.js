const createGatePass = `INSERT INTO GatePass (reason, name, fromlocation, tolocation, date) VALUES ($1, $2, $3, $4, $5)`;
const createGatePassAsset = "INSERT INTO GatePassAsset (gatePassID, assetid) VALUES ($1, $2)";
const getGatePass = "SELECT id FROM Gatepass WHERE reason = $1 AND name = $2 AND fromlocation = $3 AND tolocation = $4 AND date = $5 ORDER BY id DESC LIMIT 1";
const checkIfUserExists = "SELECT * FROM User2 WHERE CONCAT(fname, ' ', lname) = $1 AND deleted = false";
const getLocationID = "SELECT id FROM Location WHERE name = $1";
const getApprovers = `SELECT u.username, u.name FROM User2 u JOIN GatePassAuthorizers g ON g.username = u.username WHERE g.locationid = $1`;
const addGateAuthorizer = 'INSERT INTO AuthorizeGatepass (username, gatepassid) VALUES ($1, $2)';
const getPreviousGatePasses = `SELECT g.id, (SELECT name FROM User2 WHERE username = g.name), (SELECT name AS fromlocation FROM Location WHERE id = g.fromlocation), 
                            (SELECT name AS tolocation FROM Location WHERE id = g.tolocation), g.date, a.barcode, g.reason, 
                            g.approved FROM Gatepass g LEFT JOIN location l ON l.id = g.fromlocation LEFT JOIN location ON l.id = g.tolocation 
                            JOIN gatepassasset ga ON ga.gatepassid = g.id JOIN Asset a ON a.assetid = ga.assetid WHERE g.name = $1;`;
const getRequestedGatePasses = `SELECT g.id, g.name, (SELECT name AS fromlocation FROM Location WHERE id = g.fromlocation), 
                                (SELECT name AS tolocation FROM Location WHERE id = g.tolocation), g.date, a.barcode, g.reason, g.approved 
                                FROM Gatepass g LEFT JOIN location l ON l.id = g.fromlocation LEFT JOIN location ON l.id = g.tolocation JOIN gatepassasset ga 
                                ON ga.gatepassid = g.id JOIN Asset a ON a.assetid = ga.assetid WHERE g.id IN (SELECT gatepassid FROM AuthorizeGatepass WHERE 
                                username = $1) AND g.approved = false`;
const doesGatePassExist = `SELECT * FROM Gatepass WHERE id = $1`;
const handleGatePass = `UPDATE Gatepass SET approved = $1, comment = $2 WHERE id = $3;`;
export default {
    handleGatePass,
    doesGatePassExist,
    getRequestedGatePasses,
    getPreviousGatePasses,
    addGateAuthorizer,
    getApprovers,
    getLocationID,
    checkIfUserExists,
    getGatePass,
    createGatePassAsset,
    createGatePass
};
//# sourceMappingURL=db_gatepass.js.map