let getLocation = "SELECT name FROM Location WHERE id = $1";
let getLocations = "SELECT name, id FROM Location"
const doesLocationExist = "SELECT * FROM Location WHERE name = $1 AND parentLocationID IN (SELECT id FROM Location WHERE name = $2 AND companyName = $3)"
const createLocation = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, (SELECT id FROM Location WHERE name = $3 AND companyName=$4))"
const doesSiteExist = "SELECT * FROM Site WHERE name = $1 AND companyName = $2"
const createSite = "INSERT INTO Site (name, county, city, address, companyname) VALUES ($1, $2, $3, $4, $5)"
const getLocationSites = "SELECT l1.name AS location, l1.id AS locationid, l2.name AS parent, l2.id AS parentid FROM Location l1 LEFT JOIN Location l2 ON l1.parentlocationid = l2.id WHERE l1.deleted = false"
const getSites = "SELECT name, id FROM Location WHERE parentLocationID IS NULL";
const getTags = `SELECT t.scannedtime, t.epcid AS barcode, r.name AS reader, l.name AS location, a.entry 
                FROM Tags t JOIN RFIDReader r ON r.id = t.readerid JOIN Location l ON l.id = r.locationid 
                JOIN Antennae a ON a.id = t.antennae_id WHERE t.scannedtime BETWEEN $1 AND $2`;
const doesReaderExist = "SELECT * FROM RFIDReader WHERE name = $1 AND locationid = $2";
const createReader = "INSERT INTO RFIDReader (locationID, hardwareKey, noantennae) VALUES ($1, $2, $3)";
const doesAntennaeExist = "SELECT * FROM Antennae WHERE antennaeno = $1 AND readerID = $2";
const createAntennae = "INSERT INTO Antennae (antennaeno, readerID, entry) VALUES ($1, $2, $3)";
const getReader = "SELECT * FROM RFIDReader WHERE hardwareKey = $1";
const getReaderFromID = "SELECT * FROM RFIDReader WHERE id = $1";
const getMovementInfo = `SELECT scannedtime, hardwarekey, antno, entry FROM (SELECT t.scannedtime, t.hardwarekey, t.antno, t.epcid, r.id, a.entry, lag(a.entry) 
                        OVER (PARTITION BY t.epcid ORDER BY t.scannedtime) AS prev_state FROM Tags t JOIN RFIDReader r ON r.hardwarekey = t.hardwarekey JOIN Antennae a 
                        ON a.readerid = r.id AND a.antennaeno = t.antno) AS q WHERE entry IS DISTINCT FROM prev_state`;;
const viewReaders = "SELECT r.id, r.hardwarekey, r.noantennae, l.name AS location FROM RFIDReader r JOIN Location l ON l.id = r.locationid";
const doesLocationNameExist = "SELECT * FROM Location WHERE name = $1 AND parentlocationid IN (SELECT parentlocationid FROM Location WHERE id = $2)";

let locationTable = {
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
}

export default locationTable;