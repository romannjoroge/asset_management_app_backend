import { MyErrors2 } from "../../utility/constants.js";
import MyError from "../../utility/myError.js";
import { getAssetDepreciationDetails } from "./depreciations.js";
export function getDoubleDecliningBalanceDepreciationEntries(assetID) {
    return new Promise((res, rej) => {
        let depreciationScheduleEntries = [];
        getAssetDepreciationDetails(assetID).then(depDetails => {
            // Calculate needed values
            let basicDepreciationValue = depDetails.acquisitioncost / depDetails.lifespan;
            let basicDepreciationRate = (basicDepreciationValue / depDetails.acquisitioncost);
            // Depreciation Schedule Value to keep track of 
            let year = depDetails.acquisitiondate.getFullYear();
            let yearToAdd;
            let openToAdd;
            let depreciationExpense;
            let accumDepToAdd = 0;
            let closeToAdd = depDetails.acquisitioncost;
            for (var i = 0; i < depDetails.lifespan; i++) {
                yearToAdd = year + i;
                openToAdd = closeToAdd;
                // Depreciation Expense
                depreciationExpense = 2 * basicDepreciationRate * openToAdd;
                // Accumulated Depreciation
                accumDepToAdd = depreciationExpense + accumDepToAdd;
                // Closing Book Value
                closeToAdd = openToAdd - depreciationExpense;
                let props = {
                    year: yearToAdd,
                    assetid: assetID,
                    openingbookvalue: openToAdd,
                    depreciationexpense: depreciationExpense,
                    accumulateddepreciation: accumDepToAdd,
                    closingbookvalue: closeToAdd
                };
                depreciationScheduleEntries.push(props);
            }
            return res(depreciationScheduleEntries);
        }).catch((err) => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GET_DEPRECIATION_SCHEDULE));
        });
    });
}
//# sourceMappingURL=double-declining-balance-depreciation.js.map