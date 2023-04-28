let getLocation = "SELECT name FROM Location WHERE id = $1";
let getLocations = "SELECT name, id FROM Location"
const doesLocationExist = "SELECT * FROM Location WHERE name = $1 AND parentLocationID IN (SELECT id FROM Location WHERE name = $2 AND companyName = $3)"
const createLocation = "INSERT INTO Location (name, companyname, parentLocationID) VALUES ($1, $2, (SELECT id FROM Location WHERE name = $3 AND companyName=$4))"
const doesSiteExist = "SELECT * FROM Site WHERE name = $1 AND companyName = $2"
const createSite = "INSERT INTO Site (name, county, city, address, companyname) VALUES ($1, $2, $3, $4, $5)"
const getLocationSites = "SELECT l1.name AS location, l2.name AS parent FROM Location l1 LEFT JOIN Location l2 ON l1.parentlocationid = l2.id"
const getSites = "SELECT name FROM Location WHERE parentLocationID IS NULL";
const getTags = "SELECT scannedTime, antNo, epcID FROM Tags WHERE scannedTime BETWEEN $1 AND $2"

let locationTable = {
    getLocation,
    getLocations,
    doesLocationExist,
    createLocation,
    doesSiteExist,
    createSite,
    getLocationSites,
    getSites,
    getTags
}

export default locationTable;