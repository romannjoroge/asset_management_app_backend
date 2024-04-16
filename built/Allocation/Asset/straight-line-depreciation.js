import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import { getAssetDepreciationDetails } from "./depreciations.js";
export function getStraightLineDepreciationScheduleEntries(assetID) {
    return new Promise((res, rej) => {
        let depreciationScheduleEntries = [];
        getAssetDepreciationDetails(assetID).then(depDetails => {
            if (depDetails.residualvalue == null || depDetails.residualvalue == undefined) {
                return rej(new MyError(MyErrors2.INVALID_DEPRECIATION_DETAILS));
            }
            let year = depDetails.acquisitiondate.getFullYear();
            let closingBookValue = depDetails.acquisitioncost;
            let accumulatedDepreciation = 0;
            let yearToAdd;
            let openToAdd;
            let depreciationExpense = (depDetails.acquisitioncost - depDetails.residualvalue) / depDetails.lifespan;
            // Compute depreciation schedule
            for (var i = 0; i < depDetails.lifespan; i++) {
                yearToAdd = year + i;
                openToAdd = closingBookValue;
                // Getting Accumulated Depreciation
                accumulatedDepreciation = accumulatedDepreciation + depreciationExpense;
                // Getting Closing Book Value
                closingBookValue = openToAdd - depreciationExpense;
                let props = {
                    year: yearToAdd,
                    assetid: assetID,
                    openingbookvalue: openToAdd,
                    depreciationexpense: depreciationExpense,
                    accumulateddepreciation: accumulatedDepreciation,
                    closingbookvalue: closingBookValue
                };
                depreciationScheduleEntries.push(props);
            }
            return res(depreciationScheduleEntries);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
        });
    });
}
//# sourceMappingURL=straight-line-depreciation.js.map