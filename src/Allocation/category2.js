// Importing the database bool from db2.js. This will allow me to connect to the database
import pool from '../../db2';

// Importing SQL commands involving categories
import categoryTable from './db_category2';

async function addCategory() {
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
    if (this.depreciationType in this.depTypes === false) {
        // If depreciationType isn't in depType it means an invalid depreciaition type was entered
        throw new Error("Invalid depreciation type")
    }

    // Asserting that categoryName is a string and less than 50 characters
    if (typeof this.categoryName !== 'sting' || this.categoryName.length > 50) {
        throw new Error('Invalid category name')
    }
    
    // Check if parentFolderId is an int
    if (typeof this.parentFolderID !== 'int') {
        throw new Error('Invalid parent Folder')
    }

    // Check if depdetail is a float that is greater than 0
    if (typeof this.depDetail !== 'float') {
        throw new Error('Depreciation Detail is of the wrong type')
    } else {
        if (this.depDetail < 0) {
            throw new Error('Invalid depreciation value')
        }
    }

    // Create Category
    try{
        // Add an entry to Category table
        const result = await pool.query(categoryTable.add, [this.categoryName, this.parentFolderID, 
                                                            this,depreciationType]);

        // If depreciaitionType is not Double Declining Balance we get category ID of recent category
        if (this.depreciationType !== 'Double Declining Balance') {
            // Get id of recently created category
            const result2 = await pool.query(categoryTable.getID, [this.categoryName])
            // Check if nothing was returned
            if (result2.rowCount === 0){
                // This would mean that category was never created
                throw new Error("Couldn't create category")
            } else {
                this.categoryID = result2.rows[0].id
            }

            // If depreciationType is Straight Line add an entry to DepreciationPerYear
            if (depreciationType === 'Straight Line') {
                await pool.query(categoryTable.addStraight, [this.categoryID, this.depDetail])
            }else {
                // Else add entry to DepreciationPercent
                await pool.query(categoryTable.addWritten, [this.categoryID, this.depDetail])
            }
        }
    }catch(err) {
        throw new Error("Could not create category")
    }
}


// Category Constructor function
function Category(n, p, d, dd) {
    
    // Instantiate private variables
    let categoryName = n;
    let parentFolderID = p;
    let depreciaitionType = d;
    let depDetail = dd;
    let depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];
    let categoryID;
    
    this.addCategory = addCategory;
 
     // Update Category
 
     // Delete Category
 
     // View Category Details
 
     // Get Depreciation Details
 }
