import Asset from "../Allocation/Asset/asset2.js"
import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js"

export function getCurrentMarketValueOfAsset(barcode: string): Promise<number> {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetID => {
            const query = "SELECT valuationvalue FROM AssetValuationHistory WHERE assetID = $1 AND deleted = false ORDER BY valuationdate DESC LIMIT 1"
            getResultsFromDatabase<{valuationvalue: number}>(query, [assetID]).then(data => {
                if (data.length <= 0) {
                    const query22= "SELECT acquisitioncost FROM Asset WHERE assetid = 2 AND deleted = false"
                    getResultsFromDatabase<{acquisitioncost: number}>(query, [assetID]).then(acquisitionCostData => {
                        return res(acquisitionCostData[0].acquisitioncost);
                    })
                } else {
                    return res(data[0].valuationvalue);
                }
            }).catch((err: MyError) => {
                console.log(err, "OHH SHIT");
                return rej(new MyError(MyErrors2.NOT_GET_CURRENT_MARKET_VALUE));
            })
        }).catch((err: MyError) => {
            console.log(err, "OHH SHIT");
            return rej(new MyError(MyErrors2.NOT_GET_CURRENT_MARKET_VALUE));
        })
    })
}