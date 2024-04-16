import Asset from "../Allocation/Asset/asset2.js";
import { MyErrors2 } from "../utility/constants.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";
import MyError from "../utility/myError.js";
export function getInsurances(barcode) {
    return new Promise((res, rej) => {
        Asset._getAssetID(barcode).then(assetID => {
            const query = "SELECT ai.id AS id, insurancevalue AS value, TO_CHAR(insurancedate, 'YYYY-MM-DD') AS insurance_date, u.name AS insurer_name, a.barcode AS asset_barcode FROM AssetInsuranceValue ai LEFT JOIN Asset a ON a.assetid = ai.assetid LEFT JOIN User2 u ON u.id = ai.insurerID WHERE ai.deleted = false AND a.assetid = $1";
            getResultsFromDatabase(query, [assetID]).then(data => {
                return res(data);
            }).catch((err) => {
                console.log(err, "OHH SHIT");
                return rej(new MyError(MyErrors2.NOT_GET_INSURANCE));
            });
        });
    });
}
//# sourceMappingURL=getInsurance.js.map