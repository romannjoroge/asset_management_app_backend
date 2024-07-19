import pool from "../../../db2.js";
import User from "../../Users/users.js";
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";

export async function disposeAsset(assetID: number, userID: number, disposalValue: number, date: Date) {
    try {
        const doesAssetExist = await Asset._doesAssetIDExist(assetID);
        if(!doesAssetExist) {
            throw new MyError(MyErrors2.ASSET_NOT_EXIST);
        }

        const doesUserExist = await User.checkIfUserIDExists(userID);
        if(!doesUserExist) {
            throw new MyError(MyErrors2.USER_NOT_EXIST);
        }

        await pool.query("UPDATE Asset SET isdisposed = TRUE WHERE assetID = $1", [assetID]);
        await pool.query("INSERT INTO DisposedAssetDetails (assetID, userID, date, disposalvalue) VALUES ($1, $2, $3, $4)", [assetID, userID, date, disposalValue])
    } catch(err) {
        if (err instanceof MyError) {
            throw err;
        } else {
            throw new MyError(MyErrors2.NOT_DISPOSE_ASSET);
        }
    }
}