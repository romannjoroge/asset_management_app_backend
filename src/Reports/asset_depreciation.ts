import Asset from "../Allocation/Asset/asset2.js";
import { DepreciaitionScheduleEntry, createDeprecaitonScheduleEntries } from "../Allocation/Asset/depreciations.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export function getDepreciationDetails(barcode: string): Promise<DepreciaitionScheduleEntry[]> {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetid => {
            createDeprecaitonScheduleEntries(assetid).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}