import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import { CategoryDepreciationConfig } from "./helpers.js";
import ReportDatabase from "./reportDatabase.js";

export function getCategoryDepreciation(): Promise<CategoryDepreciationConfig[]> {
    return new Promise((res, rej) => {
        ReportDatabase.getCategoryDepreciationConfigReport().then(data => {
            return res(data);
        }).catch((err: MyError) => {
            return rej(new MyError(MyErrors2.NOT_GENERATE_REPORT));
        })
    })
}