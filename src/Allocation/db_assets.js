const doesAssetTagExist = "SELECT isFixed FROM Asset WHERE assetTag = $1";
const addAssetToAssetRegister =`INSERT INTO Asset (assetTag, makeAndModelNo, isFixed, serialNumber, acquisitionDate, locationID,
    status, custodianName, acquisitionCost, insuranceValue, categoryID, assetLifeSpan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
const addAssetFileAttachment = "INSERT INTO Asset_File (assetTag, attachment) VALUES ($1, $2)";
const updateAssetFixedStatus = "UPDATE Asset SET isFixed = $1 WHERE assetTag = $2";

module.exports = {
    doesAssetTagExist,
    addAssetToAssetRegister,
    addAssetFileAttachment,
    updateAssetFixedStatus,

}