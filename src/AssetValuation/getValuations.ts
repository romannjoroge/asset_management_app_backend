import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
import { AssetValuation } from "./types.js";

export function getValuations(barcode: string): Promise<AssetValuation[]> {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetID => {
            const query = "SELECT av.id AS id, valuationvalue AS value, TO_CHAR(valuationdate, 'YYYY-MM-DD') AS valuation_date, u.name AS valuer_name, a.barcode AS asset_barcode FROM AssetValuationHistory av LEFT JOIN Asset a ON a.assetid = av.assetid LEFT JOIN User2 u ON u.id = av.valuerid WHERE av.deleted = false AND a.assetid = $1"
            getResultsFromDatabase<AssetValuation>(query, [assetID]).then(data => {
                return res(data);
            }).catch((err: MyError) => {
                console.log(err, "OHH SHIT");
                return rej(new MyError(MyErrors2.NOT_GET_VALUATION));
            })
        })
    })
}