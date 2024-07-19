import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import * as XLSX from 'xlsx/xlsx.mjs';
export function getDataFromExcel(fileName) {
    try {
        let workbook = XLSX.readFile(fileName);
        let jsa = [];
        workbook.SheetNames.forEach(function (sheetName) {
            // Here is your object
            var XL_row_object = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            jsa.push(...XL_row_object);
        });
        return jsa;
    }
    catch (err) {
        console.log(err);
        throw new MyError(MyErrors2.NOT_PROCESS_EXCEL_FILE);
    }
}
//# sourceMappingURL=getDataFromExcelFile.js.map