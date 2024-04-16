import pool from "../../db2.js";
import Asset from "../Allocation/Asset/asset2.js"
import User from "../Users/users.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export function addValuation(barcode: string, valuerID: number, valuation_value: number, valuation_date: Date): Promise<void> {
  return new Promise((res, rej) => {
    // Check if asset exists
    Asset._getAssetID(barcode).then(assetID => {
      User.checkIfUserIDExists(valuerID).then(userExist => {
        if (userExist === false) {
          return rej(new MyError(MyErrors2.USER_NOT_EXIST));
        }

        const query = "INSERT INTO AssetValuationHistory (assetid, valuationvalue, valuationdate, valuerid) VALUES ($1, $2, $3, $4)"
        pool.query(query, [assetID, valuation_value, valuation_date, valuerID]).then((_: any) => {
          return res();
        }).catch((err: any) => {
          throw rej(new MyError(MyErrors2.NOT_ADD_VALUATION));
        })
      }).catch((err: MyError) => {
        return rej(new MyError(MyErrors2.NOT_ADD_VALUATION));
      })
    }).catch((err: MyError) => {
      return rej(new MyError(MyErrors2.NOT_ADD_VALUATION));
    })
  });
}
