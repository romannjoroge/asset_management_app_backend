let getLocation = "SELECT name FROM Location WHERE id = $1";
let getLocations = "SELECT name, id FROM Location"
const doesLocationExist = "SELECT * FROM Location WHERE name = $1 AND site IN (SELECT id FROM Site WHERE name = $2 AND companyName = $3)"
const createLocation = "INSERT INTO Location (name, companyname, site) VALUES ($1, $2, (SELECT id FROM Site WHERE name = $3 AND companyName=$4))"
const doesSiteExist = "SELECT * FROM Site WHERE name = $1 AND companyName = $2"
const createSite = "INSERT INTO Site (name, county, city, address, companyname) VALUES ($1, $2, $3, $4, $5)"
const getLocationSites = "SELECT l.name AS location, s.name AS site FROM Location l INNER JOIN Site s ON s.id = l.site;"
const getSites = "SELECT name FROM Site";

let locationTable = {
    getLocation,
    getLocations,
    doesLocationExist,
    createLocation,
    doesSiteExist,
    createSite,
    getLocationSites,
    getSites
}

export default locationTable;