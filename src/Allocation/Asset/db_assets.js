const doesAssetTagExist = "SELECT isFixed FROM Asset WHERE assetTag = $1";
const addAssetToAssetRegister =`INSERT INTO Asset (barcode, noInBuilding, code, description, serialNumber, acquisitionDate, locationID, residualValue,
    condition, responsibleUsername, acquisitionCost, categoryID, usefulLife, depreciationType, depreciationPercent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
const addAssetFileAttachment = "INSERT INTO Asset_File (assetTag, attachment) VALUES ($1, $2)";
const updateAssetFixedStatus = "UPDATE Asset SET isFixed = $1 WHERE assetTag = $2";
const updateAssetLifeSpan = "UPDATE Asset SET assetLifeSpan = $1 WHERE assetTag = $2";
const updateAssetAcquisitionDate = "UPDATE Asset SET acquisitionDate = $1 WHERE assetTag = $2";
const updateAssetLocation = "UPDATE Asset SET locationID = $1 WHERE assetTag = $2";
const updateAssetStatus = "UPDATE Asset SET status = $1 WHERE assetTag = $2";
const updateAssetCustodian = "UPDATE Asset SET custodianName = $1 WHERE assetTag = $2";
const updateAssetAcquisitionCost = "UPDATE Asset SET acquisitionCost = $1 WHERE assetTag = $2";
const updateAssetInsuranceValue = "UPDATE Asset SET insuranceValue = $1 WHERE assetTag = $2";
const updateAssetCategory = "UPDATE Asset SET categoryID = $1 WHERE assetTag = $2";
const getAssetTags = "SELECT assetTag FROM Asset";
const disposeAsset = "DELETE FROM Asset WHERE assettag = $1";
const getAssetCategoryName = "SELECT name FROM Category WHERE ID = (SELECT categoryID from Asset WHERE assetTag = $1)";
const updateAssetResidualValue = "UPDATE Asset SET residualValue = $1 WHERE assetTag = $2";
const getCloseBookValue = "SELECT closingBookValue FROM DepreciationSchedule WHERE assetTag = $1 AND year = $2";
const getAccumulatedDepreciation = "SELECT SUM(depreciationExpense) FROM DepreciationSchedule WHERE assettag = $1;";
const insertDepreciationSchedule = "INSERT INTO DepreciationSchedule VALUES ($1, $2, $3, $4, $5, $6)";
const getAssetDetails = `
    SELECT a.makeandmodelno, a.isfixed, a.serialnumber, a.acquisitiondate, a.status, 
    a.custodianname, a.acquisitioncost, a.insurancevalue, a.residualvalue, a.assetlifespan, 
    l.name as locationname, c.name as categoryname FROM Asset as a JOIN Location as l ON a.locationid = l.id 
    JOIN Category as c ON a.categoryid = c.id WHERE a.assettag = $1;
`
const insertAssetTag = `INSERT INTO Tags(commandCode, hardwareKey, tagRecNums, antNo, pc, epcID, crc) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
const unallocate = `UPDATE Asset SET custodianname = null WHERE assettag = $1`;
const getAllAssets= "SELECT a.assetid, a.barcode, a.description, a.condition, c.name AS category, a.serialNumber, l.name AS location FROM Asset a FULL JOIN Location l ON l.id = a.locationid FULL JOIN Category c ON a.categoryid = c.id";
const assetCategories = 'SELECT c.name, COUNT(*) FROM Asset a JOIN Category c ON c.id = a.categoryid GROUP BY c.id';
const deleteAsset = "DELETE FROM Assets WHERE barcode = $1";
const getAssetNetAndTotal = "SELECT SUM(acquisitionCost) AS netValue, COUNT(*) AS total FROM Asset";
const getAssetAddedInLast12Months = "SELECT COUNT(*) AS last12mths FROM Asset WHERE acquisitionDate > (NOW() - INTERVAL '1 YEAR')";
const doesBarCodeExist = "SELECT * FROM Asset WHERE barcode = $1";
const searchBySerialNo = "SELECT a.barcode, a.description, a.condition, c.name AS category, a.serialNumber, l.name AS location FROM Asset a FULL JOIN Location l ON l.id = a.locationid FULL JOIN Category c ON a.categoryid = c.id WHERE a.serialNumber = $1";
const updateAsset = "UPDATE Asset SET $1 = $2 WHERE assetid = $3";


const assetTable = {
    doesAssetTagExist,
    addAssetToAssetRegister,
    addAssetFileAttachment,
    updateAssetFixedStatus,
    updateAssetLifeSpan,
    updateAssetAcquisitionDate,
    updateAssetLocation,
    updateAssetStatus,
    updateAssetCustodian,
    updateAssetAcquisitionCost,
    updateAssetInsuranceValue,
    updateAssetCategory,
    getAssetTags,
    disposeAsset,
    getAssetCategoryName,
    updateAssetResidualValue,
    getCloseBookValue,
    getAccumulatedDepreciation,
    getAssetDetails,
    insertAssetTag,
    unallocate,
    insertDepreciationSchedule,
    assetCategories,
    getAllAssets,
    deleteAsset,
    getAssetNetAndTotal,
    getAssetAddedInLast12Months,
    doesBarCodeExist,
    searchBySerialNo,
    updateAsset
}

export default assetTable;
