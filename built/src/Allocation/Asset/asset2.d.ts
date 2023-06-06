export default Asset;
declare class Asset {
    static _doesAssetIDExist(assetID: any): any;
    static _doesBarCodeExist(barCode: any): Promise<any>;
    static _getAssetCategoryName(assetTag: any): any;
    static _updateAssetAcquisitionDate(assetTag: any, newDate: any): any;
    static _updateAssetFixedStatus(assetTag: any, newFixedStatus: any): any;
    static _updateAssetLifeSpan(assetTag: any, newLifeSpan: any): any;
    static _updateAssetLocation(assetTag: any, newLocation: any): any;
    static _updateAssetStatus(assetTag: any, newStatus: any): any;
    static _updateAssetCustodian(assetTag: any, newCustodian: any): any;
    static _updateAssetAcquisitionCost(assetTag: any, newAcquisitionCost: any): any;
    static _updateAssetInsuranceValue(assetTag: any, newInsuranceValue: any): any;
    static _updateAssetCategoryID(assetTag: any, newCategoryID: any): any;
    static _insertAssetAttachments(assetTag: any, attachments: any): any;
    static _updateAssetResidualValue(assetTag: any, residualValue: any): any;
    static updateAsset(updateAssetDict: any, assetTag: any): any;
    static displayAllAssetTags(): any;
    static disposeAsset(assetTag: any): any;
    static _insertDepreciationSchedule(assetTag: any, year: any, openBookValue: any, depreciationExpense: any, closingBookValue: any, accumulatedDepreciation: any): Promise<any>;
    static _getCloseBookValue(assetTag: any, year: any): Promise<any>;
    static _getAccumulatedDepreciation(assetTag: any): any;
    static createDepreciationSchedule(depreciationType: any, assetTag: any, assetLifeSpan: any, acquisitionCost: any, acquisitionDate: any, residualValue: any, depreciationPercentage: any): any;
    static allocateAsset(assetTag: any, username: any): any;
    constructor(barCode: any, assetLifeSpan: any, acquisitionDate: any, locationID: any, status: any, custodianName: any, acquisitionCost: any, categoryName: any, attachments: any, noInBuilding: any, serialNumber: any, residualValue: any, code: any, description: any, depreciaitionType: any, depreciationPercent: any);
    assetLifeSpan: any;
    acquisitionDate: Date;
    locationID: any;
    status: any;
    custodianName: any;
    acquisitionCost: any;
    description: any;
    code: any;
    barCode: any;
    noInBuilding: any;
    depreciaitionType: any;
    depreciationPercent: any;
    categoryName: any;
    attachments: any[];
    serialNumber: any;
    residualValue: any;
    initialize(): any;
    _storeAssetInAssetRegister(): any;
}
declare namespace Asset {
    let assetStatusOptions: string[];
}
