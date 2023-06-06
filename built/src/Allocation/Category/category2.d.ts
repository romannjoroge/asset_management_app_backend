export default Category;
declare class Category {
    static _saveCategoryInDb(categoryName: any, parentCategoryID: any, depreciationType: any, depreciationPercentage: any): any;
    static _getCategoryID(categoryName: any): any;
    static _doesCategoryExist(categoryName: any): any;
    static verifyCategoryName(newName: any): any;
    static _updateNameinDb(category_id: any, newName: any): any;
    static _updateCategoryName(newName: any, oldName: any): any;
    static verifyFolder(id: any): any;
    static _updateFolderinDB(category_id: any, newID: any): any;
    static _updateCategoryFolder(newFolderID: any, categoryName: any): any;
    static verifyDepreciationDetails(depType: any, depValue: any): void;
    static _updateDepreciationTypeInDB(category_id: any, depType: any): any;
    static _insertDepreciationPercentInDb(category_id: any, percent: any): any;
    static _deleteDepreciationPercentInDb(category_id: any): any;
    static _updateDepreciationType(depType: any, value: any, categoryName: any): any;
    static updateCategory(updateJSON: any, categoryName: any): any;
    static _doesCategoryIDExist(categoryID: any): any;
    static _getCategoryDepreciationType(categoryID: any): any;
    static _getCategoryDepreciationPercent(categoryID: any): any;
    static _getDepreciationDetails(categoryName: any): any;
    static viewDetails(categoryName: any): any;
    constructor(categoryName: any, parentCategoryID: any, depreciationType: any, depreciationPercentage: any);
    categoryName: string;
    parentCategoryID: any;
    depreciaitionType: any;
    depreciationPercentage: any;
    initialize(): any;
}
declare namespace Category {
    let depTypes: string[];
}
