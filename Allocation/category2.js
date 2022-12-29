// Importing the database bool from db2.js. This will allow me to connect to the database
const pool = require('../db2')

// Category Class
function Category(name, parentFolder, depreciationType, depDetail) {
    // Create Category
    /*
        Create a category from the following data:
        name: string. Is the name of a category, should be unique
        parentFolder: string. Name of the folder
        depreciaitionType: string. The type of depreciation to apply to its assets. Its value should
            be in the depreciaition type list
        depDetail: float. Either the depreciaition per year or depreciation percent depending on value of 
            depreciationType. Can't be zero and must be positive. 
        depreciationPerYear: float. Is a monetary value, has a maximum of 2dp
        depreciationPercentage: float. The percentage depreciation
    */

    // Validate Details
    let depTypes = ['Straight Line', 'Double Declining Balance', 'Written Down Value'];
    
    // Create Entity

    // Create Log


    // Update Category

    // Delete Category

    // View Category Details

    // Get Depreciation Details
}


