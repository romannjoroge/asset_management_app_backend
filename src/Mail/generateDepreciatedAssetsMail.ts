import createExcelFileFromAssetRegisterData from "../Excel/createExcelFileFromAssetRegisterData.js";
import { getAssetDisposalReport } from "../Reports/asset_disposal.js";
import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";

export default function generateDepreciatedAssetsInMonth(): Promise<void> {
    return new Promise((res, rej) => {
        // Get dates
        const today = new Date();
        
        // Get date last month
        var lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        // Find assets that depreciated in this month
        getAssetDisposalReport(lastMonth, today).then(depreciatedAssets => {
            createExcelFileFromAssetRegisterData(depreciatedAssets)
        }).catch((err: MyError) => {
            console.log(err);
            return rej(new MyError(MyErrors2.NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS));
        })
    })
}