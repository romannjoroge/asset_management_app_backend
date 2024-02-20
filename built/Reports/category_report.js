import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import ReportDatabase from "./reportDatabase.js";
export function categoryReport() {
    return new Promise((res, rej) => {
        ReportDatabase.getCategoryReport().then(data => {
            return res(data);
        }).catch((err) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        });
    });
}
//# sourceMappingURL=category_report.js.map