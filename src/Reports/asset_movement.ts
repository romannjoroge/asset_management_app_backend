import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetMovement, RawAssetMovement, batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function assetMovementReport(barcode: string): Promise<AssetMovement[]> {
    return new Promise((res, rej) => {
        // Get assetid
        Asset._getAssetID(barcode).then(assetID => {
            // Get data
            ReportDatabase.getAssetMovements(assetID).then(rawData => {
                // Get site, building, location
                batchAddSiteBuildingLocation<RawAssetMovement, AssetMovement>(rawData).then(converted => {
                    return res(converted);
                }).catch((err: MyError) => {
                    return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
                })
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}