import { MyErrors2 } from "../utility/constants.js";

export enum SupportedGenerateAssetReportFields {
    SERIAL_NUMBER = "serialnumber",
    ACQUISITION_DATE = "acquisitiondate",
    CONDITION = "condition",
    ACQUISITION_COST = "acquisitioncost",
    RESIDUAL_VALUE = "residualvalue",
    CATEGORY = "category",
    USEFUL_LIFE = "usefullife",
    BARCODE = "barcode",
    DESCRIPTION = "description",
    LOCATION = "location",
    DISPOSAL_DATE = "disposaldate",
    DEPRECIATION_TYPE = "depreciationtype",
    RESPONSIBLE_USER = "responsible_user",
    ISCONVERTED = "isconverted",
    ESTIMATEDVALUE = "estimatedvalue"
}

export enum GenerateAssetReportTimePeriods {
    MONTHLY = "monthly",
    QUATERLY = "quaterly",
    ANNUALY = "annualy"
}

export const ItemsThatNeedJoin = [
    SupportedGenerateAssetReportFields.CATEGORY,
    SupportedGenerateAssetReportFields.LOCATION,
    SupportedGenerateAssetReportFields.RESPONSIBLE_USER,
    SupportedGenerateAssetReportFields.DEPRECIATION_TYPE,
]

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
    SupportedGenerateAssetReportFields.CONDITION,
    SupportedGenerateAssetReportFields.ESTIMATEDVALUE
];

export interface GeneratedAssetReportType {
    serialnumber?: string,
    acquisitiondate?: string,
    condition?: string,
    acquisitioncost?: number,
    residualvalue?: number,
    category?: string,
    usefullife?: number,
    barcode?: string,
    description?: string,
    // site?: string,
    // building?: string,
    // office?: string,
    location_name?: string,
    disposaldate?: string,
    depreciationtype?: string,
    responsible_user?: string,
    isconverted?: boolean
}

export interface GenerateReportStruct {
    fieldsThatDontNeedJoin: string[],
    fieldsThatNeedJoin: string[]
    filterFields?: Record<string, any>
}

// Items that you can filter results by 
export enum FilterFields {
    ACQUISITION_DATE = SupportedGenerateAssetReportFields.ACQUISITION_DATE,
    CONDITION = SupportedGenerateAssetReportFields.CONDITION,
    ACQUISITION_COST = SupportedGenerateAssetReportFields.ACQUISITION_COST,
    RESIDUAL_VALUE = SupportedGenerateAssetReportFields.RESIDUAL_VALUE,
    CATEGORY = SupportedGenerateAssetReportFields.CATEGORY,
    USEFUL_LIFE = SupportedGenerateAssetReportFields.USEFUL_LIFE,
    LOCATION = SupportedGenerateAssetReportFields.LOCATION,
    DISPOSAL_DATE = SupportedGenerateAssetReportFields.DISPOSAL_DATE,
    DEPRECIATION_TYPE = SupportedGenerateAssetReportFields.DEPRECIATION_TYPE,
    RESPONSIBLE_USER = SupportedGenerateAssetReportFields.RESPONSIBLE_USER,
    ISCONVERTED = SupportedGenerateAssetReportFields.ISCONVERTED
}

// Different ways to filter by
export enum WaysToFilterBy {
    DATE_RANGE,
    STRING,
    NUMBER_RANGE,
    ID,
    BOOLEAN
}

