import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetRegisterData, batchAddSiteBuildingLocation, RawAssetRegisterData } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function getAssetDisposalReport(startDate: Date, endDate: Date): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetDisposalData(startDate, endDate).then(rawData => {
            // Convert to Asset Register Data
            batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                return res(converted);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        // Return
        }).catch((err: MyError) => {
            return new MyError(MyErrors2.NOT_GENERATE_REPORT);
        })
        
    });
}