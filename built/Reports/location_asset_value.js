/**
 * This function is meant to show the details of assets in a certain location. I'll think of a better name
 */
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function assetsInLocation(locationid) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetsInLocation(locationid).then(rawData => {
            // Convert data
            batchAddSiteBuildingLocation(rawData).then(converted => {
                return res(converted);
            }).catch((err) => {
                return new MyError(MyErrors2.NOT_GENERATE_REPORT);
            });
        }).catch((err) => {
            return new MyError(MyErrors2.NOT_GENERATE_REPORT);
        });
    });
}
//# sourceMappingURL=location_asset_value.js.map