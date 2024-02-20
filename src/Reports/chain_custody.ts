import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { ChainOfCustody } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

/**
 * @returns Chain of custody of asset with barcode
 * @param barcode Barcode of the item you want to get chain of custody of
 */
export function getChainOfCustody(barcode: string): Promise<ChainOfCustody[]> {
    return new Promise((res, rej) => {
        // Convert barcode to assetid
        Asset._getAssetID(barcode).then(assetID => {
            // Get data
            ReportDatabase.getChainOfCustody(assetID).then(data => {
                return res(data)
            }).catch((err: MyError) => {
                return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}