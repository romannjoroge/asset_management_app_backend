// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../../db2');

// Importing SQL commands involving categories
const categoryTable = require('./db_category2');

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
        try{
            // Get id of recently created category
            const result = await pool.query(categoryTable.getID, [categoryName])
            // Check if nothing was returned
            if (result.rowCount === 0){
                // This would mean that category was never created
                throw new Error("No Category exists with that name")
            } else {
                return result.rows[0].id
            }
        }catch(err){
            throw new Error("Could not get category ID")
        }
    }

    // Function that saves category in the database
    static async saveCategoryInDb(categoryName, parentFolderID, depreciationType, depDetail) {
        try{
            // Add an entry to Category table
            const result = await pool.query(categoryTable.add, [categoryName, parentFolderID, depreciationType]);
            let categoryID;
            // If depreciaitionType is not Double Declining Balance we get category ID of recent category
            if (this.depreciationType !== 'Double Declining Balance') {
                try {
                    categoryID = await Category.getCategoryID(categoryName);
                }catch(err){
                    throw new Error(`Could not save category: ${err.message}`);
                }

                // If depreciationType is Straight Line add an entry to DepreciationPerYear
                if (depreciationType === 'Straight Line') {
                    try {
                        await pool.query(categoryTable.addStraight, [categoryID, depDetail]);
                    }catch(err){
                        throw new Error("Could not add Straight line Depreciation Entry");
                    }
                }else {
                    // Else add entry to DepreciationPercent
                    try {
                        await pool.query(categoryTable.addWritten, [categoryID, depDetail]);
                    }catch(err){
                        throw new Error("Could not add Written Down Value Depreciation");
                    }
                }
                return "Category created"
            }
        }catch(err) {
            throw new Error(err.message);
        }
    }

    // Update Category
 
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
            throw new Error("Invalid depreciation type")
        }

        // Asserting that categoryName is a string and less than 50 characters
        if (typeof this.categoryName !== 'sting' || this.categoryName.length > 50) {
            throw new Error('Invalid category name')
        }
        console.log(2);

        // Check if parentFolderId is an int
        if (typeof this.parentFolderID !== 'int') {
            throw new Error('Invalid parent Folder')
        }
        console.log(3);

        // Check if depdetail is a float that is greater than 0
        if (typeof this.depDetail !== 'float') {
            console.log(4);
            throw new Error('Depreciation Detail is of the wrong type')
        } else {
            console.log(5);
            if (this.depDetail < 0) {
                console.log(6);
                throw new Error('Invalid depreciation value')
            }
        }
        console.log(7);
        // Create Category
        try{
            const result = Category.saveCategoryInDb(this.categoryName, this.parentFolderID, this.depreciaitionType, this.depDetail);
            console.log(8);
            return result;
        }catch(err) {
            console.log(9);
            throw new Error(err.message);
        }
    }

module.exports = Category;

