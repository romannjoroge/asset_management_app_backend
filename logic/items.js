const utility = require('../utility/utility')
const category = require('../model/Assets/category')
const items = require('../model/Assets/items')
const pool = require('../test/datbase/connection_test')

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

function removeItem(req, res){
    // Add code
}

function updateItem(req, res){
    // Add code
}

function getItem(req, res){
    // Add code
}

function getItems(req, res){
    // Add code
}

module.exports = {
    addItem,
    removeItem,
    updateItem,
    getItem,
    getItems
}