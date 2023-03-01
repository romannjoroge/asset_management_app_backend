// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../../db2.js';

// Importing SQL commands involving categories
import categoryTable from './db_category2.js';

// Importing custom MyError class
import MyError from '../../../utility/myError.js';
import Folder from '../Folder/folder.js';
import utility from '../../../utility/utility.js';

class Category {
    // Constructor
    constructor(categoryName, parentFolderID, depreciationType, depreciationPercentage) {
        if (utility.isAnyEmpty([categoryName, parentFolderID, depreciationType])){
            throw new MyError("Missing Information");
        }

        if (typeof categoryName === "string"){
            this.categoryName = categoryName;
        }else{
            throw new MyError("Invalid Category Name");
        }

        if (!Number.isInteger(parentFolderID)){
            throw new MyError("Invalid parent folder");
        }else{
            this.parentFolderID = parentFolderID;
        }

        Category.verifyDepreciationDetails(depreciationType, depreciationPercentage);
        this.depreciaitionType = depreciationType;
        this.depreciationPercentage = depreciationPercentage;
    }

    // Function that saves category in the database
    static async _saveCategoryInDb(categoryName, parentFolderID, depreciationType, depreciationPercentage) {
        // Categories of all depreciation types have a name, parent folder and a depreciation type
        let categoryID;
        try{
            await pool.query(categoryTable.add, [categoryName, parentFolderID, depreciationType]);
        }catch(err){
            throw new MyError("Could Not Add Category To System")
        }

        // Only written down value depreciation uses a custom depreciation percentage that needs to be stored in the system
        if (depreciationType === "Written Down Value"){
            try{
                categoryID = await Category._getCategoryID(categoryName);
                await pool.query(categoryTable.addWritten, [categoryID, depreciationPercentage]);
            }catch(err){
                throw new MyError("Could Not Add Entry to DepreciationPercentage table");
            }
        }
    }

    async initialize(){
        if (!await Category._doesCategoryExist(this.categoryName)){
            throw new MyError("Category Already Exists");
        }

        if (!await Folder.doesFolderExist(this.parentFolderID)){
            throw new MyError("Parent Folder Does Not Exist");
        }

        utility.addErrorHandlingToAsyncFunction(Category._saveCategoryInDb, "Could not add category to system"
                                                ,this.categoryName, this.parentFolderID, this.depreciaitionType, 
                                                this.depreciationPercentage);
    }

    // Static fields
    static depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];

    // Function that gets Category ID from name
    static async _getCategoryID(categoryName) {
        let fetchResult;
        let categoryID;

        try{
            fetchResult = await pool.query(categoryTable.getID, [categoryName]);
        }catch(err){
            throw new MyError("Could Not Get Category ID From System");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Category Does Not Exist");

        categoryID = fetchResult.rows[0].id;
        return categoryID;
    }

    static async _doesCategoryExist(categoryName) {
        try {
            const exist = await Category._getCategoryID(categoryName);
            return true;
        }catch(err){
            return false;
        }
    }

    // Update Category
    static async verifyCategoryName(newName){
        // Verify the new name
        if (typeof newName !== "string"){
            // If not a string throw an error
            throw new MyError("Category Name is of invalid type");
        }else if (newName.length > 50){
            // Throw an error for a name that's too long
            throw new MyError("Category Name is too long");
        }

        // Check if the name exists
        const exist = await Category._doesCategoryExist(newName);
        if (exist === true){
            throw new MyError(`${newName} category already exists`);
        }

        return "Name is valid!";
    }

    static async _updateNameinDb (category_id, newName) {
        // Run command
        try {
            await pool.query(categoryTable.updateCategoryName, [newName, category_id]);
        }catch(err){
            throw new MyError("Could not update category name");
        }
    }

    static async _updateCategoryName(newName, oldName) {
        // Verify newName
        const isValid = await Category.verifyCategoryName(newName);
        
        const category_id = await Category._getCategoryID(oldName);

        // Update database
        await Category._updateNameinDb(category_id, newName);
    }

    static async verifyFolder(id) {
        // Verifies a folder ID
        // Test if folder ID is an int
        if (!Number.isInteger(id)){
            throw new MyError("Invalid Folder");
        }

        const exist = Folder.doesFolderExist(id);
        if (!exist) {
            throw new MyError("Folder does not exist");
        }
    }

    static async _updateFolderinDB(category_id, newID) {
        try{
            await pool.query(categoryTable.updateFolderID, [newID, category_id]);
        }catch(err){
            throw new MyError("Could not update category folder");
        }
    }

    static async _updateCategoryFolder(newFolderID, categoryName) {
        // Verify new folder ID
        await Category.verifyFolder(newFolderID);

        // Get category ID from categoryName
        const categoryID = Category._getCategoryID(categoryName);

        // Update details in DB
        await Category._updateFolderinDB(categoryID, newFolderID);
    }

    static verifyDepreciationDetails(depType, depValue) {
        // Verifies that depreciation details are valid
        // Make sure that depType is valid
        utility.checkIfInList(Category.depTypes, depType, "Invalid Depreciation Type");

        // Make sure deptype depvalue pair is valid
        if (depType === "Double Declining Balance" || depType === "Straight Line") {
            if (depValue) {
                throw new MyError("There should be no depreciation percentage");
            }
        }else if (depType === "Written Down Value"){
            utility.checkIfNumberisGreaterThanZero(depValue, "Invalid Depreciation Percentage");
        }
    }

    static async _updateDepreciationTypeInDB(category_id, depType){
        // Update the depreciation type in category table
        try {
            await pool.query(categoryTable.updateDepreciationType, [depType, category_id]);
        }catch(err){
            throw new MyError("Could not update Depreciation Type");
        }
    }

    static async _insertDepreciationPercentInDb(category_id, percent) {
        try{
            await pool.query(categoryTable.insertDepreciationPercent, [category_id, percent]);
        }catch(err){
            throw new MyError("Could not insert depreciation percentage");
        }
    }

    static async _deleteDepreciationPercentInDb(category_id) {
        try {
            await pool.query(categoryTable.deleteDepreciationPercent, [category_id]);
        }catch(err){
            throw new MyError("Could not delete depreciation percentage entry");
        }
    }

    static async _updateDepreciationType(depType, value, categoryName){
        // Verify Depreciation Details
        Category.verifyDepreciationDetails(depType, value);

        // Get category ID
        const category_id = Category._getCategoryID(categoryName);

        // Update Depreciation Type Entry in Category Table
        await Category._updateDepreciationTypeInDB(category_id, depType);

        // Delete Depreciation Type and Depreciation Per Year in category table
        await Category._deleteDepreciationPercentInDb(category_id);

        // Insert DepreciationPerYear of DepreciationPercent
        if (depType === "Written Down Value"){
            await Category._insertDepreciationPercentInDb(category_id, value);
        }
    }

    static async updateCategory(updateJSON, categoryName) {
        // Update whatever item is specified in json
        /*
        json: an object that could have the following keys: name, parentFolder or depreciaiton
        Each key contains the new info to use to update that property of a category.
        The depreciation key contains another object that has depreciation type and value
        */
        if ("name" in updateJSON) {
            await Category._updateCategoryName(updateJSON.name, categoryName);
        }
        
        if("parentFolder" in updateJSON){
            await Category._updateCategoryFolder(updateJSON.parentFolder, categoryName);
        }

        if ("depreciation" in updateJSON){
            await Category._updateDepreciationType(updateJSON.depreciation.type, updateJSON.depreciation.value, categoryName);
        }
    }

    // Delete Category
    // Deleting a category would involve deleting the depreiciation details of all the assets under the category which
    // To me doesn't make alot of sense. So I've decided to not add this functionality for now

    static async _doesCategoryIDExist(categoryID){
        let fetchResult;

        try{
            fetchResult = await pool.query(categoryTable.doesCategoryIDExist, [categoryID]);
        }catch(err){
            throw new MyError("Could Not Confirm If Category Exists");
        }

        if (fetchResult.rowCount === 0){
            return false;
        }else{
            return true;
        }
    }

    static async _getCategoryDepreciationType(categoryID){
        let fetchResult;

        // Check if Category Exists
        if (!await Category._doesCategoryIDExist(categoryID)){
            throw new MyError("Category Does Not Exist");
        }

        try{
            fetchResult = await pool.query(categoryTable.getCategoryDepreciationType, [categoryID]);
        }catch(err){
            throw new MyError("Could Not Get Category Depreciation Type");
        }

        utility.verifyDatabaseFetchResults(fetchResult, "Error Querying Database");

        let depreciaitionType = fetchResult.rows[0].depreciationtype;
        return depreciaitionType;
    }

    static async _getCategoryDepreciationPercent(categoryID){
        let fetchResult;
        let depreciationPercentage;

        if (!await Category._doesCategoryIDExist(categoryID)){
            throw new MyError("Category Does Not Exist");
        }

        if(await Category._getCategoryDepreciationType(categoryID) === "Written Down Value"){
            try{
                fetchResult = await pool.query(categoryTable.getDepreciationPercent, [categoryID]);
            }catch(err){
                throw new MyError("Could Not Get Depreciation Percentage")
            }

            depreciationPercentage = fetchResult.rows[0].percentage;
        }else{
            depreciationPercentage = null;
        }

        return depreciationPercentage;
    }

    // View Category Details
    static async viewDetails(categoryName){
        let categoryExist = await Category._doesCategoryExist(categoryName);
        if (!categoryExist) {
            throw new MyError("Category Does Not Exist");
        }

        let categoryID = await Category._getCategoryID(categoryName);
        let depreciationType = await Category._getCategoryDepreciationType(categoryID);
        let depreciationValue = await Category._getCategoryDepreciationPercent(categoryID, depreciationType);

        return {
            categoryName: categoryName,
            depreciationType: depreciationType,
            depreciationValue: depreciationValue
        }
    }

    static as
}

export default Category;