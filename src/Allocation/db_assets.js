const doesAssetTagExist = "SELECT isFixed FROM Asset WHERE assetTag = $1";

module.exports = {
    doesAssetTagExist
}