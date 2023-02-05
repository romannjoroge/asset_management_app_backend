// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing SQL commands involving categories
const categoryTable = require('./db_category2');

// Importing custom MyError class
const MyError = require('../../utility/myError');
const Folder = require('./folder');

class Category {
    // Constructor
    constructor(n, p, d, dd) {
        this.categoryName = n;
        this.parentFolderID = p;
        this.depreciaitionType = d;
        this.depDetail = dd;
    }

    // Static fields
    static depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];

    // Static methods

    // Function that gets Category ID from name
    static async getCategoryID(categoryName) {
        // Get id of recently created category
        const result = await pool.query(categoryTable.getID, [categoryName]);
        // Check if nothing was returned
        if (result.rowCount === 0){
            // This would mean that category was never created
            throw new MyError("No Category exists with that name");
        } else {
            return result.rows[0].id
        }
    }

    static async doesCategoryExist(categoryName) {
        try {
            const exist = await Category.getCategoryID(categoryName);
            return true;
        }catch(err){
            return false;
        }
    }

    // Function that saves category in the database
    static async saveCategoryInDb(categoryName, parentFolderID, depreciationType, depDetail) {
        // Test if category already exists
        const exist = await Category.doesCategoryExist(categoryName);
        if (exist === true){
            throw new MyError("Category Exists");
        }

        // Test if parent folder exists
        const folderExist = await Folder.doesFolderExist(parentFolderID);
        if (folderExist === false){
            throw new MyError("Folder does not Exist");
        }

        // Add an entry to Category table
        const result = await pool.query(categoryTable.add, [categoryName, parentFolderID, depreciationType]);
        let categoryID;
        // If depreciaitionType is not Double Declining Balance we get category ID of recent category
        if (this.depreciationType !== 'Double Declining Balance') {
            try {
                categoryID = await Category.getCategoryID(categoryName);
            }catch(err){
                throw new MyError(`Could not save category: ${err.message}`);
            }

            // If depreciationType is Straight Line add an entry to DepreciationPerYear
            if (depreciationType === 'Straight Line') {
                await Category.insertDepreciationValueInDB(categoryID, depDetail);
            }else {
                // Else add entry to DepreciationPercent
                await Category.insertDepreciationPercentInDb(categoryID, depDetail);
            }
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
        const exist = await Category.doesCategoryExist(newName);
        if (exist === true){
            throw new MyError(`${newName} category already exists`);
        }

        return "Name is valid!";
    }

    static async updateNameinDb (category_id, newName) {
        // Run command
        try {
            await pool.query(categoryTable.updateCategoryName, [newName, category_id]);
        }catch(err){
            throw new MyError("Could not update category name");
        }
    }

    static async updateCategoryName(newName, oldName) {
        // Verify newName
        const isValid = await Category.verifyCategoryName(newName);
        
        const category_id = await Category.getCategoryID(oldName);

        // Update database
        await Category.updateNameinDb(category_id, newName);
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

    static async updateFolderinDB(category_id, newID) {
        // Run the SQL command
        try{
            await pool.query(categoryTable.updateFolderID, [newID, category_id]);
        }catch(err){
            throw new MyError("Could not update category folder");
        }
    }

    static async updateCategoryFolder(newFolderID, categoryName) {
        // Verify new folder ID
        await Category.verifyFolder(newFolderID);

        // Get category ID from categoryName
        const categoryID = Category.getCategoryID(categoryName);

        // Update details in DB
        await Category.updateFolderinDB(categoryID, newFolderID);
    }

    static verifyDepreciationDetails(depType, depValue) {
        // Verifies that depreciation details are valid
        // Make sure that depType is valid
        if(!Category.depTypes.includes(depType)) {
            throw new MyError("Invalid Depreciation Type");
        }

        // Make sure deptype depvalue pair is valid
        if (depType === "Double Declining Balance") {
            if (depValue) {
                throw new MyError("Double Declining Balance should not have a depreciation value");
            }
        }else{
            if (!Number.isInteger(depValue) || depValue <= 0){
                throw new MyError("Invalid depreciation value");
            }
        }
    }

    static async updateDepreciationTypeInDB(category_id, depType){
        // Update the depreciation type in category table
        try {
            await pool.query(categoryTable.updateDepreciationType, [depType, category_id]);
        }catch(err){
            throw new MyError("Could not update Depreciation Type");
        }
    }

    static async insertDepreciationValueInDB(category_id, value) {
        try {
            await pool.query(categoryTable.insertDepreciationPerYear, [category_id, value]);
        }catch(err){
            throw new MyError("Could not insert depreciation per year");
        }
    }

    static async insertDepreciationPercentInDb(category_id, percent) {
        try{
            await pool.query(categoryTable.insertDepreciationPercent, [category_id, percent]);
        }catch(err){
            throw new MyError("Could not insert depreciation percentage");
        }
    }

    static async deleteDepreciationPerYearInDb(category_id) {
        try{
            await pool.query(categoryTable.deleteDepreciationPerYear, [category_id]);
        }catch(err){
            throw new MyError("Could not delete DepreciationPerYear entry")
        }
    }

    static async deleteDepreciationPercentInDb(category_id) {
        try {
            await pool.query(categoryTable.deleteDepreciationPercent, [category_id]);
        }catch(err){
            throw new MyError("Could not delete depreciation percentage entry");
        }
    }

    static async updateDepreciationType(depType, value, categoryName){
        // Verify Depreciation Details
        await Category.verifyDepreciationDetails(depType, value);

        // Get category ID
        const category_id = Category.getCategoryID(categoryName);

        // Update Depreciation Type Entry in Category Table
        await Category.updateDepreciationTypeInDB(category_id, depType);

        // Delete Depreciation Type and Depreciation Per Year in category table
        await Category.deleteDepreciationPerYearInDb(category_id);
        await Category.deleteDepreciationPercentInDb(category_id);

        // Insert DepreciationPerYear of DepreciationPercent
        if (depType === "Straight Line") {
            // Insert DepreciationPerYear
            await Category.insertDepreciationValueInDB(category_id, value);
        }else if (depType === "Written Down Value"){
            await Category.insertDepreciationPercentInDb(category_id, value);
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
            await Category.updateCategoryName(updateJSON.name, categoryName);
        }
        
        if("parentFolder" in updateJSON){
            await Category.updateCategoryFolder(updateJSON.parentFolder, categoryName);
        }

        if ("depreciation" in updateJSON){
            await Category.updateDepreciationType(updateJSON.depreciation.type, updateJSON.depreciation.value, categoryName);
        }
    }

    // Delete Category
    // Deleting a category would involve deleting the depreiciation details of all the assets under the category which
    // To me doesn't make alot of sense. So I've decided to not add this functionality for now

    // View Category Details

    // Get Depreciation Details
}

// Adds a category in system
Category.prototype.addCategory = async function addCategory() {
        // Create Category
        /*
            Create a category from the following data:
            categoryName: string. Is the name of a category, should be unique
            parentFolder: string. Name of the folder
            depreciaitionType: string. The type of depreciation to apply to its assets. Its value should
                be in the depreciaition type list
            depDetail: float. Either the depreciaition per year or depreciation percent depending on value of 
                depreciationType. Can't be zero and must be positive. 
            depreciationPerYear: float. Is a monetary value, has a maximum of 2dp
            depreciationPercentage: float. The percentage depreciation
        */

        // Validate Details
        // Asserting that categoryName is a string and less than 50 characters
        if (typeof this.categoryName !== 'string' || this.categoryName.length > 50) {
            throw new MyError('Invalid category name')
        }

        // Check if parentFolderId is an int
        if (!Number.isInteger(this.parentFolderID)) {
            throw new MyError('Invalid parent Folder')
        }

        // Verify Depreciation Details
        Category.verifyDepreciationDetails(this.depreciaitionType, this.depDetail);

        // Create Category
        const result = await Category.saveCategoryInDb(this.categoryName, this.parentFolderID, this.depreciaitionType, this.depDetail);
        return result;
    }

module.exports = Category;