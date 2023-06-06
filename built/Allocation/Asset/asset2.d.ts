declare class Asset {
    static assetStatusOptions: string[];
    constructor(barCode: any, assetLifeSpan: any, acquisitionDate: any, locationID: any, status: any, custodianName: any, acquisitionCost: any, categoryName: any, attachments: any, noInBuilding: any, serialNumber: any, residualValue: any, code: any, description: any, depreciaitionType: any, depreciationPercent: any);
    initialize(): Promise<void>;
    static _doesAssetIDExist(assetID: any): Promise<boolean>;
    static _doesBarCodeExist(barCode: any): Promise<unknown>;
    _storeAssetInAssetRegister(): Promise<void>;
    static _getAssetCategoryName(assetTag: any): Promise<any>;
    static _updateAssetAcquisitionDate(assetTag: any, newDate: any): Promise<void>;
    static _updateAssetFixedStatus(assetTag: any, newFixedStatus: any): Promise<void>;
    static _updateAssetLifeSpan(assetTag: any, newLifeSpan: any): Promise<void>;
    static _updateAssetLocation(assetTag: any, newLocation: any): Promise<void>;
    static _updateAssetStatus(assetTag: any, newStatus: any): Promise<void>;
    static _updateAssetCustodian(assetTag: any, newCustodian: any): Promise<void>;
    static _updateAssetAcquisitionCost(assetTag: any, newAcquisitionCost: any): Promise<void>;
    static _updateAssetInsuranceValue(assetTag: any, newInsuranceValue: any): Promise<void>;
    static _updateAssetCategoryID(assetTag: any, newCategoryID: any): Promise<void>;
    static _insertAssetAttachments(assetTag: any, attachments: any): Promise<void>;
    static _updateAssetResidualValue(assetTag: any, residualValue: any): Promise<void>;
    static updateAsset(updateAssetDict: any, assetTag: any): Promise<void>;
    static displayAllAssetTags(): Promise<any>;
    static disposeAsset(assetTag: any): Promise<void>;
    static _insertDepreciationSchedule(assetTag: any, year: any, openBookValue: any, depreciationExpense: any, closingBookValue: any, accumulatedDepreciation: any): Promise<unknown>;
    static _getCloseBookValue(assetTag: any, year: any): Promise<unknown>;
    static _getAccumulatedDepreciation(assetTag: any): Promise<unknown>;
    static createDepreciationSchedule(depreciationType: any, assetTag: any, assetLifeSpan: any, acquisitionCost: any, acquisitionDate: any, residualValue: any, depreciationPercentage: any): Promise<any>;
    static allocateAsset(assetTag: any, username: any): Promise<void>;
}
export default Asset;
