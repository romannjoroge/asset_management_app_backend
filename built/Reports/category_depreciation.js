import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
export function getCategoryDepreciation() {
    return new Promise((res, rej) => {
        ReportDatabase.getCategoryDepreciationConfigReport().then(data => {
            return res(data);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=category_depreciation.js.map