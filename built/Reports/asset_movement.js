import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function assetMovementReport(barcode) {
    return new Promise((res, rej) => {
        // Get assetid
        Asset._getAssetID(barcode).then(assetID => {
            // Get data
            ReportDatabase.getAssetMovements(assetID).then(rawData => {
                // Get site, building, location
                batchAddSiteBuildingLocation(rawData).then(converted => {
                    return res(converted);
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=asset_movement.js.map