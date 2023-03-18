const physical_valuation = `SELECT a.assetTag AS "Asset Tag", a.serialnumber AS "Serial Number", a.makeandmodelno AS 
                            "Make And Model Number", c.name AS "Category", l.name AS "Location" FROM Asset a JOIN Category c 
                            ON a.categoryid = c.id JOIN Location l ON l.id = a.locationid WHERE a.assettag IN (SELECT assetTag FROM 
                            StockTakeAssets WHERE stockTakeID = $1)`;
const missingAssets = `SELECT assettag FROM Asset a WHERE NOT EXISTS ( SELECT FROM StockTakeAssets WHERE assettag = a.assettag AND 
                       stocktakeid=$1 AND a.locationid = (SELECT locationid FROM StockTake WHERE id=$1))`;
const movements = `SELECT timestamp, username FROM Log WHERE logdescription ~* $1 AND eventtype = 'Movement' ORDER BY timestamp`;
const chainOfCustody = `SELECT timestamp, username, logdescription FROM Log WHERE logdescription ~* $1 AND eventtype = 'Allocate Asset' 
                        ORDER BY timestamp;`;
const categoryCount = `SELECT c.name, COUNT(a.assettag) FROM Asset a JOIN Category c ON c.id = a.categoryid GROUP BY c.name`;
const depreciationValues = 'SELECT openingBookvalue FROM DepreciationSchedule WHERE assettag = $1';
const getStockTakes = "SELECT date, id FROM StockTake";

export default {
    physical_valuation,
    missingAssets,
    chainOfCustody,
    movements,
    categoryCount,
    depreciationValues,
    getStockTakes
}