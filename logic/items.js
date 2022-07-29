const utility = require('../utility/utility')
const category = require('../model/Assets/category')
const items = require('../model/Assets/items')
const pool = require('../test/datbase/connection_test')
const location = require('../model/Tracking/location')

async function addItem(req, res){
    // Expected items
    let {
        category_id,
        name,
        purchase_date,
        purchase_amount,
        next_dep_date,
        accum_dep,
        isnew
    } = req.body
    let item = [category_id, name, purchase_amount, purchase_date, next_dep_date, accum_dep, isnew]
    
    // Test if any element is empty
    const isEmpty = utility.isAnyEmpty(items)
    // If any item is empty it should return a 404
    if (isEmpty){
        return res.status(404).json({"message":'One of the elements was empty', "code":404})
    }

    // Test if the category id exists in database
    category_id = parseInt(category_id)
    // Query the database with the category_id in the request body
    try{
        const result = await pool.query(category.getCategory, [category_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Category doesn't exist", "code":404})
        }
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with request')
    }

    // Add the item to the database
    // Converting items to appropriate types
    purchase_amount = parseFloat(purchase_amount)
    accum_dep = parseFloat(accum_dep)
    item = [category_id, name, purchase_date, purchase_amount, next_dep_date, accum_dep, isnew]

    try{
        const result = await pool.query(items.addItem, item)
        return res.status(201).json({"success":true, "message":'Item succesfully added'})
    }catch(error){
        console.log(error)
        return res.status(404).json({"code":404, "message":'Problem with adding item'})
    }
}

async function removeItem(req, res){
    /*
        removes an item from the database using an item_id in the request body
    */
   // Get item_id from request body
   let {item_id} = req.body
   // Change it to an int
   item_id = parseInt(item_id)
   // If null return error
   if (!item_id){
        return res.status(404).json({"code":404, "message":'No item id given'})
   }

   // Check if item_id exists
   try{
        // Query the database using given item_id if no result is returned then return error
        const result = await pool.query(items.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        // Else remove item from db by running the query
        const result2 = await pool.query(items.removeItem, [item_id])
        return res.status(200).json({"success": true, "message":'Item succesfully removed'})
   }catch(error){
        console.log(error)
        return res.status(404).send('Error sending request')
   }
}

async function updateItem(req, res){
    // Get item_id and other details about an item
    let {
        item_id,
        category_id,
        name,
        purchase_date,
        purchase_amount,
        next_dep_date,
        accum_dep,
        location_id,
        isnew
    } = req.body

    // Validate item_id
    // Check if it is null and convert it to an int
    item_id = parseInt(item_id)
    // If null return error
    if (!item_id){
            return res.status(404).json({"code":404, "message":'No item id given'})
    }
    // Check if it exists
    try{
        const result = await pool.query(items.getItem, [item_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Item doesn't exist", "code":404})
        }
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with item request')
    }

    // Validate category_id
    // Check if it is null and convert it to an int
    if (!category_id){
        return res.status(404).json({"code":404, "message":'No category id given'})
    }
    // Test if the category id exists in database
    category_id = parseInt(category_id)
    // Query the database with the category_id in the request body
    try{
        const result = await pool.query(category.getCategory, [category_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Category doesn't exist", "code":404})
        }
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with category request')
    }

    // Validate location_id
    // Change its type
    location_id = parseInt(location_id)
    // Check if it exists
    try{
        const result = await pool.query(location.getLocation, [location_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Location does not exist'})
        }
    }catch(error){
        console.log(error)
        return res.status(404).send('Problem with location request')
    }


    // Check if any non-nullable items are null
    item_list = [item_id, category_id, purchase_amount, purchase_date, next_dep_date, accum_dep, name, isnew]
    // If null return error
    isEmpty = utility.isAnyEmpty(item_list)
    if (isEmpty){
        res.status(404).json({"code":404, "message":'One of the items is empty'})
    }

    // Change items to correct data types
    purchase_amount = parseFloat(purchase_amount)
    accum_dep = parseFloat(accum_dep)

    // Update the item
    // Run pool.query() if you get an error log it
    item_list = [name, category_id, purchase_amount, purchase_date, next_dep_date, accum_dep,  isnew, location_id, item_id]
    
    try{
        const result = pool.query(items.updateItem, item_list)
        return res.status(201).json({"success":true, "message":'Item has been updated'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with update request')
    }
}

async function getItem(req, res){
    // Get item_id from path
    let item_id = req.params.id
    // Convert it to an int
    item_id = parseInt(item_id)
    // Check if its null
    if (!item_id){
        return res.status(404).json({"code":404, "message":'Item does not exist'})
    }

    // Check if it exists
    try{
        const result = await pool.query(items.getItem, [item_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Item doesn't exist", "code":404})
        }
        // Send the results
        res.status(200).json({"success":true, "data":result.rows, "message":'Data sent'})
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with item request')
    }
}

async function getItems(req, res){
    // Send all the items
    try{
        const result = await pool.query(items.getAllItems)
        return res.status(200).json({"success":true, "message":'Items sent', "data":result.rows})
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