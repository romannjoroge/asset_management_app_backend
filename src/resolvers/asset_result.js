const AssetResult = {
    __resolveType: object => {
        if (object.message) {
            return "DoesNotExist";
        }

        if (object.assettag) {
            return "Asset"
        }

        return null;
    }
}


export default AssetResult
