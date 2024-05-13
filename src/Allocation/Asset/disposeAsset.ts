import pool from "../../../db2.js";
import User from "../../Users/users.js";
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";

export function disposeAsset(assetID: number, userID: number): Promise<void> {
    return new Promise((res, rej) => {
        Asset._doesAssetIDExist(assetID).then(doesAssetExist => {
            if (doesAssetExist === false) {
                return rej(new MyError(MyErrors2.ASSET_NOT_EXIST));
            }

            User.checkIfUserIDExists(userID).then(doesUserExist => {
                if (doesUserExist == false) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }

                let query = "UPDATE Asset SET isdisposed = TRUE WHERE assetID = $1";
                pool.query(query, [assetID]).then((_: void) => {
                    // Update DisposedAssetDetails table to show disposal details
                    query = "INSERT INTO DisposedAssetDetails (assetID, userID) VALUES ($1, $2)"
                    pool.query(query, [assetID, userID]).then((_: void) => {
                        return res();
                    })
                }).catch((err: any) => {
                    console.log(err, "OHH SHIT");
                    return rej(new MyError(MyErrors2.NOT_DISPOSE_ASSET));
                })
            })
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_DISPOSE_ASSET));
        })
    });
}