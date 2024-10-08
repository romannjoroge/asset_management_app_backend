var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../../db2.js';
// Importing SQL commands involving categories
import categoryTable from './db_category2.js';
// Importing custom MyError class
import MyError from '../../utility/myError.js';
import utility from '../../utility/utility.js';
import { Errors, MyErrors2 } from '../../utility/constants.js';
import { DepreciationTypes } from '../Asset/asset2.js';
class Category {
    // Constructor
    /**
     *
     * @param categoryName The name of the category to be created
     * @param parentCategoryID The id of the parent category, this is optional as categories don't need to always have parents
     * @param depreciationType
     * @param depreciationPercentage Optional as not every category needs to have it
     */
    constructor(categoryName, parentCategoryID, depreciationType, depreciationPercentage) {
        if (utility.isAnyEmpty([categoryName, depreciationType])) {
            throw new MyError("Missing Information");
        }
        if (typeof categoryName === "string") {
            this.categoryName = categoryName;
        }
        else {
            throw new MyError("Invalid Category Name");
        }
        // If there is a parentcategory id check if it is valid
        if (parentCategoryID) {
            if (!Number.isInteger(parentCategoryID)) {
                throw new MyError(MyErrors2.INVALID_PARENT_CATEGORY);
            }
            else {
                this.parentCategoryID = parentCategoryID;
            }
        }
        Category.verifyDepreciationDetails({ type: depreciationType, value: depreciationPercentage });
        this.depreciaitionType = depreciationType;
        this.depreciationPercentage = depreciationPercentage;
    }
    // Function that saves category in the database
    /**
     *
     * @param categoryName Name of the category to add to database
     * @param parentCategoryID The optional parent category of category
     * @param depreciationType
     * @param depreciationPercentage Optional
     * @description Given the following details the function adds the details to the database. The name must be unique otherwise an error is thrown. Parent category is optional
     */
    static _saveCategoryInDb(categoryName, parentCategoryID, depreciationType, depreciationPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create category
            // Check if parent category is given
            if (parentCategoryID) {
                pool.query(categoryTable.add, [categoryName, depreciationType, parentCategoryID]).then(_ => {
                    if (depreciationPercentage) {
                        // Add depreciaition percentage to database
                        // Get ID of created category
                        Category._getCategoryID(categoryName).then(ID => {
                            // Add depreciation percentage to database
                            pool.query(categoryTable.addWritten, [ID, depreciationPercentage]).then(_ => {
                            }).catch(err => {
                                throw new MyError("Could Not Add Entry to DepreciationPercentage table");
                            });
                        }).catch(err => {
                            console.log(err);
                            throw new MyError(Errors[12]);
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    throw new MyError(Errors[9]);
                });
            }
            else {
                // Add a category with no parent
                pool.query(categoryTable.addCategoryWithNoParent, [categoryName, depreciationType]).then(_ => {
                    if (depreciationPercentage) {
                        // Add depreciaition percentage to database
                        // Get ID of created category
                        Category._getCategoryID(categoryName).then(ID => {
                            // Add depreciation percentage to database
                            pool.query(categoryTable.addWritten, [ID, depreciationPercentage]).then(_ => {
                            }).catch(err => {
                                throw new MyError("Could Not Add Entry to DepreciationPercentage table");
                            });
                        }).catch(err => {
                            console.log(err);
                            throw new MyError(Errors[12]);
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    throw new MyError(Errors[9]);
                });
            }
        });
    }
    /**
     * @description This function combines both the constructor and save in db functions
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield Category._doesCategoryExist(this.categoryName)) {
                throw new MyError("Category Already Exists");
            }
            // If there is a parent category check if it is valida
            if (this.parentCategoryID) {
                if (!(yield Category._doesCategoryIDExist(this.parentCategoryID))) {
                    throw new MyError("Parent Category Does Not Exist");
                }
            }
            utility.addErrorHandlingToAsyncFunction(Category._saveCategoryInDb, "Could not add category to system", this.categoryName, this.parentCategoryID, this.depreciaitionType, this.depreciationPercentage);
        });
    }
    // Function that gets Category ID from name
    static _getCategoryID(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            let categoryID;
            try {
                fetchResult = yield pool.query(categoryTable.getID, [categoryName]);
            }
            catch (err) {
                throw new MyError(Errors[5]);
            }
            utility.verifyDatabaseFetchResults(fetchResult, Errors[5]);
            categoryID = fetchResult.rows[0].id;
            return categoryID;
        });
    }
    /**
     *
     * @param categoryID ID of the category to find parent of
     * @description A function that finds the ID of the parent of the specified category
     */
    static getParentCategoryID(categoryID) {
        return new Promise((res, rej) => {
            // Check if category exists, if not throw error
            this._doesCategoryIDExist(categoryID).then(doesExist => {
                if (doesExist === false) {
                    return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
                }
                // Get parent of category
                pool.query(categoryTable.getParentCategoryID, [categoryID]).then((fetchResult) => {
                    if (fetchResult.rowCount <= 0) {
                        return res();
                    }
                    return res(fetchResult.rows[0].parentcategoryid);
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_PARENT_CATEGORY));
            });
        });
    }
    /**
     *
     * @param categoryID ID of the category to get name of
     * @description Gets name of the given category
     */
    static getCategoryName(categoryID) {
        return new Promise((res, rej) => {
            // Check if category exists
            Category._doesCategoryIDExist(categoryID).then(categoryExists => {
                if (categoryExists === false) {
                    return rej(new MyError(MyErrors2.CATEGORY_NOT_EXIST));
                }
                // Return name of category
                pool.query(categoryTable.getCategoryName, [categoryID]).then((data) => {
                    if (data.rowCount <= 0) {
                        return res();
                    }
                    return res(data.rows[0].name);
                });
            }).catch((err) => {
                return rej(new MyError(MyErrors2.NOT_GET_CATEGORY_NAME));
            });
        });
    }
    static _doesCategoryExist(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exist = yield Category._getCategoryID(categoryName);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    // Update Category
    static verifyCategoryName(newName) {
        return new Promise((res, rej) => {
            // Verify the new name
            if (typeof newName !== "string") {
                // If not a string throw an error
                return rej(new MyError(Errors[53]));
            }
            else if (newName.length > 50) {
                // Throw an error for a name that's too long
                return rej(new MyError(Errors[53]));
            }
            // Check if the name exists
            Category._doesCategoryExist(newName).then(exist => {
                if (exist === true) {
                    return rej(new MyError(Errors[54]));
                }
                return res();
            }).catch(err => {
                return rej(new MyError(Errors[9]));
            });
        });
    }
    static verifyDepreciationDetails(props) {
        // Verifies that depreciation details are valid
        // Make sure that depType is valid
        if (Object.values(DepreciationTypes).includes(props.type) === false) {
            throw new MyError(Errors[50]);
        }
        // Make sure deptype depvalue pair is valid
        if (props.type === DepreciationTypes.WrittenDownValue) {
            if (props.value) {
                if (props.value <= 0) {
                    throw new MyError(Errors[50]);
                }
            }
        }
        else {
            if (props.value) {
                throw new MyError(Errors[50]);
            }
        }
    }
    static _insertDepreciationPercentInDb(category_id, percent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query(categoryTable.insertDepreciationPercent, [category_id, percent]);
            }
            catch (err) {
                throw new MyError("Could not insert depreciation percentage");
            }
        });
    }
    static _deleteDepreciationPercentInDb(category_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query(categoryTable.deleteDepreciationPercent, [category_id]);
            }
            catch (err) {
                throw new MyError("Could not delete depreciation percentage entry");
            }
        });
    }
    // Delete Category
    // Deleting a category would involve deleting the depreiciation details of all the assets under the category which
    // To me doesn't make alot of sense. So I've decided to not add this functionality for now
    static _doesCategoryIDExist(categoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                pool.query(categoryTable.doesCategoryIDExist, [categoryID]).then(fetchResult => {
                    if (fetchResult.rowCount === 0) {
                        return res(false);
                    }
                    else {
                        return res(true);
                    }
                }).catch(err => {
                    console.log(err);
                    return rej(new MyError(Errors[9]));
                });
            });
        });
    }
    static _getCategoryDepreciationType(categoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            // Check if Category Exists
            if (!(yield Category._doesCategoryIDExist(categoryID))) {
                throw new MyError("Category Does Not Exist");
            }
            try {
                fetchResult = yield pool.query(categoryTable.getCategoryDepreciationType, [categoryID]);
            }
            catch (err) {
                throw new MyError("Could Not Get Category Depreciation Type");
            }
            utility.verifyDatabaseFetchResults(fetchResult, "Error Querying Database");
            let depreciaitionType = fetchResult.rows[0].depreciationtype;
            return depreciaitionType;
        });
    }
    static _getCategoryDepreciationPercent(categoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            let depreciationPercentage;
            if (!(yield Category._doesCategoryIDExist(categoryID))) {
                throw new MyError("Category Does Not Exist");
            }
            if ((yield Category._getCategoryDepreciationType(categoryID)) === "Written Down Value") {
                try {
                    fetchResult = yield pool.query(categoryTable.getDepreciationPercent, [categoryID]);
                }
                catch (err) {
                    throw new MyError("Could Not Get Depreciation Percentage");
                }
                depreciationPercentage = fetchResult.rows[0].percentage;
            }
            else {
                depreciationPercentage = null;
            }
            return depreciationPercentage;
        });
    }
    static _getDepreciationDetails(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                Category._getCategoryID(categoryName).then(categoryID => {
                    Category._getCategoryDepreciationType(categoryID).then(depType => {
                        Category._getCategoryDepreciationPercent(categoryID).then(perc => {
                            res({ "depType": depType, "perc": perc });
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    rej(MyError(Errors[9]));
                });
            });
        });
    }
    // View Category Details
    static viewDetails(categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            let categoryExist = yield Category._doesCategoryExist(categoryName);
            if (!categoryExist) {
                throw new MyError("Category Does Not Exist");
            }
            let categoryID = yield Category._getCategoryID(categoryName);
            let depreciationType = yield Category._getCategoryDepreciationType(categoryID);
            let depreciationValue = yield Category._getCategoryDepreciationPercent(categoryID, depreciationType);
            return {
                categoryName: categoryName,
                depreciationType: depreciationType,
                depreciationValue: depreciationValue
            };
        });
    }
}
// Static fields
Category.depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];
export default Category;
//# sourceMappingURL=category2.js.map