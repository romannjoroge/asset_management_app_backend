declare class Category {
    constructor(categoryName: any, parentCategoryID: any, depreciationType: any, depreciationPercentage: any);
    static _saveCategoryInDb(categoryName: any, parentCategoryID: any, depreciationType: any, depreciationPercentage: any): Promise<void>;
    initialize(): Promise<void>;
    static depTypes: string[];
    static _getCategoryID(categoryName: any): Promise<any>;
    static _doesCategoryExist(categoryName: any): Promise<boolean>;
    static verifyCategoryName(newName: any): Promise<string>;
    static _updateNameinDb(category_id: any, newName: any): Promise<void>;
    static _updateCategoryName(newName: any, oldName: any): Promise<void>;
    static verifyFolder(id: any): Promise<void>;
    static _updateFolderinDB(category_id: any, newID: any): Promise<void>;
    static _updateCategoryFolder(newFolderID: any, categoryName: any): Promise<void>;
    static verifyDepreciationDetails(depType: any, depValue: any): void;
    static _updateDepreciationTypeInDB(category_id: any, depType: any): Promise<void>;
    static _insertDepreciationPercentInDb(category_id: any, percent: any): Promise<void>;
    static _deleteDepreciationPercentInDb(category_id: any): Promise<void>;
    static _updateDepreciationType(depType: any, value: any, categoryName: any): Promise<void>;
    static updateCategory(updateJSON: any, categoryName: any): Promise<void>;
    static _doesCategoryIDExist(categoryID: any): Promise<boolean>;
    static _getCategoryDepreciationType(categoryID: any): Promise<any>;
    static _getCategoryDepreciationPercent(categoryID: any): Promise<any>;
    static _getDepreciationDetails(categoryName: any): Promise<unknown>;
    static viewDetails(categoryName: any): Promise<{
        categoryName: any;
        depreciationType: any;
        depreciationValue: any;
    }>;
}
export default Category;
