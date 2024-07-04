export var SupportedGenerateAssetReportFields;
(function (SupportedGenerateAssetReportFields) {
    SupportedGenerateAssetReportFields["SERIAL_NUMBER"] = "serialnumber";
    SupportedGenerateAssetReportFields["ACQUISITION_DATE"] = "acquisitiondate";
    SupportedGenerateAssetReportFields["CONDITION"] = "condition";
    SupportedGenerateAssetReportFields["ACQUISITION_COST"] = "acquisitioncost";
    SupportedGenerateAssetReportFields["RESIDUAL_VALUE"] = "residualvalue";
    SupportedGenerateAssetReportFields["CATEGORY"] = "category";
    SupportedGenerateAssetReportFields["USEFUL_LIFE"] = "usefullife";
    SupportedGenerateAssetReportFields["BARCODE"] = "barcode";
    SupportedGenerateAssetReportFields["DESCRIPTION"] = "description";
    SupportedGenerateAssetReportFields["LOCATION"] = "location";
    SupportedGenerateAssetReportFields["DISPOSAL_DATE"] = "disposaldate";
    SupportedGenerateAssetReportFields["DEPRECIATION_TYPE"] = "depreciationtype";
    SupportedGenerateAssetReportFields["RESPONSIBLE_USER"] = "responsible_user";
    SupportedGenerateAssetReportFields["ISCONVERTED"] = "isconverted";
    SupportedGenerateAssetReportFields["ESTIMATEDVALUE"] = "estimatedvalue";
})(SupportedGenerateAssetReportFields || (SupportedGenerateAssetReportFields = {}));
export var GenerateAssetReportTimePeriods;
(function (GenerateAssetReportTimePeriods) {
    GenerateAssetReportTimePeriods["MONTHLY"] = "monthly";
    GenerateAssetReportTimePeriods["QUATERLY"] = "quaterly";
    GenerateAssetReportTimePeriods["ANNUALY"] = "annualy";
})(GenerateAssetReportTimePeriods || (GenerateAssetReportTimePeriods = {}));
export const ItemsThatNeedJoin = [
    SupportedGenerateAssetReportFields.CATEGORY,
    SupportedGenerateAssetReportFields.LOCATION,
    SupportedGenerateAssetReportFields.RESPONSIBLE_USER,
    SupportedGenerateAssetReportFields.DEPRECIATION_TYPE,
];
export const ItemsThatDontNeedJoin = [
    SupportedGenerateAssetReportFields.SERIAL_NUMBER,
    SupportedGenerateAssetReportFields.ACQUISITION_DATE,
    SupportedGenerateAssetReportFields.ACQUISITION_COST,
    SupportedGenerateAssetReportFields.RESIDUAL_VALUE,
    SupportedGenerateAssetReportFields.USEFUL_LIFE,
    SupportedGenerateAssetReportFields.BARCODE,
    SupportedGenerateAssetReportFields.DESCRIPTION,
    SupportedGenerateAssetReportFields.DISPOSAL_DATE,
    SupportedGenerateAssetReportFields.ISCONVERTED,
    SupportedGenerateAssetReportFields.CONDITION
];
// Items that you can filter results by 
export var FilterFields;
(function (FilterFields) {
    FilterFields["ACQUISITION_DATE"] = "acquisitiondate";
    FilterFields["CONDITION"] = "condition";
    FilterFields["ACQUISITION_COST"] = "acquisitioncost";
    FilterFields["RESIDUAL_VALUE"] = "residualvalue";
    FilterFields["CATEGORY"] = "category";
    FilterFields["USEFUL_LIFE"] = "usefullife";
    FilterFields["LOCATION"] = "location";
    FilterFields["DISPOSAL_DATE"] = "disposaldate";
    FilterFields["DEPRECIATION_TYPE"] = "depreciationtype";
    FilterFields["RESPONSIBLE_USER"] = "responsible_user";
    FilterFields["ISCONVERTED"] = "isconverted";
})(FilterFields || (FilterFields = {}));
// Different ways to filter by
export var WaysToFilterBy;
(function (WaysToFilterBy) {
    WaysToFilterBy[WaysToFilterBy["DATE_RANGE"] = 0] = "DATE_RANGE";
    WaysToFilterBy[WaysToFilterBy["STRING"] = 1] = "STRING";
    WaysToFilterBy[WaysToFilterBy["NUMBER_RANGE"] = 2] = "NUMBER_RANGE";
    WaysToFilterBy[WaysToFilterBy["ID"] = 3] = "ID";
    WaysToFilterBy[WaysToFilterBy["BOOLEAN"] = 4] = "BOOLEAN";
})(WaysToFilterBy || (WaysToFilterBy = {}));
//# sourceMappingURL=generated_report_types.js.map