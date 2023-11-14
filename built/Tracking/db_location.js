let getLocation = "SELECT name FROM Location WHERE id = $1";
let getLocations = "SELECT name, id FROM Location WHERE deleted = false";
const doesLocationExist = "SELECT * FROM Location WHERE name = $1 AND parentLocationID IN (SELECT id FROM Location WHERE name = $2 AND companyName = $3) AND deleted = false";
const createLocation = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, (SELECT id FROM Location WHERE name = $3 AND companyName=$4))";
const createLocationWithNoParent = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, null)";
const doesSiteExist = "SELECT * FROM Location WHERE name = $1 AND companyName = $2 AND parentLocationID = null";
const createSite = "INSERT INTO Site (name, county, city, address, companyname) VALUES ($1, $2, $3, $4, $5)";
const getLocationSites = "SELECT l1.name AS location, l1.id AS locationid, l2.name AS parent, l2.id AS parentid FROM Location l1 LEFT JOIN Location l2 ON l1.parentlocationid = l2.id WHERE l1.deleted = false";
const getSites = "SELECT name, id FROM Location WHERE parentLocationID IS NULL AND deleted = false";
const getTags = `SELECT t.scannedtime, t.epcid AS barcode, r.name AS reader, l.name AS location, a.entry 
                FROM Tags t JOIN RFIDReader r ON r.id = t.readerid JOIN Location l ON l.id = r.locationid 
                JOIN Antennae a ON a.id = t.antennae_id WHERE t.scannedtime BETWEEN $1 AND $2`;
const doesReaderExist = "SELECT * FROM RFIDReader WHERE name = $1 AND locationid = $2";
const createReader = "INSERT INTO RFIDReader (locationID, hardwareKey, noantennae) VALUES ($1, $2, $3)";
const doesAntennaeExist = "SELECT * FROM Antennae WHERE antennaeno = $1 AND readerID = $2 AND deleted = false";
const doesAntennaeIDExist = "SELECT * FROM Antennae WHERE id = $1 AND deleted = false";
const createAntennae = "INSERT INTO Antennae (antennaeno, readerID, entry) VALUES ($1, $2, $3)";
const getReader = "SELECT * FROM RFIDReader WHERE hardwareKey = $1";
const getReaderFromID = "SELECT * FROM RFIDReader WHERE id = $1 AND deleted = false";
const getMovementInfo = `SELECT scannedtime, hardwarekey, antno, entry FROM (SELECT t.scannedtime, t.hardwarekey, t.antno, t.epcid, r.id, a.entry, lag(a.entry) 
                        OVER (PARTITION BY t.epcid ORDER BY t.scannedtime) AS prev_state FROM Tags t JOIN RFIDReader r ON r.hardwarekey = t.hardwarekey JOIN Antennae a 
                        ON a.readerid = r.id AND a.antennaeno = t.antno) AS q WHERE entry IS DISTINCT FROM prev_state`;
;
const viewReaders = "SELECT r.id, r.hardwarekey AS name, r.noantennae, l.name AS location FROM RFIDReader r JOIN Location l ON l.id = r.locationid WHERE r.deleted = false";
const doesLocationNameExist = "SELECT * FROM Location WHERE name = $1 AND parentlocationid IN (SELECT parentlocationid FROM Location WHERE id = $2)";
const getAntennaes = "SELECT a.id, a.antennaeno, r.hardwarekey, a.entry, l.name FROM Antennae a JOIN RFIDReader r ON r.id = a.readerid JOIN Location l ON l.id = r.locationid WHERE a.deleted = false";
const readerIDs = "SELECT id, hardwarekey AS name FROM RFIDReader WHERE deleted = false";
const getNumberofAntennaes = "SELECT id, noAntennae FROM RFIDReader WHERE id IN (SELECT readerID FROM Antennae WHERE id = $1)";
const checkIfAntennaeNumberTaken = "SELECT * FROM Antennae WHERE readerid = $1 AND antennaeno = $2";
const getNumberofAntennaes2 = "SELECT noantennae, id FROM RFIDReader WHERE id = $1";
const getParentLocations = "SELECT parentLocationID FROM Location WHERE id = $1 AND deleted = false";
const addProcessedTag = "INSERT INTO ProcessedTags(scannedTime, assetID, readerDeviceID) VALUES ($1, $2, $3)";
const getAllAssetsLeavingLocationAndIfAuthorized = `
SELECT p.scannedTime, g.date AS gatepassdate, u.name AS responsibleuser, a.serialnumber, a.barcode, a.description, a.condition, c.name AS category, 
g.approved AS authorized FROM ProcessedTags p JOIN ReaderDevice r ON r.id = p.readerdeviceid JOIN Gatepass g ON g.fromlocation = r.locationid JOIN Asset a 
ON a.assetid = p.assetid JOIN Category c ON c.id = a.categoryid JOIN User2 u ON u.username = a.responsibleusername WHERE readerdeviceid IN (SELECT id FROM 
ReaderDevice WHERE locationid = $1 AND entry = false)
`;
let getTrackedLocations = "SELECT id, name FROM Location WHERE id IN (SELECT locationid FROM readerdevice)";
let getLocationDetails = "SELECT id, name, parentLocationID FROM Location WHERE deleted = false";
let syncItem = "UPDATE Asset SET lastConverted = $1, isConverted = $2, isTagged = $3 WHERE assetID = $4";
let createReaderDevice = "INSERT INTO readerdevice (readerdeviceid, locationid, entry) VALUES ($1, $2, $3)";
let doesReaderDeviceExist = "SELECT * FROM readerdevice WHERE readerdeviceid = $1 AND deleted = false";
let getReaderDevices = `
SELECT r.id, entry, readerdeviceid, l.name AS location FROM ReaderDevice r INNER JOIN Location l ON l.id = r.locationid WHERE r.deleted = false;
`;
let doesReaderIDExist = "SELECT * FROM ReaderDevice WHERE id = $1";
let getPreviousEntry = "SELECT * FROM ProcessedTags WHERE assetID = $1 AND scannedTime < $2 ORDER BY scannedTime DESC LIMIT 1";
let getPreviousReaderDevices = "SELECT p.readerdeviceid, r.entry FROM ProcessedTags p INNER JOIN ReaderDevice r ON r.readerdeviceid = p.readerdeviceid WHERE assetID = $1 ORDER BY scannedTime DESC LIMIT 2";
let getLocationOfReaderDevice = "SELECT locationid FROM ReaderDevice WHERE readerdeviceid = $1";
let buildAssetFromTagDetails = `
SELECT serialnumber, description, condition, c.name AS category, u.name AS user 
FROM Asset a INNER JOIN Category c ON c.id = a.categoryid INNER JOIN 
User2 u ON u.username = a.responsibleusername WHERE assetID = $1
`;
let getAllLocations = "SELECT id, name, companyname, parentLocationID FROM Location WHERE deleted = false";
let locationTable = {
    getAllLocations,
    buildAssetFromTagDetails,
    getLocationOfReaderDevice,
    getPreviousReaderDevices,
    getPreviousEntry,
    createLocationWithNoParent,
    doesReaderIDExist,
    getReaderDevices,
    doesReaderDeviceExist,
    createReaderDevice,
    syncItem,
    getLocationDetails,
    getTrackedLocations,
    getAllAssetsLeavingLocationAndIfAuthorized,
    addProcessedTag,
    getParentLocations,
    getNumberofAntennaes2,
    checkIfAntennaeNumberTaken,
    getNumberofAntennaes,
    doesAntennaeIDExist,
    readerIDs,
    getAntennaes,
    doesLocationNameExist,
    viewReaders,
    getMovementInfo,
    getReaderFromID,
    getReader,
    getLocation,
    getLocations,
    doesLocationExist,
    createLocation,
    doesSiteExist,
    createSite,
    getLocationSites,
    getSites,
    getTags,
    doesReaderExist,
    createReader,
    doesAntennaeExist,
    createAntennae
};
export default locationTable;
//# sourceMappingURL=db_location.js.map