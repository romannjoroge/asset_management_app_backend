import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export default function depreciateAssetPerCategory(category_id, startDate, endDate) {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getDepreciationPerCategory(category_id, startDate, endDate).then(rawData => {
            // Get location details
            batchAddSiteBuildingLocation(rawData).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=depreciation_per_category.js.map