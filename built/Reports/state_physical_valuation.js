import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";
export function assetsPresentInRegister() {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getStockTakeAssetsInRegister().then(rawData => {
            // Convert
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
export function assetsNotInRegister() {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getStockTakeAssetsNotInRegister().then(rawData => {
            // Convert
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
//# sourceMappingURL=state_physical_valuation.js.map