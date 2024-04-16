import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js";
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
export function addInsurance(barcode, insurer_id, insurance_value, insurance_date) {
    return new Promise((res, rej) => {
        // Check if asset exists
        Asset._getAssetID(barcode).then(assetID => {
            User.checkIfUserIDExists(insurer_id).then(userExist => {
                if (userExist === false) {
                    return rej(new MyError(MyErrors2.USER_NOT_EXIST));
                }
                const query = "INSERT INTO AssetInsuranceValue (assetid, insuranceValue, insuranceDate, insurerID) VALUES ($1, $2, $3, $4)";
                pool.query(query, [assetID, insurance_value, insurance_date, insurer_id]).then((_) => {
                    return res();
                }).catch((err) => {
                    throw rej(new MyError(MyErrors2.NOT_ADD_INSURANCE));
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_ADD_INSURANCE));
            });
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_ADD_INSURANCE));
        });
    });
}
//# sourceMappingURL=addInsurance.js.map