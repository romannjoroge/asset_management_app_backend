const createGatePass = `INSERT INTO GatePass (reason, userid, fromlocation, tolocation, date) VALUES ($1, $2, $3, $4, $5)`;
const createGatePassAsset = "INSERT INTO GatePassAsset (gatePassID, assetid) VALUES ($1, $2)";
const getGatePass = "SELECT id FROM Gatepass WHERE reason = $1 AND userid = $2 AND fromlocation = $3 AND tolocation = $4 AND date = $5 ORDER BY id DESC LIMIT 1";
const checkIfUserExists = "SELECT * FROM User2 WHERE CONCAT(fname, ' ', lname) = $1 AND deleted = false";
const getLocationID = "SELECT id FROM Location WHERE name = $1";
const getApprovers = "SELECT u.id, u.name FROM User2 u JOIN GatePassAuthorizers g ON g.userid = u.id WHERE g.locationid = $1";
const addApprover = `INSERT INTO GatepassAuthorizers (userid, locationid) VALUES ($1, $2);`;
const addGateAuthorizer = 'INSERT INTO AuthorizeGatepass (userid, gatepassid) VALUES ($1, $2)';
const getPreviousGatePasses = `SELECT g.id, u.name, (SELECT name AS 
    fromlocation FROM Location WHERE id = g.fromlocation), (SELECT name AS tolocation FROM Location WHERE id = 
        g.tolocation), g.date, a.barcode, g.reason, g.approved FROM Gatepass g JOIN gatepassasset ga ON ga.gatepassid = g.id JOIN 
        Asset a ON a.assetid = ga.assetid LEFT JOIN User2 u ON u.id = g.userid WHERE g.userid = $1 AND g.deleted = false;
`;
const getRequestedGatePasses = `SELECT g.id,(SELECT name FROM User2 WHERE userid = g.userid LIMIT 1), (SELECT name AS fromlocation FROM Location WHERE id = g.fromlocation), (SELECT name AS tolocation FROM Location WHERE id = g.tolocation), g.date, a.barcode, g.reason, g.approved 
                                FROM Gatepass g LEFT JOIN location l ON l.id = g.fromlocation LEFT JOIN location ON l.id = g.tolocation JOIN gatepassasset ga  
ON ga.gatepassid = g.id JOIN Asset a ON a.assetid = ga.assetid WHERE g.id IN (SELECT gatepassid FROM AuthorizeGatepass WHERE userid = $1) AND g.approved = false;`;
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
                            (SELECT batchid FROM InventoryBatch) AND b.deleted = false`;
const getBatchesInInventory = `SELECT b.id, b.comments as name, l.name as location, (SELECT COUNT(*) AS no_items FROM BatchAsset 
                            WHERE batchid = b.id), b.date FROM Batch b JOIN Location l ON l.id = b.locationid WHERE b.id IN 
                            (SELECT batchid FROM InventoryBatch WHERE inventoryid = $1) AND b.deleted = false;`;
const getAssetsInBatch = `SELECT b.id, b.date, a.barcode, l.name as location FROM Batch b JOIN Location l ON l.id = b.locationid 
                        JOIN BatchAsset ba ON ba.batchid = b.id JOIN Asset a ON a.assetid = ba.assetid WHERE ba.batchid = $1 AND b.deleted = false`;
const getAssetInInventoryDetails = `SELECT a.barcode, a.noInBuilding, a.code, a.description, a.serialnumber, a.acquisitiondate, a.condition, 
                                    (SELECT name AS responsibleusername FROM User2 WHERE id = a.responsibleuserid LIMIT 1), a.acquisitioncost, a.residualvalue, a.usefulLife, a.depreciationtype, a.depreciationpercent,
                                    l.name as locationname, c.name as categoryname FROM Asset as a JOIN Location as l ON a.locationid = l.id 
                                    JOIN Category as c ON a.categoryid = c.id WHERE a.deleted = false AND a.assetID IN (SELECT assetID FROM BatchAsset 
                                    WHERE batchID IN (SELECT batchID FROM InventoryBatch WHERE inventoryID = $1));`;
const updateInventory = 'UPDATE Inventory SET name = $1 WHERE id = $2';
const updateBatch = 'UPDATE Batch SET comments = $1 WHERE id = $2';
const returnInventories = "SELECT id, name FROM Inventory WHERE deleted = false";
const getGatepassWithLocationAndScannedTime = `
SELECT * FROM Gatepass WHERE id IN (SELECT gatepassid FROM GatepassAsset WHERE assetid = $1) 
AND date < $2 AND date > $3 AND fromlocation = $4 ORDER BY id DESC LIMIT 1;
`;
const getReaderID = "SELECT id FROM ReaderDevice WHERE readerdeviceid = $1;";
export default {
    getReaderID,
    getGatepassWithLocationAndScannedTime,
    returnInventories,
    addApprover,
    updateBatch,
    updateInventory,
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