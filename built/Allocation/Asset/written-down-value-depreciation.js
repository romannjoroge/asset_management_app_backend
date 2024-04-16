import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import { getAssetDepreciationDetails } from "./depreciations.js";
export function getWrittenDownValueDepreciationScheduleEntries(assetID) {
    return new Promise((res, rej) => {
        let depreciationScheduleEntries = [];
        getAssetDepreciationDetails(assetID).then(depDetails => {
            if (depDetails.depreciation_percentage === undefined) {
                return rej(new MyError(MyErrors2.INVALID_DEPRECIATION_DETAILS));
            }
            let year = depDetails.acquisitiondate.getFullYear();
            let closingBookValue = 0;
            let accumulatedDepreciation = 0;
            let yearToAdd;
            let openToAdd;
            let depreciationExpense;
            let accumDepToAdd;
            let closeToAdd;
            // Create depreciation schedule entries
            for (let i = 0; i < depDetails.lifespan; i++) {
                yearToAdd = year + i;
                // Opening book value is that of previous year
                if (yearToAdd == year) {
                    openToAdd = depDetails.acquisitioncost;
                }
                else {
                    openToAdd = closingBookValue;
                }
                // Depreciation Expense is percentage of opening book value
                depreciationExpense = openToAdd * (depDetails.depreciation_percentage / 100);
                // Accumulated Depreciation is depreciation expense of previous year + depreciation expense of current year
                accumDepToAdd = accumulatedDepreciation + depreciationExpense;
                // Closing book value is opening book value - depreciation expense
                closeToAdd = openToAdd - depreciationExpense;
                let props = {
                    year: yearToAdd,
                    assetid: assetID,
                    openingbookvalue: openToAdd,
                    depreciationexpense: depreciationExpense,
                    accumulateddepreciation: accumDepToAdd,
                    closingbookvalue: closeToAdd
                };
                // Insert Depreciation Details
                depreciationScheduleEntries.push(props);
                // Update values for next iteration
                closingBookValue = closeToAdd;
                accumulatedDepreciation = accumDepToAdd;
            }
            return res(depreciationScheduleEntries);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_DETAILS));
        });
    });
}
//# sourceMappingURL=written-down-value-depreciation.js.map