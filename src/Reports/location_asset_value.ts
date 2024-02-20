/**
 * This function is meant to show the details of assets in a certain location. I'll think of a better name
 */

import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetRegisterData, RawAssetRegisterData, batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function assetsInLocation(locationid: number): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getAssetsInLocation(locationid).then(rawData => {
            // Convert data
            batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                return res(converted);
            }).catch((err: MyError) => {
                return new MyError(MyErrors2.NOT_GENERATE_REPORT);
            })
        }).catch((err: MyError) => {
            return new MyError(MyErrors2.NOT_GENERATE_REPORT);
        })
    })
}