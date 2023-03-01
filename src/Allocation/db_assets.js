const doesAssetTagExist = "SELECT isFixed FROM Asset WHERE assetTag = $1";
const addAssetToAssetRegister =`INSERT INTO Asset (assetTag, makeAndModelNo, isFixed, serialNumber, acquisitionDate, locationID,
    status, custodianName, acquisitionCost, insuranceValue, categoryID, assetLifeSpan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
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
const getAccumulatedDepreciation = "SELECT SUM(depreciationExpense) AS accumulatedDepreciation FROM DepreciationSchedule GROUP BY assetTag WHERE assetTag = $1";
const insertDepreciationSchedule = "INSERT INTO DepreciationSchedule VALUES ($1, $2, $3, $4, $5)";

module.exports = {
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
    insertDepreciationSchedule
}