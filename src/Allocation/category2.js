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
                try {
                    await pool.query(categoryTable.addStraight, [categoryID, depDetail]);
                }catch(err){
                    throw new MyError("Could not add Straight line Depreciation Entry");
                }
            }else {
                // Else add entry to DepreciationPercent
                try {
                    await pool.query(categoryTable.addWritten, [categoryID, depDetail]);
                }catch(err){
                    throw new MyError("Could not add Written Down Value Depreciation");
                }
            }
            return "Category created"
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
        
        // Get id of category
        const category_id = await Category.getCategoryID(oldName);

        // Update database
        await Category.updateNameinDb(category_id, newName);
    }
    
    // Delete Category

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
        // Asserting that depreciationType is in depTypes
        if (Category.depTypes.includes(this.depreciaitionType) === false) {
            // If depreciationType isn't in depType it means an invalid depreciaition type was entered
            throw new MyError("Invalid depreciation type")
        }

        // Asserting that categoryName is a string and less than 50 characters
        if (typeof this.categoryName !== 'string' || this.categoryName.length > 50) {
            throw new MyError('Invalid category name')
        }

        // Check if parentFolderId is an int
        if (!Number.isInteger(this.parentFolderID)) {
            throw new MyError('Invalid parent Folder')
        }

        // Check if depdetail is a number
        if (!Number.isInteger(this.depDetail)) {
            throw new MyError('Depreciation Detail is of the wrong type')
        }

        // Check if depDetail depreciationType combo is valid
        if (this.depreciaitionType === "Double Declining Balance"){
            // Straight Line should not have a depreciation type
            if (this.depDetail !== 0){
                throw new MyError("Double Declining Balance should not have a depreciation value");
            }
        }else{
            if (this.depDetail <= 0){
                throw new MyError("Invalid depreciation value");
            }
        }

        // Create Category
        const result = await Category.saveCategoryInDb(this.categoryName, this.parentFolderID, this.depreciaitionType, this.depDetail);
        return result;
    }

module.exports = Category;

