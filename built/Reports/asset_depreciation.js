import Asset from "../Allocation/Asset/asset2.js";
import { createDeprecaitonScheduleEntries } from "../Allocation/Asset/depreciations.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
export function getDepreciationDetails(barcode) {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetid => {
            createDeprecaitonScheduleEntries(assetid).then(data => {
                return res(data);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=asset_depreciation.js.map