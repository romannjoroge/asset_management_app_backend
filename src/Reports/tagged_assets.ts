import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { AssetRegisterData, RawAssetRegisterData, batchAddSiteBuildingLocation } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function getTaggedAssets(isTagged: boolean): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        function getData(): Promise<RawAssetRegisterData[]> {
            return new Promise((res, rej) => {
                if (isTagged == true) {
                    ReportDatabase.getTaggedAssets(true).then(data => {
                        return res(data)
                    }).catch((err: MyError) => {
                        return rej(err);
                    })
                } else {
                    ReportDatabase.getTaggedAssets(false).then(data => {
                        return res(data);
                    }).catch((err: MyError) => {
                        return rej(err);
                    })
                }
            })
        }

        getData().then(rawData => {
            // Convert data to assetregisterdata
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