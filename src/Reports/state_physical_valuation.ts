import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetRegisterData, RawAssetRegisterData, batchAddSiteBuildingLocation, convertHasLocationToSiteBuilding } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function assetsPresentInRegister(): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getStockTakeAssetsInRegister().then(rawData => {
            // Convert
            batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                return res(converted);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT))
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT))
        })
        
    })
}

export function assetsNotInRegister(): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        // Get data
        ReportDatabase.getStockTakeAssetsNotInRegister().then(rawData => {
            // Convert
            batchAddSiteBuildingLocation<RawAssetRegisterData, AssetRegisterData>(rawData).then(converted => {
                return res(converted);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT))
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT))
        })
        
    })
}