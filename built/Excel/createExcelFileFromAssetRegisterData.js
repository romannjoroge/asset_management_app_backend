import * as XLSX from 'xlsx/xlsx.mjs';
export default function createExcelFileBufferFromAssetRegisterData(data) {
    // Create a worksheet with the data
    const worksheet = XLSX.utils.json_to_sheet(data);
    // Attach worksheet to workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    // Fixing headers
    XLSX.utils.sheet_add_aoa(worksheet, [["Serial Number", "Acquisition Date", "Condition", "Responsible User's Name", "Acquisition Cost", "Residual Value", "Category Name", "Useful Life", "Barcode", "Description", "Expected Depreciation Date", "Days To Disposal", "Site", "Building", "Office"]], { origin: "A1" });
    // Fixing maximum width of column
    const max_width = data.reduce((w, r) => Math.max(w, r.description.length), 10);
    worksheet["!cols"] = [{ wch: max_width }];
    // Save to file
    // XLSX.writeFileXLSX(workbook, "data.xlsx");
    return (XLSX.write(workbook, {
        type: 'buffer'
    }));
}
//# sourceMappingURL=createExcelFileFromAssetRegisterData.js.map