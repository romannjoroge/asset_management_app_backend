import pool from "../../../db2.js";
import User from "../../Users/users.js";
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";
import { existsSync } from "fs";
export function storeAttachmentDetails(originalFileName, storageLocation, fileSize, userID, assetID, filetype) {
    return new Promise((res, rej) => {
        // Check if asset exists
        Asset._doesAssetIDExist(assetID).then(doesAssetExist => {
            if (!doesAssetExist) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }
            // Check if user exists
            User.checkIfUserIDExists(userID).then(doesUserExist => {
                if (!doesUserExist) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                // Check if file exists
                const fileExists = existsSync(storageLocation);
                if (!fileExists) {
                    return rej(new MyError(MyErrors2.FILE_NOT_EXISTS));
                }
                // Store details
                let query = "INSERT INTO AssetAttachments(assetid, userid, storagelocation, originalfilename, size, filetype) VALUES ($1, $2, $3, $4, $5, $6)";
                pool.query(query, [assetID, userID, storageLocation, originalFileName, fileSize, filetype]).then((_) => {
                    return res();
                }).catch((err) => {
                    return rej(new MyError(MyErrors2.NOT_STORE_FILE));
                });
            });
        });
    });
}
//# sourceMappingURL=storeAttachmentDetails.js.map