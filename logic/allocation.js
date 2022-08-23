const utility = require('../utility/utility')
const allocation = require('../model/Allocation/allocation')
const item = require('../model/Assets/items')
const pool = require('../db')

async function addUserItem (req, res){
    // Get item_id and user_id
    let {item_id,
        user_id
    } = req.body
    // Check that non are null
    item_id = parseInt(item_id)
    user_id = parseInt(user_id)

    items = [user_id, item_id]

    isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({"code":false, "message":'Details are null'})
    }

    // Check that item_id is valid
    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        // Allocate the item to a user
        await pool.query(allocation.allocate, items)
        res.status(201).json({"success":true, "message":'Item has been allocated to the user'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function removeUserItem(req, res){
    // Get item_id
    let {item_id} = req.body
    item_id = parseInt(item_id)
    // Validate item_id
    if (!item_id){
        res.status(404).json({"code":404, "message":'Item id cannot be empty'})
    }
    try{
        // Checks if item_id exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            // Item with id item_id does not exist
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        // Go to entry of item_id and set user_id to null
        await pool.query(allocation.allocate, [null, item_id])
        res.status(201).json({"success":true, "message":'Item has been removed from user'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    } 
}

module.exports = {
    addUserItem,
    removeUserItem
}