var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from "../../../db2.js";
import User from "../../Users/users.js";
import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import Asset from "./asset2.js";
export function disposeAsset(assetID, userID, disposalValue, date) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const doesAssetExist = yield Asset._doesAssetIDExist(assetID);
            if (!doesAssetExist) {
                throw new MyError(MyErrors2.ASSET_NOT_EXIST);
            }
            const doesUserExist = yield User.checkIfUserIDExists(userID);
            if (!doesUserExist) {
                throw new MyError(MyErrors2.USER_NOT_EXIST);
            }
            yield pool.query("UPDATE Asset SET isdisposed = TRUE WHERE assetID = $1", [assetID]);
            yield pool.query("INSERT INTO DisposedAssetDetails (assetID, userID, date, disposalvalue) VALUES ($1, $2, $3, $4)", [assetID, userID, date, disposalValue]);
        }
        catch (err) {
            if (err instanceof MyError) {
                throw err;
            }
            else {
                throw new MyError(MyErrors2.NOT_DISPOSE_ASSET);
            }
        }
    });
}
//# sourceMappingURL=disposeAsset.js.map