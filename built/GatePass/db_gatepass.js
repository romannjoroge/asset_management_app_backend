const createGatePass = "INSERT INTO GatePass (leavingTime, arrivingTime, entry, username, reason) VALUES ($1, $2, $3, $4, $5)";
const createGatePassAsset = "INSERT INTO GatePassAsset (gatePassID, assetid) VALUES ($1, $2)";
const getGatePass = "SELECT id FROM Gatepass WHERE leavingTime = $1 AND arrivingTime = $2 AND entry = $3 AND username = $4 AND reason = $5";
export default {
    getGatePass,
    createGatePassAsset,
    createGatePass
};
//# sourceMappingURL=db_gatepass.js.map