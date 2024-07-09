import { MyErrors2 } from "../utility/constants.js";
import MyError from "../utility/myError.js";
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';

XLSX.set_fs(fs);

export function loadDataToExcelFile(data: Record<string, any>[], sheetName: string): Buffer {
    try {
        // Create a worksheet with the data
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Attach worksheet to workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

        // Fixing headers
        XLSX.utils.sheet_add_aoa(worksheet, [Object.keys(data[0])], { origin: "A1" });

        // Fixing maximum width of column
        const max_width = data.reduce((w, r) => Math.max(w, r.description.length), 10);
        worksheet["!cols"] = [ { wch: max_width } ];

        return(XLSX.write(workbook, {
            type: 'buffer'
        }))
    } catch(err) {
        console.log("Error Loading Data To Excel File", err);
        throw new MyError(MyErrors2.NOT_CREATE_EXCEL_FILE);
    }
}