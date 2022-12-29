const category = require('../model/Assets/category')
const pool = require('../db')
const utility = require('../utility/utility')
const item = require('../model/Assets/items')
const {addlog} = require('../logic/log')
const users = require('../model/Users/users')

async function addCategory(req, res){
    // Get details from request body
    let{
        username,
        num_dep,
        name,
        dep_type,
        freq_dep
    } = req.body

    let user_id;

    // Verify that non are null
    let items = [username, num_dep, name, dep_type, freq_dep]
    isEmpty = utility.isAnyEmpty(items)
    if(isEmpty){
        return res.status(404).json({data:'One of the items is empty'})
    }
    
    // Verify username
    try{
        const result = await pool.query(users.getUserFromName, [username])
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result.rows[0]['user_id']
    }catch(err){
        console.log(err)
        return res.status(501).json({data:`Server couldn't verify if user ${username} exists`})
    }

    // Verify that the category does not exist
    try{
        const result = await pool.query(category.getCategoryFromName, [name])
        // If result rowCount is empty then category doesn't exist
        if (result.rowCount > 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} already exists`, 'Adding Category')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data: `Category ${name} already exists`})
        }
    }catch(err){
        console.log(err)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had trouble checking if category ${name} exists`, 'Adding Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data: `Server had trouble checking if category ${name} exists`})
    }
    // Convert items to appropriate types
    num_dep = parseInt(num_dep)
    freq_dep = parseInt(freq_dep)

    // Add to db
    items = [name, dep_type, num_dep, freq_dep]
    try{
        const result = await pool.query(category.addCategory, items)
        if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} succesfully added`, 'Adding Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Category ${name} succesfully added`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had an issue with adding category ${name} please try again`, 'Adding Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server had an issue with adding category ${name} please try again`})
    }
}

// Check how to redirect users to other path
async function removeCategory(req, res){
    // Get category_name from request body
    let {
        name,
        username
    } = req.body
    
    let user_id;
    // Verify username
    try{
        const result = await pool.query(users.getUserFromName, [username])
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result.rows[0]['user_id']
    }catch(err){
        console.log(err)
        return res.status(501).json({data:`Server couldn't verify if user ${username} exists`})
    }
    // Validate category name

    // Check if null, if null send an error
    if (!name){
        res.status(404).json({data:'Category name not given'})
    }
    // Check if it exists
    try{
        const result = await pool.query(category.getCategoryFromName, [name])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} doesn't exist`, 'Removing Category')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Category ${name} doesn't exist`})
        }
        let category_id = result.rows[0]['category_id']
        
        // Locate the temporary category
        const result2 = await pool.query(category.getCategoryFromName, ['Temporary'])
        if (result2.rowCount == 0){
            if (await addlog(user_id, new Date().toLocaleString(), "There is no Temporary category to store items belonging to deleted category", 'Removing Category')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            // There is no Temporary category thus item cannot be deleted
            return res.status(501).json({data:"There is no Temporary category to store items belonging to deleted category"})
        }
        const temp_id = result2.rows[0]['category_id']

        // Move items belonging to deleted category to temporary category
        await pool.query(item.temporaryItemCateg, [temp_id, category_id])

        // Remove category
        await pool.query(category.removeCategory, [category_id])
        if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} succesfully deleted. Items belonging to it have been moved to Temporary category`, 'Removing Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(201).json({data:`Category ${name} succesfully deleted. Items belonging to it have been moved to Temporary category`})
    }catch (error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had issues removing category ${name}`, 'Removing Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data:`Server had issues removing category ${name}`})
    }

}

async function updateCategory(req, res){
    // Get details from request body
    let{
        username,
        new_name,
        num_dep,
        name,
        dep_type,
        freq_dep
    } = req.body

    // Initializing category_id
    let category_id;
    let user_id;

    // Verify that non are null
    items = [username, new_name,num_dep, name, dep_type, freq_dep]
    isEmpty = utility.isAnyEmpty(items)
    if(isEmpty){
        return res.status(404).json({data:'One of the items is empty'})
    }

    // Verifying username
    try{
        const result = await pool.query(users.getUserFromName, [username])
        // If result is empty return an error
        if (result.rowCount == 0){
            return res.status(404).json({data:`User ${username} does not exist`})
        }
        user_id = result.rows[0]['user_id']
    }catch(err){
        console.log(err)
        return res.status(501).json({data:`Server couldn't verify if user ${username} exists`})
    }

    // Check that name is valid
    // Check if it exists
    try{
        const result = await pool.query(category.getCategoryFromName, [name])
        // If the result is empty the category doesn't exist and an error should be returned
        if (result.rows.length == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} doesn't exist`, 'Updating Category')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Category ${name} doesn't exist`})
        }
        // If new_name is not the same as old name check if new name already exists
        if (new_name != name){
            const result2 = await pool.query(category.getCategoryFromName, [new_name])
            // If result2 has rows then category with new name already exists
            if (result2.rowCount > 0){
                if (await addlog(user_id, new Date().toLocaleString(), `Category ${new_name} already exists pick a different category name`, 'Updating Category')){
                    // If something other than 0 is returned an error occured
                    return res.status(501).json({data:'Server had trouble updating the log try again'})
                }
                return res.status(404).json({data: `Category ${new_name} already exists pick a different category name`})
            }
        }
        category_id = result.rows[0]['category_id']
    }catch (error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had trouble verifying category ${name} please try again`, 'Updating Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data:`Server had trouble verifying category ${name} please try again`})
    }

    // Convert items to appropriate types
    num_dep = parseInt(num_dep)
    freq_dep = parseInt(freq_dep)
 
    // Run query
    items = [new_name, dep_type, num_dep, freq_dep, category_id]
    try{
        const result = await pool.query(category.updateCategory, items)
        if (await addlog(user_id, new Date().toLocaleString(), `Category ${name} updated`, 'Updating Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Category ${name} updated`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server had trouble updating ${name} category please try again`, 'Updating Category')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:`Server had trouble updating ${name} category please try again`})
    }
}

async function getCategory(req, res){
    // Get category id from parameters
    let category_id = req.params.id
    category_id = parseInt(category_id)
    if (!category_id){
        res.status(404).json({"code":404, "message":'Empty category id'})
    }

    // Run query and send results
    try{
        const result = await pool.query(category.getCategory, [category_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Category does not exist'})
        }
        res.status(200).json({"success":true, "data":result.rows, "message":'Data sent'})
    }catch(error){
        console.log(error)
        res.status(400).send('Problem with request')
    }
}

async function getCategories(req, res){
    // Send data
    try{
        const result = await pool.query(category.getAllCategorys)
        return res.status(200).json({data:result.rows})
    }catch(error){
        console.log(error)
        return res.status(404).json({data:"Server couldn't get categories try again later"})
    }
}

async function getCategoryName(req, res) {
    // Get data
    try{
        // Getting category names
        const result = await pool.query(category.getCategroyName)
        // Empty result so no categories
        if (result.rowCount == 0){
            return res.status(404).json({data:"Server has no categories"})
        }
        res.status(200).json({data:result.rows})
    }catch(err){
        console.log(err)
        res.status(501).json({data:"Server couldn't load category names"})
    }
}

module.exports = {
    addCategory,
    removeCategory,
    updateCategory,
    getCategory,
    getCategories,
    getCategoryName
}