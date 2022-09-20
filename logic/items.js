const utility = require('../utility/utility')
const category = require('../model/Assets/category')
const items = require('../model/Assets/items')
const pool = require('../db')
const location = require('../model/Tracking/location')
const users = require('../model/Users/users')
const { addItemReconciliation,
        removeItemReconciliation } = require('./reconciliation')
const { addlog } = require('../logic/log')

async function addItem(req, res){
    // Expected items
    let {
        username,
        item_id,
        category_name,
        name,
        purchase_date,
        purchase_amount,
        next_dep_date,
        accum_dep,
        isnew,
        location_name
    } = req.body
    let item = [username, item_id, category_name, name, purchase_amount, purchase_date, next_dep_date, accum_dep, isnew, location_name]
    
    // Initializing category and location IDs that will be gotten from the database
    let category_id;
    let location_id;
    let user_id;

    // Test if any element is empty
    const isEmpty = utility.isAnyEmpty(item)
    // If any item is empty it should return a 404
    if (isEmpty){
        return res.status(404).json({data:'One of the elements was empty'})
    }

    // Test if user exists
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

    // Test if the Item already exists
    try{
        const result = await pool.query(items.getItem, [item_id])
        // If result has something raise an error
        if (result.rowCount > 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} already exists in system`, 'Adding Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Item ${item_id} already exists in system`})
        }
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), "Problem with verifying item ID in system", 'Adding Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(501).json({data:"Problem with verifying item ID in system"})
    }

    // Test if the category name exists in database
    category_id = parseInt(category_name)
    // Query the database with the category_name in the request body
    try{
        const result = await pool.query(category.getCategoryFromName, [category_name])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rowCount == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Category ${category_name} doesn't exist`, 'Adding Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data :`Category ${category_name} doesn't exist`})
        }
        category_id = result.rows[0]['category_id']
    }catch (error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Server couldn't confirm category ${category_name} try again`, 'Adding Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data:`Server couldn't confirm category ${category_name} try again`})
    }

    // Test if the location exists in the database
    try{
        // Query the database for id of the location with the name location_name
        const result = await pool.query(location.getLocationID, [location_name])
        // If no result is returned return an error
        if (result.rowCount == 0){
            console.log(result)
            if (await addlog(user_id, new Date().toLocaleString(), `Location ${location_name} does not exist in system. Please add the location`, 'Adding Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Location ${location_name} does not exist in system. Please add the location`})
        }
        // If a result has data it means the location exists, we get its id from the result
        location_id = result.rows[0]['location_id']
    }catch(err){
        console.log(err)
        if (await addlog(user_id, new Date().toLocaleString(), `Server couldn't confirm location ${location_name} try again`, 'Adding Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data:`Server couldn't confirm location ${location_name} try again`})
    }

    // Add the item to the database
    // Converting items to appropriate types
    purchase_amount = parseFloat(purchase_amount)
    accum_dep = parseFloat(accum_dep)
    item = [item_id, category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew, location_id]

    try{
        const result = await pool.query(items.addItem, item)
        if (await addItemReconciliation(item_id)){
            if (await addlog(user_id, new Date().toLocaleString(), 'Server had trouble updating the reconciliation try again', 'Adding Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the reconciliation try again'})
            }
            return res.status(501).json({data:`Server had trouble adding ${item_id} to reconciliation records`})
        }
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} succesfully added`, 'Adding Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        res.status(201).json({data:`Item ${item_id} succesfully added`})
    }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `Problem with adding item ${item_id}`, 'Adding Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the reconciliation try again'})
        }
        return res.status(501).json({data:`Problem with adding item ${item_id}`})
    }
}

async function removeItem(req, res){
    /*
        removes an item from the database using an item_id in the request body
    */
   // Get item_id from request body
   let {
        item_id,
        username
    } = req.body

    let user_id;

    // Test that items are not empty
    if(utility.isAnyEmpty([username, item_id])){
        return res.status(404).json({data:"One of the items is empty"})
    } 

    // Test if user exists
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

   // Check if item_id exists
   try{
        // Query the database using given item_id if no result is returned then return error
        const result = await pool.query(items.getItem, [item_id])
        if (result.rowCount == 0){
            if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} does not exist`, 'Removing Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(404).json({data:`Item ${item_id} does not exist`})
        }
        // Else remove item from db by running the query
        if(await removeItemReconciliation(item_id)){
            // If returns something means an error occured
            if (await addlog(user_id, new Date().toLocaleString(), `Couldn't remove reconciliation record for ${item_id}`, 'Removing Item')){
                // If something other than 0 is returned an error occured
                return res.status(501).json({data:'Server had trouble updating the log try again'})
            }
            return res.status(501).json({data:`Couldn't remove reconciliation record for ${item_id}`})
        }
        const result2 = await pool.query(items.removeItem, [item_id])
        if (await addlog(user_id, new Date().toLocaleString(), `Item ${item_id} succesfully removed`, 'Removing Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(200).json({data:`Item ${item_id} succesfully removed`})
   }catch(error){
        console.log(error)
        if (await addlog(user_id, new Date().toLocaleString(), `System could not remove the item ${item_id} try again`, 'Removing Item')){
            // If something other than 0 is returned an error occured
            return res.status(501).json({data:'Server had trouble updating the log try again'})
        }
        return res.status(501).json({data:`System could not remove the item ${item_id} try again`})
   }
}

async function updateItem(req, res){
    // Get item_id and other details about an item
    let {
        item_id,
        category_name,
        name,
        purchase_date,
        purchase_amount,
        next_dep_date,
        accum_dep,
        location_name,
        isnew
    } = req.body

    // Initializing values for category ID and location ID
    let category_id;
    let location_id;

    // Validate item_id
    // Check if it is null
    // If null return error
    if (!item_id){
            return res.status(404).json({data:'No item id given'})
    }
    // Check if it exists
    try{
        const result = await pool.query(items.getItem, [item_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rowCount == 0){
            return res.status(404).json({data:"Item doesn't exist"})
        }
    }catch (error){
        console.log(error)
        return res.status(501).json({data:"Server had an issue validating your Item ID try again"})
    }

    // Validate category_name
    // Check if it is null and convert it to an int
    if (!category_name){
        return res.status(404).json({data:'No category name given'})
    }
    // Test if the category id exists in database
    category_id = parseInt(category_id)
    // Query the database with the category_id in the request body
    try{
        const result = await pool.query(category.getCategoryFromName, [category_name])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rowCount == 0){
            return res.status(404).json({data:"Category doesn't exist"})
        }
        category_id = result.rows[0]['category_id']
    }catch (error){
        console.log(error)
        return res.status(501).json({data:"Server had issues validating your category try again"})
    }

    // Validate location_id
    if (!location_name){
        return res.status(404).json({data:'No location name given'})
    }
    // Check if it exists
    try{
        const result = await pool.query(location.getLocationID, [location_name])
        if (result.rowCount == 0){
            return res.status(404).json({data:'Location does not exist'})
        }
        location_id = result.rows[0]['location_id']
    }catch(error){
        console.log(error)
        return res.status(501).json({data:"Server had an error validating the location please try again"})
    }


    // Check if any non-nullable items are null
    item_list = [item_id, purchase_amount, purchase_date, next_dep_date, accum_dep, name, isnew]
    // If null return error
    isEmpty = utility.isAnyEmpty(item_list)
    if (isEmpty){
        console.log(item_list)
        return res.status(404).json({data:'One of the items is empty'})
    }

    // Change items to correct data types
    purchase_amount = parseFloat(purchase_amount)
    accum_dep = parseFloat(accum_dep)

    // Update the item
    // Run pool.query() if you get an error log it
    item_list = [name, category_id, purchase_amount, purchase_date, next_dep_date, accum_dep,  isnew, location_id, item_id]
    
    try{
        const result = pool.query(items.updateItem, item_list)
        return res.status(201).json({data:'Item has been updated'})
    }catch(error){
        console.log(error)
        res.status(501).json({data:"Server had trouble updating the item please try again"})
    }
}

async function getItem(req, res){
    // Get item_id from path
    let item_id = req.params.id

    // Check if its null
    if (!item_id){
        return res.status(404).json({data:'Item does not exist'})
    }

    // Check if it exists
    try{
        const result = await pool.query(items.getItem, [item_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rowCount == 0){
            return res.status(404).json({data:"Item doesn't exist"})
        }
        // Send the results
        res.status(200).json({data:result.rows})
    }catch (error){
        console.log(error)
        return res.status(501).json({data:"Server had an issue getting the item please try again"})
    }
}

async function getItems(req, res){
    // Send all the items
    try{
        const result = await pool.query(items.getAllItems)
        return res.status(200).json({data:result.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with items request')
    }
}

module.exports = {
    addItem,
    removeItem,
    updateItem,
    getItem,
    getItems
}