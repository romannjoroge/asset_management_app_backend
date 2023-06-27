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
const createInventory = "INSERT INTO Inventory (name) VALUES ($1)";
const createBatch = "INSERT INTO Batch (date, comments, locationid) VALUES ($1, $2, $3)";
const getBatchID = `SELECT MAX(id) FROM Batch WHERE locationid = $1 AND date = $2 AND comments = $3`;
const insertBatchAsset = "INSERT INTO BatchAsset(assetID, batchID) VALUES ($1, $2)";
const checkIfInventoryExists = "SELECT * FROM Inventory WHERE id = $1";
const checkIfBatchExists = "SELECT * FROM Batch WHERE id = $1";
const allocateBatch = "INSERT INTO InventoryBatch (inventoryid, batchid) VALUES ($1, $2)";
const getUnallocatedAssets = `SELECT b.id, b.comments as name, l.name as location, (SELECT COUNT(*) AS no_items FROM BatchAsset 
                            WHERE batchid = b.id), b.date FROM Batch b JOIN Location l ON l.id = b.locationid WHERE b.id NOT IN 
                            (SELECT batchid FROM InventoryBatch)`;
const getBatchesInInventory = `SELECT b.id, b.comments as name, l.name as location, (SELECT COUNT(*) AS no_items FROM BatchAsset 
                            WHERE batchid = b.id), b.date FROM Batch b JOIN Location l ON l.id = b.locationid WHERE b.id IN 
                            (SELECT batchid FROM InventoryBatch WHERE inventoryid = $1);`;
const getAssetsInBatch = `SELECT b.id, b.date, a.barcode, l.name as location FROM Batch b JOIN Location l ON l.id = b.locationid 
                        JOIN BatchAsset ba ON ba.batchid = b.id JOIN Asset a ON a.assetid = ba.assetid WHERE ba.batchid = $1`;
const getAssetInInventoryDetails = `SELECT a.barcode, a.noInBuilding, a.code, a.description, a.serialnumber, a.acquisitiondate, a.condition, 
                                    a.responsibleUsername, a.acquisitioncost, a.residualvalue, a.usefulLife, a.depreciationtype, a.depreciationpercent,
                                    l.name as locationname, c.name as categoryname FROM Asset as a JOIN Location as l ON a.locationid = l.id 
                                    JOIN Category as c ON a.categoryid = c.id WHERE a.deleted = false AND a.assetID IN (SELECT assetID FROM BatchAsset 
                                    WHERE batchID IN (SELECT batchID FROM InventoryBatch WHERE inventoryID = $1));`;
export default {
    getAssetInInventoryDetails,
    getAssetsInBatch,
    getBatchesInInventory,
    getUnallocatedAssets,
    allocateBatch,
    checkIfBatchExists,
    checkIfInventoryExists,
    insertBatchAsset,
    getBatchID,
    createBatch,
    createInventory,
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