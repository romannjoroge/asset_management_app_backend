const physical_valuation = `SELECT a.assetTag AS "Asset Tag", a.serialnumber AS "Serial Number", a.makeandmodelno AS 
                            "Make And Model Number", c.name AS "Category", l.name AS "Location" FROM Asset a JOIN Category c 
                            ON a.categoryid = c.id JOIN Location l ON l.id = a.locationid WHERE a.assettag IN (SELECT assetTag FROM 
                            StockTakeAssets WHERE stockTakeID = $1)`;
const missingAssets = `SELECT assettag FROM Asset WHERE assettag NOT IN (SELECT assettag FROM StockTakeAssets WHERE stocktakeid = $1)`;
const movements = `SELECT timestamp, username FROM Log WHERE logdescription ~* $1 AND eventtype = 'Movement' ORDER BY timestamp`;
const chainOfCustody = `SELECT timestamp, logdescription, username FROM Log WHERE logdescription ~* $1 AND eventtype = 'Allocate Asset' 
                        ORDER BY timestamp;`;
const categoryCount = `SELECT c.name, foo.count FROM Category c FULL JOIN (SELECT COUNT(*), c.name FROM Asset a JOIN Category c ON c.id = a.categoryid WHERE a.locationID = $1 GROUP BY c.name) AS foo ON foo.name = c.name`;
const getStockTakes = `SELECT s.date, s.id, l.name AS "Location"  FROM Stocktake s JOIN Location l ON l.id = s.locationid`;
const acquisitionReport = `SELECT a.assettag, l.name AS "Location", a.acquisitioncost FROM Asset a JOIN Location l ON l.id = a.locationid WHERE a.acquisitiondate BETWEEN $1 AND $2`
const depreciationReport = `SELECT year, openingbookvalue FROM DepreciationSchedule WHERE assetTag = $1`;
const getChildLocations = 'SELECT name, id FROM Location WHERE parentLocationID = $1';
const getStockTakesInLocations = 'SELECT id FROM StockTake WHERE locationID = ANY($1)';
const getClosestStockTake = 'SELECT id FROM StockTake WHERE date <= $1 AND locationID = $2 ORDER BY date DESC LIMIT 1';
const getClosestStockTakeM = 'SELECT id FROM StockTake WHERE date BETWEEN $1 AND $2 AND locationID = $3 ORDER BY date DESC LIMIT 1';
const getAssetsInStockTakes = 'SELECT COUNT(assetID) - (SELECT COUNT(assetID) FROM StockTakeAssets WHERE stockTakeID = ALL($1)) AS missing FROM Asset';
const numOfAssetsInStockTakes = "SELECT COUNT(assetID) AS missing FROM StockTakeAssets WHERE stockTakeID = ALL($1)"
const getAssetsInLocations = "SELECT COUNT(assetID) AS missing FROM Asset WHERE locationID = ANY($1)";
const assetsInLocationByCategory = `SELECT c.name, foo.count FROM Category c FULL JOIN (SELECT COUNT(*), c.name FROM Asset a JOIN Category c ON c.id = a.categoryid WHERE a.locationID = $1 GROUP BY c.name) AS foo ON foo.name = c.name`;
const getAccumulatedAcquisitionCost = "SELECT SUM(acquisitionCost) FROM Asset WHERE locationID = $1 AND acquisitionDate BETWEEN $2 AND $3";
const getDepreciationDetails = "SELECT c.name, c.depreciationtype, d.percentage FROM Category c FULL Join DepreciationPercent d ON c.id = d.categoryid";
const depSchedule = "SELECT year, openingBookValue FROM DepreciationSchedule WHERE assetID = $1 ORDER BY year ASC";
const getAssetRegister = `SELECT a.serialnumber, a.acquisitiondate, a.condition, a.responsibleusername, a.acquisitioncost, a.residualvalue, 
                        c.name AS category, a.usefullife, a.barcode, a.code, a.noinbuilding, a.description, l.name AS location FROM Asset a FULL JOIN 
                        Category c ON c.id = a.categoryid FULL JOIN Location l ON l.id = a.locationid`
const getAssetsInInventory = `
SELECT a.assetid, a.barcode, a.description, a.condition, c.name AS category, a.serialNumber, l.name AS location FROM Asset a FULL JOIN Location l ON l.id = 
a.locationid FULL JOIN Category c ON a.categoryid = c.id WHERE a.assetid IS NOT NULL AND a.deleted = false AND a.assetid IN (SELECT assetID FROM BatchAsset 
WHERE batchID IN (SELECT batchID FROM InventoryBatch WHERE inventoryID = $1));
`
const getAssetsNotInInventory = `
SELECT a.assetid, a.barcode, a.description, a.condition, c.name AS category, a.serialNumber, l.name AS location FROM Asset a FULL JOIN Location l ON l.id = 
a.locationid FULL JOIN Category c ON a.categoryid = c.id WHERE a.assetid IS NOT NULL AND a.deleted = false AND a.assetid NOT IN (SELECT assetID FROM BatchAsset 
WHERE batchID IN (SELECT batchID FROM InventoryBatch WHERE inventoryID = $1));
`
const getAdditionalAssetsInInventory = `
SELECT assetID FROM BatchAsset WHERE batchID IN (SELECT batchID FROM InventoryBatch WHERE inventoryID = $1) AND assetID NOT IN (SELECT assetID From Asset);
`;

export default {
    getAdditionalAssetsInInventory,
    getAssetsNotInInventory,
    getAssetsInInventory,
    getAssetRegister,
    physical_valuation,
    depSchedule,
    missingAssets,
    chainOfCustody,
    movements,
    categoryCount,
    getStockTakes,
    acquisitionReport,
    depreciationReport,
    getChildLocations,
    getStockTakesInLocations,
    getClosestStockTake,
    getAssetsInStockTakes,
    numOfAssetsInStockTakes,
    getClosestStockTakeM,
    assetsInLocationByCategory,
    getAssetsInLocations,
    getAccumulatedAcquisitionCost,
    getDepreciationDetails
}