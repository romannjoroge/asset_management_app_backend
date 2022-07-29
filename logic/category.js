const category = require('../model/Assets/category')
const pool = require('../db')
const utility = require('../utility/utility')

async function addCategory(req, res){
    // Get details from request body
    let{
        num_dep,
        name,
        dep_type,
        freq_dep
    } = req.body

    // Verify that non are null
    items = [num_dep, name, dep_type, freq_dep]
    isEmpty = utility.isAnyEmpty(items)
    if(isEmpty){
        return res.status(404).json({"code":404, "message":'One of the items is empty'})
    }
    
    // Convert items to appropriate types
    num_dep = parseInt(num_dep)
    freq_dep = parseInt(freq_dep)

    // Add to db
    items = [name, dep_type, num_dep, freq_dep]
    try{
        const result = await pool.query(category.addCategory, items)
        res.status(201).json({"success": true, "message":'Category succesfully added'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with your request')
    }
}

// Check how to redirect users to other path
async function removeCategory(req, res){
    // Get category id from request body
    let {category_id} = req.body
    // Validate category id
    // Convert it to an int
    category_id = parseInt(category_id)
    // Check if null, if null send an error
    if (!category_id){
        res.status(404).json({"code":404, "message":'Category does not exist'})
    }
    // Check if it exists
    try{
        const result = await pool.query(category.getCategory, [category_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Category doesn't exist", "code":404})
        }
        // Remove category from the database
        const result2 = await pool.query(category.removeCategory, [category_id])
        return res.status(200).json({"success":true, "message":'Category was able to be deleted'})
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with category request')
    }

}

async function updateCategory(req, res){
    // Get details from request body
    let{
        category_id,
        num_dep,
        name,
        dep_type,
        freq_dep
    } = req.body

    // Verify that non are null
    items = [category_id, num_dep, name, dep_type, freq_dep]
    isEmpty = utility.isAnyEmpty(items)
    if(isEmpty){
        return res.status(404).json({"code":404, "message":'One of the items is empty'})
    }

    // Check that category id is valid
    category_id = parseInt(category_id)
    // Check if it exists
    try{
        const result = await pool.query(category.getCategory, [category_id])
        // If the result is empty the id doesn't exist and an error should be returned
        if (result.rows.length == 0){
            return res.status(404).json({"message":"Category doesn't exist", "code":404})
        }
        // // Remove category from the database
        // const result2 = await pool.query(category.removeCategory, [category_id])
        // return res.status(200).json({"success":true, "message":'Category was able to be deleted'})
    }catch (error){
        console.log(error)
        return res.status(501).send('Problem with category request')
    }

    // Convert items to appropriate types
    num_dep = parseInt(num_dep)
    freq_dep = parseInt(freq_dep)
 
    // Run query
    items = [name, dep_type, num_dep, freq_dep, category_id]
    try{
        const result = await pool.query(category.updateCategory, items)
        res.status(201).json({"success": true, "message":'Item updated'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
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
        return res.status(200).json({"success":true, "message": "Data sent", "data":result.rows})
    }catch(error){
        console.log(error)
        return res.status(404).send('Problem with request')
    }
}

module.exports = {
    addCategory,
    removeCategory,
    updateCategory,
    getCategory,
    getCategories
}