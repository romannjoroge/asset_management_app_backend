import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetRegisterData, RawAssetRegisterData, batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export default function depreciateAssetPerCategory(category_id: number, startDate: Date, endDate: Date): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getDepreciationPerCategory(category_id, startDate, endDate).then(rawData => {
            // Get location details
            batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                return res(converted);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}