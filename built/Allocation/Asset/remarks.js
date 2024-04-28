import pool from "../../../db2.js";
import User from "../../Users/users.js";
import { MyErrors2 } from "../../utility/constants.js";
import getResultsFromDatabase from "../../utility/getResultsFromDatabase.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";
export function createAssetRemark(remark, userID, assetID) {
    return new Promise((res, rej) => {
        // Check if the asset exists and is not deleted
        Asset._doesAssetIDExist(assetID).then(assetExist => {
            if (!assetExist) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }
            // Check if the user exists and is not deleted
            User.checkIfUserIDExists(userID).then(userExist => {
                if (!userExist) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                // Add remark in remarks table
                pool.query("INSERT INTO AssetRemarks(assetID, remark, userID) VALUES ($1, $2, $3)", [assetID, remark, userID]).then((_) => {
                    return res();
                }).catch((_err) => {
                    console.log(_err, "Error Adding Remark");
                    return rej(new MyError(MyErrors2.NOT_ADD_REMARK));
                });
            })
                .catch((_err) => {
                return rej(new MyError(MyErrors2.USER_NOT_EXIST));
            });
        })
            .catch((_err) => {
            return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
        });
    });
}
export function getAssetRemarks(assetID) {
    return new Promise((res, rej) => {
        // Check if asset exists
        Asset._doesAssetIDExist(assetID).then(assetExist => {
            if (!assetExist) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }
            // Return results
            let query = "SELECT assetid, remark, TO_CHAR(date, 'YYYY-MM-DD') AS date, u.username FROM AssetRemarks a LEFT JOIN User2 u ON u.id = a.userid WHERE assetid = $1";
            getResultsFromDatabase(query, [assetID])
                .then(results => {
                return res(results);
            }).catch((_err) => {
                return rej(new MyError(MyErrors2.NOT_GET_REMARKS));
            });
        }).catch((_err) => {
            return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
        });
    });
}
//# sourceMappingURL=remarks.js.map