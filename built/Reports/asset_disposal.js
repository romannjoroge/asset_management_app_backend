import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function getAssetDisposalReport(startDate, endDate) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetDisposalData(startDate, endDate).then(rawData => {
            // Convert to Asset Register Data
            batchAddSiteBuildingLocation(rawData).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
            // Return
        }).catch((err) => {
            return new MyError(MyErrors2.NOT_GENERATE_REPORT);
        });
    });
}
//# sourceMappingURL=asset_disposal.js.map