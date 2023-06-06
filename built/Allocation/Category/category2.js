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
import { Errors } from '../../utility/constants.js';
class Category {
    // Constructor
    constructor(categoryName, parentCategoryID, depreciationType, depreciationPercentage) {
        if (utility.isAnyEmpty([categoryName, parentCategoryID, depreciationType])) {
            throw new MyError("Missing Information");
        }
        if (typeof categoryName === "string") {
            this.categoryName = categoryName;
        }
        else {
            throw new MyError("Invalid Category Name");
        }
        if (!Number.isInteger(parentCategoryID)) {
            throw new MyError("Invalid parent category");
        }
        else {
            this.parentCategoryID = parentCategoryID;
        }
        Category.verifyDepreciationDetails(depreciationType, depreciationPercentage);
        this.depreciaitionType = depreciationType;
        this.depreciationPercentage = depreciationPercentage;
    }
    // Function that saves category in the database
    static _saveCategoryInDb(categoryName, parentCategoryID, depreciationType, depreciationPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create category
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
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield Category._doesCategoryExist(this.categoryName)) {
                throw new MyError("Category Already Exists");
            }
            if (!(yield Category._doesCategoryIDExist(this.parentCategoryID))) {
                throw new MyError("Parent Category Does Not Exist");
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
        return __awaiter(this, void 0, void 0, function* () {
            // Verify the new name
            if (typeof newName !== "string") {
                // If not a string throw an error
                throw new MyError("Category Name is of invalid type");
            }
            else if (newName.length > 50) {
                // Throw an error for a name that's too long
                throw new MyError("Category Name is too long");
            }
            // Check if the name exists
            const exist = yield Category._doesCategoryExist(newName);
            if (exist === true) {
                throw new MyError(`${newName} category already exists`);
            }
            return "Name is valid!";
        });
    }
    static _updateNameinDb(category_id, newName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Run command
            try {
                yield pool.query(categoryTable.updateCategoryName, [newName, category_id]);
            }
            catch (err) {
                throw new MyError("Could not update category name");
            }
        });
    }
    static _updateCategoryName(newName, oldName) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`old is ${oldName} and new is ${newName}`);
            // Verify newName
            const isValid = yield Category.verifyCategoryName(newName);
            const category_id = yield Category._getCategoryID(oldName);
            // Update database
            yield Category._updateNameinDb(category_id, newName);
        });
    }
    static verifyFolder(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifies a folder ID
            // Test if folder ID is an int
            if (!Number.isInteger(id)) {
                throw new MyError("Invalid Folder");
            }
            const exist = Folder.doesFolderExist(id);
            if (!exist) {
                throw new MyError("Folder does not exist");
            }
        });
    }
    static _updateFolderinDB(category_id, newID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(typeof newID, newID);
                console.log(typeof category_id, category_id);
                yield pool.query(categoryTable.updateFolderID, [newID, category_id]);
            }
            catch (err) {
                console.log(err);
                throw new MyError("Could not update category folder");
            }
        });
    }
    static _updateCategoryFolder(newFolderID, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify new folder ID
            yield Category.verifyFolder(newFolderID);
            // Get category ID from categoryName
            const categoryID = yield Category._getCategoryID(categoryName);
            // Update details in DB
            yield Category._updateFolderinDB(categoryID, newFolderID);
        });
    }
    static verifyDepreciationDetails(depType, depValue) {
        // Verifies that depreciation details are valid
        // Make sure that depType is valid
        utility.checkIfInList(Category.depTypes, depType, "Invalid Depreciation Type");
        // Make sure deptype depvalue pair is valid
        if (depType === "Double Declining Balance") {
            if (depValue) {
                throw new MyError("There should be no depreciation value");
            }
        }
        else if (depType === "Written Down Value") {
            utility.checkIfNumberisGreaterThanZero(depValue, "Invalid Depreciation Percentage");
        }
    }
    static _updateDepreciationTypeInDB(category_id, depType) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update the depreciation type in category table
            try {
                yield pool.query(categoryTable.updateDepreciationType, [depType, category_id]);
            }
            catch (err) {
                throw new MyError("Could not update Depreciation Type");
            }
        });
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
    static _updateDepreciationType(depType, value, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify Depreciation Details
            Category.verifyDepreciationDetails(depType, value);
            // Get category ID
            const category_id = yield Category._getCategoryID(categoryName);
            // Update Depreciation Type Entry in Category Table
            yield Category._updateDepreciationTypeInDB(category_id, depType);
            // Delete Depreciation Type and Depreciation Per Year in category table
            yield Category._deleteDepreciationPercentInDb(category_id);
            // Insert DepreciationPerYear of DepreciationPercent
            if (depType === "Written Down Value") {
                yield Category._insertDepreciationPercentInDb(category_id, value);
            }
        });
    }
    static updateCategory(updateJSON, categoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update whatever item is specified in json
            /*
            json: an object that could have the following keys: name, parentFolder or depreciaiton
            Each key contains the new info to use to update that property of a category.
            The depreciation key contains another object that has depreciation type and value
            */
            console.log(1);
            if ("name" in updateJSON) {
                yield Category._updateCategoryName(updateJSON.name, categoryName);
            }
            console.log(2);
            if ("parentFolder" in updateJSON) {
                yield Category._updateCategoryFolder(updateJSON.parentFolder, categoryName);
            }
            console.log(3);
            if ("depreciation" in updateJSON) {
                yield Category._updateDepreciationType(updateJSON.depreciation.type, updateJSON.depreciation.value, categoryName);
            }
            console.log(4);
        });
    }
    // Delete Category
    // Deleting a category would involve deleting the depreiciation details of all the assets under the category which
    // To me doesn't make alot of sense. So I've decided to not add this functionality for now
    static _doesCategoryIDExist(categoryID) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchResult;
            try {
                fetchResult = yield pool.query(categoryTable.doesCategoryIDExist, [categoryID]);
            }
            catch (err) {
                throw new MyError("Could Not Confirm If Category Exists");
            }
            if (fetchResult.rowCount === 0) {
                return false;
            }
            else {
                return true;
            }
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