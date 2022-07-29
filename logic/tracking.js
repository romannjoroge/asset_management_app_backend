const pool = require('../db')
const location = require('../model/Tracking/location')
const utility = require('../utility/utility')
const item = require('../model/Assets/items')

async function moveItem(req, res){
    // Get details
    let {
        location_id,
        item_id
    } = req.body

    // Validate them
    // Changing items to appropriate type
    location_id = parseInt(location_id)
    item_id = parseInt(item_id)

    // Checking if any item is empty
    items = [location_id, item_id]
    const isEmpty = utility.isAnyEmpty(items)
    if (isEmpty){
        res.status(404).json({"code":404, "message":'Details cannot be null'})
    }
    
    try{
        // Checking if an entry for item exists
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            // Returns an error if item doesn't exist
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        // Checking if an entry for location exists
        const result2 = await pool.query(location.getLocation, [location_id])
        if (result2.rows.length == 0){
            // Returns an error if location doesn't exist
            return res.status(404).json({"code":404, "message":'Location does not exist'})
        }
        // Changing the location of the item
        pool.query(location.moveItem, items)
        res.status(201).json({"success":true, "message":'Item has been moved'})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function displayItems(req, res){
    // Run query
    try{
        const results = await pool.query(location.displayItems)
        res.status(200).json({"success":true, "message":'Data sent', "data":results.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

async function displayItem(req, res){
    // Validate item_id
    let item_id = req.params.id 
    item_id = parseInt(item_id)
    if (!item_id){
        res.status(404).json({"code":404, "message":'id can not be null'})
    }
    try{
        const result = await pool.query(item.getItem, [item_id])
        if (result.rows.length == 0){
            return res.status(404).json({"code":404, "message":'Item does not exist'})
        }
        const result2 = await pool.query(location.displayItem, [item_id])
        return res.status(200).json({"success":true, "message":'Data sent', "data":result2.rows})
    }catch(error){
        console.log(error)
        res.status(404).send('Problem with request')
    }
}

module.exports = {
    moveItem,
    displayItem,
    displayItems
}