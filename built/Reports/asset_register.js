import { batchConvertRawAssetRegister } from "./helpers.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
import { MyErrors2 } from "../utility/constants.js";
/**
 * A function to get the data of the asset register report
 */
export function getAssetRegister() {
    return new Promise((res, rej) => {
        // Get data from database
        ReportDatabase.getAssetRegisterData().then(rawData => {
            batchConvertRawAssetRegister(rawData).then(converted => {
                return res(converted);
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=asset_register.js.map