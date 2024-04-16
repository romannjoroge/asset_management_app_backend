import pool from "../../../db2.js";
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";
export function disposeAsset(assetID) {
    return new Promise((res, rej) => {
        Asset._doesAssetIDExist(assetID).then(doesAssetExist => {
            if (doesAssetExist === false) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }
            let query = "UPDATE Asset SET isdisposed = TRUE WHERE assetID = $1";
            pool.query(query, [assetID]).then((_) => {
                return res();
            }).catch((err) => {
                console.log(err, "OHH SHIT");
                return rej(new MyError(MyErrors2.NOT_DISPOSE_ASSET));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_DISPOSE_ASSET));
        });
    });
}
//# sourceMappingURL=disposeAsset.js.map